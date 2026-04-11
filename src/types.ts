export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface CryptoPrice {
    id: string;
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    icon: string;
    color: string;
}

export interface WalletState {
    address: string | null;
    ethBalance: string | null;
    networkName: string | null;
    holdings: PortfolioHolding[];
    isConnecting: boolean;
    isConnected: boolean;
}

export type RightPanelView =
    | 'prices'
    | 'portfolio'
    | 'coin-chart'
    | 'transaction'
    | 'swap'
    | 'watchlist'
    | 'contacts'
    | 'history'
    | 'news-sentiment'
    | 'futures'
    | 'futures-confirm'
    | 'learn-assistant';

export interface AppTransaction {
    id: string;
    type: 'send' | 'swap' | 'receive';
    fromToken: string;
    fromAmount: string;
    toToken?: string;
    toAmount?: string;
    toAddress?: string;
    contactName?: string;
    timestamp: number;
    status: 'pending' | 'success' | 'failed';
    hash: string;
    network: string;
}

export interface TransactionPreview {
    recipientName: string;
    address: string;
    amount: string;
    coin: string;
    estimatedGas: string;
    networkName?: string;
}

export interface SwapPreview {
    fromToken: string;
    fromTokenAddress: string;
    fromAmount: string;
    toToken: string;
    toTokenAddress: string;
    toAmount: string;
    rate: string;
    estimatedGas: string;
    slippage: number;
    rawSwapData?: any;
}

export interface ChartDataPoint {
    time: string;
    price: number;
}

export interface TraderSignal {
    id: string;
    name: string;
    avatar: string;
    signal: string;
    coin: string;
    direction: 'Long' | 'Short';
    entry: number;
    tp: number;
    winRate: number;
    totalSignals: number;
    verified: boolean;
    currentPrice?: number;
    change24h?: number;
}

export interface Signal {
    id: string;
    created_at: string;
    user_id: string;
    coin: string;
    direction: 'Long' | 'Short';
    entry_price: number;
    target_price: number;
    stop_loss: number;
    // Joined from user_data
    trader_name?: string;
    is_verified?: boolean;
}

export interface PortfolioHolding {
    symbol: string;
    name: string;
    amount: number;
    valueUsd: number;
    color: string;
}

export interface CoinGeckoCoin {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    total_volume: number;
    price_change_percentage_24h: number;
    sparkline_in_7d: {
        price: number[];
    };
}

export interface FuturesPosition {
    id: number;
    coin: string;
    coinId: string;
    direction: 'long' | 'short';
    leverage: number;
    entryPrice: number;
    size: number;
    margin: number;
    liquidationPrice: number;
    openedAt: number;
    closedAt?: number;
    status: 'open' | 'closed' | 'liquidated';
    exitPrice?: number;
    pnl?: number;
    pnlPercent?: number;
    stopLoss?: number | null;
    takeProfit?: number | null;
}

export type SidebarFeature =
    | 'portfolio'
    | 'wallet'
    | 'watchlist'
    | 'chart'
    | 'morning'
    | 'journal'
    | 'news-sentiment'
    | 'futures'
    | 'learn';

export interface AcademyLesson {
    id: string;
    title: string;
    hook: string;
    theory: string; // 3-5 lines max
    explanation: string; // Detailed context
    learningGoals: string[];
    activityOverview: string;
    realExample: string;
    actionableRule: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    category: string;
    chartTasks: ChartTask[];
    simulation: SimulationStep;
}

export interface AcademySubsection {
    id: string;
    title: string;
    lessons: AcademyLesson[];
}

export interface AcademyModule {
    id: string;
    title: string;
    description: string;
    subsections: AcademySubsection[];
}

export interface ChartTask {
    type: 'identify-sr' | 'predict-next' | 'mark-breakout';
    instruction: string;
    targetPriceRange?: [number, number];
    targetTimeRange?: [number, number];
    requiredProfit?: number;
    hint: string;
    successMessage: string;
}

export interface SimulationStep {
    snapshotData: any[]; // OHLC data up to the moment of decision
    futureData: any[];   // "The move" that plays out after the decision
    correctAction: 'buy' | 'sell' | 'wait';
    feedback: {
        analysis: string;
        correctApproach: string;
        reasoning: string;
    };
}

export interface UserProgress {
    completedLessonIds: string[];
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export interface NewsArticle {
    title: string;
    url: string;
    source: string;
    thumbnail: string | null;
    publishedAt: string;
    description: string;
}

export interface FearGreedData {
    value: string;
    value_classification: string;
    timestamp: string;
    time_until_update?: string;
}
export interface PriceAlert {
    id: string;
    symbol: string;
    coinId: string;
    targetPrice: number;
    condition: 'above' | 'below';
    isTriggered: boolean;
    createdAt: number;
}

export interface ChartPatternOverlay {
    name: string;
    points: { time: number; price: number; label?: string }[];
    lines: { 
        startPrice: number; 
        endPrice: number; 
        startTime: number; 
        endTime: number; 
        color?: string; 
        type?: 'resistance' | 'support' | 'trend';
        dashed?: boolean;
    }[];
    breakoutZone?: number;
    confidence: 'Low' | 'Medium' | 'High';
}
