import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Chrome, AlertCircle, ArrowRight } from 'lucide-react';
import appLogo from '../assets/cryptoguru.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/app');
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/app' } });
  };

  return (
    <div className="auth-page">
      <div className="auth-card-premium">
        <div className="auth-logo-section">
          <img src={appLogo} alt="CryptoGuru" style={{ height: '80px', marginBottom: '12px' }} />
          <div className="auth-logo-text">CryptoGuru</div>
        </div>

        <div className="auth-header">
          <h2>Welcome back</h2>
          <p>Access your trading terminal and co-pilot</p>
        </div>

        {error && (
          <div className="auth-error-premium">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form-premium">
          <div className="auth-input-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input-premium"
              required
            />
          </div>
          <div className="auth-input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input-premium"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="auth-button-premium">
            {loading ? 'Decrypting Access...' : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-divider-premium"><span>Secure OAuth</span></div>

        <button onClick={handleGoogleLogin} className="auth-google-btn">
          <Chrome size={20} />
          Continue with Google
        </button>

        <div className="auth-footer-text">
          New to the cockpit? <Link to="/signup">Register Access</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
