import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, PortfolioHolding, AppTransaction } from '../types';
import { detectAgent, detectFuturesIntent, buildAgentPrompt } from '../agents';
import { supabase } from '../lib/supabase';
import type { AgentType, AgentContext } from '../agents';
import {
  detectResearchIntent,
  buildPortfolioResearch,
  buildPortfolioPrompt,
  buildInvestmentPrompt,
  researchCoin,
  INVESTMENT_COINS,
  type PortfolioHoldingInput,
  type CoinResearch,
} from './useResearchEngine';
import {
  detectEmotionalTrigger,
  buildMemoryBlock,
  updateUserMemory,
  type UserMemory,
} from './useUserMemory';

export function useGroqChat(apiKey: string, onActionDetected?: (action: string, params: Record<string, string>) => void | Promise<void>, onRequireUpgrade?: () => void) {
  const onActionDetectedRef = useRef(onActionDetected);

  useEffect(() => {
    onActionDetectedRef.current = onActionDetected;
  }, [onActionDetected]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Hey, I'm your crypto co-pilot. 🚀 Markets are moving fast — I've got the latest sentiment and news stats ready for you. Ask me anything!",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAgent, setLastAgent] = useState<AgentType | null>(null);

  const sendMessage = useCallback(
    async (
      content: string,
      walletContext?: {
        address: string | null;
        holdings: PortfolioHolding[];
        contacts?: Record<string, string>;
        history?: AppTransaction[];
        watchlist?: string[]
      },
      sentimentContext?: {
        fearGreed?: any[];
        news?: any[];
      },
      futuresContext?: {
        balance: number;
        positions: any[];
      },
      activeFeature?: string | null,
      chartAnalysisResults?: {
        coin: string;
        coinSymbol: string;
        currentPrice: number;
        support: number;
        resistance: number;
        ema20: number;
        ema50: number;
        trendline: number | null;
        buySignals: number;
        sellSignals: number;
      } | null,
      options?: {
        allowActions?: boolean;
        hidden?: boolean;
      },
      userMemory?: UserMemory | null,
    ) => {
      if (!content.trim() || isLoading) return;

      // ── 0. Check Free Plan AI Prompt Limit ────────────────────────────
      const checkPromptLimit = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data } = await supabase
          .from('user_data')
          .select('plan, ai_prompts_used, ai_prompts_reset_date')
          .eq('id', user.id)
          .single();

        if (!data) return true;

        const today = new Date().toISOString().split('T')[0];

        // Reset counter if new day
        if (data.ai_prompts_reset_date !== today) {
          await supabase.from('user_data').update({
            ai_prompts_used: 1,
            ai_prompts_reset_date: today
          }).eq('id', user.id);
          return true;
        }

        // Block if free user exceeded 5 prompts
        if (data.plan === 'free' && data.ai_prompts_used >= 5) {
          if (onRequireUpgrade) onRequireUpgrade();
          return false;
        }

        // Increment counter
        await supabase.from('user_data').update({
          ai_prompts_used: data.ai_prompts_used + 1
        }).eq('id', user.id);

        return true;
      };

      const allowed = await checkPromptLimit();
      if (!allowed) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      if (!options?.hidden) {
        setMessages((prev) => [...prev, userMsg]);
      }
      setIsLoading(true);

      if (!apiKey) {
        setMessages((prev) => [...prev, {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: '⚙️ Please add your **Groq API key** in settings to enable AI responses.',
          timestamp: new Date(),
        }]);
        setIsLoading(false);
        return;
      }

      // ── 1. Detect which agent should handle this ──────────────────────
      const agent = detectAgent(content, activeFeature || null);
      setLastAgent(agent);

      // Detect futures intent to prevent accidental position opening
      const futuresIntent = agent === 'FUTURES' ? detectFuturesIntent(content) : undefined;
      console.log(`🤖 Agent Router → Using agent: ${agent} (sidebar: ${activeFeature || 'none'})${futuresIntent ? ` [futures intent: ${futuresIntent}]` : ''}`);

      // ── 1b. Memory Engine — detect emotional triggers + coin mentions ─────
      const emotionalTrigger = detectEmotionalTrigger(content);
      if (emotionalTrigger) {
        // Track in background
        updateUserMemory({
          type: 'emotional_trigger',
          trigger:
            emotionalTrigger === 'fomo' ? 'FOMO detected' :
            emotionalTrigger === 'panic' ? 'panic selling detected' :
            'revenge trading detected',
        });
      }

      // Detect coin mentions and track preferred coins in background
      const TRACKED_COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'AVAX', 'LINK', 'DOT', 'XRP', 'DOGE', 'MATIC'];
      const msgUpper = content.toUpperCase();
      const mentionedCoin = TRACKED_COINS.find(c => msgUpper.includes(c));
      if (mentionedCoin) {
        updateUserMemory({ type: 'coin_mentioned', coin: mentionedCoin });
      }

      // Build emotional trigger context addon
      let emotionalInjection = '';
      if (emotionalTrigger === 'fomo') {
        emotionalInjection = '\n[EMOTIONAL CONTEXT] User may be experiencing FOMO right now. Gently acknowledge this before giving trade advice. Reference their past patterns if relevant.';
      } else if (emotionalTrigger === 'panic') {
        emotionalInjection = '\n[EMOTIONAL CONTEXT] User may be panic selling. Remind them of their past winning patterns before they act impulsively.';
      } else if (emotionalTrigger === 'revenge') {
        emotionalInjection = '\n[EMOTIONAL CONTEXT] User may be revenge trading after a loss. This is in their common mistakes pattern. Warn them specifically and clearly.';
      }

      // ── 1c. Research Engine — intercept portfolio / investment queries ──
      const researchDetection = detectResearchIntent(content);
      let researchInjection = '';  // extra block appended to system prompt when research runs

      if (researchDetection.intent !== 'NONE') {
        const newsData = sentimentContext?.news ?? [];
        const fearGreedVal = sentimentContext?.fearGreed?.[0]?.value;

        if (researchDetection.intent === 'PORTFOLIO_HEALTH') {
          // Show thinking message immediately
          setMessages(prev => [...prev, {
            id: `res-thinking-${Date.now()}`,
            role: 'assistant',
            content: '🔍 Researching your holdings... analyzing 30-day trends, EMA signals and recent news.',
            timestamp: new Date(),
          }]);

          // Map symbol → CoinGecko ID for historical data lookup
          const SYMBOL_TO_ID: Record<string, string> = {
            BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin',
            ADA: 'cardano', AVAX: 'avalanche-2', LINK: 'chainlink', DOT: 'polkadot',
            MATIC: 'matic-network', UNI: 'uniswap', XRP: 'ripple', DOGE: 'dogecoin',
          };
          const holdingInputs: PortfolioHoldingInput[] = (walletContext?.holdings ?? []).map(h => ({
            coinId: SYMBOL_TO_ID[h.symbol?.toUpperCase()] ?? h.symbol?.toLowerCase() ?? 'unknown',
            symbol: h.symbol,
            amount: Number(h.amount),
            value: Number(h.valueUsd ?? 0),
          }));

          if (holdingInputs.length > 0) {
            console.log(`[ResearchEngine] Running portfolio health check for ${holdingInputs.map(h => h.symbol).join(', ')}`);
            const research = await buildPortfolioResearch(holdingInputs, newsData);
            researchInjection = '\n\n' + buildPortfolioPrompt(holdingInputs, research, fearGreedVal);
            console.log(`[ResearchEngine] Portfolio research complete. Injecting into prompt.`);
          }
        } else if (researchDetection.intent === 'INVESTMENT_QUERY' && researchDetection.amount) {
          const amount = researchDetection.amount;

          // Show thinking message immediately
          setMessages(prev => [...prev, {
            id: `res-thinking-${Date.now()}`,
            role: 'assistant',
            content: `🔍 Researching top coins based on 30-day trends and recent news for your $${amount.toLocaleString()} investment...`,
            timestamp: new Date(),
          }]);

          console.log(`[ResearchEngine] Running investment research for $${amount} (sequential to avoid rate limits)`);
          // Research coins sequentially with a short delay to avoid CoinGecko rate limits
          const research: CoinResearch[] = [];
          for (const c of INVESTMENT_COINS) {
            research.push(await researchCoin(c.id, c.symbol, newsData));
            await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay between requests
          }
          researchInjection = '\n\n' + buildInvestmentPrompt(amount, research, fearGreedVal);
          console.log(`[ResearchEngine] Investment research complete. Injecting into prompt.`);
        }
      }

      // ── 2. Build live prices context ──────────────────────────────────
      let pricesBlock = 'PRICES UNAVAILABLE';
      try {
        const coinIds = 'bitcoin,ethereum,solana,binancecoin,cardano,avalanche-2,chainlink,polkadot,tether,usd-coin,ripple';
        const priceRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`);
        if (priceRes.ok) {
          const d = await priceRes.json().catch(() => ({}));
          const format = (id: string, name: string) => d[id] ? `${name}: $${d[id].usd} (${d[id].usd_24h_change?.toFixed(2)}%)` : `${name}: N/A`;
          pricesBlock = `LIVE MARKET PRICES:\n${format('bitcoin', 'BTC')}\n${format('ethereum', 'ETH')}\n${format('binancecoin', 'BNB')}\n${format('solana', 'SOL')}\n${format('ripple', 'XRP')}\n${format('cardano', 'ADA')}\n${format('chainlink', 'LINK')}`;
        }
      } catch (err) { console.error(err); }

      // ── 3. Build sentiment context ────────────────────────────────────
      let sentimentBlock = 'SENTIMENT: N/A';
      if (sentimentContext?.fearGreed && sentimentContext.fearGreed.length > 0) {
        const f = sentimentContext.fearGreed;
        sentimentBlock = `CURRENT MARKET SENTIMENT:\nFear & Greed Index: ${f[0].value}/100 — ${f[0].value_classification}\nYesterday: ${f[1]?.value || 'N/A'}\nLast Week: ${f[6]?.value || 'N/A'}`;
      }

      // ── 4. Build news context ─────────────────────────────────────────
      const coinKeywords: Record<string, string[]> = { 'BTC': ['btc', 'bitcoin'], 'ETH': ['eth', 'ethereum'], 'BNB': ['bnb', 'binance'], 'SOL': ['sol', 'solana'] };
      const msgLower = content.toLowerCase();
      let detectedCoin: string | null = null;
      for (const [coin, keywords] of Object.entries(coinKeywords)) { if (keywords.some(k => msgLower.includes(k))) { detectedCoin = coin; break; } }

      let newsBlock = 'NO RELEVANT NEWS AVAILABLE.';
      if (sentimentContext?.news && sentimentContext.news.length > 0) {
        let relevantNews = sentimentContext.news;
        if (detectedCoin) {
          relevantNews = sentimentContext.news.filter((n: any) => n.title.toLowerCase().includes(detectedCoin!.toLowerCase()) || n.description?.toLowerCase().includes(detectedCoin!.toLowerCase()));
        }

        if (relevantNews.length > 0) {
          const topNews = relevantNews.slice(0, 5).map((n: any, i: number) => `${i + 1}. ${n.title} (${n.source})`).join('\n');
          newsBlock = `LATEST CRYPTO NEWS ${detectedCoin ? `(FILTERED FOR ${detectedCoin})` : ''}:
${topNews}

Only reference these headlines when directly relevant to what the user asked.`;
        }
      }

      // ── 5. Build user context block ───────────────────────────────────
      const holdings = walletContext?.address ? walletContext.holdings.map(h => `${h.amount} ${h.symbol}`).join(', ') : 'None';
      const contactsStr = walletContext?.contacts ? Object.entries(walletContext.contacts).map(([n, a]) => `${n}: ${a}`).join(', ') : 'Empty';

      const userContextBlock = `USER CONTEXT:
Address: ${walletContext?.address || 'Not connected'}
Holdings: ${holdings}
ADDRESS BOOK: ${contactsStr}
Watchlist: ${walletContext?.watchlist?.join(', ') || 'Empty'}

PAPER FUTURES POSITIONS:
${!futuresContext || futuresContext.positions.length === 0 ? 'No open positions' :
          futuresContext.positions.map((p: any) =>
            `${p.direction.toUpperCase()} ${p.coin} ${p.leverage}x | Entry: $${p.entryPrice} | Size: $${p.size} | Liq: $${p.liquidationPrice}`
          ).join('\n')}

Virtual Balance: $${futuresContext?.balance || '1000'}`;

      // ── 6. Build the agent-specific system prompt ─────────────────────
      const agentContext: AgentContext = {
        pricesBlock,
        sentimentBlock,
        newsBlock,
        userContextBlock,
        memoryBlock: buildMemoryBlock(userMemory ?? null),
        walletAddress: walletContext?.address,
        holdings,
        contacts: contactsStr,
        watchlistIds: walletContext?.watchlist,
        txHistory: walletContext?.history,
        futuresPositions: futuresContext?.positions,
        futuresBalance: futuresContext?.balance,
        chartAnalysisResults: chartAnalysisResults || null,
        futuresIntent,
      };

      const systemPrompt = buildAgentPrompt(agent, agentContext) + researchInjection + emotionalInjection;

      // ── 7. Send to Groq ───────────────────────────────────────────────
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: content.trim() }
            ],
            temperature: agent === 'WALLET' || agent === 'FUTURES' ? 0.3 : 0.5,
            max_tokens: agent === 'CHART_ANALYSIS' || agent === 'PORTFOLIO' ? 800 : 600
          })
        });

        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        let aiContent = data.choices[0].message.content;

        const allowActions = options?.allowActions !== false;
        const actionMatch = aiContent.match(/\[\[ACTION:(.*?)\]\]/);
        if (allowActions && actionMatch && onActionDetectedRef.current) {
          const parts = actionMatch[1].split('|');
          const type = parts[0];
          const params: Record<string, string> = {};
          parts.slice(1).forEach((p: string) => {
            const firstColon = p.indexOf(':');
            if (firstColon !== -1) {
              const k = p.substring(0, firstColon).trim();
              const v = p.substring(firstColon + 1).trim();
              params[k] = v;
            }
          });
          // Handle Internal Actions (None here, handle in handleAIAction)
          onActionDetectedRef.current(type, params);
          aiContent = aiContent.replace(/\[\[ACTION:.*?\]\]/g, '').trim();
        } else if (actionMatch) {
          aiContent = aiContent.replace(/\[\[ACTION:.*?\]\]/g, '').trim();
        }

        setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: aiContent, timestamp: new Date() }]);
      } catch (err: any) {
        setMessages(prev => [...prev, { id: `e-${Date.now()}`, role: 'assistant', content: `❌ Error: ${err.message}`, timestamp: new Date() }]);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, messages, isLoading]
  );

  const addSystemMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, { id: `sys-${Date.now()}`, role: 'assistant', content, timestamp: new Date() }]);
  }, []);

  const addUserMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content, timestamp: new Date() }]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([{ id: 'reset', role: 'assistant', content: "Chat cleared. Ask me anything!", timestamp: new Date() }]);
    setLastAgent(null);
  }, []);

  return { messages, isLoading, sendMessage, addSystemMessage, addUserMessage, clearMessages, lastAgent };
}
