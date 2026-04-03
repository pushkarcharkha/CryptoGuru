import { useState, useEffect, useCallback } from 'react';
import type { AppTransaction } from '../types';
import { supabase } from '../lib/supabase';

export const useTransactionHistory = () => {
  const [history, setHistory] = useState<AppTransaction[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) {
        setHistory(data.map((d: any) => ({
          id: d.id,
          type: d.type as any,
          fromToken: d.from_token,
          toToken: d.to_token,
          fromAmount: d.from_amount,
          toAmount: d.to_amount,
          toAddress: d.to_address,
          contactName: d.contact_name,
          hash: d.hash,
          status: d.status as any,
          network: d.network,
          timestamp: new Date(d.created_at).getTime()
        })));
      }
    };
    fetchHistory();
  }, []);

  const saveTransaction = useCallback(async (tx: Omit<AppTransaction, 'id' | 'timestamp'>) => {
    setHistory(prev => {
      const existingIndex = prev.findIndex(item => item.hash === tx.hash);
      let newHistory;
      if (existingIndex > -1) {
        newHistory = [...prev];
        newHistory[existingIndex] = { ...newHistory[existingIndex], ...tx };
      } else {
        const newTx: AppTransaction = { ...tx, id: tx.hash, timestamp: Date.now() };
        newHistory = [newTx, ...prev];
      }
      return newHistory;
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if it exists in Supabase
    const { data } = await supabase.from('transactions').select('id').eq('user_id', user.id).eq('hash', tx.hash);
    
    if (data && data.length > 0) {
      await supabase.from('transactions').update({
        status: tx.status
      }).eq('id', data[0].id);
    } else {
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: tx.type,
        from_token: tx.fromToken,
        to_token: tx.toToken,
        from_amount: tx.fromAmount,
        to_amount: tx.toAmount,
        to_address: tx.toAddress,
        contact_name: tx.contactName,
        hash: tx.hash,
        status: tx.status,
        network: tx.network
      });
    }
  }, []);

  const getRecentHistory = useCallback((limit: number = 10) => {
    return history.slice(0, limit);
  }, [history]);

  return { history, saveTransaction, getRecentHistory };
};
