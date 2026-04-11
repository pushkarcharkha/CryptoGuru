import { useEffect, useRef, useCallback } from 'react';
import { useStrategies } from './useStrategies';

const SCAN_INTERVAL = 5 * 60 * 1000; // 5 minutes
const COIN_IDS: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'BNB': 'binancecoin',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'AVAX': 'avalanche-2',
    'DOT': 'polkadot',
    'LINK': 'chainlink',
    'MATIC': 'matic-network'
};

export const useStrategyMonitor = (addSystemMessage: (msg: string) => void, onNotify?: (coinId: string, symbol: string, pattern: string, msg: string) => void) => {
    const { strategies, updateStrategy } = useStrategies();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const calculateRSI = (prices: number[], period: number = 14) => {
        if (prices.length < period + 1) return 50;
        let gains = 0;
        let losses = 0;
        for (let i = 1; i <= period; i++) {
            const diff = prices[i] - prices[i - 1];
            if (diff >= 0) gains += diff;
            else losses -= diff;
        }
        let avgGain = gains / period;
        let avgLoss = losses / period;
        
        for (let i = period + 1; i < prices.length; i++) {
            const diff = prices[i] - prices[i - 1];
            if (diff >= 0) {
                avgGain = (avgGain * (period - 1) + diff) / period;
                avgLoss = (avgLoss * (period - 1)) / period;
            } else {
                avgGain = (avgGain * (period - 1)) / period;
                avgLoss = (avgLoss * (period - 1) - diff) / period;
            }
        }
        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    };

    const detectPattern = (ohlcv: any[], patternName: string) => {
        const highs = ohlcv.map(d => d[2]);
        const lows = ohlcv.map(d => d[3]);
        const name = patternName.toLowerCase();

        if (name.includes('triangle')) {
            // Check for converging volatility (lower highs AND higher lows)
            const recentHighs = highs.slice(-30);
            const recentLows = lows.slice(-30);
            
            const firstHalfHigh = Math.max(...recentHighs.slice(0, 15));
            const secondHalfHigh = Math.max(...recentHighs.slice(15));
            const firstHalfLow = Math.min(...recentLows.slice(0, 15));
            const secondHalfLow = Math.min(...recentLows.slice(15));

            // Symmetrical Triangle: Higher Lows and Lower Highs
            const isLowerHigh = secondHalfHigh < firstHalfHigh;
            const isHigherLow = secondHalfLow > firstHalfLow;
            
            return isLowerHigh && isHigherLow;
        }

        if (name.includes('head & shoulders')) {
            // Look for peak, higher peak, lower peak
            const peaks = [];
            for (let i = 5; i < highs.length - 5; i++) {
                if (highs[i] > highs[i - 1] && highs[i] > highs[i + 1] && 
                    highs[i] > highs[i - 2] && highs[i] > highs[i + 2]) {
                    peaks.push({ i, val: highs[i] });
                }
            }
            if (peaks.length >= 3) {
                const p3 = peaks.slice(-3);
                return p3[1].val > p3[0].val && p3[1].val > p3[2].val && Math.abs(p3[0].val - p3[2].val) / p3[0].val < 0.05;
            }
        }

        if (name.includes('double top')) {
            const peaks = [];
            for (let i = 5; i < highs.length - 5; i++) {
                if (highs[i] > highs[i - 1] && highs[i] > highs[i + 1]) peaks.push(highs[i]);
            }
            if (peaks.length >= 2) {
                const lastTwo = peaks.slice(-2);
                return Math.abs(lastTwo[0] - lastTwo[1]) / lastTwo[0] < 0.02;
            }
        }

        return false;
    };

    const scanStrategies = useCallback(async () => {
        const active = strategies.filter(s => s.isActive);
        if (active.length === 0) return;

        console.log(`[StrategyMonitor] Scanning ${active.length} active strategies...`);

        // Group by coin to minimize API calls
        const coinsToScan = Array.from(new Set(active.map(s => s.coin)));
        
        for (const coin of coinsToScan) {
            const coinId = COIN_IDS[coin.toUpperCase()] || (coin === 'ANY' ? 'bitcoin' : coin.toLowerCase());
            const symbol = (coin === 'ANY' ? 'BTC' : coin.toUpperCase()) + 'USDT';
            
            try {
                // Fetch OHLCV from Binance (1d timeframe, 30 days)
                const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=30`);
                if (!res.ok) continue;
                const binanceData = await res.json();
                
                // Binance structure: [time, open, high, low, close, volume, ...] all as strings
                const ohlcv = binanceData.map((d: any[]) => [
                    d[0],
                    parseFloat(d[1]), // open
                    parseFloat(d[2]), // high
                    parseFloat(d[3]), // low
                    parseFloat(d[4])  // close
                ]);
                const closes = ohlcv.map((d: any[]) => d[4]);
                const currentPrice = closes[closes.length - 1];

                const relevantStrategies = active.filter(s => s.coin === coin || (s.coin === 'ANY' && coin === 'BTC'));

                for (const strategy of relevantStrategies) {
                    // Debounce alerts (only once every 4 hours)
                    if (strategy.lastTriggered && Date.now() - strategy.lastTriggered < 4 * 60 * 60 * 1000) continue;

                    let triggered = false;
                    const results: string[] = [];

                    for (const condition of strategy.conditions) {
                        if (condition.type === 'indicator') {
                            if (condition.target === 'RSI') {
                                const rsi = calculateRSI(closes);
                                if (condition.operator === '<' && rsi < Number(condition.value)) triggered = true;
                                if (condition.operator === '>' && rsi > Number(condition.value)) triggered = true;
                                if (triggered) results.push(`RSI is ${rsi.toFixed(1)}`);
                            }
                        } else if (condition.type === 'pattern') {
                            if (detectPattern(ohlcv, condition.target)) {
                                triggered = true;
                                results.push(`${condition.target} detected`);
                            }
                        } else if (condition.type === 'price') {
                            if (condition.operator === '>' && currentPrice > Number(condition.value)) triggered = true;
                            if (condition.operator === '<' && currentPrice < Number(condition.value)) triggered = true;
                            if (triggered) results.push(`Price is $${currentPrice.toLocaleString()}`);
                        }
                    }

                    if (triggered) {
                        const resultsStr = results.join(', ');
                        addSystemMessage(`🎯 **Strategy Triggered: ${strategy.name}**\nDetected on ${coin}. Details: ${resultsStr}. Suggested investment: $${strategy.investmentAmount}`);
                        if (onNotify) {
                            onNotify(coinId, coin, strategy.name, resultsStr);
                        }
                        updateStrategy(strategy.id, { lastTriggered: Date.now(), status: 'triggered', lastChecked: Date.now() });
                    } else {
                        updateStrategy(strategy.id, { status: 'scanning', lastChecked: Date.now() });
                    }
                }

                // Rate limiting delay
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (err) {
                console.error(`[StrategyMonitor] Failed to scan ${coin}:`, err);
            }
        }
    }, [strategies, addSystemMessage, updateStrategy]);

    useEffect(() => {
        // Run once on mount
        scanStrategies();

        // Setup interval
        intervalRef.current = setInterval(scanStrategies, SCAN_INTERVAL);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [scanStrategies]);

    return null;
};
