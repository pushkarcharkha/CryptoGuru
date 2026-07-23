import { useState, useEffect, useCallback } from 'react';
import { getUserSafe } from '../lib/supabase';
import type { TradingStrategy } from '../types';

export const useStrategies = () => {
    const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStrategies = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await getUserSafe();
            if (!user) {
                // Fallback to localStorage if not logged in
                const saved = localStorage.getItem('cryptoguru_strategies');
                if (saved) setStrategies(JSON.parse(saved));
                setLoading(false);
                return;
            }

            // In a real app, we'd have a 'trading_strategies' table. 
            // For now, we'll use user_data metadata or localStorage as a secondary fallback.
            const saved = localStorage.getItem(`cryptoguru_strategies_${user.id}`);
            if (saved) {
                setStrategies(JSON.parse(saved));
            }
        } catch (err) {
            console.error('[useStrategies] Error fetching:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveToStorage = useCallback(async (newList: TradingStrategy[]) => {
        const { data: { user } } = await getUserSafe();
        const key = user ? `cryptoguru_strategies_${user.id}` : 'cryptoguru_strategies';
        localStorage.setItem(key, JSON.stringify(newList));
        setStrategies(newList);
    }, []);

    useEffect(() => {
        fetchStrategies().then(() => {
            // Cleanup: Automatically remove ghost/placeholder strategies from previous versions
            setStrategies(prev => {
                const filtered = prev.filter(s =>
                    s.name !== 'New AI Strategy' &&
                    s.description &&
                    s.description.trim() !== ''
                );
                if (filtered.length !== prev.length) {
                    saveToStorage(filtered);
                }
                return filtered;
            });
        });
    }, [fetchStrategies, saveToStorage]);

    const addStrategy = async (strategy: Omit<TradingStrategy, 'id' | 'createdAt' | 'isActive'>) => {
        const newStrategy: TradingStrategy = {
            ...strategy,
            id: Math.random().toString(36).substr(2, 9),
            isActive: true,
            createdAt: Date.now()
        };
        const newList = [newStrategy, ...strategies];
        await saveToStorage(newList);
        return newStrategy;
    };

    const updateStrategy = async (id: string, updates: Partial<TradingStrategy>) => {
        const newList = strategies.map(s => s.id === id ? { ...s, ...updates } : s);
        await saveToStorage(newList);
    };

    const deleteStrategy = async (id: string) => {
        const newList = strategies.filter(s => s.id !== id);
        await saveToStorage(newList);
    };

    const toggleStrategy = async (id: string) => {
        const strategy = strategies.find(s => s.id === id);
        if (strategy) {
            await updateStrategy(id, { isActive: !strategy.isActive });
        }
    };

    return {
        strategies,
        loading,
        addStrategy,
        updateStrategy,
        deleteStrategy,
        toggleStrategy,
        refresh: fetchStrategies
    };
};
