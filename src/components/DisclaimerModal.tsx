import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface DisclaimerModalProps {
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept }) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999, // Ensure it's on top of everything
      }}
    >
      <div
        className="fade-in"
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid rgba(255, 68, 102, 0.3)',
          borderRadius: '16px',
          padding: '32px',
          width: '500px',
          maxWidth: '90vw',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(255, 68, 102, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255, 68, 102, 0.3)'
          }}>
            <AlertTriangle size={26} color="#ff4466" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#fff', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
              Important Disclaimer
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              Please read carefully before proceeding.
            </p>
          </div>
        </div>

        <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <ShieldCheck size={20} color="#00d4ff" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0 }}>
              <strong>Trading Suggestions Only:</strong> Our AI provides algorithmic trade suggestions and trends. <strong>The final confirmation is yours.</strong>
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <ShieldCheck size={20} color="#00d4ff" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0 }}>
              <strong>Pure Intelligence Layer:</strong> Our system is a Pure Intelligence Layer. We do not process payments, we do not store wallet balances, and we do not provide a trading engine. The entire financial transaction lifecycle happens on the partner exchange's regulated infrastructure. We only bridge the gap between AI insights and execution via secure APIs. We are like a co-pilot, not the pilot.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <ShieldCheck size={20} color="#00d4ff" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0 }}>
              <strong>Risk Acknowledgment:</strong> While we strive to empower you with the very best analytical insights, please be gently reminded that all trading involves market risk. We kindly note that we cannot accept liability for any financial outcomes or losses that may occur.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <button
            onClick={onAccept}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))',
              border: '1px solid rgba(0,212,255,0.4)',
              borderRadius: '12px',
              color: '#fff',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.25)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(139,92,246,0.3))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))';
            }}
          >
            I understand and accept these terms
          </button>
        </div>
      </div>
    </div>
  );
};
