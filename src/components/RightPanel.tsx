import React from 'react';
import {
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import type { CryptoPrice, RightPanelView, WalletState, TransactionPreview, SwapPreview, AppTransaction, CoinGeckoCoin, NewsArticle, FearGreedData, FuturesPosition, Message, AcademyLesson } from '../types';
import NewsSentimentPanel from './NewsSentimentPanel';
import FuturesPanel from './FuturesPanel';
import { TechnicalAnalysisChart } from './TechnicalAnalysisChart';
import { AnimatedNumber } from './AnimatedNumber';
import {
    Send as SendIcon,
    AlertTriangle,
    User,
    Trash2,
    Search,
    Book,
    CheckCircle,
    XCircle,
    Clock,
    CornerDownRight,
    ArrowRightLeft,
    DollarSign,
    Activity
} from 'lucide-react';

interface RightPanelProps {
    view: RightPanelView;
    prices: CryptoPrice[];
    pricesLoading: boolean;
    wallet: WalletState;
    transactionPreview?: TransactionPreview | null;
    swapPreview?: SwapPreview | null;
    contacts?: Record<string, string>;
    onContactSendClick?: (name: string) => void;
    onContactDeleteClick?: (name: string) => void;
    onConfirmTransactionClick?: () => void;
    onConfirmSwapClick?: () => void;
    onSwitchNetwork?: (targetChainId: number) => Promise<void>;
    history?: AppTransaction[];
    allCoins?: CoinGeckoCoin[];
    watchlistCoins?: CoinGeckoCoin[];
    onToggleWatchlist?: (coinId: string) => void;
    isInWatchlist?: (coinId: string) => boolean;
    watchlistLoading?: boolean;
    watchlistLastUpdated?: number;
    onCoinClick?: (coin: CoinGeckoCoin) => void;
    activeCoin?: CoinGeckoCoin | null;
    newsData?: NewsArticle[];
    fearGreedData?: FearGreedData[];
    newsLoading?: boolean;
    newsError?: string | null;
    newsLastUpdated?: number | null;
    futuresBalance?: number;
    futuresPositions?: FuturesPosition[];
    onCloseFuturesPosition?: (id: number, currentPrice: number) => void;
    futuresPrices?: Record<string, { usd: number }> | null;
    pendingFuturesPosition?: any | null;
    onConfirmFutures?: (sl?: number, tp?: number) => void;
    onDeclineFutures?: () => void;
    chartShouldAnalyze?: boolean;
    onAnalysisComplete?: (stats: any) => void;
    memory?: any;
    patternOverlay?: import('../types').ChartPatternOverlay | null;
    messages?: Message[];
    onSendMessage?: (msg: string) => void;
    isLoading?: boolean;
}

function formatPrice(n: number | null | undefined) {
    if (n === null || n === undefined) return '$0.00';
    if (n >= 1000) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    if (n >= 1) return `$${n.toFixed(2)}`;
    return `$${n.toFixed(4)}`;
}

function formatChange(n: number | null | undefined) {
    if (n === null || n === undefined) return '0.00%';
    return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

const Row = ({ label, value, color = '#e2e8f0' }: {label: string, value: string, color?: string}) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
    <span style={{ color: '#8888aa' }}>{label}</span>
    <span style={{ color, fontWeight: '600', fontFamily: 'JetBrains Mono' }}>{value}</span>
  </div>
);

const FuturesConfirmCard = ({ position, onConfirm, onDecline }: any) => {
  const [sl, setSl] = React.useState('');
  const [tp, setTp] = React.useState('');

  return (
    <div style={{
      background: '#111128',
      border: '1px solid #1a1a3a',
      borderRadius: '12px',
      padding: '20px',
      margin: '12px'
    }}>
      <h3 style={{ color: '#00ff88', marginBottom: '16px', marginTop: 0 }}>Position Preview</h3>
      
      {/* Market Context */}
      <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
        <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#e2e8f0' }}>Trend: {position.trend}</p>
        <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#e2e8f0' }}>Support: ${position.support}</p>
        <p style={{ margin: '0', fontSize: '13px', color: '#e2e8f0' }}>Resistance: ${position.resistance}</p>
      </div>
      
      {/* Position Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <Row label="Direction" value={position.direction.toUpperCase()} />
        <Row label="Leverage" value={`${position.leverage}x`} />
        <Row label="Size" value={`$${position.size}`} />
        <Row label="Entry" value={`$${position.entryPrice}`} />
        <Row label="Margin" value={`$${position.margin}`} />
        <Row label="Liquidation" value={`$${position.liquidationPrice}`} color="#ff3366" />
      </div>

      {/* SL/TP Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#8888aa', marginBottom: '6px' }}>Stop Loss Price</label>
          <input 
            type="number"
            value={sl}
            onChange={(e) => setSl(e.target.value)}
            placeholder="None"
            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid #1a1a3a', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '13px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#8888aa', marginBottom: '6px' }}>Take Profit Price</label>
          <input 
            type="number"
            value={tp}
            onChange={(e) => setTp(e.target.value)}
            placeholder="None"
            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid #1a1a3a', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '13px' }}
          />
        </div>
      </div>
      
      {/* Risk warning for high leverage */}
      {position.leverage >= 10 && (
        <p style={{ color: '#ff3366', fontSize: '12px', marginBottom: '16px' }}>
          ⚠️ {position.leverage}x leverage — 
          a {(100/position.leverage).toFixed(1)}% move against you = liquidation
        </p>
      )}
      
      {/* Confirm / Decline */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => onConfirm(sl ? parseFloat(sl) : undefined, tp ? parseFloat(tp) : undefined)}
          style={{ flex: 1, background: 'rgba(0,255,136,0.1)', border: '1px solid #00ff88', color: '#00ff88', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
        >
          ✓ Confirm
        </button>
        <button
          onClick={onDecline}
          style={{ flex: 1, background: 'rgba(255,51,102,0.1)', border: '1px solid #ff3366', color: '#ff3366', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
        >
          ✕ Decline
        </button>
      </div>
    </div>
  );
};

const MemoryCard = ({ memory }: { memory: any }) => {
  if (!memory || memory.risk_profile === 'unknown') return null;
  
  const Stat = ({ label, value }: { label: string, value: string }) => (
    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', flex: 1, minWidth: '100px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', textTransform: 'capitalize' }}>{value}</div>
    </div>
  );

  return (
    <div className="glass-card" style={{ padding: '16px', marginBottom: '20px', borderLeft: '3px solid #00d4ff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Activity size={16} color="#00d4ff" />
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>Your Trading Profile</h3>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        <Stat label="Risk Profile" value={memory.risk_profile} />
        <Stat label="Win Rate" value={`${memory.win_rate?.toFixed(1) || 0}%`} />
        <Stat label="Avg Trade Size" value={`$${memory.avg_trade_size?.toFixed(0) || 0}`} />
        <Stat label="Avg Leverage" value={`${memory.leverage_preference?.toFixed(0) || 0}x`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {memory.winning_patterns?.length > 0 && (
          <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={12} /> Winning Patterns
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {memory.winning_patterns.map((p: string) => <div key={p} style={{ fontSize: '12px', color: '#e2e8f0' }}>• {p}</div>)}
            </div>
          </div>
        )}

        {memory.common_mistakes?.length > 0 && (
          <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={12} /> Watch Out For
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {memory.common_mistakes.map((m: string) => <div key={m} style={{ fontSize: '12px', color: '#e2e8f0' }}>• {m}</div>)}
            </div>
          </div>
        )}

        {memory.emotional_triggers?.length > 0 && (
          <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={12} /> Emotional Triggers
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {memory.emotional_triggers.map((t: string) => (
                <span key={t} style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', color: '#d8b4fe' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};




const RightPanel: React.FC<RightPanelProps> = ({
    view,
    prices,
    pricesLoading,
    wallet,
    transactionPreview,
    swapPreview,
    contacts = {},
    onContactSendClick,
    onContactDeleteClick,
    onConfirmTransactionClick,
    onConfirmSwapClick,
    history = [],
    allCoins = [],
    watchlistCoins = [],
    onToggleWatchlist,
    isInWatchlist,
    watchlistLoading,
    watchlistLastUpdated,
    onCoinClick,
    activeCoin,
    newsData = [],
    fearGreedData = [],
    newsLoading,
    newsError,
    newsLastUpdated,
    futuresBalance,
    futuresPositions,
    onCloseFuturesPosition,
    futuresPrices,
    pendingFuturesPosition,
    onConfirmFutures,
    onDeclineFutures,
    chartShouldAnalyze,
    onAnalysisComplete,
    messages = [],
    onSendMessage,
    isLoading,
    memory,
    patternOverlay,
}) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [watchlistTab, setWatchlistTab] = React.useState<'my' | 'all'>('my');

    const holdingsWithValues = (wallet.holdings || []).map((h) => {
        const priceObj = prices.find((p) => p.symbol.toLowerCase() === h.symbol.toLowerCase());
        const val = priceObj ? h.amount * priceObj.price : 0;
        return { ...h, valueUsd: val };
    });

    const totalPortfolioValue = holdingsWithValues.reduce((sum, h) => sum + h.valueUsd, 0);

    // History Filtering Logic
    const unifiedHistory = React.useMemo(() => {
        const spotItems = history.map(tx => ({ ...tx, itemType: 'spot' as const }));
        const futuresItems = (futuresPositions || [])
            .filter(p => p.status === 'closed' || p.status === 'liquidated')
            .map(p => ({
                ...p,
                timestamp: p.closedAt || p.openedAt,
                itemType: 'futures' as const,
                hash: `futures-${p.id}`
            }));
        // @ts-ignore
        return [...spotItems, ...futuresItems].sort((a, b) => b.timestamp - a.timestamp);
    }, [history, futuresPositions]);

    const filteredHistory = unifiedHistory.filter(item => {
        if (searchQuery === '') return true;
        const q = searchQuery.toLowerCase();
        if (item.itemType === 'spot') {
            const tx = item as AppTransaction;
            return (
                tx.fromToken.toLowerCase().includes(q) ||
                (tx.toToken && tx.toToken.toLowerCase().includes(q)) ||
                (tx.contactName && tx.contactName.toLowerCase().includes(q)) ||
                (tx.toAddress && tx.toAddress.toLowerCase().includes(q))
            );
        } else {
            const f = item as unknown as FuturesPosition;
            return f.coin.toLowerCase().includes(q);
        }
    });

    const handleExportCSV = () => {
        const headers = ["Date", "Type", "Asset", "Action", "Amount/Size", "Price", "PnL", "Network", "Status"];
        const rows = unifiedHistory.map(item => {
            const dateStr = new Date(item.timestamp).toISOString();
            if (item.itemType === 'spot') {
                const tx = item as AppTransaction;
                const typeStr = tx.type === 'send' ? 'Send' : 'Swap';
                const assetStr = tx.fromToken;
                const actionStr = tx.type === 'send' ? `To ${tx.contactName || tx.toAddress}` : `For ${tx.toAmount} ${tx.toToken}`;
                const amountStr = tx.fromAmount.toString();
                return [dateStr, typeStr, assetStr, actionStr, amountStr, "-", "-", tx.network || "-", tx.status];
            } else {
                const f = item as unknown as FuturesPosition;
                const typeStr = "Futures";
                const assetStr = f.coin;
                const actionStr = f.direction.toUpperCase();
                const amountStr = f.size.toString();
                const priceStr = `Entry: $${f.entryPrice} / Exit: $${f.exitPrice || '-'}`;
                const pnlStr = f.pnl ? `$${f.pnl.toFixed(2)}` : "-";
                return [dateStr, typeStr, assetStr, actionStr, amountStr, priceStr, pnlStr, "Futures (Sim)", f.status];
            }
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `CryptoGuru_Trades_Export_${new Date().getFullYear()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div
            className="right-panel-container"
            style={{
                height: '100%',
                background: 'var(--bg-panel)',
                borderLeft: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 5,
            }}
        >
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: view === 'coin-chart' ? 'hidden' : 'auto',
                    WebkitOverflowScrolling: 'touch',
                    scrollBehavior: 'smooth',
                    overscrollBehaviorY: 'contain',
                    touchAction: 'pan-y',
                    willChange: 'transform',
                    padding: '16px',
                }}
            >
                {/* ===== PRICES VIEW ===== */}
                {view === 'prices' && (
                    <div className="panel-content fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Markets</h2>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                                LIVE
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {pricesLoading && prices.length === 0 ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="skeleton" style={{ height: '64px', borderRadius: '12px' }} />
                                ))
                            ) : (
                                prices.map((coin) => (
                                    <div key={coin.id} className="glass-card market-row" style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '20px' }}>{coin.icon}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{coin.symbol}</span>
                                                    <span style={{ fontSize: '14px', color: '#00d4ff' }}>
                                                        <AnimatedNumber value={coin.price} format={(n) => formatPrice(n)} />
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{coin.name}</span>
                                                    <span style={{
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        color: coin.change24h >= 0 ? '#10ff88' : '#ff3366'
                                                    }}>
                                                        <AnimatedNumber value={coin.change24h} format={(n) => formatChange(n)} />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ===== PORTFOLIO VIEW ===== */}
                {view === 'portfolio' && (
                    <div className="panel-content fade-in">
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', marginBottom: '20px' }}>Portfolio</h2>

                        <div style={{ height: '220px', position: 'relative', marginBottom: '20px' }}>
                            {holdingsWithValues.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={holdingsWithValues}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="valueUsd"
                                        >
                                            {holdingsWithValues.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ background: '#1a1a2e', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(val: any) => `$${Number(val).toLocaleString()}`}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '13px' }}>
                                    No assets to display
                                </div>
                            )}
                        </div>

                        {/* Total */}
                        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Value</div>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#00d4ff' }}>
                                <AnimatedNumber value={totalPortfolioValue} format={(n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                            </div>
                        </div>

                        {/* Holdings */}
                        {wallet.isConnected ? (
                            holdingsWithValues.length > 0 ? (
                                holdingsWithValues.map((h) => (
                                    <div key={h.symbol} className="glass-card" style={{ padding: '10px 14px', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: h.color, flexShrink: 0 }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{h.symbol}</span>
                                                    <span style={{ fontSize: '13px', color: '#00d4ff' }}>
                                                        <AnimatedNumber value={h.valueUsd} format={(n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{h.amount.toFixed(4)} {h.symbol}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                        {totalPortfolioValue > 0 ? ((h.valueUsd / totalPortfolioValue) * 100).toFixed(1) : '0'}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>
                                    No holdings found in this wallet.
                                </div>
                            )
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>
                                Connect your wallet to see your portfolio.
                            </div>
                        )}
                    </div>
                )}

                {/* ===== COIN CHART VIEW (TRADINGVIEW) ===== */}
                {view === 'coin-chart' && (
                    <div className="panel-content fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>Chart Analysis</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 16px 0' }}>
                            {activeCoin ? `Viewing ${activeCoin.symbol.toUpperCase()} chart. Click another coin to switch.` : 'Select a coin to open its chart, or type "analyze BTC" in chat.'}
                        </p>

                        <div style={{ flex: 1, minHeight: '300px', marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                            {activeCoin ? (
                                <TechnicalAnalysisChart
                                    coinId={activeCoin.id}
                                    coinSymbol={activeCoin.symbol}
                                    onAnalysisComplete={chartShouldAnalyze ? onAnalysisComplete : undefined}
                                    patternOverlay={patternOverlay}
                                />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                    No coin selected
                                </div>
                            )}
                        </div>

                        {/* Watchlist coins */}
                        {watchlistCoins.length > 0 && (
                            <>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                                    ⭐ Your Watchlist
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                                    {watchlistCoins.map((coin) => (
                                        <div
                                            key={coin.id}
                                            onClick={() => onCoinClick?.(coin)}
                                            className="glass-card"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '10px 12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                borderColor: activeCoin?.id === coin.id ? 'rgba(0,212,255,0.5)' : undefined,
                                                background: activeCoin?.id === coin.id ? 'rgba(0,212,255,0.08)' : undefined,
                                            }}
                                            onMouseEnter={(e) => { if (activeCoin?.id !== coin.id) { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'; e.currentTarget.style.background = 'rgba(0,212,255,0.05)'; }}}
                                            onMouseLeave={(e) => { if (activeCoin?.id !== coin.id) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = ''; }}}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={coin.image} alt={coin.symbol} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{coin.symbol.toUpperCase()}</div>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{coin.name}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '13px', color: '#00d4ff', fontFamily: 'JetBrains Mono' }}>
                                                    <AnimatedNumber value={coin.current_price} format={(n) => formatPrice(n)} />
                                                </div>
                                                <div style={{ fontSize: '10px', fontWeight: 600, color: (coin.price_change_percentage_24h || 0) >= 0 ? '#10ff88' : '#ff3366' }}>
                                                    <AnimatedNumber value={coin.price_change_percentage_24h} format={(n) => formatChange(n)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}


                    </div>
                )}

                {/* ===== TRANSACTION VIEW ===== */}
                {view === 'transaction' && (
                    <div className="panel-content fade-in">
                        <div className="glass-card" style={{ padding: '16px', marginBottom: '12px', borderColor: 'rgba(0,212,255,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>
                                <SendIcon size={12} /> SEND PREVIEW
                            </div>
                            {[
                                { label: 'From', value: wallet.isConnected && wallet.address ? wallet.address : 'Not connected' },
                                { label: 'To', value: transactionPreview ? transactionPreview.address : 'N/A' },
                                { label: 'Recipient', value: transactionPreview ? transactionPreview.recipientName : 'N/A' },
                                { label: 'Amount', value: transactionPreview ? `${transactionPreview.amount} ${transactionPreview.coin}` : '0.00' },
                                { label: 'Gas (est.)', value: transactionPreview ? transactionPreview.estimatedGas : 'Low' },
                                { label: 'Network', value: transactionPreview?.networkName || wallet.networkName || 'Ethereum' },
                            ].map((row) => (
                                <div
                                    key={row.label}
                                    style={{
                                        display: 'flex',
                                        flexDirection: row.label === 'To' || row.label === 'From' ? 'column' : 'row',
                                        justifyContent: 'space-between',
                                        alignItems: row.label === 'To' || row.label === 'From' ? 'flex-start' : 'center',
                                        padding: '8px 0',
                                        borderBottom: '1px solid var(--border-subtle)',
                                        fontSize: '13px',
                                    }}
                                >
                                    <span style={{ color: 'var(--text-muted)', marginBottom: row.label === 'To' || row.label === 'From' ? '4px' : '0' }}>{row.label}</span>
                                    <span style={{
                                        color: '#e2e8f0',
                                        fontFamily: 'JetBrains Mono, monospace',
                                        fontSize: '12px',
                                        wordBreak: 'break-all',
                                        textAlign: row.label === 'To' || row.label === 'From' ? 'left' : 'right',
                                        width: row.label === 'To' || row.label === 'From' ? '100%' : 'auto'
                                    }}>{row.value}</span>
                                </div>
                            ))}
                            <button
                                onClick={onConfirmTransactionClick}
                                style={{
                                    marginTop: '12px',
                                    width: '100%',
                                    padding: '10px',
                                    background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))',
                                    border: '1px solid rgba(0,212,255,0.3)',
                                    borderRadius: '10px',
                                    color: '#00d4ff',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    fontFamily: 'Inter, sans-serif',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(0,212,255,0.3)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                            >
                                Confirm Transaction →
                            </button>
                        </div>

                        <div
                            style={{
                                padding: '12px',
                                background: 'rgba(255,68,102,0.05)',
                                border: '1px solid rgba(255,68,102,0.15)',
                                borderRadius: '10px',
                                fontSize: '12px',
                                color: '#ff4466',
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={14} /> Always verify the recipient address before confirming any transaction.</span>
                        </div>
                    </div>
                )}

                {/* ===== SWAP VIEW ===== */}
                {view === 'swap' && (
                    <div className="panel-content fade-in">
                        <div className="glass-card" style={{ padding: '16px', marginBottom: '12px', borderColor: 'rgba(139,92,246,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#8b5cf6', marginBottom: '10px', fontWeight: 600 }}>
                                <ArrowRightLeft size={12} /> PANCAKESWAP PREVIEW
                            </div>
                            {[
                                { label: 'From', value: swapPreview ? `${swapPreview.fromAmount} ${swapPreview.fromToken}` : 'N/A' },
                                { label: 'To (est.)', value: swapPreview ? `${parseFloat(swapPreview.toAmount).toFixed(6)} ${swapPreview.toToken}` : 'N/A' },
                                { label: 'Rate', value: swapPreview ? swapPreview.rate : 'N/A' },
                                { label: 'Slippage', value: '1%' },
                                { label: 'Gas (est.)', value: swapPreview ? swapPreview.estimatedGas : 'Low' },
                                { label: 'Network', value: 'BNB Smart Chain' },
                            ].map((row) => (
                                <div
                                    key={row.label}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '8px 0',
                                        borderBottom: '1px solid var(--border-subtle)',
                                        fontSize: '13px',
                                    }}
                                >
                                    <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                                    <span style={{ color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{row.value}</span>
                                </div>
                            ))}
                            <button
                                onClick={onConfirmSwapClick}
                                style={{
                                    marginTop: '12px',
                                    width: '100%',
                                    padding: '10px',
                                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(0,212,255,0.2))',
                                    border: '1px solid rgba(139,92,246,0.3)',
                                    borderRadius: '10px',
                                    color: '#8b5cf6',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    fontFamily: 'Inter, sans-serif',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(139,92,246,0.3)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                            >
                                Confirm Swap →
                            </button>
                        </div>
                        <div
                            style={{
                                padding: '12px',
                                background: 'rgba(139,92,246,0.05)',
                                border: '1px solid rgba(139,92,246,0.15)',
                                borderRadius: '10px',
                                fontSize: '12px',
                                color: '#8b5cf6',
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={14} /> Swaps are executed via PancakeSwap v3 on BNB Smart Chain.</span>
                        </div>
                    </div>
                )}

                {/* ===== CONTACTS VIEW ===== */}
                {view === 'contacts' && (
                    <div className="panel-content fade-in">
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Address Book</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {Object.keys(contacts).length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                    <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}><User size={32} opacity={0.5} /></div>
                                    <div style={{ fontSize: '14px' }}>No contacts saved yet.</div>
                                    <div style={{ fontSize: '11px', marginTop: '4px' }}>Say "add [name] [address]" to save one.</div>
                                </div>
                            ) : (
                                Object.entries(contacts).map(([name, address]) => (
                                    <div key={address} className="glass-card" style={{ padding: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '14px', color: '#e2e8f0' }}>{name}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
                                                    {address.slice(0, 10)}...{address.slice(-8)}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => onContactSendClick?.(name)}
                                                    style={{ padding: '6px', borderRadius: '6px', background: 'rgba(0,212,255,0.1)', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)' }}
                                                    title="Send to this contact"
                                                >
                                                    <SendIcon size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onContactDeleteClick?.(name)}
                                                    style={{ padding: '6px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                    title="Delete contact"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ===== WATCHLIST VIEW ===== */}
                {view === 'watchlist' && (
                    <div className="panel-content fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Watchlist</h2>

                        <div style={{ marginBottom: '16px', position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search assets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 36px',
                                    borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border-subtle)',
                                    color: '#fff',
                                    fontSize: '13px',
                                    outline: 'none'
                                }}
                            />
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Search size={14} /></span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <button
                                onClick={() => setWatchlistTab('my')}
                                style={{
                                    flex: 1,
                                    padding: '6px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    background: watchlistTab === 'my' ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                                    border: 'none',
                                    color: watchlistTab === 'my' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                My Portfolio
                            </button>
                            <button
                                onClick={() => setWatchlistTab('all')}
                                style={{
                                    flex: 1,
                                    padding: '6px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    background: watchlistTab === 'all' ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                                    border: 'none',
                                    color: watchlistTab === 'all' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                All Coins
                            </button>
                        </div>

                        {/* Last Updated */}
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '12px', textAlign: 'right', fontFamily: 'JetBrains Mono' }}>
                            {watchlistLastUpdated ? `Last updated: ${Math.floor((Date.now() - watchlistLastUpdated) / 1000)}s ago` : 'Refreshing...'}
                        </div>

                        {/* Coin List */}
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {watchlistLoading && allCoins.length === 0 ? (
                                [1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="skeleton" style={{ height: '60px', borderRadius: '12px' }} />
                                ))
                            ) : (
                                (watchlistTab === 'my' ? watchlistCoins : allCoins)
                                    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((coin) => (
                                        <div
                                            key={coin.id}
                                            className="glass-card"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '10px 12px',
                                                cursor: 'pointer',
                                                marginBottom: '8px'
                                            }}
                                            onClick={() => onCoinClick?.(coin)}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        >
                                            {/* Left - coin info */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={coin.image} alt={coin.symbol} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                                                <div>
                                                    <p style={{ color: '#e8e8ff', fontSize: '13px', fontWeight: '600', margin: 0 }}>{coin.symbol.toUpperCase()}</p>
                                                    <p style={{ color: '#5555aa', fontSize: '11px', margin: 0 }}>{coin.name}</p>
                                                </div>
                                            </div>

                                            {/* Right - price + add button */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ color: '#e8e8ff', fontSize: '13px', fontFamily: 'JetBrains Mono', margin: 0 }}>
                                                        <AnimatedNumber value={coin.current_price} format={(n) => formatPrice(n)} />
                                                    </p>
                                                    <p style={{ 
                                                        color: (coin.price_change_percentage_24h || 0) >= 0 ? '#10ff88' : '#ff3366',
                                                        fontSize: '11px',
                                                        margin: 0
                                                    }}>
                                                        <AnimatedNumber value={coin.price_change_percentage_24h} format={(n) => formatChange(n)} />
                                                    </p>
                                                </div>

                                                {/* ADD / REMOVE BUTTON */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onToggleWatchlist?.(coin.id)
                                                    }}
                                                    style={{
                                                        background: isInWatchlist?.(coin.id) ? 'rgba(255,51,102,0.1)' : 'rgba(0,255,136,0.1)',
                                                        border: `1px solid ${isInWatchlist?.(coin.id) ? '#ff3366' : '#00ff88'}`,
                                                        color: isInWatchlist?.(coin.id) ? '#ff3366' : '#00ff88',
                                                        borderRadius: '6px',
                                                        padding: '4px 10px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {isInWatchlist?.(coin.id) ? '− Remove' : '+ Add'}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                )}

                {/* ===== NEWS VIEW ===== */}
                {view === 'news-sentiment' && (
                    <NewsSentimentPanel
                        newsData={newsData}
                        fearGreed={fearGreedData}
                        isLoading={!!newsLoading}
                        error={newsError || null}
                        lastUpdated={newsLastUpdated || null}
                    />
                )}

                {/* ===== HISTORY VIEW ===== */}
                {view === 'history' && (
                    <div className="panel-content fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Journal</h2>
                            <button
                                onClick={handleExportCSV}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-subtle)',
                                    color: '#e2e8f0',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                Export CSV
                            </button>
                        </div>
                        
                        <MemoryCard memory={memory} />

                        <div style={{ marginBottom: '16px', position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search history..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 36px',
                                    borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border-subtle)',
                                    color: '#fff',
                                    fontSize: '13px',
                                    outline: 'none'
                                }}
                            />
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Search size={14} /></span>
                        </div>

                        {filteredHistory.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}><Book size={32} opacity={0.5} /></div>
                                <div style={{ fontSize: '14px' }}>No trades recorded.</div>
                                <div style={{ fontSize: '11px', marginTop: '4px' }}>Every transfer or swap will appear here.</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {filteredHistory.map((item) => {
                                    if (item.itemType === 'spot') {
                                        const tx = item as AppTransaction;
                                        return (
                                            <div key={tx.id || tx.hash} className="glass-card" style={{ padding: '12px', borderLeft: `3px solid ${tx.status === 'success' ? '#10b981' : tx.status === 'failed' ? '#ef4444' : '#f59e0b'}` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <div style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '8px',
                                                            background: tx.type === 'send' ? 'rgba(0, 212, 255, 0.1)' : tx.type === 'swap' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '14px'
                                                        }}>
                                                            {tx.type === 'send' ? <CornerDownRight size={14} /> : tx.type === 'swap' ? <ArrowRightLeft size={14} /> : <DollarSign size={14} />}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                                                                {tx.type === 'send' ? 'Sent Funds' : tx.type === 'swap' ? 'Swapped Assets' : 'Received Funds'}
                                                            </div>
                                                            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                                                                {tx.fromAmount} {tx.fromToken}
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                                {tx.type === 'send' ? `To: ${tx.contactName || tx.toAddress?.slice(0, 6) + '...' + tx.toAddress?.slice(-4)}` : tx.type === 'swap' ? `For: ${tx.toAmount} ${tx.toToken}` : `From: ${tx.toAddress?.slice(0, 6) + '...' + tx.toAddress?.slice(-4)}`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{
                                                            fontSize: '10px',
                                                            fontWeight: 700,
                                                            color: tx.status === 'success' ? '#10b981' : tx.status === 'failed' ? '#ef4444' : '#f59e0b',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {tx.status === 'success' ? (
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}><CheckCircle size={10} /> SUCCESS</span>
                                                            ) : tx.status === 'failed' ? (
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}><XCircle size={10} /> FAILED</span>
                                                            ) : (
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}><Clock size={10} /> PENDING</span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                            {new Date(tx.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', marginTop: '8px' }}>
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{tx.network || 'BNB Smart Chain'} {tx.hash && tx.hash.length > 20 && `• ${tx.hash.slice(0,6)}...`}</span>
                                                    {tx.hash && tx.hash.length >= 64 && (
                                                        <a
                                                            href={`https://bscscan.com/tx/${tx.hash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ fontSize: '10px', color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}
                                                        >
                                                            View on Explorer ↗
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        const f = item as unknown as FuturesPosition;
                                        const isProfit = f.pnl && f.pnl >= 0;
                                        return (
                                            <div key={f.id} className="glass-card" style={{ padding: '12px', borderLeft: `3px solid ${isProfit ? '#10b981' : '#ef4444'}` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <div style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '8px',
                                                            background: isProfit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '14px'
                                                        }}>
                                                            <Activity size={14} color={isProfit ? '#10b981' : '#ef4444'} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                                                                {f.direction === 'long' ? 'CLOSED LONG' : 'CLOSED SHORT'}
                                                            </div>
                                                            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                                                                {f.size} {f.coin} ({f.leverage}x)
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                                Entry: ${f.entryPrice} • Exit: ${f.exitPrice || '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{
                                                            fontSize: '11px',
                                                            fontWeight: 700,
                                                            color: isProfit ? '#10b981' : '#ef4444',
                                                            fontFamily: 'JetBrains Mono'
                                                        }}>
                                                            {isProfit ? '+' : ''}{f.pnl?.toFixed(2)} USD
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                            {new Date(f.closedAt || f.openedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
            
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', marginTop: '8px' }}>
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Paper Trading {f.status === 'liquidated' ? '• (Liquidated)' : ''}</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== FUTURES VIEW ===== */}
                {view === 'futures' && (
                    <FuturesPanel
                        balance={futuresBalance || 1000}
                        positions={futuresPositions || []}
                        onClosePosition={onCloseFuturesPosition || (() => { })}
                        prices={futuresPrices || {}}
                    />
                )}

                {/* ===== FUTURES CONFIRM VIEW ===== */}
                {view === 'futures-confirm' && pendingFuturesPosition && (
                    <FuturesConfirmCard
                        position={pendingFuturesPosition}
                        onConfirm={onConfirmFutures}
                        onDecline={onDeclineFutures}
                    />
                )}

                {/* ===== LEARN ASSISTANT VIEW ===== */}
                {view === 'learn-assistant' && (
                    <div className="panel-content fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Book size={18} color="#8b5cf6" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>AI Tutor</h2>
                                <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>Learning Assistant</p>
                            </div>
                        </div>

                        <div style={{ 
                            flex: 1, 
                            overflowY: 'auto', 
                            marginBottom: '16px', 
                            paddingRight: '4px',
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '12px' 
                        }}>
                            {messages.filter(m => !m.content.startsWith('The user is now studying:')).length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', paddingTop: '40px' }}>
                                    I'm your dedicated crypto tutor. Ask me about the current lesson, or for examples and simpler explanations!
                                </div>
                            ) : (
                                messages
                                    .filter(m => !m.content.startsWith('The user is now studying:'))
                                    .map((m, i) => (
                                    <div key={i} style={{
                                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '90%',
                                        padding: '10px 14px',
                                        borderRadius: '12px',
                                        background: m.role === 'user' ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                                        border: '1px solid',
                                        borderColor: m.role === 'user' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                                        fontSize: '13px',
                                        lineHeight: '1.5',
                                        color: m.role === 'user' ? '#fff' : '#cbd5e1'
                                    }}>
                                        {m.content}
                                    </div>
                                ))
                            )}
                            {isLoading && (
                                <div style={{ alignSelf: 'flex-start', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', fontSize: '13px', color: '#64748b' }}>
                                    Tutor is thinking...
                                </div>
                            )}
                        </div>

                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Ask teacher..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.currentTarget.value.trim() && onSendMessage) {
                                        onSendMessage(e.currentTarget.value.trim());
                                        e.currentTarget.value = '';
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    paddingRight: '40px',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '10px',
                                    color: '#fff',
                                    fontSize: '13px',
                                    outline: 'none'
                                }}
                            />
                            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                                <SendIcon size={14} color="#00d4ff" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Refresh indicator */}
            <div
                style={{
                    padding: '8px 12px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    flexShrink: 0,
                    fontFamily: 'JetBrains Mono, monospace',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Activity size={10} color="#00ff88" /> Live Prices · Binance WS & CoinGecko</span>
            </div>
        </div>
    );
};

export default RightPanel;
