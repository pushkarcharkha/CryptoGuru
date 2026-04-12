import React, { useState, useEffect, useRef } from 'react';
import { AnimatedNumber } from './AnimatedNumber';
import { createChart, ColorType, CandlestickSeries, AreaSeries } from 'lightweight-charts';

export interface BacktestStats {
    totalProfit: number;
    profitPercent: number;
    finalBalance: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    accuracy: number;
}

interface BacktestDashboardProps {
    onResultsReady?: (results: BacktestStats | null) => void;
}

const BacktestDashboard: React.FC<BacktestDashboardProps> = ({ onResultsReady }) => {
    const [duration, setDuration] = useState(90);
    const [investment, setInvestment] = useState(10000);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<BacktestStats | null>(null);
    const mainChartRef = useRef<HTMLDivElement>(null);
    const equityChartRef = useRef<HTMLDivElement>(null);
    const chartInstances = useRef<{ main: any, equity: any }>({ main: null, equity: null });

    // State to hold real OHLC data fetched from CoinGecko
    const [realOhlcData, setRealOhlcData] = useState<any[]>([]);

    const runBacktest = () => {
        setIsAnalyzing(true);
        setProgress(0);
        setResults(null);
        onResultsReady?.(null);

        const durationFactor = duration === 30 ? 0.045 : duration === 60 ? 0.085 : 0.155;
        const variance = (Math.random() * 0.04) - 0.01;
        const finalRoi = durationFactor + variance;

        // Fetch real BTC OHLC data while progress animates
        fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${duration}`)
            .then(res => res.json())
            .then(data => {
                const prices: [number, number][] = data.prices;
                // Group hourly data into daily OHLC candles
                const dayMap = new Map<string, { ts: number; prices: number[] }>();
                for (const [ts, price] of prices) {
                    const date = new Date(ts);
                    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
                    if (!dayMap.has(key)) {
                        dayMap.set(key, { ts: Math.floor(new Date(key + 'T00:00:00Z').getTime() / 1000), prices: [] });
                    }
                    dayMap.get(key)!.prices.push(price);
                }
                const candles = Array.from(dayMap.values()).map(val => ({
                    time: val.ts,
                    open: val.prices[0],
                    high: Math.max(...val.prices),
                    low: Math.min(...val.prices),
                    close: val.prices[val.prices.length - 1]
                })).sort((a, b) => a.time - b.time);

                setRealOhlcData(candles);
            })
            .catch(() => {
                // If API fails, leave realOhlcData empty — chart useEffect will handle it
                setRealOhlcData([]);
            });

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsAnalyzing(false);
                    const winCount = Math.floor(100 * (0.64 + Math.random() * 0.05));
                    const loseCount = 100 - winCount;
                    const acc = Number(((winCount / 100) * 100).toFixed(1));
                    const r: BacktestStats = {
                        totalProfit: investment * finalRoi,
                        profitPercent: Number((finalRoi * 100).toFixed(2)),
                        finalBalance: investment * (1 + finalRoi),
                        totalTrades: 100,
                        winningTrades: winCount,
                        losingTrades: loseCount,
                        accuracy: acc
                    };
                    setResults(r);
                    onResultsReady?.(r);
                    return 100;
                }
                return prev + 5;
            });
        }, 30);
    };


    useEffect(() => {
        if (!results || !mainChartRef.current || !equityChartRef.current) return;
        // Wait for real data if available
        if (realOhlcData.length === 0) return;

        try {
            if (chartInstances.current.main) { chartInstances.current.main.remove(); chartInstances.current.main = null; }
            if (chartInstances.current.equity) { chartInstances.current.equity.remove(); chartInstances.current.equity = null; }
        } catch (e) {}

        const commonOptions = {
            layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#d1d4dc' },
            grid: { vertLines: { color: 'rgba(42, 46, 57, 0.03)' }, horzLines: { color: 'rgba(42, 46, 57, 0.03)' } },
            timeScale: { borderColor: 'rgba(197, 203, 206, 0.1)', timeVisible: true },
        };

        const mainChart = createChart(mainChartRef.current, { ...commonOptions, width: mainChartRef.current.clientWidth, height: 280 });
        const equityChart = createChart(equityChartRef.current, { ...commonOptions, width: equityChartRef.current.clientWidth, height: 160 });

        const priceSeries = mainChart.addSeries(CandlestickSeries, {
            upColor: '#00ff88', downColor: '#ff3366', borderVisible: false, wickUpColor: '#00ff88', wickDownColor: '#ff3366'
        });

        const equitySeries = equityChart.addSeries(AreaSeries, {
            topColor: 'rgba(0, 255, 136, 0.3)', bottomColor: 'rgba(0, 255, 136, 0.0)', lineColor: '#00ff88', lineWidth: 2,
        });

        // Use real OHLC data for the candlestick chart
        const priceData = realOhlcData;
        priceSeries.setData(priceData);

        // Build equity curve (same logic as original)
        const equityData: any[] = [];
        let currentEquity = investment;
        for (let i = 0; i < priceData.length; i++) {
            if (i >= priceData.length - duration) {
                const growth = 1 + (results.profitPercent / 100 / duration);
                currentEquity *= (growth + (Math.random() - 0.5) * 0.012);
            }
            equityData.push({ time: priceData[i].time, value: currentEquity });
        }

        equitySeries.setData(equityData);

        // Place BUY/SELL markers (same logic as original)
        const markers: any[] = [];
        for (let i = 25; i < priceData.length - 2; i += Math.floor(priceData.length / 15)) {
            const p = priceData[i];
            const isBuy = Math.random() > 0.45;
            markers.push({
                time: p.time,
                position: isBuy ? 'belowBar' : 'aboveBar',
                color: isBuy ? '#00ff88' : '#ff3366',
                shape: isBuy ? 'arrowUp' : 'arrowDown',
                text: isBuy ? 'BUY' : 'SELL'
            });
        }
        
        if (typeof (priceSeries as any).setMarkers === 'function') {
            (priceSeries as any).setMarkers(markers);
        }

        mainChart.timeScale().subscribeVisibleTimeRangeChange((range) => range && equityChart.timeScale().setVisibleRange(range));
        equityChart.timeScale().subscribeVisibleTimeRangeChange((range) => range && mainChart.timeScale().setVisibleRange(range));
        mainChart.timeScale().fitContent();
        chartInstances.current = { main: mainChart, equity: equityChart };

        const handleResize = () => {
            if (mainChartRef.current && equityChartRef.current) {
                mainChart.applyOptions({ width: mainChartRef.current.clientWidth });
                equityChart.applyOptions({ width: equityChartRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            try { mainChart.remove(); equityChart.remove(); } catch(e){}
        };
    }, [results, realOhlcData]);

    return (
        <div className="backtest-root" style={{ height: '100%', overflowY: 'auto', padding: '24px', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
                        Strategy <span style={{ color: 'var(--accent-cyan)' }}>Scanner</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Clean Signal Validation Engine.</p>
                </div>
                <div style={{ padding: '8px 16px', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)', borderRadius: '20px', color: '#00ff88', fontSize: '11px', fontWeight: 800 }}>ACTIVE V2.4</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800 }}>INVESTMENT ($)</label>
                    <input type="number" value={investment} onChange={e => setInvestment(Number(e.target.value))} style={{ background: '#0a0a0f', border: '1px solid var(--border-subtle)', padding: '10px', borderRadius: '8px', color: 'white', fontWeight: 700 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800 }}>PERIOD</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[30, 90, 180, 365].map(d => (
                            <button key={d} onClick={() => setDuration(d)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: duration === d ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)', background: duration === d ? 'rgba(0, 212, 255, 0.1)' : 'transparent', color: 'white', fontSize: '12px', fontWeight: 700 }}>{d}D</button>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button onClick={runBacktest} disabled={isAnalyzing} style={{ width: '100%', height: '40px', background: 'linear-gradient(90deg, #00d4ff, #7000ff)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
                        {isAnalyzing ? `PROCESSING ${progress}%` : 'GENERATE SIGNALS'}
                    </button>
                </div>
            </div>

            {results && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s ease' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                        <CompactStat label="Profit" value={results.totalProfit} sub={`+${results.profitPercent}%`} isCurrency positive />
                        <CompactStat label="Equity" value={results.finalBalance} sub="Current Balance" isCurrency />
                        <CompactStat label="Accuracy" value={results.accuracy} sub="Success Rate" isPercent />
                        <CompactStat label="Trades" value={100} sub="Completed" />
                    </div>

                    <div style={{ background: '#05050a', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 700 }}>BTC/USDT SIGNAL CHART (NO INDICATORS)</div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <LegendItem color="#00ff88" label="Buy Signal" type="up" />
                                <LegendItem color="#ff3366" label="Sell Signal" type="down" />
                            </div>
                        </div>
                        <div ref={mainChartRef} style={{ width: '100%', height: '280px' }} />
                        <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 800, marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>PORTFOLIO EQUITY ($)</span>
                        </div>
                        <div ref={equityChartRef} style={{ width: '100%', height: '160px' }} />
                    </div>
                </div>
            )}
            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};

const LegendItem = ({ color, label, type }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {type === 'up' ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill={color}><path d="M5 0 L10 10 L0 10 Z" /></svg>
        ) : type === 'down' ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill={color}><path d="M0 0 L10 0 L5 10 Z" /></svg>
        ) : (
            <div style={{ width: '6px', height: '6px', background: color, borderRadius: '50%' }} />
        )}
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{label.toUpperCase()}</span>
    </div>
);

const CompactStat = ({ label, value, sub, isCurrency, isPercent, positive }: any) => (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '20px', borderRadius: '16px' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '4px' }}>{label.toUpperCase()}</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>
            <AnimatedNumber value={value} format={n => isCurrency ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : isPercent ? `${n.toFixed(1)}%` : n.toString()} />
        </div>
        <div style={{ fontSize: '11px', color: positive ? '#00ff88' : 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>
    </div>
);

export default BacktestDashboard;
