import { Bot, Radio, ArrowRightLeft, LogOut, Bell, Trash2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import type { CryptoPrice, WalletState, PriceAlert } from '../types';
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
  alerts: PriceAlert[];
  removeAlert: (id: string) => void;
  clearTriggered: () => void;
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
  alerts,
  removeAlert,
  clearTriggered,
}) => {
  const [userEmail, setUserEmail] = useState('');
  const [userPlan, setUserPlan] = useState('free');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const triggeredCount = alerts.filter(a => a.isTriggered).length;

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        
        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: showNotifications ? '#00ff88' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.2s ease'
            }}
          >
            <Bell size={18} />
            {triggeredCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ff3366',
                color: 'white',
                fontSize: '10px',
                fontWeight: 800,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0a0a0c'
              }}>
                {triggeredCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '45px',
              right: '0',
              width: '300px',
              background: 'rgba(15, 15, 20, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              zIndex: 1000,
              padding: '12px',
              animation: 'fadeIn 0.2s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Notifications</span>
                {triggeredCount > 0 && (
                  <button onClick={clearTriggered} style={{ background: 'transparent', border: 'none', color: '#00ff88', fontSize: '11px', cursor: 'pointer' }}>Clear</button>
                )}
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }} className="custom-scrollbar">
                {alerts.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No alerts set. Type "Notify me when BTC hits 70000" in chat.
                  </div>
                ) : (
                  alerts.slice().sort((a,b) => b.createdAt - a.createdAt).map(alert => (
                    <div key={alert.id} style={{
                      background: alert.isTriggered ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${alert.isTriggered ? 'rgba(0, 255, 136, 0.2)' : 'var(--border-subtle)'}`,
                      borderRadius: '8px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#00d4ff' }}>{alert.symbol.toUpperCase()}</span>
                        <button onClick={() => removeAlert(alert.id)} style={{ background: 'transparent', border: 'none', color: '#ff3366', cursor: 'pointer', padding: '2px' }}><Trash2 size={12} /></button>
                      </div>
                      <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Target: ${alert.targetPrice.toLocaleString()}</span>
                        <span style={{ color: alert.isTriggered ? '#00ff88' : 'var(--text-muted)', fontWeight: 600 }}>
                          {alert.isTriggered ? 'TRIGGERED' : 'PENDING'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 10px; }
      `}</style>
    </div>
  );
};

export default TopBar;
