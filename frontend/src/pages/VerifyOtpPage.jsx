import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const VerifyOtpPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || otp.length !== 6) return;
    setIsVerifying(true);
    setError('');
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setSuccess(true);
      setTimeout(() => navigate('/auth'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{
            background: '#eafaf1', border: '1px solid #27ae60',
            borderRadius: '8px', padding: '28px', margin: '8px 0'
          }}>
            <p style={{ fontSize: '36px', margin: '0 0 8px 0' }}>✓</p>
            <h2 style={{ color: '#27ae60', margin: '0 0 8px 0' }}>Email Verified!</h2>
            <p style={{ color: '#555', margin: 0 }}>Your account is active. Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '8px' }}>Verify Your Email</h2>
          <p style={{ color: '#555', margin: 0 }}>
            Enter the <strong>6-digit code</strong> sent to your email address.
          </p>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="verifyEmail">Email Address</label>
            <input
              id="verifyEmail"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label htmlFor="verifyOtp">Verification Code</label>
            <input
              id="verifyOtp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              autoFocus={!!email}
              style={{
                letterSpacing: '14px',
                fontSize: '30px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                padding: '14px',
              }}
            />
          </div>
          <button
            type="submit"
            className="submit-btn"
            disabled={otp.length !== 6 || !email || isVerifying}
            style={{ width: '100%', marginTop: '20px' }}
          >
            {isVerifying ? 'Verifying...' : 'Verify & Activate Account'}
          </button>
        </form>

        <p style={{ color: '#888', fontSize: '13px', marginTop: '20px', textAlign: 'center' }}>
          Code expires in 10 minutes. Check your spam folder if not received.
        </p>
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <a href="/auth" style={{ color: '#3498db', textDecoration: 'none', fontSize: '14px' }}>
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
