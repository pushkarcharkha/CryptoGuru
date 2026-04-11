import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Chrome, AlertCircle, ArrowRight } from 'lucide-react';
import appLogo from '../assets/cryptoguru.png';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
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
      options: { 
        data: { full_name: name },
        emailRedirectTo: window.location.origin + '/app'
      }
    });

    if (signupError) {
      if (signupError.message.includes('rate limit')) {
        setError('Email rate limit exceeded. Please wait 1 hour or check your Supabase Dashboard -> Auth -> Providers -> Email settings.');
      } else {
        setError(signupError.message);
      }
      setLoading(false);
    } else if (user) {
      // If user is created but not yet confirmed, show OTP input
      // If "Confirm Email" is OFF, user might be automatically confirmed
      if (user.identities?.length === 0) {
        setError('An account with this email already exists.');
        setLoading(false);
      } else {
        setShowOtpInput(true);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup'
      });

      if (verifyError) {
        setError(verifyError.message);
        setLoading(false);
      } else if (data.user) {
        // Create user profile in user_data table after verification
        const { error: dbError } = await supabase.from('user_data').insert({
          id: data.user.id,
          plan: 'free',
          ai_prompts_used: 0,
          ai_prompts_reset_date: new Date().toISOString().split('T')[0]
        });
        
        if (dbError) {
          console.error('Error creating user profile:', dbError);
        }
        navigate('/app');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // ... (existing handleGoogleLogin code remains the same)
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google', 
        options: { 
          redirectTo: window.location.origin + '/app',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        } 
      });
      if (error) {
        console.error('Google Sign In Error:', error);
        setError(`Google Login Error: ${error.message}. Please check your Supabase/Google Dashboard configuration.`);
      }
    } catch (err: any) {
      console.error('Google Sign In Catch Error:', err);
      setError(err.message || 'An error occurred during Google sign in');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-premium">
        <div className="auth-logo-section">
          <img src={appLogo} alt="CryptoGuru" className="auth-logo" />
          <div className="auth-logo-text">CryptoGuru</div>
        </div>

        <div className="auth-header">
          <h2>{showOtpInput ? 'Verify Email' : 'Apply for Access'}</h2>
          <p>{showOtpInput ? `Enter the verification code sent to ${email}` : 'Join the next generation of AI traders'}</p>
        </div>

        {error && (
          <div className="auth-error-premium">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!showOtpInput ? (
          <>
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

            <button type="button" onClick={handleGoogleLogin} className="auth-google-btn">
              <Chrome size={20} />
              Sign up with Google
            </button>

            <div className="auth-footer-text">
              Already a pilot? <Link to="/login">Sign In</Link>
            </div>
          </>
        ) : (
          <form onSubmit={handleVerifyOtp} className="auth-form-premium">
            <div className="auth-input-group">
              <input
                type="text"
                placeholder="6-digit Verification Code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="auth-input-premium"
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '24px' }}
                maxLength={6}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="auth-button-premium">
              {loading ? 'Verifying...' : (
                <>
                  Verify & Access <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="auth-footer-text" style={{ marginTop: '20px' }}>
              Didn't get the code? <button type="button" onClick={() => setShowOtpInput(false)} className="text-link" style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: 'var(--accent-primary)' }}>Back to Sign Up</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;
