import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, login, register, isLoading, error, clearError } = useAuthStore();
  const [tab, setTab] = useState('signin'); // 'signin' | 'register'

  // Redirect as soon as user is set in state (after successful login or register)
  useEffect(() => {
    if (user) {
      navigate('/residents', { replace: true });
    }
  }, [user, navigate]);

  // Clear any stale error from previous session on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Sign-in form state
  const [signIn, setSignIn] = useState({ email: '', password: '' });
  const [signInErrors, setSignInErrors] = useState({});

  // Register form state
  const [reg, setReg] = useState({
    fullName: '',
    flatNo: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: '',
  });
  const [regErrors, setRegErrors] = useState({});
  const [regSuccess, setRegSuccess] = useState(false);
  const [showSignInPwd, setShowSignInPwd] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Forgot password state
  const [forgotStep, setForgotStep] = useState(null); // null | 'email' | 'otp'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmNewPwd, setConfirmNewPwd] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmNewPwd, setShowConfirmNewPwd] = useState(false);

  const switchTab = (t) => {
    clearError();
    setSignInErrors({});
    setRegErrors({});
    setRegSuccess(false);
    setShowPwd(false);
    setShowConfirmPwd(false);
    setShowSignInPwd(false);
    setForgotStep(null);
    setForgotEmail('');
    setForgotOtp('');
    setNewPwd('');
    setConfirmNewPwd('');
    setForgotError('');
    setForgotSuccess(false);
    setTab(t);
  };

  /* ───────── Validation ───────── */
  const validateSignIn = () => {
    const errs = {};
    if (!signIn.email.trim()) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(signIn.email)) errs.email = 'Enter a valid email address';
    if (!signIn.password) errs.password = 'Password is required';
    else if (signIn.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const validateReg = () => {
    const errs = {};
    if (!reg.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!reg.flatNo.trim()) errs.flatNo = 'Flat No. is required';
    if (!reg.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(reg.email)) errs.email = 'Enter a valid email';
    if (!reg.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^[0-9+\-\s]{7,15}$/.test(reg.phone)) errs.phone = 'Enter a valid phone number';
    if (!reg.password) errs.password = 'Password is required';
    else if (reg.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!reg.role) errs.role = 'Please select a role';
    if (!reg.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (reg.password !== reg.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  /* ───────── Submit handlers ───────── */
  const handleSignIn = async (e) => {
    e.preventDefault();
    const errs = validateSignIn();
    if (Object.keys(errs).length) { setSignInErrors(errs); return; }
    setSignInErrors({});
    try {
      await login(signIn.email, signIn.password);
      // Navigation is handled automatically by App.jsx:
      // when user state becomes non-null, App re-renders with authenticated
      // routes, and the /auth route redirects to /residents.
    } catch {
      // error shown from store
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = validateReg();
    if (Object.keys(errs).length) { setRegErrors(errs); return; }
    setRegErrors({});

    const nameParts = reg.fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '.';

    try {
      await register({
        firstName,
        lastName,
        email: reg.email,
        phone: reg.phone,
        password: reg.password,
        role: reg.role,
        flatNo: reg.flatNo,
      });
      // Clear form and show success message instead of auto-login
      setReg({ fullName: '', flatNo: '', email: '', phone: '', role: '', password: '', confirmPassword: '' });
      setRegSuccess(true);
    } catch {
      // error shown from store
    }
  };

  /* ───────── Forgot password handlers ───────── */
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotStep('otp');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (forgotOtp.length !== 6) { setForgotError('Enter the 6-digit code from your email.'); return; }
    if (!newPwd || newPwd.length < 6) { setForgotError('Password must be at least 6 characters.'); return; }
    if (newPwd !== confirmNewPwd) { setForgotError('Passwords do not match.'); return; }
    setForgotLoading(true);
    setForgotError('');
    try {
      await api.post('/auth/reset-password', { email: forgotEmail, otp: forgotOtp, newPassword: newPwd });
      setForgotSuccess(true);
      setTimeout(() => {
        setForgotStep(null); setForgotSuccess(false);
        setForgotEmail(''); setForgotOtp(''); setNewPwd(''); setConfirmNewPwd('');
      }, 3000);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Reset failed. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  /* ───────── Feature list (right panel) ───────── */
  const features = [
    { icon: '🎉', text: 'Events & Festivals' },
    { icon: '🔧', text: 'Maintenance Tracking' },
    { icon: '💰', text: 'Transparent Funds' },
    { icon: '🔔', text: 'Instant Updates' },
  ];

  return (
    <div className="auth-split-layout">
      {/* ── Left panel ─────────────────────────────── */}
      <div className="auth-left-panel">
        <div className="auth-brand">
          <div className="auth-brand-icon">🏛️</div>
          <h1 className="auth-brand-title">Sri Tulasi Nivas</h1>
          <p className="auth-brand-sub">RESIDENT'S PORTAL - HYDERABAD</p>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab-btn${tab === 'signin' ? ' active' : ''}`}
            onClick={() => switchTab('signin')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab-btn${tab === 'register' ? ' active' : ''}`}
            onClick={() => switchTab('register')}
          >
            Register
          </button>
        </div>

        {/* Global error / success banners */}
        {error && (
          <div className="auth-error-banner" onClick={clearError}>
            {error}
          </div>
        )}
        {regSuccess && tab === 'register' && (
          <div className="auth-success-banner">
            ✅ Successfully Registered! Please Sign In to access the portal.
            <button type="button" onClick={() => { setRegSuccess(false); switchTab('signin'); }}>
              Sign In now →
            </button>
          </div>
        )}

        {/* ── Forgot Password: Step 1 – Enter email ── */}
        {tab === 'signin' && forgotStep === 'email' && (
          <form className="auth-form" onSubmit={handleForgotEmailSubmit} noValidate>
            <div style={{ marginBottom: '8px' }}>
              <h3 style={{ margin: '0 0 4px 0', color: '#2c3e50' }}>Reset Password</h3>
              <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>
                Enter your registered email and we'll send a 6-digit reset code.
              </p>
            </div>
            {forgotError && <div className="auth-error-banner">{forgotError}</div>}
            <div className="auth-field">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="yourname@gmail.com"
                value={forgotEmail}
                autoFocus
                onChange={e => setForgotEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={forgotLoading}>
              {forgotLoading ? 'Sending…' : 'Send Reset Code'}
            </button>
            <p className="auth-link-text">
              <button type="button" className="auth-text-link" onClick={() => setForgotStep(null)}>
                ← Back to Sign In
              </button>
            </p>
          </form>
        )}

        {/* ── Forgot Password: Step 2 – OTP + New Password ── */}
        {tab === 'signin' && forgotStep === 'otp' && (
          <form className="auth-form" onSubmit={handleResetPasswordSubmit} noValidate>
            {forgotSuccess ? (
              <div className="auth-success-banner">
                ✅ Password reset successfully! Redirecting to sign in…
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <h3 style={{ margin: '0 0 4px 0', color: '#2c3e50' }}>Enter Reset Code</h3>
                  <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>
                    We sent a 6-digit code to <strong>{forgotEmail}</strong>
                  </p>
                </div>
                {forgotError && <div className="auth-error-banner">{forgotError}</div>}
                <div className="auth-field">
                  <label>6-DIGIT RESET CODE</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={forgotOtp}
                    autoFocus
                    onChange={e => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ letterSpacing: '10px', fontSize: '22px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold' }}
                  />
                </div>
                <div className="auth-field">
                  <label>NEW PASSWORD</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={newPwd}
                      onChange={e => setNewPwd(e.target.value)}
                    />
                    <button type="button" className="password-toggle-btn" onClick={() => setShowNewPwd(v => !v)}>
                      {showNewPwd
                        ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                </div>
                <div className="auth-field">
                  <label>CONFIRM NEW PASSWORD</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmNewPwd ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmNewPwd}
                      onChange={e => setConfirmNewPwd(e.target.value)}
                    />
                    <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmNewPwd(v => !v)}>
                      {showConfirmNewPwd
                        ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                </div>
                <button type="submit" className="auth-submit-btn" disabled={forgotLoading || forgotOtp.length !== 6}>
                  {forgotLoading ? 'Resetting…' : 'Reset Password'}
                </button>
                <p className="auth-link-text">
                  <button type="button" className="auth-text-link" onClick={() => setForgotStep('email')}>
                    ← Resend code
                  </button>
                </p>
              </>
            )}
          </form>
        )}

        {/* ── Sign In Form ── */}
        {tab === 'signin' && !forgotStep && (
          <form className="auth-form" onSubmit={handleSignIn} noValidate>
            <div className="auth-field">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="yourname@gmail.com"
                value={signIn.email}
                onChange={(e) => setSignIn({ ...signIn, email: e.target.value })}
              />
              {signInErrors.email && <span className="field-error">{signInErrors.email}</span>}
            </div>

            <div className="auth-field">
              <label>PASSWORD</label>
              <div className="password-input-wrapper">
                <input
                  type={showSignInPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={signIn.password}
                  onChange={(e) => setSignIn({ ...signIn, password: e.target.value })}
                />
                <button type="button" className="password-toggle-btn" onClick={() => setShowSignInPwd(v => !v)} aria-label="Toggle password visibility">
                  {showSignInPwd ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {signInErrors.password && <span className="field-error">{signInErrors.password}</span>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign In to Portal'}
            </button>

            <p className="auth-link-text">
              <button type="button" className="auth-text-link" onClick={() => { clearError(); setForgotStep('email'); setForgotEmail(signIn.email); }}>Forgot password?</button>
            </p>

            <div className="auth-divider"><span>or</span></div>

            <p className="auth-link-text">
              New resident?{' '}
              <button type="button" className="auth-text-link" onClick={() => switchTab('register')}>
                Register here
              </button>
            </p>
          </form>
        )}

        {/* ── Register Form ── */}
        {tab === 'register' && (
          <form className="auth-form" onSubmit={handleRegister} noValidate>
            <div className="auth-field-row">
              <div className="auth-field">
                <label>FULL NAME</label>
                <input
                  type="text"
                  placeholder="Ravi Kumar"
                  value={reg.fullName}
                  onChange={(e) => setReg({ ...reg, fullName: e.target.value })}
                />
                {regErrors.fullName && <span className="field-error">{regErrors.fullName}</span>}
              </div>
              <div className="auth-field">
                <label>FLAT NO.</label>
                <input
                  type="text"
                  placeholder="A-101"
                  value={reg.flatNo}
                  onChange={(e) => setReg({ ...reg, flatNo: e.target.value })}
                />
                {regErrors.flatNo && <span className="field-error">{regErrors.flatNo}</span>}
              </div>
            </div>

            <div className="auth-field">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="yourname@gmail.com"
                value={reg.email}
                onChange={(e) => setReg({ ...reg, email: e.target.value })}
              />
              {regErrors.email && <span className="field-error">{regErrors.email}</span>}
            </div>

            <div className="auth-field">
              <label>PHONE NUMBER</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={reg.phone}
                onChange={(e) => setReg({ ...reg, phone: e.target.value })}
              />
              {regErrors.phone && <span className="field-error">{regErrors.phone}</span>}
            </div>

            <div className="auth-field">
              <label>ROLE</label>
              <select
                value={reg.role}
                onChange={(e) => setReg({ ...reg, role: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.85rem', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', background: '#fff', color: reg.role ? '#1A1209' : '#999', outline: 'none' }}
              >
                <option value="">— Select Role —</option>
                <option value="OWNER">OWNER</option>
                <option value="TENANT">TENANT</option>
              </select>
              {regErrors.role && <span className="field-error">{regErrors.role}</span>}
            </div>

            <div className="auth-field-row">
              <div className="auth-field">
                <label>PASSWORD</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={reg.password}
                    onChange={(e) => setReg({ ...reg, password: e.target.value })}
                  />
                  <button type="button" className="password-toggle-btn" onClick={() => setShowPwd(v => !v)} aria-label="Toggle password visibility">
                    {showPwd ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                {regErrors.password && <span className="field-error">{regErrors.password}</span>}
              </div>
              <div className="auth-field">
                <label>CONFIRM PASSWORD</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={reg.confirmPassword}
                    onChange={(e) => setReg({ ...reg, confirmPassword: e.target.value })}
                  />
                  <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPwd(v => !v)} aria-label="Toggle confirm password visibility">
                    {showConfirmPwd ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                {regErrors.confirmPassword && <span className="field-error">{regErrors.confirmPassword}</span>}
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create My Account'}
            </button>

            <p className="auth-link-text">
              Already registered?{' '}
              <button type="button" className="auth-text-link" onClick={() => switchTab('signin')}>
                Sign in here
              </button>
            </p>
          </form>
        )}
      </div>

      {/* ── Right panel ─────────────────────────────── */}
      <div className="auth-right-panel">
        <div className="auth-right-content">
          <div className="auth-hero-icon">🏠</div>
          <h2 className="auth-hero-title">Your Community,<br />Your Home</h2>
          <p className="auth-hero-subtitle">
            Manage your apartment life seamlessly — from maintenance requests to community events,
            all in one secure portal.
          </p>

          <ul className="auth-feature-list">
            {features.map((f) => (
              <li key={f.text} className="auth-feature-item">
                <span className="auth-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>

          <div className="auth-right-dots">
            <span className="dot active" /><span className="dot" /><span className="dot" />
          </div>

          <p className="auth-right-footer">Est. 2020 · Hyderabad, Telangana</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
