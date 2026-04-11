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
    showAnswer?: boolean;
    answerRange?: [number, number];
}

export const LearningChart = ({ data, onTaskComplete, task, showSimulation, futureData, showAnswer, answerRange }: LearningChartProps) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const seriesRef = useRef<any>(null);
    const answerLineRef = useRef<any>(null);
    const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

    // 1. Initial Chart Setup
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
                fontSize: 11,
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.02)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 500,
            timeScale: {
                borderVisible: false,
                timeVisible: true,
                secondsVisible: false,
                barSpacing: 5,
                minBarSpacing: 1,
                rightOffset: 5,
            },
            rightPriceScale: {
                borderVisible: false,
                scaleMargins: {
                    top: 0.2,
                    bottom: 0.2,
                },
            },
            crosshair: {
                mode: 0,
                vertLine: {
                    color: 'rgba(0, 212, 255, 0.5)',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#00d4ff',
                },
                horzLine: {
                    color: 'rgba(0, 212, 255, 0.5)',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#00d4ff',
                },
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
    }, [data]);

    // 2. Task Interaction
    useEffect(() => {
        if (!chartRef.current || !seriesRef.current || !task) return;

        const clickHandler = (param: any) => {
            if (!param.point || !param.time || !task.targetPriceRange) return;
            
            const price = seriesRef.current.coordinateToPrice(param.point.y);
            if (price !== null) {
                setSelectedPrice(price);
                const [min, max] = task.targetPriceRange;
                
                if (price >= min && price <= max) {
                    onTaskComplete?.(true);
                } else {
                    onTaskComplete?.(false);
                }
            }
        };

        chartRef.current.subscribeClick(clickHandler);
        return () => {
            chartRef.current.unsubscribeClick(clickHandler);
        };
    }, [task, onTaskComplete]);

    // 3. Reveal Answer Logic
    useEffect(() => {
        if (!seriesRef.current) return;

        if (showAnswer && answerRange) {
            const midpoint = (answerRange[0] + answerRange[1]) / 2;
            answerLineRef.current = seriesRef.current.createPriceLine({
                price: midpoint,
                color: '#10b981',
                lineWidth: 2,
                lineStyle: 1, 
                axisLabelVisible: true,
                title: 'CORRECT ZONE',
            });
        } else {
            if (answerLineRef.current) {
                seriesRef.current.removePriceLine(answerLineRef.current);
                answerLineRef.current = null;
            }
        }
    }, [showAnswer, answerRange]);

    // 4. Simulation Update Logic
    const simulationIntervalRef = useRef<any>(null);
    useEffect(() => {
        if (showSimulation && futureData && seriesRef.current) {
            let i = 0;
            simulationIntervalRef.current = setInterval(() => {
                if (i < futureData.length) {
                    seriesRef.current.update(futureData[i]);
                    i++;
                } else {
                    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
                }
            }, 500);
        }
        return () => {
            if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        };
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
