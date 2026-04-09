import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Signal } from '../types';

interface UseSignalsReturn {
    signals: Signal[];
    isLoading: boolean;
    error: string | null;
    isVerified: boolean;
    currentUserId: string | null;
    traderName: string | null;
    createSignal: (data: Omit<Signal, 'id' | 'created_at' | 'user_id' | 'trader_name' | 'is_verified'>) => Promise<boolean>;
    updateSignal: (id: string, data: Partial<Omit<Signal, 'id' | 'created_at' | 'user_id' | 'trader_name' | 'is_verified'>>) => Promise<boolean>;
    deleteSignal: (id: string) => Promise<boolean>;
    refreshSignals: () => Promise<void>;
}

export function useSignals(): UseSignalsReturn {
    const [signals, setSignals] = useState<Signal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [traderName, setTraderName] = useState<string | null>(null);

    // Fetch current user's verification status
    useEffect(() => {
        const fetchUserStatus = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                setCurrentUserId(user.id);

                // Get verification status from user_data
                const { data: userData } = await supabase
                    .from('user_data')
                    .select('is_verified')
                    .eq('id', user.id)
                    .single();

                if (userData) {
                    setIsVerified(userData.is_verified === true);
                }

                // Get trader name from accepted trader_applications
                const { data: appData } = await supabase
                    .from('trader_applications')
                    .select('full_name')
                    .eq('user_id', user.id)
                    .eq('trader_applications_status', 'accepted')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (appData?.full_name) {
                    setTraderName(appData.full_name);
                } else {
                    // Fallback to auth metadata
                    setTraderName(user.user_metadata?.full_name || 'Anonymous Trader');
                }
            } catch (err) {
                console.error('Error fetching user status:', err);
            }
        };

        fetchUserStatus();
    }, []);

    // Fetch all signals with trader info
    const fetchSignals = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch signals
            const { data: signalsData, error: signalsError } = await supabase
                .from('signals')
                .select('*')
                .order('created_at', { ascending: false });

            if (signalsError) throw signalsError;

            if (!signalsData || signalsData.length === 0) {
                setSignals([]);
                setIsLoading(false);
                return;
            }

            // Get unique user IDs to fetch trader names and verification status
            const userIds = [...new Set(signalsData.map(s => s.user_id))];

            // Fetch verification status from user_data
            const { data: usersData } = await supabase
                .from('user_data')
                .select('id, is_verified')
                .in('id', userIds);

            // Fetch trader names from accepted trader_applications
            const { data: appsData } = await supabase
                .from('trader_applications')
                .select('user_id, full_name')
                .in('user_id', userIds)
                .eq('trader_applications_status', 'accepted');

            const verifiedMap = new Map<string, boolean>();
            if (usersData) {
                usersData.forEach(u => {
                    verifiedMap.set(u.id, u.is_verified === true);
                });
            }

            const nameMap = new Map<string, string>();
            if (appsData) {
                appsData.forEach(a => {
                    if (a.full_name) nameMap.set(a.user_id, a.full_name);
                });
            }

            // Enrich signals with trader info
            const enrichedSignals: Signal[] = signalsData.map(s => ({
                id: s.id,
                created_at: s.created_at,
                user_id: s.user_id,
                coin: s.coin,
                direction: s.direction as 'Long' | 'Short',
                entry_price: Number(s.entry_price),
                target_price: Number(s.target_price),
                stop_loss: Number(s.stop_loss),
                trader_name: nameMap.get(s.user_id) || 'Anonymous Trader',
                is_verified: verifiedMap.get(s.user_id) || false,
            }));

            setSignals(enrichedSignals);
        } catch (err: any) {
            console.error('Error fetching signals:', err);
            setError(err.message || 'Failed to fetch signals');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchSignals();
    }, [fetchSignals]);

    // Create a new signal
    const createSignal = useCallback(async (
        data: Omit<Signal, 'id' | 'created_at' | 'user_id' | 'trader_name' | 'is_verified'>
    ): Promise<boolean> => {
        try {
            if (!currentUserId) throw new Error('Not authenticated');

            const { error: insertError } = await supabase
                .from('signals')
                .insert({
                    user_id: currentUserId,
                    coin: data.coin.toUpperCase(),
                    direction: data.direction,
                    entry_price: data.entry_price,
                    target_price: data.target_price,
                    stop_loss: data.stop_loss,
                });

            if (insertError) throw insertError;

            await fetchSignals();
            return true;
        } catch (err: any) {
            console.error('Error creating signal:', err);
            setError(err.message || 'Failed to create signal');
            return false;
        }
    }, [currentUserId, fetchSignals]);

    // Update an existing signal
    const updateSignal = useCallback(async (
        id: string,
        data: Partial<Omit<Signal, 'id' | 'created_at' | 'user_id' | 'trader_name' | 'is_verified'>>
    ): Promise<boolean> => {
        try {
            const updateData: Record<string, any> = {};
            if (data.coin !== undefined) updateData.coin = data.coin.toUpperCase();
            if (data.direction !== undefined) updateData.direction = data.direction;
            if (data.entry_price !== undefined) updateData.entry_price = data.entry_price;
            if (data.target_price !== undefined) updateData.target_price = data.target_price;
            if (data.stop_loss !== undefined) updateData.stop_loss = data.stop_loss;

            const { error: updateError } = await supabase
                .from('signals')
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchSignals();
            return true;
        } catch (err: any) {
            console.error('Error updating signal:', err);
            setError(err.message || 'Failed to update signal');
            return false;
        }
    }, [fetchSignals]);

    // Delete a signal
    const deleteSignal = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from('signals')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            await fetchSignals();
            return true;
        } catch (err: any) {
            console.error('Error deleting signal:', err);
            setError(err.message || 'Failed to delete signal');
            return false;
        }
    }, [fetchSignals]);

    return {
        signals,
        isLoading,
        error,
        isVerified,
        currentUserId,
        traderName,
        createSignal,
        updateSignal,
        deleteSignal,
        refreshSignals: fetchSignals,
    };
}
