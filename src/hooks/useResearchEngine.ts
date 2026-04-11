/**
 * Research Engine — Fetches historical price data from CoinGecko,
 * computes EMA cross + 7/30-day trends, combines news sentiment,
 * and returns structured research blocks for portfolio or investment prompts.
 *
 * RULES:
 * - Only touches research logic. No UI, no chat, no other features.
 * - All research uses historical data from CoinGecko (not current price).
 * - Results are cached for 5 minutes per coin to avoid rate limits.
 */

// ── Cache ────────────────────────────────────────────────────────────────────

interface CachedResearch {
  data: CoinResearch;
  timestamp: number;
}

const researchCache = new Map<string, CachedResearch>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CoinResearch {
  coinId: string;
  symbol: string;
  trend7d: string;   // e.g. "+12.34"
  trend30d: string;  // e.g. "-5.21"
  emaSignal: 'Bullish' | 'Bearish';
  relevantNews: string[];
  score: number;
  notHolding?: boolean;
  dataUnavailable?: boolean; // true when CoinGecko fetch failed
}

// ── EMA Calculation ───────────────────────────────────────────────────────────

function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) return prices;
  const k = 2 / (period + 1);
  const ema: number[] = [];

  // Seed with simple average of first `period` values
  const seed = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema.push(seed);

  for (let i = period; i < prices.length; i++) {
    ema.push(prices[i] * k + ema[ema.length - 1] * (1 - k));
  }

  return ema;
}

// ── Core Research Function ────────────────────────────────────────────────────

