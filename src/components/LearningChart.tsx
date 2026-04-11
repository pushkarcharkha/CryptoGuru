import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

interface LearningChartProps {
    data: any[];
    onTaskComplete?: (success: boolean) => void;
    task?: {
        type: 'identify-sr' | 'predict-next' | 'mark-breakout';
        targetPriceRange?: [number, number];
        successMessage: string;
    };
    showSimulation?: boolean;
    futureData?: any[];
}

export const LearningChart = ({ data, onTaskComplete, task, showSimulation, futureData }: LearningChartProps) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const seriesRef = useRef<any>(null);
    const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            timeScale: {
                borderVisible: false,
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderVisible: false,
            },
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
        });

        candlestickSeries.setData(data);
        chart.timeScale().fitContent();

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        // Task Interaction: Click to identify S/R
        if (task?.type === 'identify-sr') {
            chart.subscribeClick((param) => {
                if (!param.point || !param.time) return;
                const price = candlestickSeries.coordinateToPrice(param.point.y);
                if (price !== null) {
                    setSelectedPrice(price);
                    
                    if (task.targetPriceRange) {
                        const [min, max] = task.targetPriceRange;
                        if (price >= min && price <= max) {
                            onTaskComplete?.(true);
                        } else {
                            // Give some visual feedback that it's wrong? 
                            // For now we'll just let the parent handle the "Try Again"
                        }
                    }
                }
            });
        }

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, task, onTaskComplete]);

    // Update data when simulation starts
    useEffect(() => {
        if (showSimulation && futureData && seriesRef.current) {
            let i = 0;
            const interval = setInterval(() => {
                if (i < futureData.length) {
                    seriesRef.current.update(futureData[i]);
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 500); // 500ms per candle fast-forward
            return () => clearInterval(interval);
        }
    }, [showSimulation, futureData]);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div ref={chartContainerRef} />
            {selectedPrice && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(0, 212, 255, 0.1)',
                    border: '1px solid #00d4ff',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#00d4ff',
                    zIndex: 10
                }}>
                    Selection: ${selectedPrice.toFixed(2)}
                </div>
            )}
        </div>
    );
};
