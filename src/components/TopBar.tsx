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
    <div className="topbar-root">
      {/* Left: Logo */}
      <div 
        style={{ display: 'flex', alignItems: 'center', flexShrink: 0, cursor: 'pointer' }}
        onClick={() => window.location.href = '/'}
        title="Go to Home"
      >
        <img
          src={appLogo}
          alt="Cryptoguru"
          className="topbar-logo"
        />
      </div>

      {/* Scrolling ticker — hidden on mobile */}
      <div className="topbar-ticker">
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
      <div className="topbar-tabs">
        <button id="tab-exchange" onClick={onOpenExchange} className="topbar-tab-btn">
          <ArrowRightLeft size={16} /> <span className="topbar-tab-label">Exchange</span>
        </button>
        <button id="tab-agent" onClick={() => onTabChange('agent')} className={`topbar-tab-btn ${activeTab === 'agent' ? 'active' : ''}`}>
          <Bot size={16} /> <span className="topbar-tab-label">AI Agent</span>
        </button>
        <button id="tab-signals" onClick={() => onTabChange('signals')} className={`topbar-tab-btn ${activeTab === 'signals' ? 'active' : ''}`}>
          <Radio size={16} /> <span className="topbar-tab-label">Signals</span>
        </button>
      </div>

      {/* Right: User Profile & Wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }} className="topbar-right">
        {userPlan === 'free' && (
          <button onClick={onUpgrade} className="topbar-upgrade-btn">UPGRADE</button>
        )}
        
        <div className="topbar-user-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="plan-badge" style={{ background: userPlan === 'free' ? '#333' : userPlan === 'pro' ? '#00ff88' : '#7000ff', color: userPlan === 'free' ? '#fff' : '#050508', padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 800 }}>
              {userPlan === 'free' ? 'FREE' : userPlan === 'pro' ? 'PRO' : 'PRO+'}
            </span>
            <span className="topbar-email" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{userEmail.split('@')[0]}</span>
          </div>
          <button onClick={handleSignOut} style={{ background: 'transparent', border: 'none', padding: '0', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <LogOut size={10} /> Sign Out
          </button>
        </div>

        <div className="topbar-divider" style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }}></div>

        {wallet.isConnected ? (
          <button className="wallet-btn connected" onClick={onConnectWallet}>
            {wallet.address ? formatAddress(wallet.address) : '...'}
          </button>
        ) : (
          <button className="wallet-btn" onClick={onConnectWallet}>
            <span className="topbar-wallet-full">CONNECT WALLET</span>
            <span className="topbar-wallet-short">CONNECT</span>
          </button>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default TopBar;
