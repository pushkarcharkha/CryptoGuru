/**
 * User Memory System — Persists and retrieves behavioral trading profiles
 * from Supabase to personalize every AI response.
 *
 * RULES:
 * - All Supabase writes happen in the background (fire & forget) — never block UI
 * - Memory is cached in module scope after first load
 * - Only this file touches the user_memory table
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, getUserSafe } from '../lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserMemory {
  id: string;
  risk_profile: 'unknown' | 'conservative' | 'moderate' | 'aggressive';
  preferred_coins: string[];
  avg_trade_size: number;
  trading_frequency: string;
  leverage_preference: number;
  common_mistakes: string[];
  winning_patterns: string[];
  total_trades: number;
  win_rate: number;
  emotional_triggers: string[];
  last_updated: string;
}

export type MemoryEvent =
  | { type: 'trade_opened'; coin: string; size: number; leverage: number }
  | { type: 'trade_closed'; coin: string; pnl: number; leverage: number; direction: 'long' | 'short' }
  | { type: 'coin_mentioned'; coin: string }
  | { type: 'update_risk_profile' }
  | { type: 'emotional_trigger'; trigger: string };

export type EmotionalTrigger = 'fomo' | 'panic' | 'revenge' | null;

// ── Module-level cache ────────────────────────────────────────────────────────

let memoryCache: UserMemory | null = null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function calculateAverage(current: number | undefined, newValue: number): number {
  if (!current) return newValue;
  return (current + newValue) / 2;
}

function updateFrequencyArray(arr: string[] | undefined, item: string): string[] {
  const list = [...(arr || []), item];
  const freq: Record<string, number> = {};
  list.forEach(i => { freq[i] = (freq[i] || 0) + 1; });
  return Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 5);
}

function calculateNewWinRate(currentRate: number, totalTrades: number, won: boolean): number {
  const totalWins = (currentRate / 100) * totalTrades;
  const newWins = totalWins + (won ? 1 : 0);
  return (newWins / (totalTrades + 1)) * 100;
}

// ── Core save function (fire & forget) ───────────────────────────────────────

async function saveMemory(userId: string, updates: Partial<UserMemory>): Promise<void> {
  const payload = { id: userId, ...updates, last_updated: new Date().toISOString() };
  const { error } = await supabase.from('user_memory').upsert(payload);
  if (error) console.error('[UserMemory] Save error:', error);
  else {
    // Keep local cache in sync
    if (memoryCache) Object.assign(memoryCache, updates);
  }
}

// ── Main memory update dispatcher ────────────────────────────────────────────

export async function updateUserMemory(event: MemoryEvent): Promise<void> {
  const { data: { user } } = await getUserSafe();
  if (!user) return;

  const current = memoryCache ?? {};

  if (event.type === 'trade_opened') {
    const updates: Partial<UserMemory> = {
      total_trades: ((current as UserMemory).total_trades || 0) + 1,
      avg_trade_size: calculateAverage((current as UserMemory).avg_trade_size, event.size),
      leverage_preference: calculateAverage((current as UserMemory).leverage_preference, event.leverage),
      preferred_coins: updateFrequencyArray((current as UserMemory).preferred_coins, event.coin),
    };
    // Background save — don't await in callers
    saveMemory(user.id, updates);
  }

  if (event.type === 'trade_closed') {
    const won = event.pnl > 0;
    const totalTrades = (current as UserMemory).total_trades || 0;
    const newWinRate = calculateNewWinRate((current as UserMemory).win_rate || 0, totalTrades, won);

    const patterns = [...((current as UserMemory).winning_patterns || [])];
    const mistakes = [...((current as UserMemory).common_mistakes || [])];

    if (won && event.leverage >= 10) patterns.push('wins with high leverage');
    if (won && event.direction === 'long') patterns.push('long bias works');
    if (won && event.direction === 'short') patterns.push('short bias works');
    if (!won && event.leverage >= 20) mistakes.push('high leverage losses');
    if (!won && event.direction === 'long' && event.pnl < -50) mistakes.push('large long losses');
    if (!won && event.direction === 'short' && event.pnl < -50) mistakes.push('large short losses');

    saveMemory(user.id, {
      win_rate: newWinRate,
      winning_patterns: [...new Set(patterns)].slice(0, 8),
      common_mistakes: [...new Set(mistakes)].slice(0, 8),
    });
  }

  if (event.type === 'coin_mentioned') {
    saveMemory(user.id, {
      preferred_coins: updateFrequencyArray((current as UserMemory).preferred_coins, event.coin),
    });
  }

  if (event.type === 'emotional_trigger') {
    const triggers = [...((current as UserMemory).emotional_triggers || []), event.trigger];
    saveMemory(user.id, {
      emotional_triggers: [...new Set(triggers)].slice(0, 10),
    });
  }

  if (event.type === 'update_risk_profile') {
    const avgLeverage = (current as UserMemory).leverage_preference || 10;
    const riskProfile =
      avgLeverage >= 20 ? 'aggressive' : avgLeverage >= 10 ? 'moderate' : 'conservative';
    saveMemory(user.id, { risk_profile: riskProfile });
  }
}

// ── Emotional trigger detection ───────────────────────────────────────────────

const FOMO_KEYWORDS = ['pump', 'moon', 'going up', 'missing out', 'everyone is buying', 'skyrocket', 'all in'];
const PANIC_KEYWORDS = ['crash', 'dump', 'losing everything', 'sell everything', 'scared', 'market crash', 'falling'];
const REVENGE_KEYWORDS = ['make it back', 'double down', 'angry', 'got wrecked', 'lost everything', 'revenge'];

export function detectEmotionalTrigger(message: string): EmotionalTrigger {
  const msg = message.toLowerCase();
  if (FOMO_KEYWORDS.some(k => msg.includes(k))) return 'fomo';
  if (PANIC_KEYWORDS.some(k => msg.includes(k))) return 'panic';
  if (REVENGE_KEYWORDS.some(k => msg.includes(k))) return 'revenge';
  return null;
}

// ── Memory context block builder (injected into every agent prompt) ───────────

export function buildMemoryBlock(memory: UserMemory | null): string {
  if (!memory || memory.risk_profile === 'unknown') {
    return 'USER BEHAVIOR PROFILE: No trading history yet — treat as new user.';
  }

  return `USER BEHAVIOR PROFILE (learned from past interactions — use to personalize response):
Risk Profile: ${memory.risk_profile}
Preferred Coins: ${memory.preferred_coins?.join(', ') || 'none detected yet'}
Average Trade Size: $${memory.avg_trade_size?.toFixed(0) || 'unknown'}
Leverage Preference: ${memory.leverage_preference?.toFixed(0) || 10}x average
Win Rate: ${memory.win_rate?.toFixed(1) || 0}% across ${memory.total_trades || 0} total trades
Winning Patterns: ${memory.winning_patterns?.join(', ') || 'none detected yet'}
Common Mistakes: ${memory.common_mistakes?.join(', ') || 'none detected yet'}
Emotional Triggers Seen: ${memory.emotional_triggers?.join(', ') || 'none detected yet'}

PERSONALIZATION RULES — STRICTLY FOLLOW:
- Risk profile is ${memory.risk_profile}: ${
    memory.risk_profile === 'aggressive'
      ? 'skip basic risk warnings, speak trader-to-trader, reference their leverage history'
      : memory.risk_profile === 'conservative'
      ? 'always mention downside first, be cautious with leverage suggestions'
      : 'balanced tone, mention both upside and risk'
  }
- If user mentions a coin in their preferred list (${memory.preferred_coins?.join(', ') || 'none'}): reference their history with it
- If "${memory.common_mistakes?.join(', ') || ''}" is in common mistakes: warn specifically about repeating it
- If user has a winning pattern (${memory.winning_patterns?.join(', ') || 'none'}): reinforce it when they follow it
- Always reference win rate (${memory.win_rate?.toFixed(1) || 0}%) when user asks about performance`;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useUserMemory() {
  const [memory, setMemory] = useState<UserMemory | null>(memoryCache);
  const [isLoaded, setIsLoaded] = useState(memoryCache !== null);
  const messageCountRef = useRef(0);

  // Load memory once on mount
  useEffect(() => {
    if (memoryCache) { setIsLoaded(true); return; }

    const load = async () => {
      const { data: { user } } = await getUserSafe();
      if (!user) { setIsLoaded(true); return; }

      const { data } = await supabase
        .from('user_memory')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        memoryCache = data as UserMemory;
        setMemory(data as UserMemory);
      }
      setIsLoaded(true);
    };

    load();
  }, []);

  // Track message count, recalculate risk profile every 10 messages
  const onMessage = useCallback(async () => {
    messageCountRef.current += 1;
    if (messageCountRef.current % 10 === 0) {
      await updateUserMemory({ type: 'update_risk_profile' });
      // Refresh local state after profile update
      const { data: { user } } = await getUserSafe();
      if (user) {
        const { data } = await supabase.from('user_memory').select('*').eq('id', user.id).single();
        if (data) {
          memoryCache = data as UserMemory;
          setMemory(data as UserMemory);
        }
      }
    }
  }, []);

  // Expose a refresh function after external updates
  const refreshMemory = useCallback(async () => {
    const { data: { user } } = await getUserSafe();
    if (!user) return;
    const { data } = await supabase.from('user_memory').select('*').eq('id', user.id).single();
    if (data) {
      memoryCache = data as UserMemory;
      setMemory(data as UserMemory);
    }
  }, []);

  return { memory, isLoaded, onMessage, refreshMemory };
}
