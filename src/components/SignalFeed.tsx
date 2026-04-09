import React, { useState } from 'react';
import type { Signal } from '../types';
import { useCryptoPrices } from '../hooks/useCrypto';
import { useSignals } from '../hooks/useSignals';

interface SignalFeedProps {
    onCopyTrade: (signal: Signal) => void;
    onAnalyzeClick: (signal: Signal) => void;
}

const SYMBOL_TO_ID: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    SOL: 'solana',
    ADA: 'cardano',
    LINK: 'chainlink',
    AVAX: 'avalanche-2',
    DOT: 'polkadot',
    BNB: 'binancecoin',
    XRP: 'ripple',
    MATIC: 'matic-network',
    DOGE: 'dogecoin',
};

function timeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Toast notification ───
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className="fade-in"
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 10000,
                padding: '14px 22px',
                borderRadius: '12px',
                background: type === 'success'
                    ? 'linear-gradient(135deg, rgba(76,255,176,0.18), rgba(18,22,40,0.95))'
                    : 'linear-gradient(135deg, rgba(255,93,143,0.18), rgba(18,22,40,0.95))',
                border: `1px solid ${type === 'success' ? 'rgba(76,255,176,0.4)' : 'rgba(255,93,143,0.4)'}`,
                color: type === 'success' ? '#4cffb0' : '#ff5d8f',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'Manrope, sans-serif',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
            }}
        >
            <span style={{ fontSize: '18px' }}>{type === 'success' ? '✓' : '✕'}</span>
            {message}
        </div>
    );
};

// ─── Signal Form Modal ───
interface SignalFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { coin: string; direction: 'Long' | 'Short'; entry_price: number; target_price: number; stop_loss: number }) => void;
    isSubmitting: boolean;
    editData?: Signal | null;
}

