import React, { useState } from 'react';
import { Settings, Key, Eye, EyeOff, Bot } from 'lucide-react';

interface SettingsModalProps {
  apiKey: string;
  onSave: (groqKey: string) => void;
  onClose: () => void;
  language?: 'english' | 'hindi';
  onLanguageChange?: (lang: 'english' | 'hindi') => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ apiKey, onSave, onClose, language = 'english', onLanguageChange }) => {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    onSave(keyInput.trim());
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="fade-in"
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '28px',
          width: '440px',
          maxWidth: '90vw',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))',
              border: '1px solid rgba(0,212,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <Settings size={22} color="#00d4ff" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: '#e2e8f0' }}>
              Settings
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Configure Cryptoguru AI
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '20px',
              lineHeight: 1,
              padding: '4px',
            }}
          >
            ×
          </button>
        </div>

        {/* API Key Section */}
        {import.meta.env.VITE_GROQ_API_KEY ? (
          <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '10px' }}>
            <p style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={14} /> AI Engine Active (System Key)
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Your terminal is using the system-configured Groq API key from environment variables.
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
              <Key size={14} /> Groq API Key
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="api-key-input"
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="gsk_..."
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px 44px 12px 14px',
                  color: '#e2e8f0',
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(0,212,255,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Get a free API key at{' '}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#00d4ff', textDecoration: 'none' }}
              >
                console.groq.com
              </a>
              . The key is stored locally in your browser only.
            </p>
          </div>
        )}



        <div
          style={{
            padding: '12px 14px',
            background: 'rgba(0,212,255,0.04)',
            border: '1px solid rgba(0,212,255,0.1)',
            borderRadius: '10px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            <Bot size={12} /> AI MODEL
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#e2e8f0' }}>llama-3.3-70b-versatile</span>
            <span style={{ color: '#00ff88', fontSize: '11px', fontWeight: 600 }}>FREE</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            via Groq · Ultra-fast inference
          </div>
        </div>

        {/* Language Selection */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>AI Language / भाषा</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onLanguageChange?.('english')}
              style={{
                flex: 1,
                background: language === 'english' ? 'rgba(0,255,136,0.1)' : 'rgba(0,0,0,0.2)',
                border: `1px solid ${language === 'english' ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
                color: language === 'english' ? '#00ff88' : '#cbd5e1',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => onLanguageChange?.('hindi')}
              style={{
                flex: 1,
                background: language === 'hindi' ? 'rgba(0,255,136,0.1)' : 'rgba(0,0,0,0.2)',
                border: `1px solid ${language === 'hindi' ? '#00ff88' : 'rgba(255,255,255,0.1)'}`,
                color: language === 'hindi' ? '#00ff88' : '#cbd5e1',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              🇮🇳 हिंदी
            </button>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '8px' }}>
            {language === 'hindi' ? 'AI आपसे हिंदी में बात करेगा' : 'AI will respond in English'}
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '11px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            Cancel
          </button>
          <button
            id="save-settings-btn"
            onClick={handleSave}
            style={{
              flex: 2,
              padding: '11px',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(139,92,246,0.3))',
              border: '1px solid rgba(0,212,255,0.4)',
              borderRadius: '10px',
              color: '#00d4ff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
