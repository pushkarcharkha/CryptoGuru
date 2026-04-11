import React, { useState } from 'react';
import { X, Zap, Sparkles, DollarSign } from 'lucide-react';
import type { TradingStrategy } from '../types';

interface StrategyBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (strategy: Omit<TradingStrategy, 'id' | 'createdAt' | 'isActive'>) => void;
    initialData?: TradingStrategy | null;
}

export const StrategyBuilderModal: React.FC<StrategyBuilderModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [investmentAmount, setInvestmentAmount] = useState(initialData?.investmentAmount?.toString() || '1000');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name.trim() || !description.trim()) return;
        
        // When saving, we still pass a default 'conditions' array for now
        // In a more advanced version, we would call the AI here to generate structured conditions
        // if they haven't been generated yet.
        onSave({
            name,
            description,
            investmentAmount: parseFloat(investmentAmount) || 0,
            coin: 'ANY', // Will be parsed by AI
            timeframe: '1h',
            logic: 'AND',
            conditions: initialData?.conditions || []
        });
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(10px)'
        }}>
            <div className="glass-card fade-in" style={{
                width: '100%',
                maxHeight: '90vh',
                maxWidth: '500px',
                padding: '32px',
                border: '1px solid var(--border-subtle)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: '#8888aa', cursor: 'pointer' }}>
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '12px', 
                        background: 'rgba(0, 255, 136, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 16px auto' 
                    }}>
                        <Zap size={24} color="#00ff88" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '22px', color: '#e2e8f0', fontWeight: 700 }}>
                        {initialData ? 'Edit Strategy' : 'Strategy Builder'}
                    </h2>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                        Describe your trading rule in plain English.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Strategy Name */}
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Strategy Name
                        </label>
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. BTC Triangle Breakout"
                            style={{ 
                                width: '100%', 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '12px', 
                                padding: '12px 16px', 
                                color: '#fff', 
                                outline: 'none',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    {/* Investment Amount */}
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Investment Amount (USD)
                        </label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <DollarSign size={14} />
                            </span>
                            <input 
                                type="number"
                                value={investmentAmount}
                                onChange={(e) => setInvestmentAmount(e.target.value)}
                                placeholder="1000"
                                style={{ 
                                    width: '100%', 
                                    background: 'rgba(255,255,255,0.03)', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    borderRadius: '12px', 
                                    padding: '12px 16px 12px 36px', 
                                    color: '#fff', 
                                    outline: 'none',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Strategy Description
                        </label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. I follow the triangle pattern on BTC/USDT. Notify me when it breaks out so I can invest..."
                            style={{ 
                                width: '100%', 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '12px', 
                                padding: '16px', 
                                color: '#fff', 
                                outline: 'none',
                                fontSize: '14px',
                                minHeight: '120px',
                                resize: 'none',
                                lineHeight: '1.5'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                    <button 
                        onClick={handleSave}
                        disabled={!name.trim() || !description.trim()}
                        style={{
                            background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
                            border: 'none',
                            color: '#0b0b1a',
                            padding: '14px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: (!name.trim() || !description.trim()) ? 0.5 : 1,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Sparkles size={18} /> {initialData ? 'Update Strategy' : 'Create AI Strategy'}
                    </button>
                    
                    <p style={{ margin: 0, textAlign: 'center', fontSize: '11px', color: '#555577', fontStyle: 'italic' }}>
                        Our AI will monitor charts locally for your pattern and alert you instantly.
                    </p>
                </div>
            </div>
        </div>
    );
};
