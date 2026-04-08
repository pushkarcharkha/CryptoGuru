import { useEffect, useRef, useState } from 'react';

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
}

interface TechnicalAnalysisChartProps {
  coinId: string;
  coinSymbol: string;
  onAnalysisComplete?: (stats: TAStats) => void;
}

export const TechnicalAnalysisChart = ({ 
  coinId, 
  coinSymbol,
  onAnalysisComplete 
}: TechnicalAnalysisChartProps) => {
  const containerId = `tv_chart_${coinId.replace(/[^a-zA-Z0-9]/g, '')}`;
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
    const formattedData = data.map((d: any) => ({
      time: (d[0] / 1000),
      open: d[1],
      high: d[2],
      low: d[3],
      close: d[4]
    }));

    ohlcvCache[cacheKey] = {
      timestamp: Date.now(),
      data: formattedData
    };

    return formattedData;
  };

  const calculateEMA = (data: number[], period: number) => {
    const k = 2 / (period + 1);
    const ema = [data[0]];
    for (let i = 1; i < data.length; i++) {
      ema.push(data[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
  };

  const findTrendlinePoints = (candles: any[], type: 'low' | 'high') => {
    const values = type === 'low' ? candles.map(c => c.low) : candles.map(c => c.high);
    const significantPoints = [];
    for (let i = 2; i < values.length - 2; i++) {
      if (type === 'low') {
        if (values[i] < values[i - 1] && values[i] < values[i - 2] && values[i] < values[i + 1] && values[i] < values[i + 2]) {
          significantPoints.push({ time: candles[i].time, value: values[i] });
        }
      } else {
        if (values[i] > values[i - 1] && values[i] > values[i - 2] && values[i] > values[i + 1] && values[i] > values[i + 2]) {
          significantPoints.push({ time: candles[i].time, value: values[i] });
        }
      }
    }
    return significantPoints.slice(-3);
  };

  // 1. Initialize TradingView Widget for Visual Display
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((window as any).TradingView && document.getElementById(containerId)) {
        // Build an exchange symbol mapping based on the symbol provided by coingecko
        const tvSymbol = `BINANCE:${coinSymbol.toUpperCase()}USDT`;
        
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          container_id: containerId,
          backgroundColor: "#0a0a0f",
          gridColor: "#1a1a2e",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          hide_side_toolbar: false, // Enables the drawing tools!
          allow_symbol_change: false,
          studies: [
            "EMA@tv-basicstudies",
            "RSI@tv-basicstudies"
          ]
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [coinSymbol, containerId]);

  // 2. Fetch CoinGecko purely for the AI Chat context
  useEffect(() => {
    if (!onAnalysisCompleteRef.current) return;
    
    setIsLoading(true);
    fetchOHLCV(coinId, 30).then(candles => {
      if (!candles || candles.length === 0) return;

      const closes = candles.map((c: any) => c.close);
      const highs = candles.map((c: any) => c.high);
      const lows = candles.map((c: any) => c.low);

      const resistanceValue = Math.max(...highs.slice(-20));
      const supportValue = Math.min(...lows.slice(-20));
      const midLevel = (resistanceValue + supportValue) / 2;

      const ema20Data = calculateEMA(closes, 20);
      const ema50Data = calculateEMA(closes, 50);

      const trendlinePoints = findTrendlinePoints(candles, 'low');
      let trendlineValue: number | undefined = undefined;
      if (trendlinePoints.length >= 2) {
        trendlineValue = trendlinePoints[trendlinePoints.length - 1].value;
      }

      let buyCount = 0;
      let sellCount = 0;
      for (let i = 1; i < 20; i++) {
        const idx = candles.length - 20 + i;
        if (idx < 1) continue;
        const prevEma20 = ema20Data[idx - 1];
        const prevEma50 = ema50Data[idx - 1];
        const currEma20 = ema20Data[idx];
        const currEma50 = ema50Data[idx];

        if (prevEma20 < prevEma50 && currEma20 > currEma50) {
          buyCount++;
        }
        if (prevEma20 > prevEma50 && currEma20 < currEma50) {
          sellCount++;
        }
      }

      if (onAnalysisCompleteRef.current) {
        onAnalysisCompleteRef.current({
          support: supportValue,
          resistance: resistanceValue,
          midLevel,
          ema20: ema20Data[ema20Data.length - 1],
          ema50: ema50Data[ema50Data.length - 1],
          currentPrice: closes[closes.length - 1],
          coinSymbol: coinSymbol.toUpperCase(),
          buySignals: buyCount,
          sellSignals: sellCount,
          trendline: trendlineValue
        });
      }

      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [coinId, coinSymbol]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px' }}>
      <div id={containerId} style={{ width: '100%', height: '100%' }} />
      {isLoading && (
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: 'var(--accent-cyan)', zIndex: 10 }}>
          Analyzing data for AI...
        </div>
      )}
    </div>
  );
};
