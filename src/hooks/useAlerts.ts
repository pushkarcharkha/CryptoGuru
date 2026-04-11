import { useState, useEffect, useCallback } from 'react';
import type { PriceAlert } from '../types';

export const useAlerts = () => {
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('cryptoguru_alerts');
        if (saved) {
            try {
                setAlerts(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse alerts from localStorage', e);
            }
        }
    }, []);

    const addAlert = (coinId: string, symbol: string, targetPrice: number, condition: 'above' | 'below') => {
        setAlerts(prev => {
            const newAlert: PriceAlert = {
                id: Math.random().toString(36).substr(2, 9),
                coinId,
                symbol,
                targetPrice,
                condition,
                type: 'price',
                isTriggered: false,
                createdAt: Date.now()
            };
            const newList = [...prev, newAlert];
            localStorage.setItem('cryptoguru_alerts', JSON.stringify(newList));
            return newList;
        });
    };

    const addStrategyAlert = (coinId: string, symbol: string, patternName: string, message: string) => {
        setAlerts(prev => {
            const newAlert: PriceAlert = {
                id: Math.random().toString(36).substr(2, 9),
                coinId,
                symbol,
                targetPrice: 0,
                condition: 'above',
                type: 'strategy',
                patternName,
                message,
                isTriggered: true, // Auto-triggered as it's a notification of a past event
                createdAt: Date.now()
            };
            const newList = [newAlert, ...prev];
            localStorage.setItem('cryptoguru_alerts', JSON.stringify(newList));
            return newList;
        });
    };

    const removeAlert = (id: string) => {
        setAlerts(prev => {
            const newList = prev.filter(a => a.id !== id);
            localStorage.setItem('cryptoguru_alerts', JSON.stringify(newList));
            return newList;
        });
    };

    const markAsTriggered = useCallback((id: string) => {
        setAlerts(prev => {
            const newList = prev.map(a => a.id === id ? { ...a, isTriggered: true } : a);
            localStorage.setItem('cryptoguru_alerts', JSON.stringify(newList));
            return newList;
        });
    }, []);

    const clearTriggered = () => {
        setAlerts(prev => {
            const newList = prev.filter(a => !a.isTriggered);
            localStorage.setItem('cryptoguru_alerts', JSON.stringify(newList));
            return newList;
        });
    };

    return {
        alerts,
        addAlert,
        addStrategyAlert,
        removeAlert,
        markAsTriggered,
        clearTriggered
    };
};
