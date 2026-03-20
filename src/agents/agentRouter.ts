/**
 * Agent Router — Detects which specialized AI agent should handle
 * a given user message based on sidebar context and message keywords.
 */

export type AgentType =
  | 'CHART_ANALYSIS'
  | 'FUTURES'
  | 'PORTFOLIO'
  | 'WALLET'
  | 'WATCHLIST'
  | 'NEWS_SENTIMENT'
  | 'TRADE_JOURNAL'
  | 'GENERAL';

/**
 * Maps the SidebarFeature type to agent-compatible section identifiers.
 */
const SIDEBAR_TO_SECTION: Record<string, string> = {
  'chart': 'chart-analysis',
  'futures': 'futures',
  'portfolio': 'portfolio',
  'wallet': 'wallet',
  'watchlist': 'watchlist',
  'news-sentiment': 'news-sentiment',
  'journal': 'trade-journal',
};

/**
 * Detects which agent should handle the user's message.
 */
export function detectAgent(
  userMessage: string,
  activeSidebarSection: string | null
): AgentType {
  const msg = userMessage.toLowerCase();
  const section = activeSidebarSection
    ? SIDEBAR_TO_SECTION[activeSidebarSection] || activeSidebarSection
    : null;

  // 1. Explicit UI Feature Lock (If user clicks a sidebar preset, respect it)
  // When a feature is clicked, the app sends a direct preset message exactly matching the feature.
  if (msg === 'open portfolio' || msg.includes('analyze my portfolio')) return 'PORTFOLIO';
  if (msg === 'open watchlist') return 'WATCHLIST';
  if (msg === 'open chart') return 'CHART_ANALYSIS';
  if (msg === 'open journal' || msg.includes('analyze my trading')) return 'TRADE_JOURNAL';
  if (msg === 'open news') return 'NEWS_SENTIMENT';

  // 2. High-Confidence Keyword Matching (Commands)
  if (msg.includes('swap ') || msg.includes('send ') || msg.includes('transfer ')) return 'WALLET';
  if (msg.includes('open long') || msg.includes('open short') || msg.includes('leverage')) return 'FUTURES';
  if (msg.includes('chart ') || msg.includes('candlestick') || msg.includes('trendline')) return 'CHART_ANALYSIS';
  if (msg.includes('fear and greed') || msg.includes('sentiment')) return 'NEWS_SENTIMENT';

  // 3. Section Bias (If they are currently looking at a section, prefer that section for ambiguous queries)
  if (section === 'futures' && (msg.includes('position') || msg.includes('liquidat') || msg.includes('margin') || msg.includes('close') || msg.includes('long') || msg.includes('short'))) return 'FUTURES';
  if (section === 'chart-analysis' && (msg.includes('support') || msg.includes('resistance') || msg.includes('analyze') || msg.includes('ema'))) return 'CHART_ANALYSIS';
  if (section === 'portfolio' && (msg.includes('pnl') || msg.includes('allocation') || msg.includes('rebalance') || msg.includes('profit') || msg.includes('loss'))) return 'PORTFOLIO';
  if (section === 'trade-journal' && (msg.includes('history') || msg.includes('mistakes') || msg.includes('pattern') || msg.includes('review') || msg.includes('analyze'))) return 'TRADE_JOURNAL';

  // 4. Fallback Keyword Matching (Lower confidence)
  if (msg.includes('portfolio') || msg.includes('holdings') || msg.includes('allocation')) return 'PORTFOLIO';
  if (msg.includes('futures') || msg.includes('margin') || msg.includes('liquidat')) return 'FUTURES';
  if (msg.includes('wallet') || msg.includes('contact') || msg.includes('address') || msg.includes('balance')) return 'WALLET';
  if (msg.includes('watchlist') || msg.includes('track') || msg.includes('monitor')) return 'WATCHLIST';
  if (msg.includes('news') || msg.includes('what is happening')) return 'NEWS_SENTIMENT';
  if (msg.includes('journal') || msg.includes('history') || msg.includes('past trade')) return 'TRADE_JOURNAL';
  
  // 5. If no keywords match, fall back to the section they are currently viewing
  if (section === 'chart-analysis') return 'CHART_ANALYSIS';
  if (section === 'futures') return 'FUTURES';
  if (section === 'portfolio') return 'PORTFOLIO';
  if (section === 'wallet') return 'WALLET';
  if (section === 'watchlist') return 'WATCHLIST';
  if (section === 'news-sentiment') return 'NEWS_SENTIMENT';
  if (section === 'trade-journal') return 'TRADE_JOURNAL';

  // 6. Generic Default
  return 'GENERAL';
}

// ── Futures Intent Detection ──────────────────────────────────────────────

export type FuturesIntent = 'ADVICE_ONLY' | 'POSITION_OPEN' | 'POSITION_CLOSE' | 'STATUS_CHECK' | 'GENERAL_FUTURES';

const ADVICE_KEYWORDS = [
  'is btc good', 'is eth good', 'is sol good', 'is bnb good',
  'is ada good', 'is avax good', 'is link good', 'is dot good',
  'should i', 'what do you think', 'is it good', 'is it a good',
  'advice', 'suggest', 'recommend', 'good time', 'worth it',
  'opinion', 'thoughts on', 'good for long', 'good for short',
  'should i long', 'should i short', 'do you think',
  'what about', 'how about', 'would you', 'is it safe',
  'risky to', 'smart to', 'wise to', 'make sense to',
];

const OPEN_KEYWORDS = [
  'open a long', 'open a short', 'open long', 'open short',
  'place a long', 'place a short', 'place long', 'place short',
  'enter long', 'enter short', 'enter a long', 'enter a short',
  'create position', 'create a position',
  'open a position', 'open position',
  'yes open', 'yes, open', 'confirm', 'go ahead',
  'yes do it', 'yes please', 'do it', 'proceed',
];

const CLOSE_KEYWORDS = [
  'close position', 'close my position', 'close the position',
  'exit position', 'exit my position',
];

const STATUS_KEYWORDS = [
  'my positions', 'my pnl', 'how are my', 'position status',
  'show positions', 'current positions', 'open positions',
];

/**
 * Detects the user's intent when they are in the futures context.
 * This prevents the AI from opening positions when the user is just asking for advice.
 */
export function detectFuturesIntent(userMessage: string): FuturesIntent {
  const msg = userMessage.toLowerCase();

  // Check for explicit open requests FIRST (higher priority than advice)
  if (OPEN_KEYWORDS.some(k => msg.includes(k))) {
    return 'POSITION_OPEN';
  }

  // Check for close requests
  if (CLOSE_KEYWORDS.some(k => msg.includes(k))) {
    return 'POSITION_CLOSE';
  }

  // Check for status/PnL checks
  if (STATUS_KEYWORDS.some(k => msg.includes(k))) {
    return 'STATUS_CHECK';
  }

  // Check for advice-seeking (this catches "is BTC good for long", "should I short ETH")
  if (ADVICE_KEYWORDS.some(k => msg.includes(k))) {
    return 'ADVICE_ONLY';
  }

  // Default — could be anything, let the AI decide but still don't auto-open
  return 'GENERAL_FUTURES';
}
