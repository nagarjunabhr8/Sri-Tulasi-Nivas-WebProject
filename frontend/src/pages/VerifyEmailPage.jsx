import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(res => {
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      });
  }, [searchParams]);

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '24px' }}>Email Verification</h2>

        {status === 'verifying' && (
          <p style={{ color: '#555' }}>Verifying your email address, please wait...</p>
        )}

        {status === 'success' && (
          <>
            <div style={{
              background: '#eafaf1', border: '1px solid #27ae60',
              borderRadius: '8px', padding: '20px', marginBottom: '24px'
            }}>
              <p style={{ color: '#27ae60', fontSize: '16px', margin: 0 }}>
                ✓ {message}
              </p>
            </div>
            <Link
              to="/auth"
              className="submit-btn"
              style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 28px' }}
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              background: '#fdf0ef', border: '1px solid #e74c3c',
              borderRadius: '8px', padding: '20px', marginBottom: '24px'
            }}>
              <p style={{ color: '#e74c3c', fontSize: '15px', margin: 0 }}>
                ✗ {message}
              </p>
            </div>
            <Link to="/auth" style={{ color: '#3498db', textDecoration: 'none' }}>
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