const SignalFormModal: React.FC<SignalFormProps> = ({ isOpen, onClose, onSubmit, isSubmitting, editData }) => {
    const [coin, setCoin] = useState(editData?.coin || '');
    const [direction, setDirection] = useState<'Long' | 'Short'>(editData?.direction || 'Long');
    const [entryPrice, setEntryPrice] = useState(editData?.entry_price?.toString() || '');
    const [targetPrice, setTargetPrice] = useState(editData?.target_price?.toString() || '');
    const [stopLoss, setStopLoss] = useState(editData?.stop_loss?.toString() || '');

    React.useEffect(() => {
        if (editData) {
            setCoin(editData.coin);
            setDirection(editData.direction);
            setEntryPrice(editData.entry_price.toString());
            setTargetPrice(editData.target_price.toString());
            setStopLoss(editData.stop_loss.toString());
        } else {
            setCoin('');
            setDirection('Long');
            setEntryPrice('');
            setTargetPrice('');
            setStopLoss('');
        }
    }, [editData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!coin.trim() || !entryPrice || !targetPrice || !stopLoss) return;
        onSubmit({
            coin: coin.trim().toUpperCase(),
            direction,
            entry_price: parseFloat(entryPrice),
            target_price: parseFloat(targetPrice),
            stop_loss: parseFloat(stopLoss),
        });
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        color: '#e2e8f0',
        fontSize: '14px',
        fontFamily: 'Manrope, sans-serif',
        outline: 'none',
        transition: 'border-color 0.2s ease',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '12px',
        fontWeight: 600,
        color: '#b0b8d1',
        marginBottom: '6px',
        fontFamily: 'Manrope, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(8px)',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="fade-in"
                style={{
                    width: '100%',
                    maxWidth: '480px',
                    margin: '0 20px',
                    borderRadius: '20px',
                    border: '1px solid rgba(137, 160, 230, 0.24)',
                    background: 'linear-gradient(160deg, rgba(18, 22, 40, 0.98) 0%, rgba(14, 17, 32, 0.95) 100%)',
                    boxShadow: '0 30px 80px rgba(5, 9, 28, 0.7)',
                    padding: '32px',
                }}
            >
                {/* Modal Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                        <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '20px', color: '#f3f7ff', margin: 0 }}>
                            {editData ? 'Edit Signal' : 'Post Signal'}
                        </h3>
                        <p style={{ fontSize: '12px', color: '#8a93b3', marginTop: '4px' }}>
                            {editData ? 'Update your signal details' : 'Share a trading signal with the community'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                            color: '#8a93b3',
                            cursor: 'pointer',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,93,143,0.1)'; e.currentTarget.style.color = '#ff5d8f'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#8a93b3'; }}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Coin */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Coin / Symbol</label>
                        <input
                            type="text"
                            value={coin}
                            onChange={(e) => setCoin(e.target.value)}
                            placeholder="e.g. BTC, ETH, SOL"
                            style={inputStyle}
                            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(98,182,255,0.5)'; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                            required
                        />
                    </div>

                    {/* Direction Toggle */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Direction</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {(['Long', 'Short'] as const).map((dir) => (
                                <button
                                    key={dir}
                                    type="button"
                                    onClick={() => setDirection(dir)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: `1px solid ${direction === dir
                                            ? (dir === 'Long' ? 'rgba(76,255,176,0.5)' : 'rgba(255,93,143,0.5)')
                                            : 'var(--border-subtle)'}`,
                                        background: direction === dir
                                            ? (dir === 'Long' ? 'rgba(76,255,176,0.12)' : 'rgba(255,93,143,0.12)')
                                            : 'rgba(0,0,0,0.2)',
                                        color: direction === dir
                                            ? (dir === 'Long' ? '#4cffb0' : '#ff5d8f')
                                            : '#8a93b3',
                                        fontWeight: 700,
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontFamily: 'Manrope, sans-serif',
                                    }}
                                >
                                    {dir === 'Long' ? '▲' : '▼'} {dir.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price inputs */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                        <div>
                            <label style={labelStyle}>Entry Price</label>
                            <input
                                type="number"
                                step="any"
                                value={entryPrice}
                                onChange={(e) => setEntryPrice(e.target.value)}
                                placeholder="0.00"
                                style={inputStyle}
                                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(98,182,255,0.5)'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                                required
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Target Price</label>
                            <input
                                type="number"
                                step="any"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(e.target.value)}
                                placeholder="0.00"
                                style={{ ...inputStyle }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(76,255,176,0.5)'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                                required
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Stop Loss</label>
                            <input
                                type="number"
                                step="any"
                                value={stopLoss}
                                onChange={(e) => setStopLoss(e.target.value)}
                                placeholder="0.00"
                                style={{ ...inputStyle }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,93,143,0.5)'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !coin.trim() || !entryPrice || !targetPrice || !stopLoss}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'linear-gradient(135deg, #6fd0ff 0%, #8b89ff 48%, #6af6c2 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#050508',
                            fontSize: '15px',
                            fontWeight: 700,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            fontFamily: 'Sora, sans-serif',
                            opacity: isSubmitting ? 0.6 : 1,
                            boxShadow: '0 8px 30px rgba(107,208,255,0.2)',
                        }}
                    >
                        {isSubmitting
                            ? 'Publishing...'
                            : editData
                                ? 'Update Signal'
                                : 'Publish Signal'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Delete Confirmation Modal ───
const DeleteConfirmModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, isDeleting }) => {
    if (!isOpen) return null;
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(8px)',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="fade-in"
                style={{
                    maxWidth: '400px',
                    width: '100%',
                    margin: '0 20px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,93,143,0.3)',
                    background: 'linear-gradient(160deg, rgba(18, 22, 40, 0.98) 0%, rgba(14, 17, 32, 0.95) 100%)',
                    boxShadow: '0 30px 80px rgba(5, 9, 28, 0.7)',
                    padding: '32px',
                    textAlign: 'center',
                }}
            >
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '18px', color: '#f3f7ff', margin: '0 0 8px 0' }}>
                    Delete Signal?
                </h3>
                <p style={{ fontSize: '13px', color: '#8a93b3', marginBottom: '24px' }}>
                    This action cannot be undone. The signal will be permanently removed.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '10px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-subtle)',
                            color: '#b0b8d1',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '14px',
                            transition: 'all 0.2s',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '10px',
                            background: 'rgba(255,93,143,0.15)',
                            border: '1px solid rgba(255,93,143,0.4)',
                            color: '#ff5d8f',
                            fontWeight: 700,
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '14px',
                            transition: 'all 0.2s',
                            opacity: isDeleting ? 0.6 : 1,
                        }}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Skeleton Loader ───
const SignalSkeleton: React.FC = () => (
    <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '6px' }} />
                <div className="skeleton" style={{ width: '80px', height: '10px' }} />
            </div>
            <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: '20px' }} />
        </div>
        <div className="skeleton" style={{ width: '100%', height: '48px', marginBottom: '14px' }} />
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <div className="skeleton" style={{ flex: 1, height: '50px' }} />
            <div className="skeleton" style={{ flex: 1, height: '50px' }} />
            <div className="skeleton" style={{ flex: 1, height: '50px' }} />
        </div>
        <div className="skeleton" style={{ width: '100%', height: '40px' }} />
    </div>
);

