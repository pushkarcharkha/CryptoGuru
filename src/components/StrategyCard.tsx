import React from 'react';
import { Trash2, ToggleLeft, ToggleRight, Settings2, Activity } from 'lucide-react';
import type { TradingStrategy } from '../types';

interface StrategyCardProps {
    strategy: TradingStrategy;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (strategy: TradingStrategy) => void;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onToggle, onDelete, onEdit }) => {
    return (
        <div className="glass-card fade-in" style={{
            padding: '16px',
            marginBottom: '12px',
            borderLeft: `3px solid ${strategy.isActive ? '#00ff88' : '#444466'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            transition: 'all 0.3s ease'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        background: strategy.isActive ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Activity size={16} color={strategy.isActive ? '#00ff88' : '#8888aa'} />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>{strategy.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 700, marginTop: '2px' }}>
                            INVESTMENT: ${strategy.investmentAmount?.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                        onClick={() => onToggle(strategy.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: strategy.isActive ? '#00ff88' : '#666688', padding: 0 }}
                    >
                        {strategy.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                </div>
            </div>

            <div style={{ 
                padding: '12px', 
                background: 'rgba(0,0,0,0.15)', 
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.03)',
                fontSize: '12px',
                color: '#8888aa',
                lineHeight: '1.4',
                fontStyle: 'italic'
            }}>
                {strategy.description || "No description provided."}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '10px', color: '#444466' }}>Created {new Date(strategy.createdAt).toLocaleDateString()}</span>
                    {strategy.isActive && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
                            <span style={{ 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '50%', 
                                background: strategy.status === 'triggered' ? '#f59e0b' : '#00ff88',
                                display: 'inline-block',
                                boxShadow: strategy.status === 'scanning' ? '0 0 5px #00ff88' : 'none'
                            }}></span>
                            <span style={{ color: strategy.status === 'triggered' ? '#f59e0b' : '#00ff88', fontWeight: 600 }}>
                                {strategy.status === 'triggered' ? 'Triggered recently' : 'Scanning live markets...'}
                            </span>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={() => onEdit(strategy)}
                        style={{ background: 'none', border: 'none', color: '#8888aa', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <Settings2 size={12} /> Edit
                    </button>
                    <button 
                        onClick={() => onDelete(strategy.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <Trash2 size={12} /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
