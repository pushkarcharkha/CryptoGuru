import { useState, useEffect, useCallback } from 'react';
import type { FuturesPosition } from '../types';
import { supabase } from '../lib/supabase';

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

  useEffect(() => {
    const loadPositions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
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
        
        // Calculate dynamic balance based on closed trades
        const initial = INITIAL_BALANCE;
        const pnl = data.filter(d => d.status !== 'open').reduce((acc, d) => acc + parseFloat(d.pnl || 0), 0);
        const openMargin = data.filter(d => d.status === 'open').reduce((acc, d) => acc + parseFloat(d.margin), 0);
        setBalance(initial + pnl - openMargin);
      }
    };
    loadPositions();
  }, []);

  const calculateLiquidationPrice = (direction: 'long' | 'short', entryPrice: number, leverage: number) => {
    const liquidationThreshold = 1 / leverage;
    return direction === 'long' 
      ? entryPrice * (1 - liquidationThreshold)
      : entryPrice * (1 + liquidationThreshold);
  };

  const checkLiquidations = useCallback(async (currentPrices: Record<string, { usd: number }>) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    setPositions((prev: FuturesPosition[]) => {
      let updated = false;
      const nextPositions = prev.map((position: FuturesPosition) => {
        if (position.status !== 'open') return position;

        const currentPrice = currentPrices[position.coinId]?.usd;
        if (!currentPrice) return position;

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
          if (user) {
             supabase.from('futures_positions').update({
                status: 'liquidated',
                closed_at: new Date().toISOString(),
                pnl: pos.pnl,
                exit_price: pos.exitPrice,
             }).eq('id', position.id).then();
          }
          return pos;
        }
        return position;
      });
      return updated ? nextPositions : prev;
    });
  }, []);

  useEffect(() => {
    if (!prices) return;
    const interval = setInterval(() => {
      checkLiquidations(prices);
    }, 30000);
    return () => clearInterval(interval);
  }, [prices, checkLiquidations]);

  const openPosition = useCallback(async (
    coin: string,
    direction: 'long' | 'short',
    leverage: number,
    size: number,
    currentPrice: number
  ) => {
    const coinId = SUPPORTED_FUTURES_COINS[coin.toUpperCase()];
    if (!coinId) throw new Error(`Coin ${coin} is not supported for futures.`);

    const margin = size / leverage;
    if (margin > balance) throw new Error(`Insufficient balance for ${leverage}x margin.`);

    const liqPrice = calculateLiquidationPrice(direction, currentPrice, leverage);
    const tempId = Date.now();

    const newPosition: FuturesPosition = {
      id: tempId,
      coin: coin.toUpperCase(),
      coinId,
      direction,
      leverage,
      entryPrice: currentPrice,
      size,
      margin,
      liquidationPrice: liqPrice,
      openedAt: Date.now(),
      status: 'open'
    };

    setPositions(prev => [...prev, newPosition]);
    setBalance(prev => prev - margin);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('futures_positions').insert({
        user_id: user.id,
        coin: coin.toUpperCase(),
        coin_id: coinId,
        direction,
        leverage,
        entry_price: currentPrice,
        size,
        margin,
        liquidation_price: liqPrice,
        pnl: 0,
        status: 'open'
      }).select('id').single();

      if (data) {
        setPositions(prev => prev.map(p => p.id === tempId ? { ...p, id: data.id } : p));
      }
    }
    return newPosition;
  }, [balance]);

  const closePosition = useCallback(async (positionId: number, currentPrice: number) => {
    let updateData: any = null;
    let marginRet = 0;
    setPositions(prev => prev.map(p => {
      if (p.id === positionId && p.status === 'open') {
        const priceChange = currentPrice - p.entryPrice;
        const priceChangePercent = priceChange / p.entryPrice;
        const pnl = p.direction === 'long' 
          ? p.size * priceChangePercent * p.leverage
          : p.size * (-priceChangePercent) * p.leverage;

        const pnlPercent = (pnl / p.margin) * 100;
        marginRet = p.margin + pnl;

        updateData = {
          status: 'closed',
          closedAt: Date.now(),
          exitPrice: currentPrice,
          pnl,
          pnlPercent
        };

        return { ...p, ...updateData, status: 'closed' as const };
      }
      return p;
    }));

    if (updateData) {
      setBalance(b => b + marginRet);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('futures_positions').update({
          status: updateData.status,
          closed_at: new Date(updateData.closedAt).toISOString(),
          pnl: updateData.pnl,
          exit_price: updateData.exitPrice
        }).eq('id', positionId);
      }
    }
  }, []);

  const getLivePnL = useCallback((position: FuturesPosition, currentPrice: number) => {
    const priceChange = currentPrice - position.entryPrice;
    const priceChangePercent = priceChange / position.entryPrice;
    const pnl = position.direction === 'long'
      ? position.size * priceChangePercent * position.leverage
      : position.size * (-priceChangePercent) * position.leverage;

    return { pnl, pnlPercent: (pnl / position.margin) * 100 };
  }, []);

  return {
    positions,
    balance,
    openPosition,
    closePosition,
    checkLiquidations,
    getLivePnL,
    SUPPORTED_FUTURES_COINS
  };
}