// ─── Main SignalFeed Component ───
const SignalFeed: React.FC<SignalFeedProps> = ({ onCopyTrade, onAnalyzeClick }) => {
    const {
        signals,
        isLoading,
        isVerified,
        currentUserId,
        createSignal,
        updateSignal,
        deleteSignal,
    } = useSignals();

    // Collect unique coin IDs for price lookups
    const coinIds = [...new Set(signals.map(s => SYMBOL_TO_ID[s.coin.toUpperCase()]).filter(Boolean))];
    const { prices } = useCryptoPrices(coinIds.length > 0 ? coinIds : ['bitcoin']);

    const [showPostModal, setShowPostModal] = useState(false);
    const [editingSignal, setEditingSignal] = useState<Signal | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const handlePostSignal = async (data: { coin: string; direction: 'Long' | 'Short'; entry_price: number; target_price: number; stop_loss: number }) => {
        setIsSubmitting(true);
        const success = await createSignal(data);
        setIsSubmitting(false);
        if (success) {
            setShowPostModal(false);
            showToast('Signal published successfully!', 'success');
        } else {
            showToast('Failed to publish signal. Try again.', 'error');
        }
    };

    const handleEditSignal = async (data: { coin: string; direction: 'Long' | 'Short'; entry_price: number; target_price: number; stop_loss: number }) => {
        if (!editingSignal) return;
        setIsSubmitting(true);
        const success = await updateSignal(editingSignal.id, data);
        setIsSubmitting(false);
        if (success) {
            setEditingSignal(null);
            showToast('Signal updated successfully!', 'success');
        } else {
            showToast('Failed to update signal. Try again.', 'error');
        }
    };

    const handleDeleteSignal = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        const success = await deleteSignal(deletingId);
        setIsDeleting(false);
        if (success) {
            setDeletingId(null);
            showToast('Signal deleted.', 'success');
        } else {
            showToast('Failed to delete signal. Try again.', 'error');
        }
    };

    return (
        <div
            style={{
                flex: 1,
                background: 'var(--bg-primary)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div
                style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                }}
            >
                <div>
                    <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '18px', color: '#f3f7ff', margin: 0 }}>
                        📡 Verified Trader Signals
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', marginBottom: 0 }}>
                        Live signals from verified traders · Updated in real-time
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isVerified ? (
                        <button
                            onClick={() => setShowPostModal(true)}
                            style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, rgba(76,255,176,0.12), rgba(98,182,255,0.12))',
                                border: '1px solid rgba(76,255,176,0.35)',
                                borderRadius: '20px',
                                fontSize: '12px',
                                color: '#4cffb0',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontFamily: 'Manrope, sans-serif',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(76,255,176,0.22), rgba(98,182,255,0.22))';
                                e.currentTarget.style.borderColor = 'rgba(76,255,176,0.55)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(76,255,176,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(76,255,176,0.12), rgba(98,182,255,0.12))';
                                e.currentTarget.style.borderColor = 'rgba(76,255,176,0.35)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            ＋ Post Signal
                        </button>
                    ) : (
                        <button
                            onClick={() => window.location.href = '/apply-trader'}
                            style={{
                                padding: '6px 14px',
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '20px',
                                fontSize: '11px',
                                color: '#c8cf43',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontFamily: 'Manrope, sans-serif',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                            }}
                        >
                            Become a Provider
                        </button>
                    )}

                    <div
                        style={{
                            padding: '6px 12px',
                            background: 'rgba(0,255,136,0.1)',
                            border: '1px solid rgba(0,255,136,0.25)',
                            borderRadius: '20px',
                            fontSize: '11px',
                            color: '#00ff88',
                            fontWeight: 600,
                        }}
                    >
                        ● LIVE
                    </div>
                </div>
            </div>

            {/* Signals Grid */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    scrollBehavior: 'smooth',
                    overscrollBehaviorY: 'contain',
                    touchAction: 'pan-y',
                    willChange: 'transform',
                    padding: '20px 24px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: '16px',
                    alignContent: 'start',
                }}
            >
                {/* Loading State */}
                {isLoading && (
                    <>
                        <SignalSkeleton />
                        <SignalSkeleton />
                        <SignalSkeleton />
                        <SignalSkeleton />
                    </>
                )}

                {/* Empty State */}
                {!isLoading && signals.length === 0 && (
                    <div
                        style={{
                            gridColumn: '1 / -1',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '60px 20px',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.6 }}>📡</div>
                        <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '18px', color: '#f3f7ff', marginBottom: '8px' }}>
                            No Signals Yet
                        </h3>
                        <p style={{ fontSize: '14px', color: '#8a93b3', maxWidth: '360px' }}>
                            Verified traders haven't posted any signals yet. Check back soon or become a verified trader to post the first signal.
                        </p>
                    </div>
                )}

                {/* Signal Cards */}
                {!isLoading && signals.map((signal) => {
                    const isLong = signal.direction === 'Long';
                    const isOwner = signal.user_id === currentUserId;
                    const coinUpper = signal.coin.toUpperCase();
                    const priceObj = prices.find((p) => p.symbol.toUpperCase() === coinUpper);
                    const currentPrice = priceObj?.price;
                    const change24h = priceObj?.change24h;

                    // Generate avatar from trader name
                    const initial = (signal.trader_name || '?')[0].toUpperCase();

                    return (
                        <div
                            key={signal.id}
                            className={`glass-card signal-card ${isLong ? 'long' : 'short'}`}
                            style={{
                                padding: '20px',
                                cursor: 'default',
                                animation: 'fadeIn 0.35s ease forwards',
                            }}
                        >
                            {/* Trader header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                                <div
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))',
                                        border: '1px solid rgba(0,212,255,0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        fontWeight: 700,
                                        color: '#62b6ff',
                                        flexShrink: 0,
                                        fontFamily: 'Sora, sans-serif',
                                    }}
                                >
                                    {initial}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '15px', color: '#e2e8f0' }}>{signal.trader_name}</span>
                                        {signal.is_verified && (
                                            <span className="badge badge-verified" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                ✓ Verified
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '3px' }}>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                            {timeAgo(signal.created_at)}
                                        </span>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                            {coinUpper}/USDT
                                        </span>
                                    </div>
                                </div>
                                <span
                                    className={isLong ? 'badge badge-buy' : 'badge badge-sell'}
                                    style={{ fontSize: '11px', padding: '4px 10px' }}
                                >
                                    {isLong ? '▲ LONG' : '▼ SHORT'}
                                </span>
                            </div>

                            {/* Current price row */}
                            {currentPrice && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <div>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '6px' }}>Current</span>
                                        <strong style={{ color: '#e2e8f0' }}>
                                            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </strong>
                                    </div>
                                    {change24h !== undefined && (
                                        <span
                                            style={{
                                                borderRadius: '999px',
                                                padding: '4px 8px',
                                                background: change24h >= 0 ? 'rgba(0,255,136,0.14)' : 'rgba(255,51,102,0.15)',
                                                color: change24h >= 0 ? '#00ff88' : '#ff3366',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                            }}
                                        >
                                            {change24h >= 0 ? '▲' : '▼'} {Math.abs(change24h).toFixed(2)}%
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Signal text */}
                            <div
                                style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    fontSize: '13px',
                                    color: '#cbd5e1',
                                    lineHeight: 1.5,
                                    marginBottom: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                }}
                            >
                                {isLong ? '🚀' : '📉'} {signal.direction} {coinUpper}
                            </div>

                            {/* Trade details */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                                {[
                                    { label: 'Entry', value: `$${signal.entry_price.toLocaleString()}`, color: '#00d4ff' },
                                    { label: 'Target', value: `$${signal.target_price.toLocaleString()}`, color: '#00ff88' },
                                    { label: 'Stop Loss', value: `$${signal.stop_loss.toLocaleString()}`, color: '#ff5d8f' },
                                ].map((d) => (
                                    <div
                                        key={d.label}
                                        style={{
                                            flex: 1,
                                            background: 'rgba(0,0,0,0.2)',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>{d.label}</div>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: d.color, fontFamily: 'JetBrains Mono, monospace' }}>
                                            {d.value}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {/* Copy Trade */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCopyTrade(signal);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: 'linear-gradient(135deg, rgba(76,255,176,0.08), rgba(98,182,255,0.08))',
                                        border: '1px solid rgba(76,255,176,0.2)',
                                        borderRadius: '8px',
                                        color: '#4cffb0',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontFamily: 'Manrope, sans-serif',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(76,255,176,0.18), rgba(98,182,255,0.18))';
                                        e.currentTarget.style.borderColor = 'rgba(76,255,176,0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(76,255,176,0.08), rgba(98,182,255,0.08))';
                                        e.currentTarget.style.borderColor = 'rgba(76,255,176,0.2)';
                                    }}
                                >
                                    📋 Copy Trade
                                </button>

                                {/* Analyze */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAnalyzeClick(signal);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(139,92,246,0.08))',
                                        border: '1px solid rgba(0,212,255,0.2)',
                                        borderRadius: '8px',
                                        color: '#00d4ff',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontFamily: 'Manrope, sans-serif',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.18), rgba(139,92,246,0.18))';
                                        e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(139,92,246,0.08))';
                                        e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)';
                                    }}
                                >
                                    🤖 Analyze
                                </button>
                            </div>

                            {/* Owner Controls */}
                            {isOwner && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingSignal(signal); }}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            background: 'rgba(98,182,255,0.06)',
                                            border: '1px solid rgba(98,182,255,0.2)',
                                            borderRadius: '8px',
                                            color: '#62b6ff',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            fontFamily: 'Manrope, sans-serif',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(98,182,255,0.14)';
                                            e.currentTarget.style.borderColor = 'rgba(98,182,255,0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(98,182,255,0.06)';
                                            e.currentTarget.style.borderColor = 'rgba(98,182,255,0.2)';
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeletingId(signal.id); }}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            background: 'rgba(255,93,143,0.06)',
                                            border: '1px solid rgba(255,93,143,0.2)',
                                            borderRadius: '8px',
                                            color: '#ff5d8f',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            fontFamily: 'Manrope, sans-serif',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,93,143,0.14)';
                                            e.currentTarget.style.borderColor = 'rgba(255,93,143,0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,93,143,0.06)';
                                            e.currentTarget.style.borderColor = 'rgba(255,93,143,0.2)';
                                        }}
                                    >
                                        🗑 Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            <SignalFormModal
                isOpen={showPostModal}
                onClose={() => setShowPostModal(false)}
                onSubmit={handlePostSignal}
                isSubmitting={isSubmitting}
            />

            <SignalFormModal
                isOpen={!!editingSignal}
                onClose={() => setEditingSignal(null)}
                onSubmit={handleEditSignal}
                isSubmitting={isSubmitting}
                editData={editingSignal}
            />

            <DeleteConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDeleteSignal}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default SignalFeed;