export async function researchCoin(
  coinId: string,
  symbol: string,
  news: Array<{ title: string; description?: string }> = []
): Promise<CoinResearch> {
  // Return cached result if still fresh
  const cached = researchCache.get(coinId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    // Re-filter news in case it has changed since cache was built
    const refreshedNews = news
      .filter(n =>
        n.title.toLowerCase().includes(symbol.toLowerCase()) ||
        n.title.toLowerCase().includes(coinId.toLowerCase())
      )
      .slice(0, 3)
      .map(n => n.title);
    return { ...cached.data, relevantNews: refreshedNews };
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30`
    );

    if (!response.ok) throw new Error(`CoinGecko error: ${response.status}`);
    const data = await response.json();
    const prices: number[] = data.prices.map((p: number[]) => p[1]);

    if (prices.length < 10) throw new Error('Insufficient price data');

    // 30-day trend
    const startPrice = prices[0];
    const endPrice = prices[prices.length - 1];
    const trend30d = (((endPrice - startPrice) / startPrice) * 100).toFixed(2);

    // 7-day trend (last ~7 entries — CoinGecko gives ~daily points for 30d)
    const prices7d = prices.slice(-7);
    const trend7d = (
      ((prices7d[prices7d.length - 1] - prices7d[0]) / prices7d[0]) *
      100
    ).toFixed(2);

    // EMA cross
    const ema20 = calculateEMA(prices, Math.min(20, prices.length));
    const ema50 = calculateEMA(prices, Math.min(50, prices.length));
    const emaSignal: 'Bullish' | 'Bearish' =
      ema20[ema20.length - 1] > ema50[ema50.length - 1] ? 'Bullish' : 'Bearish';

    // News sentiment for this coin
    const relevantNews = news
      .filter(n =>
        n.title.toLowerCase().includes(symbol.toLowerCase()) ||
        n.title.toLowerCase().includes(coinId.toLowerCase())
      )
      .slice(0, 3)
      .map(n => n.title);

    // Score: trend30d positive (+2/-2), trend7d positive (+1/-1), EMA bullish (+2/-2), has news (+1)
    const score =
      (parseFloat(trend30d) > 0 ? 2 : -2) +
      (parseFloat(trend7d) > 0 ? 1 : -1) +
      (emaSignal === 'Bullish' ? 2 : -2) +
      (relevantNews.length > 0 ? 1 : 0);

    const result: CoinResearch = {
      coinId,
      symbol,
      trend7d,
      trend30d,
      emaSignal,
      relevantNews,
      score,
    };

    researchCache.set(coinId, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.error(`[ResearchEngine] Failed to research ${symbol}:`, err);
    // Return a clearly-marked unavailable result — score -99 ensures it is never picked
    return {
      coinId,
      symbol,
      trend7d: 'N/A',
      trend30d: 'N/A',
      emaSignal: 'Bearish',
      relevantNews: [],
      score: -99,
      dataUnavailable: true,
    };
  }
}

// ── Portfolio Research Builder ────────────────────────────────────────────────

export interface PortfolioHoldingInput {
  coinId: string;
  symbol: string;
  amount: number;
  value: number;
}

export async function buildPortfolioResearch(
  holdings: PortfolioHoldingInput[],
  news: Array<{ title: string; description?: string }> = []
): Promise<CoinResearch[]> {
  // Research held coins in parallel
  const heldResearch = await Promise.all(
    holdings.map(h => researchCoin(h.coinId, h.symbol, news))
  );

  // Research top coins the user doesn't hold (for diversification suggestions)
  const TOP_COINS = [
    { id: 'bitcoin', symbol: 'BTC' },
    { id: 'ethereum', symbol: 'ETH' },
    { id: 'solana', symbol: 'SOL' },
    { id: 'binancecoin', symbol: 'BNB' },
    { id: 'cardano', symbol: 'ADA' },
  ];

  const heldIds = holdings.map(h => h.coinId);
  const notHolding = TOP_COINS.filter(c => !heldIds.includes(c.id)).slice(0, 3);

  const diversificationResearch = await Promise.all(
    notHolding.map(c => researchCoin(c.id, c.symbol, news))
  );
  diversificationResearch.forEach(r => { r.notHolding = true; });

  return [...heldResearch, ...diversificationResearch];
}

// ── Prompt Builders ───────────────────────────────────────────────────────────

export function buildPortfolioPrompt(
  holdings: PortfolioHoldingInput[],
  research: CoinResearch[],
  fearGreedValue: string | number | undefined
): string {
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0).toFixed(2);

  return `
USER HOLDINGS:
${holdings.map(h => `${h.symbol}: ${h.amount} units (worth $${h.value.toFixed(2)})`).join('\n')}
Total Portfolio Value: $${totalValue}

RESEARCH DATA (based on past 30 days of historical price data — NOT current price):
${research.map(r => `
${r.symbol}${r.notHolding ? ' [NOT CURRENTLY HELD — diversification pick]' : ''}:
- 7 day trend: ${r.trend7d}%
- 30 day trend: ${r.trend30d}%
- EMA signal: ${r.emaSignal}
- Recent news: ${r.relevantNews.join(' | ') || 'No specific news found'}
`).join('')}
Fear & Greed Index: ${fearGreedValue ?? 'N/A'}/100

TASK:
Based ONLY on the trend data, EMA signals and news above — give portfolio advice:
1. For each coin the user holds — is the trend positive or negative? Should they hold or reduce?
2. Suggest allocation percentages based on trend strength
3. Recommend 1-2 coins to diversify into based on their positive trends (from the NOT CURRENTLY HELD list above)
4. Format: Holdings analysis → Suggested allocation → Diversification picks → One line disclaimer

RULES:
- Base ALL recommendations on the trend data above — not on current price
- Never say "I can't give advice"
- Always end with: "⚠️ Not financial advice — always do your own research."
- Keep total response under 200 words
- Be specific — name coins, give percentages
`.trim();
}

export function buildInvestmentPrompt(
  amount: number,
  research: CoinResearch[],
  fearGreedValue: string | number | undefined
): string {
  // Only include coins where we have real data — exclude rate-limited fallbacks
  const withData = research.filter(r => !r.dataUnavailable);
  const sorted = [...withData].sort((a, b) => b.score - a.score);

  // Always pick top 4 by score (even if all scores are negative — pick the best of what's available)
  const top4 = sorted.slice(0, 4);
  const unavailableCount = research.length - withData.length;

  return `
User wants to invest $${amount}.

RESEARCH DATA — ${top4.length} coins with verified 30-day trend data (${unavailableCount} coins had no data available):
${top4.map((r, i) => `
${i + 1}. ${r.symbol} (Research score: ${r.score}/6):
   - 30 day trend: ${r.trend30d}%
   - 7 day trend: ${r.trend7d}%
   - EMA signal: ${r.emaSignal}
   - Recent news: ${r.relevantNews[0] || 'None'}
`).join('')}
Fear & Greed Index: ${fearGreedValue ?? 'N/A'}/100

TASK:
Based ONLY on the ${top4.length} coins listed above with verified data:
1. Allocate $${amount} across ALL ${top4.length} of the above coins — you MUST include all of them
2. Weight the allocation by score: highest-scoring coin gets the largest share
3. Give one sentence reason for each pick based on its trend direction and EMA signal
4. Add one line on risk level given Fear & Greed

FORMAT (use this exact format, no headers):
Recommended allocation for $${amount}:
- BTC — 40% ($${(amount * 0.4).toFixed(0)}) — [reason based on trend data]
- ETH — 30% ($${(amount * 0.3).toFixed(0)}) — [reason based on trend data]
- SOL — 20% ($${(amount * 0.2).toFixed(0)}) — [reason based on trend data]
- ADA — 10% ($${(amount * 0.1).toFixed(0)}) — [reason based on trend data]
Risk note: [one line based on Fear & Greed value]
⚠️ Not financial advice — always do your own research.

CRITICAL RULES:
- You MUST split $${amount} across the ${top4.length} coins shown — NEVER put 100% in one coin
- Percentages MUST add up to exactly 100%
- Dollar amounts MUST add up to exactly $${amount}
- Pick coins based PURELY on their trend scores — do not give extra weight to a coin just because the user holds it
- If a coin the user holds has a strong score, include it — if it has a weak score, don't
- Pick the coin symbols EXACTLY as listed above (e.g. BTC not Bitcoin)
- Keep total response under 150 words
`.trim();
}

// ── Intent Detection ──────────────────────────────────────────────────────────

export type ResearchIntent = 'PORTFOLIO_HEALTH' | 'INVESTMENT_QUERY' | 'NONE';

export function detectResearchIntent(message: string): { intent: ResearchIntent; amount?: number } {
  const msg = message.toLowerCase();

  // Detect investment query — must have a dollar amount
  const amountMatch = msg.match(/\$\s?(\d[\d,]*(?:\.\d+)?)\s*k?|\b(\d[\d,]*(?:\.\d+)?)\s*(dollar|usd|k\b)/i)
    || msg.match(/invest\s+\$?\s?(\d[\d,]*)/i)
    || msg.match(/(\d[\d,]*)\s*\$?\s*(?:to invest|investment|invest)/i);

  const isInvestQuery =
    (msg.includes('invest') || msg.includes('put') || msg.includes('allocate') || msg.includes('where should')) &&
    amountMatch;

  if (isInvestQuery && amountMatch) {
    const rawAmount = amountMatch[1] || amountMatch[2];
    const amount = parseFloat(rawAmount.replace(/,/g, '')) * (msg.includes('k') ? 1000 : 1);
    return { intent: 'INVESTMENT_QUERY', amount };
  }

  // Detect portfolio health check
  const portfolioTriggers = [
    'how is my portfolio', 'portfolio health', 'check my portfolio',
    'how are my holdings', 'portfolio check', 'analyze my portfolio',
    'portfolio analysis', 'how am i doing', 'portfolio performance',
    'what should i do with my portfolio',
  ];
  if (portfolioTriggers.some(t => msg.includes(t))) {
    return { intent: 'PORTFOLIO_HEALTH' };
  }

  return { intent: 'NONE' };
}

// ── Top Coins List for Investment Queries ─────────────────────────────────────

export const INVESTMENT_COINS = [
  { id: 'bitcoin', symbol: 'BTC' },
  { id: 'ethereum', symbol: 'ETH' },
  { id: 'solana', symbol: 'SOL' },
  { id: 'binancecoin', symbol: 'BNB' },
  { id: 'cardano', symbol: 'ADA' },
  { id: 'avalanche-2', symbol: 'AVAX' },
  { id: 'chainlink', symbol: 'LINK' },
  { id: 'polkadot', symbol: 'DOT' },
  { id: 'matic-network', symbol: 'MATIC' },
  { id: 'uniswap', symbol: 'UNI' },
];
