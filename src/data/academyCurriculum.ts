import type { AcademyModule } from '../types';

export const ACADEMY_CURRICULUM: AcademyModule[] = [
    {
        id: 'mod-1',
        title: 'Market Foundations',
        description: 'Master the core mechanics of price action and market structure.',
        subsections: [
            {
                id: 'sub-1-1',
                title: 'Supply and Demand',
                lessons: [
                    {
                        id: 'lesson-1-1-1',
                        title: 'Identifying the Floor (Support)',
                        hook: 'Markets have memory. Big players buy at specific price levels. Can you find where they are waiting?',
                        explanation: 'Support is a price level where a downtrend tends to pause due to a concentration of demand. Every time price hits this "floor" and bounces, it gets stronger.',
                        learningGoals: [
                            'Understand the psychology behind support zones',
                            'Identify multiple touchpoints on a horizontal level',
                            'Determine high-probability accumulation zones'
                        ],
                        activityOverview: 'You will analyze a consolidation phase, mark the primary support floor, and execute a buy order when the price retests the level.',
                        realExample: 'Bitcoin bouncing off $60k multiple times in a week.',
                        actionableRule: 'Look for 2 or more touches of the same price level where buyers stepped in.',
                        level: 'Beginner',
                        category: 'Technical Analysis',
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
                            feedback: {
                                analysis: 'The trade was highly profitable because the 42k level had significant historical demand and failed to break on multiple tests.',
                                correctApproach: 'Place a buy limit order slightly above the support line with a stop loss just below the lowest wick.',
                                reasoning: 'When price returns to a proven support level, the risk-to-reward ratio is at its peak. Sellers are exhausted, and limit orders from institutional buyers are triggered.'
                            }
                        }
                    },
                    {
                        id: 'lesson-1-1-2',
                        title: 'The Bull Trap (Fake Breakout)',
                        hook: 'Not all green candles are your friend. Sometimes the "Breakout" is just bait. are you the hunter or the prey?',
                        explanation: 'A Bull Trap occurs when price breaks a resistance level on low volume and quickly reverses. It "traps" breakout buyers who are then forced to sell as price drops, fueling a faster crash.',
                        learningGoals: [
                            'Identify low-volume breakouts',
                            'Recognize long upper wicks at resistance',
                            'Understand "Liquidity Grabs" by institutional players'
                        ],
                        activityOverview: 'Analyze a breakout that looks strong but lacks volume. You must decide whether to chase the pump or wait for the trap to spring.',
                        realExample: 'BTC hitting a new high of $74k for 10 minutes then crashing to $70k.',
                        actionableRule: 'A breakout without a significant high-volume spike is a trap until proven otherwise.',
                        level: 'Advanced',
                        category: 'Market Psychology',
                        chartTasks: [
                            {
                                type: 'identify-sr',
                                instruction: 'Click on the candle that shows the "Trap"—where buyers were lured in at the top.',
                                targetPriceRange: [73500, 74500],
                                hint: 'Look for the candle with the longest upper wick.',
                                successMessage: 'Exactly. That tail shows aggressive selling at the highs.'
                            }
                        ],
                        simulation: {
                            snapshotData: [
                                { time: '2024-05-01', open: 70000, high: 71000, low: 69500, close: 70500 },
                                { time: '2024-05-02', open: 70500, high: 74000, low: 70200, close: 73800 },
                            ],
                            futureData: [
                                { time: '2024-05-03', open: 73800, high: 73900, low: 68000, close: 69000 },
                                { time: '2024-05-04', open: 69000, high: 69500, low: 65000, close: 66000 },
                            ],
                            correctAction: 'wait',
                            feedback: {
                                analysis: 'Chasing this high was a mistake because the breakout candle had lower volume than the previous consolidation. It was a "Liquidity Grab".',
                                correctApproach: 'Wait for a "Retest" and a successful bounce off the old resistance before entering. If it fails to hold, it was a trap.',
                                reasoning: 'Large players need someone to buy their coins so they can sell. By pushing the price slightly above a known level, they trigger retail buy orders, creating the "Liquidity" they need to exit.'
                            }
                        }
                    }
                ]
            }
        ]
    },
    {
        id: 'mod-2',
        title: 'Breakout Strategies',
        description: 'Learn to trade volatility transitions and trend shifts.',
        subsections: [
            {
                id: 'sub-2-1',
                title: 'V-Squeeze Mastery',
                lessons: [
                    {
                        id: 'lesson-2-1-1',
                        title: 'The Squeeze & Release',
                        hook: 'When price gets trapped in a narrow range, energy is building. When it breaks, the move is explosive.',
                        explanation: 'A breakout happens when price moves above a resistance level with volume. It signals that buyers have finally overwhelmed the sellers.',
                        learningGoals: [
                            'Identify tightening price ranges (squeezes)',
                            'Spot valid resistance ceilings',
                            'Distinguish between high-volume breakouts and low-volume traps'
                        ],
                        activityOverview: 'Mark the resistance ceiling on an ETH chart and execute a breakout trade when volatility spikes.',
                        realExample: 'ETH breaking $2,500 after consolidating for a month.',
                        actionableRule: 'A breakout is only valid if it holds above the previous resistance.',
                        level: 'Intermediate',
                        category: 'Technical Analysis',
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
                            feedback: {
                                analysis: 'The consolidation below resistance acted as a "Bullish Flag". The break above 3200 confirmed the buyers were in control.',
                                correctApproach: 'Wait for a candle to close above the resistance line before entering, or use a "Stop Market" order.',
                                reasoning: 'Resistance levels are areas where short-sellers have placed their stops. When the level breaks, those stops become market buy orders, fueling the upward momentum.'
                            }
                        }
                    }
                ]
            }
        ]
    },
    {
        id: 'mod-risk',
        title: 'Risk Management',
        description: 'The science of survival. Learn how to protect your capital like a professional.',
        subsections: [
            {
                id: 'sub-risk-1',
                title: 'Position Sizing',
                lessons: [
                    {
                        id: 'lesson-risk-1-1',
                        title: 'The 1% Rule',
                        hook: 'Amateurs focus on how much they can win. Professionals focus on how much they can afford to lose.',
                        explanation: 'Never risk more than 1% of your total account on a single trade. This ensures that even a 10-trade losing streak only costs you 10% of your capital, not 100%.',
                        learningGoals: [
                            'Calculate risk per trade',
                            'Understand the difference between trade size and risk amount',
                            'Master the psychology of defensive trading'
                        ],
                        activityOverview: 'You will be presented with an account balance and a stop loss. You must identify the correct entry point that honors the 1% risk rule.',
                        realExample: 'A $10,000 account risking only $100 per trade.',
                        actionableRule: 'Total Account x 0.01 = Maximum Loss allowed per trade.',
                        level: 'Beginner',
                        category: 'Risk Management',
                        chartTasks: [
                            {
                                type: 'identify-sr',
                                instruction: 'Mark the "Neutral Zone" where you should NOT entry because the risk is too high.',
                                targetPriceRange: [42500, 43500],
                                hint: 'Look for the "No Mans Land" far from support.',
                                successMessage: 'Perfect. Patience is a trader\'s best weapon.'
                            }
                        ],
                        simulation: {
                            snapshotData: [
                                { time: '2024-03-01', open: 40000, high: 43000, low: 39500, close: 42000 },
                                { time: '2024-03-02', open: 42000, high: 42500, low: 41000, close: 41500 },
                            ],
                            futureData: [
                                { time: '2024-03-03', open: 41500, high: 40000, low: 39000, close: 39500 },
                            ],
                            correctAction: 'wait',
                            feedback: {
                                analysis: 'The market was in a state of high volatility with no clear support nearby. Entering here would have forced a massive stop loss.',
                                correctApproach: 'Wait for a clearer structure or a pullback to the 40k level before risking capital.',
                                reasoning: 'Poor entries force large stop losses, which significantly reduces your position size and potential profit.'
                            }
                        }
                    }
                ]
            }
        ]
    },
    {
        id: 'mod-indicators',
        title: 'Indicator Mastery',
        description: 'Use mathematical tools to filter noise and confirm momentum.',
        subsections: [
            {
                id: 'sub-ind-1',
                title: 'Momentum Tools',
                lessons: [
                    {
                        id: 'lesson-ind-1-1',
                        title: 'RSI Divergence',
                        hook: 'When price and momentum disagree, a reversal is imminent. Learn to see the "Hidden" exhaustion.',
                        explanation: 'RSI Divergence happens when price makes a higher high, but the Relative Strength Index makes a lower high. It shows that although price is rising, the strength behind the move is dying.',
                        learningGoals: [
                            'Identify Overbought and Oversold conditions',
                            'Spot Bearish and Bullish Divergence',
                            'Combine RSI avec Price Action for high-winrate entries'
                        ],
                        activityOverview: 'Analyze a rising trend where price is making new highs. Find the moment RSI fails to keep up and prepare for a reversal.',
                        realExample: 'BTC reaching $73k while RSI drops from 80 to 65.',
                        actionableRule: 'Price High + RSI Lower High = Prepare for a dump.',
                        level: 'Intermediate',
                        category: 'Technical Analysis',
                        chartTasks: [
                            {
                                type: 'identify-sr',
                                instruction: 'Click the peak where momentum (RSI) began to fade from its high.',
                                targetPriceRange: [72000, 73500],
                                hint: 'Look for the final "Blow off top" where wicks are long.',
                                successMessage: 'Excellent eye. You spotted the exhaustion.'
                            }
                        ],
                        simulation: {
                            snapshotData: [
                                { time: '2024-04-01', open: 65000, high: 68000, low: 64000, close: 67000 },
                                { time: '2024-04-02', open: 67000, high: 71000, low: 66000, close: 70000 },
                                { time: '2024-04-03', open: 70000, high: 73000, low: 69000, close: 72500 },
                            ],
                            futureData: [
                                { time: '2024-04-04', open: 72500, high: 72600, low: 65000, close: 66000 },
                                { time: '2024-04-05', open: 66000, high: 67000, low: 60000, close: 62000 },
                            ],
                            correctAction: 'sell',
                            feedback: {
                                analysis: 'The trade was successful because you identified "Bearish Divergence". Price was grinding higher, but there were no new buyers at the top.',
                                correctApproach: 'When RSI diverges at a resistance level, shorten your profit targets or look for a short entry.',
                                reasoning: 'Indicators like RSI serve as a "Speedometer". If price is still going 100mph but the engine (RSI) is at 3000 RPM instead of 7000, the car will soon slow down.'
                            }
                        }
                    }
                ]
            }
        ]
    }
];
