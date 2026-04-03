import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Chrome, AlertCircle, ArrowRight } from 'lucide-react';
import appLogo from '../assets/cryptoguru.png';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    const { data: { user }, error: signupError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { full_name: name } }
    });

    if (signupError) {
      setError(signupError.message);
    } else if (user) {
      const { error: dbError } = await supabase.from('user_data').insert({ 
        id: user.id, 
        plan: 'free',
        ai_prompts_used: 0,
        ai_prompts_reset_date: new Date().toISOString().split('T')[0]
      });
      if (dbError) {
        console.error('Error creating user profile:', dbError);
      }
      navigate('/app');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/app' } });
  };

  return (
    <div className="auth-page">
      <div className="auth-card-premium">
        <div className="auth-logo-section">
          <img 
            src={appLogo} 
            alt="CryptoGuru" 
            style={{ 
              height: '120px', 
              width: 'auto', 
              marginBottom: '-20px', 
              marginTop: '-40px' 
            }} 
          />
          <div className="auth-logo-text">CryptoGuru</div>
        </div>

        <div className="auth-header">
          <h2>Apply for Access</h2>
          <p>Join the next generation of AI traders</p>
        </div>

        {error && (
          <div className="auth-error-premium">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="auth-form-premium">
          <div className="auth-input-group">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input-premium"
              required
            />
          </div>
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
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input-premium"
              required
            />
          </div>
          <div className="auth-input-group">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input-premium"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="auth-button-premium">
            {loading ? 'Initializing Profile...' : (
              <>
                Create Account <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-divider-premium"><span>Direct Link</span></div>

        <button onClick={handleGoogleLogin} className="auth-google-btn">
          <Chrome size={20} />
          Sign up with Google
        </button>

        <div className="auth-footer-text">
          Already a pilot? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
