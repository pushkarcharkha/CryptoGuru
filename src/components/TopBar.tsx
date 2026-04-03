import { Bot, Radio, ArrowRightLeft, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CryptoPrice, WalletState } from '../types';
import { AnimatedNumber } from './AnimatedNumber';
import appLogo from '../assets/cryptoguru.png';
import { supabase } from '../lib/supabase';

interface TopBarProps {
  activeTab: 'agent' | 'signals';
  onTabChange: (tab: 'agent' | 'signals') => void;
  onOpenExchange: () => void;
  prices: CryptoPrice[];
  wallet: WalletState;
  onConnectWallet: () => void;
  onUpgrade: () => void;
  formatAddress: (addr: string) => string;
}

const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  onOpenExchange,
  prices,
  wallet,
  onConnectWallet,
  onUpgrade,
  formatAddress,
}) => {
  const [userEmail, setUserEmail] = useState('');
  const [userPlan, setUserPlan] = useState('free');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        const { data } = await supabase.from('user_data').select('plan').eq('id', user.id).single();
        if (data) {
          setUserPlan(data.plan);
        }
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={appLogo}
          alt="Cryptoguru"
          style={{
            height: '150px',
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      {/* Scrolling ticker */}
      <div style={{ flex: 1, overflow: 'hidden', margin: '0 20px', maskImage: 'linear-gradient(90deg, transparent, white 5%, white 95%, transparent)' }}>
        <div className="ticker-content" style={{ display: 'flex', gap: '24px', fontSize: '12px', whiteSpace: 'nowrap' }}>
          {prices && prices.map(p => (
            <span key={p.id}>
              <span style={{ color: 'var(--text-secondary)', marginRight: '6px' }}>{p.symbol}</span>
              <AnimatedNumber 
                value={p.price} 
                format={(n) => n < 1 ? `$${n.toFixed(4)}` : `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                className={p.change24h >= 0 ? 'positive' : 'negative'}
              />
            </span>
          ))}
          {/* Duplicate for infinite effect */}
          {prices && prices.map(p => (
            <span key={`dup-${p.id}`}>
              <span style={{ color: 'var(--text-secondary)', marginRight: '6px' }}>{p.symbol}</span>
              <AnimatedNumber 
                value={p.price} 
                format={(n) => n < 1 ? `$${n.toFixed(4)}` : `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                className={p.change24h >= 0 ? 'positive' : 'negative'}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Center: Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '4px' }}>
        <button
          id="tab-exchange"
          onClick={onOpenExchange}
          style={{
            padding: '6px 18px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '13px',
            transition: 'all 0.2s ease',
            background: 'transparent',
            color: 'var(--text-secondary)',
            boxShadow: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ArrowRightLeft size={16} /> Exchange
        </button>
        <button
          id="tab-agent"
          onClick={() => onTabChange('agent')}
          style={{
            padding: '6px 18px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '13px',
            transition: 'all 0.2s ease',
            background: activeTab === 'agent' ? 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(139,92,246,0.25))' : 'transparent',
          color: activeTab === 'agent' ? '#00d4ff' : 'var(--text-secondary)',
          boxShadow: activeTab === 'agent' ? '0 0 12px rgba(0,212,255,0.2)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <Bot size={16} /> AI Agent
      </button>
        <button
          id="tab-signals"
          onClick={() => onTabChange('signals')}
          style={{
            padding: '6px 18px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '13px',
            transition: 'all 0.2s ease',
            background: activeTab === 'signals' ? 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(139,92,246,0.25))' : 'transparent',
          color: activeTab === 'signals' ? '#00d4ff' : 'var(--text-secondary)',
          boxShadow: activeTab === 'signals' ? '0 0 12px rgba(0,212,255,0.2)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <Radio size={16} /> Signal Feed
      </button>
      </div>

      {/* Right: User Profile & Wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="user-profile">
        {userPlan === 'free' && (
          <button 
            onClick={onUpgrade}
            style={{ 
              background: 'linear-gradient(135deg, #00ff88, #00d4ff)', 
              color: '#050508', 
              padding: '6px 14px', 
              borderRadius: '8px', 
              fontSize: '12px', 
              fontWeight: 800, 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 15px rgba(0,255,136,0.3)'
            }}
          >
            UPGRADE
          </button>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="plan-badge" style={{ background: userPlan === 'free' ? '#333' : userPlan === 'pro' ? '#00ff88' : '#7000ff', color: userPlan === 'free' ? '#fff' : '#050508', padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 800 }}>
                {userPlan === 'free' ? 'FREE' : userPlan === 'pro' ? 'PRO' : 'PRO+'}
                </span>
                <span className="user-email" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{userEmail.split('@')[0]}</span>
             </div>
             <button onClick={handleSignOut} style={{ background: 'transparent', border: 'none', padding: '0', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LogOut size={10} /> Sign Out
             </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }}></div>

        {wallet.isConnected ? (
          <button 
            className="wallet-btn connected"
            onClick={onConnectWallet}
          >
            {wallet.address ? formatAddress(wallet.address) : '...'}
          </button>
        ) : (
          <button 
            className="wallet-btn"
            onClick={onConnectWallet}
          >
            CONNECT WALLET
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default TopBar;
