import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock, Mail, GraduationCap, ShieldCheck, CheckCircle2, UserPlus, ArrowRight, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const LoginView = () => {
  const { loginWithCredentials, signUpUser, demoUsers, generateUniqueAccountId, setCurrentView, theme } = useApp();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);

  // Sign up fields (strictly defaults to Student)
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpProgram, setSignUpProgram] = useState('BS Computer Science');
  const [signUpYearLevel, setSignUpYearLevel] = useState('1');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrId.trim()) {
      alert('Please enter your email, username, or Student ID.');
      return;
    }
    setIsLoading(true);
    setLoginError('');

    // Send login_portal: 'general' to enforce student and staff roles only
    const res = await loginWithCredentials(emailOrId.trim(), password, 'general');
    if (!res || !res.success) {
      if (res?.message) {
        setLoginError(res.message);
      } else {
        setLoginError('Authentication failed. Please verify your credentials.');
      }
    }
    setIsLoading(false);
  };

  const onSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!signUpName.trim() || !signUpEmail.trim()) {
      alert('Please fill out all required fields.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      alert('Passwords do not match. Please re-enter your password.');
      return;
    }

    const systemGeneratedStudentId = generateUniqueAccountId ? generateUniqueAccountId('Student', demoUsers) : `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    setIsLoading(true);
    await signUpUser({
      name: signUpName.trim(),
      email: signUpEmail.trim(),
      account_id: systemGeneratedStudentId,
      student_id_number: systemGeneratedStudentId,
      role: 'Student',
      program: signUpProgram,
      year_level: parseInt(signUpYearLevel, 10),
      password: signUpPassword,
    });
    setIsLoading(false);
  };

  const handleSelectQuickUser = (user) => {
    setEmailOrId(user.account_id || user.student_id_number || user.email || user.username);
    setPassword('password');
  };

  const handleGoToAdminPortal = () => {
    setCurrentView('admin_login');
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/admin/login');
    }
  };

  // Staff users strictly excludes Admin per Portal 1 specifications
  const staffUsers = demoUsers.filter(u => {
    const r = (u.role || '').toLowerCase();
    return r !== 'student' && r !== 'admin';
  });

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: isDark ? '#0B0F19' : '#F8F9FA',
        position: 'relative',
        transition: 'background-color 0.2s ease',
      }}
    >
      {/* Top Corner Floating Theme Toggle */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          zIndex: 50,
        }}
      >
        <ThemeToggle size="compact" />
      </div>

      {/* Left Dark Column */}
      <div
        style={{
          flex: '1',
          backgroundColor: '#1E293B',
          padding: '60px 80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: '#FFFFFF',
          minHeight: '100vh',
        }}
      >
        <div style={{ maxWidth: '480px' }}>
          {/* Official CuyoTech Logo & Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <img 
              src="/images/cuyotech-logo.png" 
              alt="CuyoTech University Logo" 
              style={{ width: '70px', height: '70px', objectFit: 'contain' }} 
            />
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#FFFFFF', margin: 0, letterSpacing: '0.5px' }}>
                CUYOTECH UNIVERSITY
              </h2>
              <p style={{ fontSize: '12.5px', color: '#F1B82D', margin: '2px 0 0', fontWeight: '700' }}>
                Student & Staff Services Information System
              </p>
            </div>
          </div>

          <h1
            style={{
              fontSize: '46px',
              fontWeight: '900',
              color: '#F1B82D',
              letterSpacing: '-1.5px',
              lineHeight: 1,
              marginBottom: '20px',
            }}
          >
            STUDENT & STAFF SERVICES
          </h1>

          <h2
            style={{
              fontSize: '22px',
              fontWeight: '700',
              lineHeight: 1.35,
              color: '#FFFFFF',
              marginBottom: '20px',
            }}
          >
            One unified campus portal.<br />
            Registration, enrollment, grades, and payments.
          </h2>

          <p
            style={{
              fontSize: '14.5px',
              lineHeight: 1.6,
              color: '#94A3B8',
              marginBottom: '32px',
            }}
          >
            Synchronized academic & financial services for CuyoTech University students and academic staff.
          </p>

          {/* Institutional Staff Auto-fill Chips (Registrar, Cashier, Dept Staff ONLY) */}
          <div style={{ borderTop: '1px solid #334155', paddingTop: '20px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
              Staff Accounts (Quick Demo Sign In)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {staffUsers.map((u, idx) => (
                <button
                  key={`staff-${u.id || u.email}-${idx}`}
                  type="button"
                  onClick={() => handleSelectQuickUser(u)}
                  style={{
                    background: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '9999px',
                    padding: '6px 14px',
                    color: '#E2E8F0',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#475569'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#334155'; }}
                >
                  {u.name} ({u.role})
                </button>
              ))}
            </div>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#CBD5E1', lineHeight: 1.5, backgroundColor: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '8px' }}>
              🔒 <strong>Student Security:</strong> Students sign in with their unique Student ID or registered email.
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Card */}
      <div
        style={{
          flex: '1.2',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderRadius: '16px',
            padding: '40px 36px',
            boxShadow: isDark ? '0 10px 35px rgba(0, 0, 0, 0.4)' : '0 8px 30px rgba(0, 0, 0, 0.06)',
            border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
            transition: 'all 0.2s ease',
          }}
        >
          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', borderBottom: `2px solid ${isDark ? '#334155' : '#E2E8F0'}`, marginBottom: '28px' }}>
            <button
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: 'transparent',
                fontWeight: mode === 'login' ? '800' : '600',
                color: mode === 'login' ? (isDark ? '#F1B82D' : '#9F1239') : '#94A3B8',
                borderBottom: mode === 'login' ? '2.5px solid #F1B82D' : 'none',
                cursor: 'pointer',
                fontSize: '15px',
                transition: 'all 0.15s ease',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: 'transparent',
                fontWeight: mode === 'signup' ? '800' : '600',
                color: mode === 'signup' ? (isDark ? '#F1B82D' : '#9F1239') : '#94A3B8',
                borderBottom: mode === 'signup' ? '2.5px solid #F1B82D' : 'none',
                cursor: 'pointer',
                fontSize: '15px',
                transition: 'all 0.15s ease',
              }}
            >
              Create Account
            </button>
          </div>

          {/* SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={onLoginSubmit}>
              <h2 style={{ fontSize: '23px', fontWeight: '800', color: isDark ? '#F8FAFC' : '#0F172A', marginBottom: '6px' }}>
                Welcome to CuyoTech
              </h2>
              <p style={{ fontSize: '13.5px', color: isDark ? '#94A3B8' : '#64748B', marginBottom: '20px' }}>
                Sign in with your email or Student ID to access your portal
              </p>

              {loginError && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
                    border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.4)' : '#FECACA'}`,
                    color: isDark ? '#FCA5A5' : '#991B1B',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="ssis-form-group">
                <label className="ssis-label" style={{ color: isDark ? '#CBD5E1' : undefined }}>
                  Email, Username, or Student ID
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="ssis-input"
                    placeholder="e.g. STU-2026-0001, r.alcantara@cuyotech.edu.ph"
                    value={emailOrId}
                    onChange={(e) => setEmailOrId(e.target.value)}
                    required
                    style={{
                      paddingLeft: '38px',
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      borderColor: isDark ? '#334155' : undefined,
                      color: isDark ? '#F8FAFC' : undefined,
                    }}
                  />
                  <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="ssis-form-group">
                <label className="ssis-label" style={{ color: isDark ? '#CBD5E1' : undefined }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="ssis-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      paddingLeft: '38px',
                      paddingRight: '42px',
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      borderColor: isDark ? '#334155' : undefined,
                      color: isDark ? '#F8FAFC' : undefined,
                    }}
                  />
                  <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
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
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748B',
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="ssis-btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '15px',
                  backgroundColor: '#F1B82D',
                  color: '#18181B',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* SIGN UP / REGISTER FORM */}
          {mode === 'signup' && (
            <form onSubmit={onSignUpSubmit}>
              <h2 style={{ fontSize: '23px', fontWeight: '800', color: isDark ? '#F8FAFC' : '#0F172A', marginBottom: '6px' }}>
                Register Student Account
              </h2>
              <p style={{ fontSize: '13px', color: isDark ? '#94A3B8' : '#64748B', marginBottom: '20px' }}>
                Create your verified student credentials for CuyoTech University
              </p>

              <div className="ssis-form-group">
                <label className="ssis-label" style={{ color: isDark ? '#CBD5E1' : undefined }}>Full Name</label>
                <input
                  type="text"
                  className="ssis-input"
                  placeholder="e.g. Juan Dela Cruz"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  required
                  style={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderColor: isDark ? '#334155' : undefined,
                    color: isDark ? '#F8FAFC' : undefined,
                  }}
                />
              </div>

              <div className="ssis-form-group">
                <label className="ssis-label" style={{ color: isDark ? '#CBD5E1' : undefined }}>Email Address</label>
                <input
                  type="email"
                  className="ssis-input"
                  placeholder="name@cuyotech.edu.ph"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                  style={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderColor: isDark ? '#334155' : undefined,
                    color: isDark ? '#F8FAFC' : undefined,
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div className="ssis-form-group">
                  <label className="ssis-label" style={{ color: isDark ? '#CBD5E1' : undefined }}>Academic Program</label>
                  <select
                    className="ssis-select"
                    value={signUpProgram}
                    onChange={(e) => setSignUpProgram(e.target.value)}
                    style={{
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      borderColor: isDark ? '#334155' : undefined,
                      color: isDark ? '#F8FAFC' : undefined,
                    }}
                  >
                    <option value="BS Computer Science">BS Computer Science</option>
                    <option value="BS Information Technology">BS Information Technology</option>
                  </select>
                </div>

                <div className="ssis-form-group">
                  <label className="ssis-label" style={{ color: isDark ? '#CBD5E1' : undefined }}>Year Level</label>
                  <select
                    className="ssis-select"
                    value={signUpYearLevel}
                    onChange={(e) => setSignUpYearLevel(e.target.value)}
                    style={{
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      borderColor: isDark ? '#334155' : undefined,
                      color: isDark ? '#F8FAFC' : undefined,
                    }}
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="ssis-form-group">
                  <label className="ssis-label" style={{ color: isDark ? '#CBD5E1' : undefined }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      className="ssis-input"
                      placeholder="Create password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                      style={{
                        paddingRight: '42px',
                        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                        borderColor: isDark ? '#334155' : undefined,
                        color: isDark ? '#F8FAFC' : undefined,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748B',
                      }}
                      title={showSignUpPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="ssis-form-group">
                  <label className="ssis-label" style={{ color: isDark ? '#CBD5E1' : undefined }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSignUpConfirmPassword ? 'text' : 'password'}
                      className="ssis-input"
                      placeholder="Repeat password"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      required
                      style={{
                        paddingRight: '42px',
                        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                        borderColor: isDark ? '#334155' : undefined,
                        color: isDark ? '#F8FAFC' : undefined,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748B',
                      }}
                      title={showSignUpConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignUpConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="ssis-btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '15px',
                  backgroundColor: '#F1B82D',
                  color: '#18181B',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
                <UserPlus size={16} />
              </button>
            </form>
          )}

          {/* Direct Portal Switcher Option to Admin Console */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <button
              type="button"
              onClick={handleGoToAdminPortal}
              id="goto-admin-portal-link"
              style={{
                backgroundColor: isDark ? 'rgba(241, 184, 45, 0.1)' : 'rgba(159, 18, 57, 0.06)',
                border: `1px solid ${isDark ? 'rgba(241, 184, 45, 0.3)' : 'rgba(159, 18, 57, 0.2)'}`,
                color: isDark ? '#F1B82D' : '#9F1239',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(241, 184, 45, 0.2)' : 'rgba(159, 18, 57, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(241, 184, 45, 0.1)' : 'rgba(159, 18, 57, 0.06)';
              }}
            >
              <Shield size={15} />
              <span>Switch to Admin Console →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
