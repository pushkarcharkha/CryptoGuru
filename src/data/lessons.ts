import type { Lesson } from '../types';

export const TRADING_CURRICULUM: Lesson[] = [
    {
        id: 'sr-trading',
        title: 'Support & Resistance: Market Memory',
        hook: 'Ever wonder why BTC always seems to bounce at the same price? That\'s not a coincidence—it\'s big players leaving orders at "value" zones.',
        explanation: 'Think of Support as a floor (where buyers step in) and Resistance as a ceiling (where sellers dump). These are zones where the "crowd" agrees the price is too cheap or too expensive.',
        realExample: 'BTC hits $60,000 and drops back to $58,000 three times. $60k is your Resistance ceiling. $58k is your Support floor.',
        actionableRule: 'Never buy directly into Resistance. Always wait for a "Break and Retest"—where the ceiling becomes a new floor.',
        level: 'Beginner',
        category: 'Technical Analysis',
        quiz: [
            {
                id: 'q-sr-1',
                question: 'The price breaks above a strong Resistance. What usually happens next in a healthy trend?',
                options: ['It crashes immediately', 'It usually comes back to test that level as new Support', 'The Resistance level disappears', 'It goes to zero'],
                correctIndex: 1,
                explanation: 'Successful traders look for the "Flip"—when old resistance becomes new support.'
            }
        ]
    },
    {
        id: 'breakout-play',
        title: 'The Breakout Strategy',
        hook: 'Breakouts are where the fastest gains happen. It\'s the moment when "Equal" pressure breaks and one side wins decisively.',
        explanation: 'A breakout happens when price moves out of a defined range with high volume. It signals that a new trend is starting and the old "range" is no longer valid.',
        realExample: 'ETH consolidates between $2,000 and $2,200 for weeks. Suddenly, it hits $2,210 with 3x higher volume than average. That\'s a Breakout.',
        actionableRule: 'Confirm every breakout with VOLUME. A breakout on low volume is often a "Trap" (Fakeout).',
        level: 'Intermediate',
        category: 'Trading Strategies',
        quiz: [
            {
                id: 'q-bo-1',
                question: 'You see price break Resistance, but Volume is falling. What is the risk?',
                options: ['A moon mission', 'A Bull Trap (Fakeout)', 'Guaranteed profit', 'Market closing'],
                correctIndex: 1,
                explanation: 'Low volume breakouts are weak and often reverse quickly, trapping late buyers.'
            }
        ]
    },
    {
        id: 'ema-crossover',
        title: 'The EMA Crossover Strategy',
        hook: 'The trend is your friend, but how do you know when it\'s officially changing? EMA crossovers provide a mechanical signal.',
        explanation: 'We use two Exponential Moving Averages (EMA): a fast one (e.g., 9 or 20) and a slow one (e.g., 50 or 200). When the fast one crosses the slow one, momentum has shifted.',
        realExample: 'In a Bull market, the 20 EMA stays above the 50 EMA. When the 20 crosses below the 50, it\'s a signal to exit or short.',
        actionableRule: 'Golden Cross (Fast crosses above Slow) = Bullish. Death Cross (Fast crosses below Slow) = Bearish.',
        level: 'Intermediate',
        category: 'Trading Strategies',
        quiz: [
            {
                id: 'q-ema-1',
                question: 'What is a "Golden Cross"?',
                options: ['A religious symbol', 'Fast EMA crossing above Slow EMA', 'Fast EMA crossing below Slow EMA', 'Price hitting an all-time high'],
                correctIndex: 1,
                explanation: 'A Golden Cross indicates that short-term momentum is now stronger than long-term momentum.'
            }
        ]
    },
    {
        id: 'risk-mgmt-basics',
        title: 'Risk Management: Survival First',
        hook: '90% of traders fail because they lose too much on one trade. Professional trading is actually just professional risk management.',
        explanation: 'You should never risk more than 1% or 2% of your TOTAL capital on a single trade. If you have $1,000, you should only lose $10 or $20 if your Stop Loss hits.',
        realExample: 'Trader A risks 50% on one trade. Two losses and they are broke. Trader B risks 1%. They need 100 losses in a row to go broke.',
        actionableRule: 'Always calculate your position size based on your Stop Loss, not just "how much I want to buy".',
        level: 'Beginner',
        category: 'Risk Management',
        quiz: [
            {
                id: 'q-risk-1',
                question: 'You have a $10,000 account and follow the 1% risk rule. Your Stop Loss hits. How much did you lose?',
                options: ['$1,000', '$10', '$100', '$500'],
                correctIndex: 2,
                explanation: '1% of $10,000 is $100. This keeps you in the game even after a loss.'
            }
        ]
    },
    {
        id: 'bull-bear-traps',
        title: 'Bull & Bear Traps',
        hook: 'Ever bought a "breakout" only for it to immediately dump? Congratulations, you were part of a Liquidity Trap.',
        explanation: 'Institutions often push price just above a known level to trigger "Buy" orders from retail traders. They use that buying pressure as liquidity to exit their own huge positions.',
        realExample: 'BTC hits a new high of $74,000, stays there for 10 minutes, then crashes back to $72,000. People who bought at $74k are "Trapped".',
        actionableRule: 'Look for "Wicks" (long tails on candles). A long tail at a breakout level is a major warning sign of a trap.',
        level: 'Advanced',
        category: 'Market Psychology',
        quiz: [
            {
                id: 'q-traps-1',
                question: 'What is the primary indicator of a potential Bull Trap?',
                options: ['Low volume on the breakout', 'Long upper wicks', 'Price staying flat', 'Both A and B'],
                correctIndex: 3,
                explanation: 'Both low volume and long upper wicks indicate that the "strength" to stay at new highs isn\'t there.'
            }
        ]
    },
    {
        id: 'volume-confirmation',
        title: 'Volume: The Market Fuel',
        hook: 'Price is the "What", but Volume is the "Why". Without volume, price movements are just random noise.',
        explanation: 'Volume tells you how much money is actually behind a move. If price goes up but volume goes down, the "smart money" isn\'t participating.',
        realExample: 'A pump on low volume is usually a manipulation. A pump on rising volume is a organic, strong trend.',
        actionableRule: 'Valid trends see volume increasing in the direction of the move and decreasing on pullbacks.',
        level: 'Intermediate',
        category: 'Technical Analysis',
        quiz: [
            {
                id: 'q-vol-1',
                question: 'Price is going up, but volume is getting smaller and smaller. What does this indicate?',
                options: ['A strong trend', 'Momentum is dying (exhaustion)', 'More people are buying', 'The market is closed'],
                correctIndex: 1,
                explanation: 'Price rising on low volume shows a lack of conviction from buyers.'
            }
        ]
    },
    {
        id: 'rsi-timing',
        title: 'RSI: Timing Your Entries',
        hook: 'Buying when everyone else is buying is a recipe for disaster. RSI tells you when the crowd is exhausted.',
        explanation: 'The Relative Strength Index (RSI) measures speed and change of price. Above 70 means "Overbought" (too hot), below 30 means "Oversold" (too cold).',
        realExample: 'SOL is up 20% in two hours and RSI is at 85. Buying now is high risk because the "rubber band" is stretched too far.',
        actionableRule: 'Don\'t blindly sell at 70 or buy at 30. Look for "Divergence"—price making a new high while RSI makes a lower high.',
        level: 'Intermediate',
        category: 'Technical Analysis',
        quiz: [
            {
                id: 'q-rsi-1',
                question: 'At what RSI level is a market usually considered "Oversold"?',
                options: ['50', 'Above 70', 'Below 30', '0'],
                correctIndex: 2,
                explanation: 'Below 30 suggests that selling pressure has been extreme and a bounce might be coming.'
            }
        ]
    },
    {
        id: 'trend-following',
        title: 'The Path of Least Resistance',
        hook: 'Trying to predict the "top" or "bottom" is a gambling habit. Trading in the direction of the trend is a winning habit.',
        explanation: 'An Uptrend is a series of Higher Highs and Higher Lows. A Downtrend is Lower Highs and Lower Lows. If you aren\'t seeing these, you are in a sideways range.',
        realExample: 'Market is making green candles every day. Don\'t try to find a reason to "Short". Just look for a dip to "Long".',
        actionableRule: '"The Trend is your friend until the very end." Never trade against the current dominant trend.',
        level: 'Beginner',
        category: 'Trading Basics',
        quiz: [
            {
                id: 'q-trend-1',
                question: 'What defines a confirmed Uptrend?',
                options: ['Green candles', 'Higher Highs and Higher Lows', 'Fast price movement', 'A tweet from an influencer'],
                correctIndex: 1,
                explanation: 'The structural definition of an uptrend is consistently higher peaks and higher troughs.'
            }
        ]
    },
    {
        id: 'stop-loss-mastery',
        title: 'Stop Loss Mastery',
        hook: 'A Stop Loss is not an admission of failure; it is an "Insurance Policy" for your capital.',
        explanation: 'Every trade has a point where it is "proven wrong". If you buy a breakout and price goes back into the range, the breakout failed. That\'s your stop.',
        realExample: 'You buy ETH at $3,000 because of Support. If ETH closes below $2,950, that "Support" is broken. You MUST exit.',
        actionableRule: 'Set your Stop Loss BEFORE you enter the trade. Never move your stop-loss further away once you are in.',
        level: 'Intermediate',
        category: 'Risk Management',
        quiz: [
            {
                id: 'q-sl-1',
                question: 'You are in a losing trade and it\'s approaching your SL. Should you move the SL lower to give it "room to breathe"?',
                options: ['Yes, crypto is volatile', 'No, that\'s how you get liquidated', 'Only if you feel lucky', 'If the news is good'],
                correctIndex: 1,
                explanation: 'Moving a stop loss is a sign of emotional trading and leads to massive losses.'
            }
        ]
    },
    {
        id: 'position-sizing',
        title: 'Position Sizing Secrets',
        hook: 'Did you know that you can lose 60% of your trades and still be profitable? It\'s all about how much money you put in each trade.',
        explanation: 'Position sizing is how many coins you buy. It’s calculated by: (Risk Amount) / (Distance to Stop Loss). This ensures every loss is the SAME dollar amount.',
        realExample: 'Risking $100. Stop 1 is $10 away -> Buy 10 units. Stop 2 is $20 away -> Buy only 5 units.',
        actionableRule: 'Smaller stops allow larger position sizes. Larger stops require smaller position sizes. Risk stays constant.',
        level: 'Advanced',
        category: 'Risk Management',
        quiz: [
            {
                id: 'q-ps-1',
                question: 'If your Stop Loss is very far away, should your position size be larger or smaller?',
                options: ['Larger', 'Smaller', 'The same', 'Doesn\'t matter'],
                correctIndex: 1,
                explanation: 'A wider stop requires a smaller position to keep the actual dollar risk the same.'
            }
        ]
    }
];
