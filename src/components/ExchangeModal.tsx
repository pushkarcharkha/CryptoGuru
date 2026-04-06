import { useState } from 'react';
import { X, Shield, Zap, CheckCircle } from 'lucide-react';
import type { CryptoPrice } from '../types';
import { openOnramp } from '../lib/onramp';

interface ExchangeModalProps {
    prices: CryptoPrice[];
    onClose: () => void;
    walletAddress?: string;
    email?: string;
    addMessage: (content: string) => void;
}

const ExchangeModal: React.FC<ExchangeModalProps> = ({ onClose, walletAddress }) => {
    const [activeFlow, setActiveFlow] = useState<'BUY' | 'SELL'>('BUY');

    const quickCoins = [
        { symbol: 'BNB', name: 'BNB', network: 'BSC' },
        { symbol: 'USDT', name: 'Tether', network: 'BSC' },
        { symbol: 'ETH', name: 'Ethereum', network: 'ERC20' },
        { symbol: 'BTC', name: 'Bitcoin', network: 'BTC' }
    ];

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(5, 10, 20, 0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="glass-card"
                style={{
                    width: 'min(600px, 95vw)',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    borderRadius: '24px',
                    border: '1px solid rgba(0, 255, 136, 0.2)',
                    background: 'linear-gradient(135deg, #0a0a1a 0%, #111128 100%)',
                    position: 'relative',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: '#5555aa',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        zIndex: 10
                    }}
                >
                    <X size={18} />
                </button>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px'
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h2 style={{ color: '#e8e8ff', fontSize: '28px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                            Onramp / Offramp Gateway
                        </h2>
                        <p style={{ color: '#5555aa', fontSize: '15px' }}>
                            Exchange Crypto natively with <span style={{ color: '#00ff88', fontWeight: 'bold' }}>INR</span>
                        </p>
                    </div>

                    {/* Flow Selection Tabs */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '16px',
                        padding: '6px',
                        marginBottom: '32px',
                        width: '100%',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <button
                            onClick={() => setActiveFlow('BUY')}
                            style={{
                                padding: '12px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '700',
                                background: activeFlow === 'BUY' ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                                color: activeFlow === 'BUY' ? '#00ff88' : '#5555aa',
                                transition: 'all 0.3s'
                            }}
                        >
                            Buy Crypto
                        </button>
                        <button
                            onClick={() => setActiveFlow('SELL')}
                            style={{
                                padding: '12px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '700',
                                background: activeFlow === 'SELL' ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                                color: activeFlow === 'SELL' ? '#00ff88' : '#5555aa',
                                transition: 'all 0.3s'
                            }}
                        >
                            Sell Crypto
                        </button>
                    </div>

                    {/* Quick cards */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
                        {quickCoins.map(coin => (
                            <div
                                key={coin.symbol}
                                onClick={() => openOnramp(activeFlow, walletAddress || '', coin.symbol, coin.network)}
                                style={{
                                    background: '#111128',
                                    border: '1px solid #1a1a3a',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    width: '120px',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = activeFlow === 'BUY' ? '#00d4ff' : '#00ff88';
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = '#1a1a3a';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.background = '#111128';
                                }}
                            >
                                <p style={{ color: '#e8e8ff', fontWeight: '700', fontSize: '18px', marginBottom: '4px' }}>{coin.symbol}</p>
                                <p style={{ color: activeFlow === 'BUY' ? '#00d4ff' : '#00ff88', fontSize: '11px', marginTop: '12px', fontWeight: '600' }}>
                                    Check Quota →
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Main CTA button */}
                    <button
                        onClick={() => openOnramp(activeFlow, walletAddress || '')}
                        style={{
                            background: activeFlow === 'BUY' ? 'linear-gradient(135deg, #3b82f6, #00d4ff)' : 'linear-gradient(135deg, #00ff88, #00d4ff)',
                            color: '#050508',
                            border: 'none',
                            borderRadius: '14px',
                            padding: '18px 48px',
                            fontSize: '18px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            width: '100%',
                            boxShadow: `0 10px 20px -10px ${activeFlow === 'BUY' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(0, 255, 136, 0.5)'}`
                        }}
                    >
                        {activeFlow === 'BUY' ? 'Initiate Purchase Flow →' : 'Initiate Bank Withdrawal →'}
                    </button>

                    {/* Trust badges */}
                    <div style={{ display: 'flex', gap: '24px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5555aa', fontSize: '12px' }}>
                            <Shield size={14} style={{ color: '#00ff88' }} /> Licensed Escrow
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5555aa', fontSize: '12px' }}>
                            <Zap size={14} style={{ color: '#00d4ff' }} /> UPI Instant
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5555aa', fontSize: '12px' }}>
                            <CheckCircle size={14} style={{ color: '#00ff88' }} /> ISO Verified
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExchangeModal;
