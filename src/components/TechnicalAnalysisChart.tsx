import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, LineStyle, CandlestickSeries, LineSeries } from 'lightweight-charts';

// Global cache for OHLCV data to prevent rate limits
const ohlcvCache: Record<string, { timestamp: number; data: any[] }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface TAStats {
  support: number;
  resistance: number;
  midLevel: number;
  ema20: number;
  ema50: number;
  currentPrice: number;
  coinSymbol: string;
  buySignals: number;
  sellSignals: number;
  trendline?: number;
  swingHighs: { time: number; value: number }[];
  swingLows: { time: number; value: number }[];
}

interface TechnicalAnalysisChartProps {
  coinId: string;
  coinSymbol: string;
  onAnalysisComplete?: (stats: TAStats) => void;
  patternOverlay?: import('../types').ChartPatternOverlay | null;
}

export const TechnicalAnalysisChart = ({ 
  coinId, 
  coinSymbol,
  onAnalysisComplete,
  patternOverlay
}: TechnicalAnalysisChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const onAnalysisCompleteRef = useRef(onAnalysisComplete);
  
  useEffect(() => {
    onAnalysisCompleteRef.current = onAnalysisComplete;
  }, [onAnalysisComplete]);

  const fetchOHLCV = async (cid: string, days: number): Promise<any[]> => {
    const cacheKey = `${cid}-${days}`;
    const cached = ohlcvCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${cid}/ohlc?vs_currency=usd&days=${days}`
    );
    
    if (response.status === 429) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return fetchOHLCV(cid, days);
    }

    if (!response.ok) throw new Error('Failed to fetch OHLCV');
    const data = await response.json();
    
    // Format, deduplicate, and sort ensuring strictly increasing time
    const rawData = data.map((d: any) => ({
      time: Math.floor(d[0] / 1000) as any,
      open: d[1],
      high: d[2],
      low: d[3],
      close: d[4]
    }));

    const uniqueMap = new Map<number, any>();
    rawData.forEach((d: any) => uniqueMap.set(d.time, d));
    
    const formattedData = Array.from(uniqueMap.values()).sort((a, b) => a.time - b.time);

    ohlcvCache[cacheKey] = {
      timestamp: Date.now(),
      data: formattedData
    };

    return formattedData;
  };

  const calculateEMA = (data: number[], period: number) => {
    const k = 2 / (period + 1);
    const ema = [];
    ema.push(data[0]);
    for (let i = 1; i < data.length; i++) {
      ema.push(data[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
  };

  const findSwings = (candles: any[], type: 'low' | 'high', strength = 3) => {
    const values = type === 'low' ? candles.map(c => c.low) : candles.map(c => c.high);
    const swings = [];
    for (let i = strength; i < values.length - strength; i++) {
        let isSwing = true;
        for (let j = 1; j <= strength; j++) {
            if (type === 'low') {
                if (values[i] >= values[i - j] || values[i] >= values[i + j]) { isSwing = false; break; }
            } else {
                if (values[i] <= values[i - j] || values[i] <= values[i + j]) { isSwing = false; break; }
            }
        }
        if (isSwing) swings.push({ time: candles[i].time, value: values[i] });
    }
    return swings;
  };

  useEffect(() => {
    let isMounted = true;
    let chart: any = null;

    const renderChartAndAnalyze = async () => {
      if (!chartContainerRef.current) return;
      setIsLoading(true);

      try {
        const candles = await fetchOHLCV(coinId, 30);
        if (!candles || candles.length === 0 || !isMounted) {
          setIsLoading(false);
          return;
        }

        // Clean any existing chart instance in case of strict mode double invocation
        if (chart) {
            chart.remove();
            chart = null;
        }

        // Setup chart
        chart = createChart(chartContainerRef.current, {
          layout: {
            background: { type: ColorType.Solid, color: '#0f0f1b' },
            textColor: '#d1d4dc',
          },
          grid: {
            vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
            horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
          },
          rightPriceScale: {
            borderColor: 'rgba(42, 46, 57, 0.8)',
          },
          timeScale: {
            borderColor: 'rgba(42, 46, 57, 0.8)',
            timeVisible: true,
          },
          crosshair: {
            mode: 1, // Magnet mode
          },
          autoSize: true, // This allows the chart to handle resize itself
        });

        // 1. Candlestick Series (v5 API)
        const candleSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#10b981',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
        });
        
        candleSeries.setData(candles);

        // Calculate TA values
        const closes = candles.map((c: any) => c.close);
        const highs = candles.map((c: any) => c.high);
        const lows = candles.map((c: any) => c.low);

        const resistanceValue = Math.max(...highs.slice(-20));
        const supportValue = Math.min(...lows.slice(-20));
        const midLevel = (resistanceValue + supportValue) / 2;

        const ema20Arr = calculateEMA(closes, 20);
        const ema50Arr = calculateEMA(closes, 50);

        // 2. Add EMA Lines (v5 API)
        const ema20Series = chart.addSeries(LineSeries, {
          color: '#f59e0b',
          lineWidth: 2,
          title: 'EMA 20',
          priceLineVisible: false,
        });
        const ema20Data = ema20Arr.map((v, i) => ({ time: candles[i].time, value: v }));
        ema20Series.setData(ema20Data.slice(20));

        const ema50Series = chart.addSeries(LineSeries, {
          color: '#8b5cf6',
          lineWidth: 2,
          title: 'EMA 50',
          priceLineVisible: false,
        });
        const ema50Data = ema50Arr.map((v, i) => ({ time: candles[i].time, value: v }));
        ema50Series.setData(ema50Data.slice(50));

        // 3. Resistance and Support price lines
        candleSeries.createPriceLine({
          price: resistanceValue,
          color: '#ef4444',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `Res $${resistanceValue.toFixed(2)}`,
        });

        candleSeries.createPriceLine({
          price: supportValue,
          color: '#10b981',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `Sup $${supportValue.toFixed(2)}`,
        });

        // 4. Trendline & Swings
        const swingLows = findSwings(candles, 'low');
        const swingHighs = findSwings(candles, 'high');
        let trendlineValue: number | undefined = undefined;

        if (swingLows.length >= 2) {
          const p1 = swingLows[swingLows.length - 2];
          const p2 = swingLows[swingLows.length - 1];
          trendlineValue = p2.value;

          if (p2.time > p1.time) {
              const trendSeries = chart.addSeries(LineSeries, {
                color: '#00d4ff',
                lineWidth: 2,
                title: 'Trendline',
                lineStyle: LineStyle.Solid,
                lastValueVisible: false,
              });
              trendSeries.setData([
                { time: p1.time, value: p1.value },
                { time: p2.time, value: p2.value }
              ]);
          }
        }

        // 5. Pattern Overlay Rendering
        if (patternOverlay) {
            // Draw points as markers
            if (patternOverlay.points && patternOverlay.points.length > 0) {
                const markers = patternOverlay.points.map(p => ({
                    time: p.time as any,
                    position: (p.price > closes[closes.length - 1] ? 'aboveBar' : 'belowBar') as any,
                    color: '#f59e0b',
                    shape: 'circle',
                    text: p.label || '',
                }));
                candleSeries.setMarkers(markers);
            }

            // Draw lines
            patternOverlay.lines.forEach((line) => {
                const layer = chart.addSeries(LineSeries, {
                    color: line.color || '#00ff88',
                    lineWidth: 3,
                    lineStyle: line.dashed ? LineStyle.Dashed : LineStyle.Solid,
                    lastValueVisible: false,
                    priceLineVisible: false,
                    title: line.type?.toUpperCase() || ''
                });
                layer.setData([
                    { time: line.startTime as any, value: line.startPrice },
                    { time: line.endTime as any, value: line.endPrice }
                ]);
            });

            // Draw Breakout Zone
            if (patternOverlay.breakoutZone) {
                candleSeries.createPriceLine({
                    price: patternOverlay.breakoutZone,
                    color: '#f59e0b',
                    lineWidth: 2,
                    lineStyle: LineStyle.Solid,
                    axisLabelVisible: true,
                    title: 'Breakout Zone',
                });
            }
        }

        // Fit content
        chart.timeScale().fitContent();

        // Count Signals for AI
        let buyCount = 0;
        let sellCount = 0;
        for (let i = 1; i < 20; i++) {
          const idx = candles.length - 20 + i;
          if (idx < 1) continue;
          if (ema20Arr[idx - 1] < ema50Arr[idx - 1] && ema20Arr[idx] > ema50Arr[idx]) buyCount++;
          if (ema20Arr[idx - 1] > ema50Arr[idx - 1] && ema20Arr[idx] < ema50Arr[idx]) sellCount++;
        }

        // Trigger analysis complete
        if (onAnalysisCompleteRef.current && isMounted) {
          onAnalysisCompleteRef.current({
            support: supportValue,
            resistance: resistanceValue,
            midLevel,
            ema20: ema20Arr[ema20Arr.length - 1],
            ema50: ema50Arr[ema50Arr.length - 1],
            currentPrice: closes[closes.length - 1],
            coinSymbol: coinSymbol.toUpperCase(),
            buySignals: buyCount,
            sellSignals: sellCount,
            trendline: trendlineValue,
            swingHighs: swingHighs.slice(-10),
            swingLows: swingLows.slice(-10)
          });
        }
      } catch (err) {
        console.error("Chart Error: ", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    renderChartAndAnalyze();

    return () => {
      isMounted = false;
      if (chart) {
        chart.remove();
      }
    };
  }, [coinId, coinSymbol, patternOverlay]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px' }}>
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
      {isLoading && (
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: 'var(--accent-cyan)', zIndex: 10 }}>
          Analyzing data for AI...
        </div>
      )}
    </div>
  );
};
