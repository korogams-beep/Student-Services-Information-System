import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock, Mail, GraduationCap, ShieldCheck, CheckCircle2, UserPlus, ArrowRight } from 'lucide-react';

export const LoginView = () => {
  const { loginWithCredentials, signUpUser, demoUsers } = useApp();

  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState('Student');
  const [isLoading, setIsLoading] = useState(false);

  // Sign up fields
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpStudentId, setSignUpStudentId] = useState('');
  const [signUpRole, setSignUpRole] = useState('Student');
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
    await loginWithCredentials(emailOrId, password, role);
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

    setIsLoading(true);
    await signUpUser({
      name: signUpName,
      email: signUpEmail,
      student_id_number: signUpStudentId || `2026-${Math.floor(10000 + Math.random() * 90000)}`,
      role: signUpRole,
      program: signUpProgram,
      year_level: parseInt(signUpYearLevel, 10),
      password: signUpPassword,
    });
    setIsLoading(false);
  };

  const handleSelectQuickUser = (user) => {
    setEmailOrId(user.email || user.username || user.student_id_number);
    setRole(user.role);
    setPassword('password');
  };

  const staffUsers = demoUsers.filter(u => u.role !== 'Student');
  const studentUsers = demoUsers.filter(u => u.role === 'Student');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#F8F9FA' }}>
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
              src="/images/pnc-logo.png" 
              alt="CuyoTech University Logo" 
              style={{ width: '70px', height: '70px', objectFit: 'contain' }} 
            />
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#FFFFFF', margin: 0, letterSpacing: '0.5px' }}>
                CUYOTECH UNIVERSITY
              </h2>
              <p style={{ fontSize: '12.5px', color: '#F1B82D', margin: '2px 0 0', fontWeight: '700' }}>
                CuyoTech University of Science & Technology
              </p>
            </div>
          </div>

          <h1
            style={{
              fontSize: '48px',
              fontWeight: '900',
              color: '#F1B82D',
              letterSpacing: '-1.5px',
              lineHeight: 1,
              marginBottom: '20px',
            }}
          >
            SSIS PORTAL
          </h1>

          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              lineHeight: 1.35,
              color: '#FFFFFF',
              marginBottom: '20px',
            }}
          >
            One connected university portal.<br />
            Every student service, in one place.
          </h2>

          <p
            style={{
              fontSize: '14.5px',
              lineHeight: 1.6,
              color: '#94A3B8',
              marginBottom: '36px',
            }}
          >
            Secure, synchronized academic & financial services for CuyoTech University students, faculty, and administrative staff.
          </p>

          {/* Quick Staff Demo Chips */}
          <div style={{ borderTop: '1px solid #334155', paddingTop: '20px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
              Staff Accounts (One-Click Auto Fill)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {staffUsers.map((u, idx) => (
                <button
                  key={`staff-${u.id || u.email}-${idx}`}
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

              {studentUsers.map((u, idx) => (
                <button
                  key={`student-${u.id || u.email}-${idx}`}
                  onClick={() => handleSelectQuickUser(u)}
                  style={{
                    background: '#9F1239',
                    border: '1px solid #BE123C',
                    borderRadius: '9999px',
                    padding: '6px 14px',
                    color: '#FFE4E6',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {u.name} (Student)
                </button>
              ))}
            </div>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#CBD5E1', lineHeight: 1.5, backgroundColor: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '8px' }}>
              ℹ️ <strong>Student Experience:</strong> Create your student account via the <strong>Create Account</strong> tab. Student accounts start fresh at default 0 and populate dynamically as Registrar, Cashier, and Department Staff process your records.
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
          padding: '40px',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '40px 36px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
            border: '1px solid #E2E8F0',
          }}
        >
          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: '28px' }}>
            <button
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: 'transparent',
                fontWeight: mode === 'login' ? '800' : '600',
                color: mode === 'login' ? '#9F1239' : '#64748B',
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
                color: mode === 'signup' ? '#9F1239' : '#64748B',
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
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                Welcome to CuyoTech University
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '24px' }}>
                Sign in with your email or Student ID to access your portal
              </p>

              <div className="ssis-form-group">
                <label className="ssis-label">Email, Username, or Student ID</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="ssis-input"
                    placeholder="e.g. Gams, r.alcantara@cuyotech.edu.ph, 2026-..."
                    value={emailOrId}
                    onChange={(e) => setEmailOrId(e.target.value)}
                    required
                    style={{ paddingLeft: '38px' }}
                  />
                  <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="ssis-form-group">
                <label className="ssis-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="ssis-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '38px' }}
                  />
                  <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="ssis-form-group">
                <label className="ssis-label">Login Perspective / Role</label>
                <select
                  className="ssis-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Student">Student</option>
                  <option value="Registrar">Registrar</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Department Staff">Department Staff</option>
                  <option value="Admin">Admin</option>
                </select>
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
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                Register Account
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
                Create your student or institutional account for CuyoTech University
              </p>

              <div className="ssis-form-group">
                <label className="ssis-label">Full Name</label>
                <input
                  type="text"
                  className="ssis-input"
                  placeholder="e.g. Gams"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="ssis-form-group">
                  <label className="ssis-label">Email Address</label>
                  <input
                    type="email"
                    className="ssis-input"
                    placeholder="name@pnc.edu.ph"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="ssis-form-group">
                  <label className="ssis-label">Student ID Number</label>
                  <input
                    type="text"
                    className="ssis-input"
                    placeholder="e.g. 2026-0001"
                    value={signUpStudentId}
                    onChange={(e) => setSignUpStudentId(e.target.value)}
                  />
                </div>
              </div>

              <div className="ssis-form-group">
                <label className="ssis-label">Role</label>
                <select
                  className="ssis-select"
                  value={signUpRole}
                  onChange={(e) => setSignUpRole(e.target.value)}
                >
                  <option value="Student">Student (Default 0 Records)</option>
                  <option value="Registrar">Registrar</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Department Staff">Department Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {signUpRole === 'Student' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                  <div className="ssis-form-group">
                    <label className="ssis-label">Academic Program</label>
                    <select
                      className="ssis-select"
                      value={signUpProgram}
                      onChange={(e) => setSignUpProgram(e.target.value)}
                    >
                      <option value="BS Computer Science">BS Computer Science</option>
                      <option value="BS Information Technology">BS Information Technology</option>
                    </select>
                  </div>

                  <div className="ssis-form-group">
                    <label className="ssis-label">Year Level</label>
                    <select
                      className="ssis-select"
                      value={signUpYearLevel}
                      onChange={(e) => setSignUpYearLevel(e.target.value)}
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="ssis-form-group">
                  <label className="ssis-label">Password</label>
                  <input
                    type="password"
                    className="ssis-input"
                    placeholder="Create password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="ssis-form-group">
                  <label className="ssis-label">Confirm Password</label>
                  <input
                    type="password"
                    className="ssis-input"
                    placeholder="Repeat password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    required
                  />
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
                }}
              >
                <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
                <UserPlus size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
