import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, ShieldAlert, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const AdminLoginView = () => {
  const { loginWithCredentials, setCurrentView, theme } = useApp();
  const isDark = theme === 'dark';

  const [adminIdentifier, setAdminIdentifier] = useState('v.ramos');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const onAdminLoginSubmit = async (e) => {
    e.preventDefault();
    if (!adminIdentifier.trim()) {
      setLoginError('Please enter your Administrator username or ID.');
      return;
    }
    setIsLoading(true);
    setLoginError('');

    // Explicitly pass login_portal: 'admin' to enforce strict role boundary
    const res = await loginWithCredentials(adminIdentifier.trim(), password, 'admin');
    if (!res || !res.success) {
      if (res?.message) {
        setLoginError(res.message);
      } else {
        setLoginError('Authentication failed. Please verify administrative credentials.');
      }
    }
    setIsLoading(false);
  };

  const handleReturnToMainPortal = () => {
    setCurrentView('login');
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: isDark ? '#070A11' : '#0F172A',
        color: '#F8FAFC',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}
    >
      {/* Top Controls Bar */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '24px',
          right: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={handleReturnToMainPortal}
          id="back-to-general-login-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#E2E8F0',
            padding: '9px 18px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'; }}
        >
          <ArrowLeft size={16} />
          <span>← Switch to Student & Staff Portal</span>
        </button>

        <ThemeToggle size="compact" />
      </div>

      {/* Main Administrative Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: isDark ? '#111827' : '#1E293B',
          borderRadius: '20px',
          padding: '44px 40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(241, 184, 45, 0.2)',
          border: '1px solid rgba(241, 184, 45, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Security Glow Accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #F1B82D, #EF4444, #F1B82D)',
          }}
        />

        {/* Security Badge Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#FCA5A5',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
            }}
          >
            <ShieldAlert size={13} color="#EF4444" />
            <span>Restricted • Admin Console</span>
          </span>
          <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>Tier-1 Access</span>
        </div>

        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <img
            src="/images/cuyotech-logo.png"
            alt="CuyoTech University Logo"
            style={{ width: '54px', height: '54px', objectFit: 'contain' }}
          />
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', margin: 0, letterSpacing: '0.4px' }}>
              CUYOTECH UNIVERSITY
            </h2>
            <p style={{ fontSize: '12px', color: '#F1B82D', margin: '2px 0 0', fontWeight: '700' }}>
              System Administrator Console Login
            </p>
          </div>
        </div>

        <p style={{ fontSize: '13.5px', color: '#94A3B8', marginBottom: '24px', lineHeight: 1.5 }}>
          Authorized system administrators only. Unauthorized access attempts are monitored and cryptographically recorded in the system audit logs.
        </p>

        {/* Error Alert Banner */}
        {loginError && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#FCA5A5',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: '800', color: '#EF4444' }}>Access Restriction:</div>
              <div>{loginError}</div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onAdminLoginSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: '700',
                color: '#CBD5E1',
                marginBottom: '6px',
                letterSpacing: '0.2px',
              }}
            >
              Administrator Username or ID
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={adminIdentifier}
                onChange={(e) => setAdminIdentifier(e.target.value)}
                placeholder="e.g. v.ramos or ADM-2026-0001"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: '700',
                color: '#CBD5E1',
                marginBottom: '6px',
                letterSpacing: '0.2px',
              }}
            >
              Admin Master Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 40px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#F1B82D',
              border: 'none',
              borderRadius: '10px',
              color: '#18181B',
              fontSize: '15px',
              fontWeight: '800',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(241, 184, 45, 0.3)',
            }}
          >
            <KeyRound size={17} />
            <span>{isLoading ? 'Verifying Admin Credentials...' : 'Authenticate Admin Session'}</span>
          </button>
        </form>

        {/* Quick Admin Demo Fill */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
            Quick Admin Demo Account
          </div>
          <button
            type="button"
            onClick={() => {
              setAdminIdentifier('v.ramos');
              setPassword('password');
            }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(241, 184, 45, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#F1B82D',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Shield size={14} />
            <span>Victor Ramos (Admin • v.ramos)</span>
          </button>
        </div>

        {/* Security Policy Reminder */}
        <div
          style={{
            marginTop: '20px',
            fontSize: '11.5px',
            color: '#64748B',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          Protected under CuyoTech University IT Security Policy 2026.
        </div>
      </div>
    </div>
  );
};
