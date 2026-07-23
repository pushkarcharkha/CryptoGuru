import { useState, useEffect, useCallback, useRef } from 'react';
import type { FuturesPosition } from '../types';
import { supabase, getUserSafe } from '../lib/supabase';

const INITIAL_BALANCE = 1000;

export const SUPPORTED_FUTURES_COINS: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'ADA': 'cardano',
  'AVAX': 'avalanche-2',
  'LINK': 'chainlink',
  'DOT': 'polkadot'
};

export function useFutures(prices: Record<string, { usd: number }> | null) {
  const [positions, setPositions] = useState<FuturesPosition[]>([]);
  const [balance, setBalance] = useState<number>(INITIAL_BALANCE);

  const [userId, setUserId] = useState<string | null>(null);
  const initToken = useRef(false);

  useEffect(() => {
    const init = async () => {
      if (initToken.current) return;
      initToken.current = true;
      
      const { data: { user } } = await getUserSafe();
      if (user) {
        setUserId(user.id);
        
        const { data } = await supabase.from('futures_positions').select('*').eq('user_id', user.id);
        if (data) {
          setPositions(data.map((p: any) => ({
            id: p.id,
            coin: p.coin,
            coinId: p.coin_id,
            direction: p.direction as any,
            leverage: p.leverage,
            entryPrice: parseFloat(p.entry_price),
            size: parseFloat(p.size),
            margin: parseFloat(p.margin),
            liquidationPrice: parseFloat(p.liquidation_price),
            openedAt: new Date(p.opened_at).getTime(),
            closedAt: p.closed_at ? new Date(p.closed_at).getTime() : undefined,
            status: p.status as any,
            exitPrice: p.exit_price ? parseFloat(p.exit_price) : undefined,
            pnl: parseFloat(p.pnl || 0),
            pnlPercent: parseFloat(p.pnl_percent || 0),
          })));
          
          const initial = INITIAL_BALANCE;
          const pnl = data.filter(d => d.status !== 'open').reduce((acc, d) => acc + parseFloat(d.pnl || 0), 0);
          const openMargin = data.filter(d => d.status === 'open').reduce((acc, d) => acc + parseFloat(d.margin), 0);
          setBalance(initial + pnl - openMargin);
        }
      }
    };
    init();
  }, []);

  const calculateLiquidationPrice = (direction: 'long' | 'short', entryPrice: number, leverage: number) => {
    const liquidationThreshold = 1 / leverage;
    return direction === 'long' 
      ? entryPrice * (1 - liquidationThreshold)
      : entryPrice * (1 + liquidationThreshold);
  };

  const checkExits = useCallback(async (currentPrices: Record<string, { usd: number }>) => {
    if (!userId) return;
    
    setPositions((prev: FuturesPosition[]) => {
      let updated = false;
      const nextPositions = prev.map((position: FuturesPosition) => {
        if (position.status !== 'open') return position;

        const currentPrice = currentPrices[position.coinId]?.usd;
        if (!currentPrice) return position;

        // Liquidation check
        const isLiquidatedLong = position.direction === 'long' && currentPrice <= position.liquidationPrice;
        const isLiquidatedShort = position.direction === 'short' && currentPrice >= position.liquidationPrice;

        if (isLiquidatedLong || isLiquidatedShort) {
          updated = true;
          const pos = {
            ...position,
            status: 'liquidated' as const,
            closedAt: Date.now(),
            exitPrice: currentPrice,
            pnl: -position.margin,
            pnlPercent: -100
          };
          
          supabase.from('futures_positions').update({
            status: 'liquidated',
            closed_at: new Date().toISOString(),
            pnl: pos.pnl,
            exit_price: pos.exitPrice,
          }).eq('id', position.id).then();
          
          return pos;
        }

        // SL/TP check
        if (position.stopLoss || position.takeProfit) {
            const priceDiff = position.direction === 'long' 
                ? (currentPrice - position.entryPrice)
                : (position.entryPrice - currentPrice);
            
            const roi = (priceDiff / position.entryPrice) * position.leverage * 100;

            let hit = false;
            let status: any = 'closed';
            if (position.stopLoss && roi <= -position.stopLoss) { hit = true; status = 'closed'; }
            if (position.takeProfit && roi >= position.takeProfit) { hit = true; status = 'closed'; }

            if (hit) {
              updated = true;
              const pnl = position.margin * (roi / 100);
              const pos = {
                ...position,
                status: status,
                closedAt: Date.now(),
                exitPrice: currentPrice,
                pnl: pnl,
                pnlPercent: roi
              };
              
              supabase.from('futures_positions').update({
                status: 'closed',
                closed_at: new Date().toISOString(),
                pnl: pos.pnl,
                exit_price: pos.exitPrice,
              }).eq('id', position.id).then();
              
              return pos;
            }
        }

        return position;
      });
      return updated ? nextPositions : prev;
    });
  }, [userId]);

  useEffect(() => {
    if (prices) {
      checkExits(prices);
    }
  }, [prices, checkExits]);

  const openPosition = async (coin: string, direction: 'long' | 'short', leverage: number, size: number, entryPrice: number, sl?: number | null, tp?: number | null) => {
    const { data: { user } } = await getUserSafe();
    if (!user) throw new Error('Not logged in');

    const margin = size / leverage;
    const liqPrice = calculateLiquidationPrice(direction, entryPrice, leverage);

    const { data, error } = await supabase.from('futures_positions').insert({
      user_id: user.id,
      coin: coin.toUpperCase(),
      coin_id: SUPPORTED_FUTURES_COINS[coin.toUpperCase()] || coin.toLowerCase(),
      direction,
      leverage,
      entry_price: entryPrice,
      size,
      margin,
      liquidation_price: liqPrice,
      status: 'open',
      stop_loss: sl || null,
      take_profit: tp || null
    }).select().single();

    if (error) throw error;

    const newPos: FuturesPosition = {
      id: data.id,
      coin: data.coin,
      coinId: data.coin_id,
      direction: data.direction as any,
      leverage: data.leverage,
      entryPrice: parseFloat(data.entry_price),
      size: parseFloat(data.size),
      margin: parseFloat(data.margin),
      liquidationPrice: parseFloat(data.liquidation_price),
      openedAt: new Date(data.opened_at).getTime(),
      status: 'open',
      stopLoss: sl || null,
      takeProfit: tp || null
    };

    setPositions((prev: FuturesPosition[]) => [...prev, newPos]);
    setBalance((prev: number) => prev - margin);
    return newPos;
  };

  const closePosition = useCallback(async (id: number, exitPrice: number) => {
    const { data: { user } } = await getUserSafe();
    
    setPositions((prev: FuturesPosition[]) => {
      const pos = prev.find((p: FuturesPosition) => p.id === id);
      if (!pos || pos.status !== 'open') return prev;

      const priceDiff = pos.direction === 'long' 
        ? (exitPrice - pos.entryPrice)
        : (pos.entryPrice - exitPrice);
      
      const pnlPercent = (priceDiff / pos.entryPrice) * pos.leverage * 100;
      const pnl = pos.margin * (pnlPercent / 100);

      if (user) {
        supabase.from('futures_positions').update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          exit_price: exitPrice,
          pnl,
          pnl_percent: pnlPercent
        }).eq('id', id).then();
      }

      setBalance((p: number) => p + pos.margin + pnl);

      return prev.map((p: FuturesPosition) => p.id === id ? {
        ...p,
        status: 'closed',
        closedAt: Date.now(),
        exitPrice,
        pnl,
        pnlPercent
      } : p);
    });
  }, []);

  const getLivePnL = useCallback((position: FuturesPosition, currentPrice: number) => {
    const priceDiff = position.direction === 'long' 
      ? (currentPrice - position.entryPrice)
      : (position.entryPrice - currentPrice);
    
    const pnlPercent = (priceDiff / position.entryPrice) * position.leverage * 100;
    const pnl = position.margin * (pnlPercent / 100);
    return { pnl, pnlPercent };
  }, []);

  return { positions, balance, openPosition, closePosition, getLivePnL };
}
