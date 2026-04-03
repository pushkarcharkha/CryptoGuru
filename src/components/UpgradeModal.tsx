import React from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

const PLANS = {
  pro: {
    name: 'Pro Plan',
    amount: 99900,
    description: 'Unlimited AI, whale alerts, personalized brief'
  },
  proPlus: {
    name: 'Pro+ Plan', 
    amount: 199900,
    description: 'Everything in Pro + Chart analysis + Voice brief'
  }
}

interface UpgradeModalProps {
  onClose: () => void;
  userEmail?: string;
  userId?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, userEmail, userId }) => {
  const handlePayment = async (planKey: 'pro' | 'proPlus') => {
    const plan = PLANS[planKey];
    
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: plan.amount,
      currency: 'INR',
      name: 'CryptoPilot',
      description: plan.description,
      image: '/cryptoguru.png',
      handler: async () => {
        if (userId) {
          await supabase.from('user_data').update({
            plan: planKey
          }).eq('id', userId);
        }
        alert('Payment successful! Your plan has been upgraded.');
        window.location.reload();
      },
      prefill: {
        email: userEmail || ''
      },
      theme: {
        color: '#00ff88'
      }
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-card" style={{ background: '#0a0a14', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '40px', maxWidth: '800px', width: '100%', position: 'relative' }}>
        <button className="icon-btn" onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px' }}><X size={24} /></button>
        <h2 style={{ fontSize: '32px', marginBottom: '8px', color: '#fff' }}>You've used your 5 free prompts today</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Upgrade to Pro for unlimited AI access</p>
        
        <div className="plan-cards" style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
          <div className="plan-card" style={{ flex: 1, padding: '32px', borderRadius: '16px', border: '1px solid var(--border-subtle)', background: 'var(--bg-panel)' }}>
            <h3 style={{ fontSize: '24px', color: '#00ff88' }}>Pro</h3>
            <p className="price" style={{ fontSize: '40px', fontWeight: 800, margin: '16px 0' }}>₹999<span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/month</span></p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>✓ Unlimited AI prompts</li>
              <li>✓ Whale alerts</li>
              <li>✓ Personalized brief</li>
              <li>✓ Full sentiment access</li>
            </ul>
            <button className="btn-outline" style={{ width: '100%' }} onClick={() => handlePayment('pro')}>
              Upgrade to Pro →
            </button>
          </div>

          <div className="plan-card featured" style={{ flex: 1, padding: '32px', borderRadius: '16px', border: '1px solid #00d4ff', background: 'rgba(0, 212, 255, 0.05)', position: 'relative' }}>
            <span className="badge" style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#00d4ff', color: '#000', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>Most Popular</span>
            <h3 style={{ fontSize: '24px', color: '#00d4ff' }}>Pro+</h3>
            <p className="price" style={{ fontSize: '40px', fontWeight: 800, margin: '16px 0' }}>₹1,999<span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/month</span></p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>✓ Everything in Pro</li>
              <li>✓ Chart analysis</li>
              <li>✓ Voice brief</li>
              <li>✓ Priority compute</li>
            </ul>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => handlePayment('proPlus')}>
              Upgrade to Pro+ →
            </button>
          </div>
        </div>

        <button onClick={onClose} className="skip-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', width: '100%', cursor: 'pointer' }}>
          Maybe later
        </button>
      </div>
    </div>
  );
};
