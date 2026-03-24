import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { register: registerUser, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const password = watch('password');

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setIsVerifying(true);
    setOtpError('');
    try {
      await api.post('/auth/verify-otp', { email: registeredEmail, otp });
      setOtpSuccess(true);
      setTimeout(() => navigate('/auth'), 2500);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLocalError('');
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      });
      setRegisteredEmail(data.email);
      setRegistered(true);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Registration failed');
    }
  };

  if (registered) {
    if (otpSuccess) {
      return (
        <div className="auth-container">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div style={{
              background: '#eafaf1', border: '1px solid #27ae60',
              borderRadius: '8px', padding: '28px', margin: '8px 0'
            }}>
              <p style={{ fontSize: '36px', margin: '0 0 8px 0' }}>✓</p>
              <h2 style={{ color: '#27ae60', margin: '0 0 8px 0' }}>Email Verified!</h2>
              <p style={{ color: '#555', margin: 0 }}>Redirecting to login...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '8px' }}>Verify Your Email</h2>
          <p style={{ color: '#555', marginBottom: '24px' }}>
            We sent a <strong>6-digit code</strong> to<br />
            <strong>{registeredEmail}</strong>
          </p>

          {otpError && (
            <div className="error-message" style={{ marginBottom: '16px' }}>{otpError}</div>
          )}

          <form onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label htmlFor="otp" style={{ textAlign: 'left', display: 'block' }}>
                Enter 6-Digit Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                autoFocus
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
              disabled={otp.length !== 6 || isVerifying}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {isVerifying ? 'Verifying...' : 'Verify & Activate Account'}
            </button>
          </form>

          <p style={{ color: '#888', fontSize: '13px', marginTop: '20px' }}>
            Code expires in 10 minutes. Check your spam folder if not received.
          </p>
          <a href="/auth" style={{ color: '#3498db', textDecoration: 'none', fontSize: '14px' }}>
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Join Sri Tulasi Nivas Community</h1>

        {(error || localError) && (
          <div className="error-message">{error || localError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                {...register('firstName', {
                  required: 'First name is required',
                })}
                placeholder="John"
              />
              {errors.firstName && (
                <span className="error">{errors.firstName.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                {...register('lastName', {
                  required: 'Last name is required',
                })}
                placeholder="Doe"
              />
              {errors.lastName && (
                <span className="error">{errors.lastName.message}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              placeholder="your@email.com"
            />
            {errors.email && (
              <span className="error">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              {...register('phone', {
                required: 'Phone is required',
              })}
              placeholder="+1234567890"
            />
            {errors.phone && (
              <span className="error">{errors.phone.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role">User Type</label>
            <select {...register('role', { required: 'User type is required' })}>
              <option value="">Select user type</option>
              <option value="tenant">Tenant</option>
              <option value="owner">Owner</option>
            </select>
            {errors.role && (
              <span className="error">{errors.role.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="error">{errors.password.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <span className="error">{errors.confirmPassword.message}</span>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="form-footer">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
