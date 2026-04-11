import type { AcademyModule } from '../types';

export const ACADEMY_CURRICULUM: AcademyModule[] = [
    {
        id: 'mod-1',
        title: 'Foundations of Trading',
        description: 'Master the core mechanics of price action and market structure.',
        subsections: [
            {
                id: 'sub-1-1',
                title: 'Market Mechanics',
                lessons: [
                    {
                        id: 'lesson-1-1-1',
                        title: 'What is a Trade?',
                        hook: 'Trading isn\'t gambling; it\'s providing liquidity to the market in exchange for profit. Are you ready to think like a liquidity provider?',
                        theory: 'At its core, trading is the exchange of one asset for another. Prices move when there is an imbalance between buyers (demand) and sellers (supply). Understanding this flow is the first step to profitable trading.',
                        explanation: 'Markets are auction systems. When more people want to buy (Demand) than sell (Supply), the price goes up to find new sellers. When they want to sell more than buy, the price drops to find new buyers.',
                        learningGoals: ['Understand Supply vs Demand', 'Learn why prices move', 'Identify market participants'],
                        activityOverview: 'Analyze a simple supply imbalance and decide whether the next move is up or down.',
                        realExample: 'Bitcoin rising from $15k to $30k because of institutional demand.',
                        actionableRule: 'Follow the path of least resistance: where is the volume flowing?',
                        level: 'Beginner',
                        category: 'Foundations',
                        chartTasks: [{
                            type: 'identify-sr',
                            instruction: 'Click on the area where the buyers suddenly overwhelmed the sellers.',
                            targetPriceRange: [25000, 26000],
                            hint: 'Look for the cluster of big green candles.',
                            successMessage: 'Correct! That\'s an aggressive demand zone.'
                        }],
                        simulation: {
                            snapshotData: [
                                { time: '2024-01-01', open: 24000, high: 24500, low: 23800, close: 24200 },
                                { time: '2024-01-02', open: 24200, high: 26000, low: 24000, close: 25800 },
                            ],
                            futureData: [
                                { time: '2024-01-03', open: 25800, high: 28000, low: 25500, close: 27500 },
                                { time: '2024-01-04', open: 27500, high: 30000, low: 27000, close: 29500 },
                            ],
                            correctAction: 'buy',
                            feedback: {
                                analysis: 'The move was justified by the massive volume breakout on Jan 2nd.',
                                correctApproach: 'Enter on the break of the previous high with a stop below the breakout candle.',
                                reasoning: 'Momentum usually carries price further once a major resistance level is cleared with high volume.'
                            }
                        }
                    },
                    {
                        id: 'lesson-1-1-2',
                        title: 'Types of Markets',
                        hook: 'Not all charts are created equal. Discover the difference between High-Volatility Crypto and Stable Stocks.',
                        theory: 'Equity markets represent ownership in companies, while Crypto markets are decentralized digital assets. Market behavior varies by liquidity and participant types.',
                        explanation: 'Crypto markets are 24/7 and highly volatile, making them great for high-reward trades but dangerous for the undisciplined. Equity markets have set hours and different regulatory drivers.',
                        learningGoals: ['Distinguish Crypto vs Stocks', 'Understand 24/7 market cycles', 'Identify high-liquidity assets'],
                        activityOverview: 'Compare two charts and identify which one represents a highly volatile crypto asset.',
                        realExample: 'BTC 10% move in an hour vs S&P 500 1% move in a day.',
                        actionableRule: 'Adjust your risk based on the volatility of the specific market.',
                        level: 'Beginner',
                        category: 'Foundations',
                        chartTasks: [{
                            type: 'identify-sr',
                            instruction: 'In this high-volatility environment, identify the "Extreme" wick that trapped late shorts.',
                            targetPriceRange: [38000, 39000],
                            hint: 'Look for the longest lower tail.',
                            successMessage: 'Spot on. That wick represents a massive "Short Squeeze".'
                        }],
                        simulation: {
                            snapshotData: [
                                { time: '2024-02-01', open: 42000, high: 42500, low: 38500, close: 41000 },
                            ],
                            futureData: [
                                { time: '2024-02-02', open: 41000, high: 45000, low: 40500, close: 44000 },
                            ],
                            correctAction: 'buy',
                            feedback: {
                                analysis: 'The long wick showed that buyers were aggressive at low prices.',
                                correctApproach: 'In volatile markets, look for "V-shaped" recoveries after deep wicks.',
                                reasoning: 'Aggressive wicks often signify that big players are "hunting" stop losses before moving the price higher.'
                            }
                        }
                    }
                ]
            }
        ]
    },
    {
        id: 'mod-2',
        title: 'Candlestick Mastery',
        description: 'Read the language of the market. Every candle tells a story of psychology.',
        subsections: [
            {
                id: 'sub-2-1',
                title: 'Candle Structure',
                lessons: [
                    {
                        id: 'lesson-2-1-1',
                        title: 'Bullish vs Bearish',
                        hook: 'Red and Green are just colors. It\'s the distance between Open and Close that matters. Can you read the strength?',
                        theory: 'A candlestick has a body (Open to Close) and wicks (High/Low). A large body shows strong conviction, while long wicks show rejection and uncertainty.',
                        explanation: 'The "Real Body" represents the actual price movement where most volume was traded. If it\'s green, bulls won. If it\'s red, bears took control.',
                        learningGoals: ['Identify Open/Close/High/Low', 'Compare Body vs Wick size', 'Spot conviction moves'],
                        activityOverview: 'Mark the candle with the highest bullish conviction in this sequence.',
                        realExample: 'A "Marubozu" candle appearing before a 20% pump.',
                        actionableRule: 'Size matters. Look for bodies that are 3x larger than surrounding candles for true signals.',
                        level: 'Beginner',
                        category: 'Candlesticks',
                        chartTasks: [{
                            type: 'identify-sr',
                            instruction: 'Click the candle that shows the strongest "Buying Conviction".',
                            targetPriceRange: [45000, 47000],
                            hint: 'Look for the largest green body with minimal wicks.',
                            successMessage: 'That\'s it. The bulls were in total control there.'
                        }],
                        simulation: {
                            snapshotData: [
                                { time: '2024-03-01', open: 44000, high: 44200, low: 43800, close: 44100 },
                                { time: '2024-03-02', open: 44100, high: 47000, low: 44000, close: 46800 },
                            ],
                            futureData: [
                                { time: '2024-03-03', open: 46800, high: 49000, low: 46500, close: 48500 },
                                { time: '2024-03-04', open: 48500, high: 51000, low: 48000, close: 50500 },
                            ],
                            correctAction: 'buy',
                            feedback: {
                                analysis: 'The large green candle confirmed that buyers were willing to pay higher prices throughout the day.',
                                correctApproach: 'Enter at the close of a high-conviction candle if it breaks a recent range.',
                                reasoning: 'Strong closes near the high of the day suggest that the trend will continue as late-comers fomo in.'
                            }
                        }
                    }
                ]
            }
        ]
    },
    {
        id: 'mod-3',
        title: 'Technical Analysis',
        description: 'Map the battlefield. Identify invisible zones of power.',
        subsections: [
            {
                id: 'sub-3-1',
                title: 'Support & Resistance',
                lessons: [
                    {
                        id: 'lesson-3-1-1',
                        title: 'Identifying the Floor',
                        hook: 'Markets have memory. Big players buy at specific price levels. Can you find where they are waiting?',
                        theory: 'Support is a price level where a downtrend tends to pause due to a concentration of demand. Every time price hits this "floor" and bounces, it gets stronger.',
                        explanation: 'Think of support as an area where buyers become more aggressive than sellers. It\'s often a psychological level or a previous high/low.',
                        learningGoals: ['Find multiple touchpoints', 'Differentiate between Line vs Zone', 'Verify retest strength'],
                        activityOverview: 'Find the floor in a consolidation phase and prepare for the reversal.',
                        realExample: 'Bitcoin bouncing off $19k during the 2022 bear market.',
                        actionableRule: 'The more times a level is tested and holds, the stronger the support becomes.',
                        level: 'Beginner',
                        category: 'TA',
                        chartTasks: [{
                            type: 'identify-sr',
                            instruction: 'Mark the "Support Floor" where price has bounced twice.',
                            targetPriceRange: [30000, 31000],
                            hint: 'Look for two identical lows.',
                            successMessage: 'Perfectly identified. The floor is set.'
                        }],
                        simulation: {
                            snapshotData: [
                                { time: '2024-04-01', open: 35000, high: 36000, low: 34000, close: 34500 },
                                { time: '2024-04-02', open: 34500, high: 35000, low: 30500, close: 30800 },
                                { time: '2024-04-03', open: 30800, high: 32000, low: 30500, close: 31000 },
                            ],
                            futureData: [
                                { time: '2024-04-04', open: 31000, high: 36000, low: 30800, close: 35500 },
                            ],
                            correctAction: 'buy',
                            feedback: {
                                analysis: 'Buying at technical support offers the highest risk-reward ratio.',
                                correctApproach: 'Set your stop loss slightly below the support zone to avoid getting wicked out.',
                                reasoning: 'When a level is defended twice, it proves a "Wall of Money" is sitting there.'
                            }
                        }
                    },
                    {
                        id: 'lesson-3-1-2',
                        title: 'The Bull Trap (Fake Breakout)',
                        hook: 'Not all green candles are your friend. Sometimes the "Breakout" is just bait. are you the hunter or the prey?',
                        theory: 'A Bull Trap occurs when price breaks a resistance level on low volume and quickly reverses. It "traps" breakout buyers who are then forced to sell as price drops, fueling a faster crash.',
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
        id: 'mod-4',
        title: 'Chart Patterns',
        description: 'See the shapes of greed and fear. Master the repeatable blueprints of market moves.',
        subsections: [
            {
                id: 'sub-4-1',
                title: 'Classic Formations',
                lessons: [
                    {
                        id: 'lesson-4-1-1',
                        title: 'The Head & Shoulders (The Reversal)',
                        hook: 'The market tries to go higher, fails, then fails again. This is the signal that the trend is dying.',
                        theory: 'This pattern consists of a peak (left shoulder), a higher peak (head), and a lower peak (right shoulder). It signals a shift from an uptrend to a downtrend.',
                        explanation: 'The pattern illustrates the exhaustion of buyers. The "Neckline" is the critical support level that, when broken, confirms the reversal.',
                        learningGoals: ['Identify 3 peak structures', 'Draw the Neckline', 'Calculate potential targets'],
                        activityOverview: 'Spot the dying trend and identify the "Neckline" that must break for a short entry.',
                        realExample: 'The May 2021 BTC crash started with a clear H&S pattern.',
                        actionableRule: 'Wait for the neckline break + retest before entering. Don\'t anticipate.',
                        level: 'Intermediate',
                        category: 'Patterns',
                        chartTasks: [{
                            type: 'identify-sr',
                            instruction: 'Click on the "Neckline" Support that the market is struggling to hold.',
                            targetPriceRange: [58000, 60000],
                            hint: 'Draw a line connecting the lows between the shoulders.',
                            successMessage: 'Great. If this breaks, the party is over.'
                        }],
                        simulation: {
                            snapshotData: [
                                { time: '2024-05-01', open: 60000, high: 65000, low: 59000, close: 64000 }, // Left
                                { time: '2024-05-02', open: 64000, high: 70000, low: 60000, close: 68000 }, // Head
                                { time: '2024-05-03', open: 68000, high: 65000, low: 61000, close: 63000 }, // Right
                            ],
                            futureData: [
                                { time: '2024-05-04', open: 63000, high: 63500, low: 55000, close: 56000 },
                                { time: '2024-05-05', open: 56000, high: 57000, low: 50000, close: 51000 },
                            ],
                            correctAction: 'sell',
                            feedback: {
                                analysis: 'The break of the neckline at 60k triggered a cascade of sell orders.',
                                correctApproach: 'Short the retest of the neckline or the immediate break with a stop above the right shoulder.',
                                reasoning: 'Failed highs (the right shoulder being lower than the head) proved that bulls no longer had the strength to trend.'
                            }
                        }
                    }
                ]
            }
        ]
    },
    {
        id: 'mod-5',
        title: 'Trading Strategies',
        description: 'Combine your skills into winning systems.',
        subsections: [
            { 
                id: 'sub-5-1', 
                title: 'Trend Following', 
                lessons: [
                    {
                        id: 'lesson-5-1-1',
                        title: 'The EMA Cross',
                        hook: 'Ride the momentum of the big whales. Large institutions use moving averages to stay on the right side of the trend.',
                        theory: 'Moving averages smooth out price action. When a faster average crosses above a slower one, it signifies a shift in momentum to the upside (Golden Cross).',
                        explanation: 'The EMA 50 and 200 are the most watched levels. A cross suggests that the short-term trend is now stronger than the long-term trend.',
                        learningGoals: ['Understand EMA 50/200', 'Identify trend shifts', 'Enter on pullbacks'],
                        activityOverview: 'Wait for the Golden Cross and identify the perfect entry on the first successful retest.',
                        realExample: 'BTC Golden Cross in 2023 leading to a 100% rally.',
                        actionableRule: 'Never trade against the 200 EMA. It is the line in the sand between a bull and bear market.',
                        level: 'Intermediate',
                        category: 'Strategies',
                        chartTasks: [{
                            type: 'identify-sr',
                            instruction: 'Mark the "Retest" point after the EMA cross where buyers stepped back in.',
                            targetPriceRange: [42000, 43000],
                            hint: 'Look for the first touch of the blue line after the cross.',
                            successMessage: 'Excellent. That is a high-probability "Buy the Dip" setup.'
                        }],
                        simulation: {
                            snapshotData: [
                                { time: '2024-06-01', open: 40000, high: 41000, low: 39500, close: 40500 },
                                { time: '2024-06-02', open: 40500, high: 44000, low: 40500, close: 43500 },
                            ],
                            futureData: [
                                { time: '2024-06-03', open: 43500, high: 48000, low: 43000, close: 47000 },
                                { time: '2024-06-04', open: 47000, high: 52000, low: 46000, close: 51000 },
                            ],
                            correctAction: 'buy',
                            feedback: {
                                analysis: 'The strategy worked because the long-term trend was finally confirmed by the cross.',
                                correctApproach: 'Always look for confirmation. A cross without volume is a trap.',
                                reasoning: 'Trends tend to persist. Once the moving averages align, the path of least resistance is clear.'
                            }
                        }
                    },
                    {
                        id: 'lesson-5-1-2',
                        title: 'The Squeeze & Release',
                        hook: 'When price gets trapped in a narrow range, energy is building. When it breaks, the move is explosive.',
                        theory: 'A breakout happens when price moves above a resistance level with volume. It signals that buyers have finally overwhelmed the sellers.',
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
        id: 'mod-6',
        title: 'Risk Management',
        description: 'Survival is the first step to success.',
        subsections: [
            { 
                id: 'sub-6-1', 
                title: 'Position Sizing', 
                lessons: [
                    {
                        id: 'lesson-6-1-1',
                        title: 'The 1% Rule',
                        hook: 'Even if you lose 10 times in a row, this rule will keep you in the game. Do you value your capital?',
                        theory: 'Never risk more than 1% of your total account on a single trade. This ensures that a losing streak doesn\'t cause emotional or financial ruin.',
                        explanation: 'Position sizing is the calculation of how many units of an asset to buy based on the distance to your stop loss and your risk tolerance.',
                        learningGoals: ['Calculate risk per trade', 'Understand Stop Loss importance', 'Manage account drawdown'],
                        activityOverview: 'Given an account size and stop loss distance, identify the maximum position size allowed.',
                        realExample: 'A trader with $10k risks only $100 per trade, surviving a 5-trade losing streak.',
                        actionableRule: 'Size the position to the trade, not the trade to the position.',
                        level: 'Beginner',
                        category: 'Risk',
                        chartTasks: [{
                            type: 'identify-sr',
                            instruction: 'Click where your Stop Loss should be to risk only the wick of the current candle.',
                            targetPriceRange: [39000, 40000],
                            hint: 'Look for the lowest point of the previous red candle.',
                            successMessage: 'Correct. A tight stop loss allows for larger position size while keeping risk low.'
                        }],
                        simulation: {
                            snapshotData: [
                                { time: '2024-07-01', open: 45000, high: 46000, low: 44500, close: 45800 },
                            ],
                            futureData: [
                                { time: '2024-07-02', open: 45800, high: 47000, low: 45500, close: 46500 },
                            ],
                            correctAction: 'wait',
                            feedback: {
                                analysis: 'Risk was too high for a market entry here without a clear setup.',
                                correctApproach: 'If the risk-reward is less than 2:1, skip the trade entirely.',
                                reasoning: 'Professional trading is a game of statistics. Protecting capital is more important than catching every move.'
                            }
                        }
                    }
                ] 
            }
        ]
    },
    {
        id: 'mod-7',
        title: 'Psychology',
        description: 'The hardest opponent is yourself.',
        subsections: [
            { 
                id: 'sub-7-1', 
                title: 'Emotional Discipline', 
                lessons: [
                    {
                        id: 'lesson-7-1-1',
                        title: 'Overcoming FOMO',
                        hook: 'The price is pumping and everyone is talking about it. This is exactly when you should probably be doing nothing.',
                        theory: 'Fear Of Missing Out (FOMO) leads to buying at the top. Professionals wait for pullbacks, while amateurs chase green candles.',
                        explanation: 'FOMO is an evolutionary response to being left out of a group success. In trading, this biological urge leads to poor entries and high risk.',
                        learningGoals: ['Recognize FOMO triggers', 'Wait for retests', 'Maintain objectivity'],
                        activityOverview: 'Watch a parabolic pump and decide whether to chase or wait for the inevitable correction.',
                        realExample: 'Retail investors buying BTC at $69k because of social media hype.',
                        actionableRule: 'If you feel "excited" about a trade, it\'s likely a bad entry. High-quality trades feel boring.',
                        level: 'Beginner',
                        category: 'Psychology',
                        chartTasks: [{
                            type: 'identify-sr',
                            instruction: 'Identify the level where price "blew off" and buyers became exhausted.',
                            targetPriceRange: [65000, 69000],
                            hint: 'Look for the very top of the massive green vertical move.',
                            successMessage: 'Correct. That was the FOMO peak.'
                        }],
                        simulation: {
                            snapshotData: [
                                { time: '2024-08-01', open: 50000, high: 69000, low: 50000, close: 68000 },
                            ],
                            futureData: [
                                { time: '2024-08-02', open: 68000, high: 68500, low: 55000, close: 56000 },
                                { time: '2024-08-03', open: 56000, high: 57000, low: 48000, close: 49000 },
                            ],
                            correctAction: 'wait',
                            feedback: {
                                analysis: 'Waiting was the right move. The "Blow-off Top" resulted in a massive crash.',
                                correctApproach: 'Treat every parabolic move as a trap until a stable support base is built.',
                                reasoning: 'What goes up vertically must come down. Buyers at the top are "exit liquidity" for smart money.'
                            }
                        }
                    }
                ] 
            }
        ]
    },
    {
        id: 'mod-8',
        title: 'Advanced Concepts',
        description: 'Learn the secrets of institutional whales.',
        subsections: [
            { 
                id: 'sub-8-1', 
                title: 'Market Structure', 
                lessons: [
                    {
                        id: 'lesson-8-1-1',
                        title: 'Liquidity Sweeps',
                        hook: 'Ever wonder why your stop loss gets hit right before price goes your way? You just provided liquidity to a whale.',
                        theory: 'Institutions need massive volume to enter positions. They often push price into "Stop Loss Zones" to trigger sell orders they can buy into.',
                        explanation: 'A Liquidity Sweep occurs when price briefly breaks a major support/resistance level, triggering stops, and then quickly reverses.',
                        learningGoals: ['Spot equal highs/lows', 'Identify "Stop Hunts"', 'Enter on the SFP (Swing Failure Pattern)'],
                        activityOverview: 'Identify a manipulation wick and enter the trade when most traders are panicking.',
                        realExample: 'BTC dropping to $25k to sweep lows before the rally to $40k.',
                        actionableRule: 'Look for the "Sweep and Close Back In". This is the highest conviction reversal signal.',
                        level: 'Advanced',
                        category: 'Advanced',
                        chartTasks: [{
                            type: 'identify-sr',
                            instruction: 'Click the "Manipulation Wick" that swept the previous lows.',
                            targetPriceRange: [24000, 25000],
                            hint: 'Look for the deep needle that touched the old support then recovered.',
                            successMessage: 'Pro move. You just spotted the institution clearing the retail stops.'
                        }],
                        simulation: {
                            snapshotData: [
                                { time: '2024-09-01', open: 30000, high: 32000, low: 29500, close: 31000 },
                                { time: '2024-09-02', open: 31000, high: 31500, low: 24500, close: 30500 }, // The sweep
                            ],
                            futureData: [
                                { time: '2024-09-03', open: 30500, high: 38000, low: 30000, close: 37000 },
                                { time: '2024-09-04', open: 37000, high: 45000, low: 36000, close: 44000 },
                            ],
                            correctAction: 'buy',
                            feedback: {
                                analysis: 'The trade was perfect. You bought when the market offered the most liquidity!',
                                correctApproach: 'Enter once the candle closes back above the old support level on high volume.',
                                reasoning: 'Whales use retail fear to fill their orders. When the floor "breaks" and then holds, the real move begins.'
                            }
                        }
                    }
                ] 
            }
        ]
    },
    {
        id: 'mod-9',
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
                        theory: 'RSI Divergence happens when price makes a higher high, but the Relative Strength Index makes a lower high. It shows that although price is rising, the strength behind the move is dying.',
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
