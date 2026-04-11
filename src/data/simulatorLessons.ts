import type { SimulatorLesson } from '../types';

export const SIMULATOR_CURRICULUM: SimulatorLesson[] = [
    {
        id: 'sim-sr-1',
        title: 'Identifying the Floor (Support)',
        hook: 'Markets have memory. Big players buy at specific price levels. Can you find where they are waiting?',
        explanation: 'Support is a price level where a downtrend tends to pause due to a concentration of demand. Every time price hits this "floor" and bounces, it gets stronger.',
        realExample: 'Bitcoin bouncing off $60k multiple times in a week.',
        actionableRule: 'Look for 2 or more touches of the same price level where buyers stepped in.',
        level: 'Intermediate',
        category: 'Technical Analysis',
        isSimulator: true,
        xpReward: 500,
        chartTasks: [
            {
                type: 'identify-sr',
                instruction: 'Click on the chart where you see the strongest "Support" floor.',
                targetPriceRange: [41500, 42200],
                hint: 'Look for the lowest price point where candles start turning green.',
                successMessage: 'Great job! You identified the accumulation zone.'
            }
        ],
        simulation: {
            snapshotData: [
                { time: '2024-01-01', open: 44000, high: 44500, low: 43800, close: 44200 },
                { time: '2024-01-02', open: 44200, high: 44300, low: 42000, close: 42500 },
                { time: '2024-01-03', open: 42500, high: 43000, low: 41800, close: 42200 },
                { time: '2024-01-04', open: 42200, high: 43500, low: 42100, close: 43000 },
                { time: '2024-01-05', open: 43000, high: 43200, low: 41900, close: 42100 },
            ],
            futureData: [
                { time: '2024-01-06', open: 42100, high: 44000, low: 42000, close: 43800 },
                { time: '2024-01-07', open: 43800, high: 45000, low: 44000, close: 44800 },
                { time: '2024-01-08', open: 44800, high: 46000, low: 45500, close: 45800 },
            ],
            correctAction: 'buy',
            explanation: 'The price held the 42k support level three times, showing strong buying pressure. A long position here was the high-probability move.'
        }
    },
    {
        id: 'sim-breakout-1',
        title: 'The Volatility Squeeze (Breakout)',
        hook: 'When price gets trapped in a narrow range, energy is building. When it breaks, the move is explosive.',
        explanation: 'A breakout happens when price moves above a resistance level with volume. It signals that buyers have finally overwhelmed the sellers.',
        realExample: 'ETH breaking $2,500 after consolidating for a month.',
        actionableRule: 'A breakout is only valid if it holds above the previous resistance.',
        level: 'Intermediate',
        category: 'Technical Analysis',
        isSimulator: true,
        xpReward: 750,
        chartTasks: [
            {
                type: 'identify-sr',
                instruction: 'Identify the "Resistance" ceiling where price keeps failing.',
                targetPriceRange: [3150, 3220],
                hint: 'Look for the peaks where sellers pushed price down.',
                successMessage: 'Correct! That ceiling is holding back the bulls.'
            }
        ],
        simulation: {
            snapshotData: [
                { time: '2024-02-01', open: 3000, high: 3200, low: 2900, close: 3100 },
                { time: '2024-02-02', open: 3100, high: 3250, low: 3050, close: 3180 },
                { time: '2024-02-03', open: 3180, high: 3210, low: 3150, close: 3170 },
                { time: '2024-02-04', open: 3170, high: 3220, low: 3160, close: 3200 },
            ],
            futureData: [
                { time: '2024-02-05', open: 3200, high: 3500, low: 3190, close: 3450 },
                { time: '2024-02-06', open: 3450, high: 3800, low: 3400, close: 3750 },
            ],
            correctAction: 'buy',
            explanation: 'The tight consolidation just below resistance was a classic "Bullish Flag". The breakout had huge follow-through.'
        }
    }
];
