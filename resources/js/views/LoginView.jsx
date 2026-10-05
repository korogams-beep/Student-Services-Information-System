import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const LoginView = () => {
  const { handleLogin } = useApp();
  const [emailOrId, setEmailOrId] = useState('maria.santos@university.edu');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('Student');

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin(role);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#F8F9FA' }}>
      {/* Left Dark Column matching Canva Wireframe Page 1 */}
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
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#94A3B8', marginBottom: '80px', letterSpacing: '0.5px' }}>
            Log In
          </div>

          <h1
            style={{
              fontSize: '56px',
              fontWeight: '900',
              color: '#F1B82D',
              letterSpacing: '-1.5px',
              lineHeight: 1,
              marginBottom: '28px',
            }}
          >
            SSIS
          </h1>

          <h2
            style={{
              fontSize: '28px',
              fontWeight: '700',
              lineHeight: 1.35,
              color: '#FFFFFF',
              marginBottom: '24px',
            }}
          >
            One connected university portal.<br />
            Every student service, in one place.
          </h2>

          <p
            style={{
              fontSize: '15px',
              lineHeight: 1.6,
              color: '#94A3B8',
            }}
          >
            Secure access for students, registrars, cashiers, department staff, and administrators.
          </p>
        </div>
      </div>

      {/* Right Form Card matching Canva Wireframe */}
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
            maxWidth: '440px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '48px 40px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E2E8F0',
          }}
        >
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '32px' }}>
            Sign in to continue to SSIS
          </p>

          <form onSubmit={onSubmit}>
            <div className="ssis-form-group">
              <label className="ssis-label">Email or Student ID</label>
              <input
                type="text"
                className="ssis-input"
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
                placeholder="maria.santos@university.edu"
                required
              />
            </div>

            <div className="ssis-form-group">
              <label className="ssis-label">Password</label>
              <input
                type="password"
                className="ssis-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
              />
            </div>

            <div className="ssis-form-group">
              <label className="ssis-label">Role</label>
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
              className="ssis-btn-primary"
              style={{ width: '100%', marginTop: '12px', padding: '14px', fontSize: '15px' }}
            >
              Log In
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <a href="#" style={{ fontSize: '13.5px', color: '#64748B', textDecoration: 'none' }}>
                Forgot password?
              </a>
            </div>
          </form>
        </div>

        {/* Footer label matching Page 1 */}
        <div style={{ position: 'absolute', bottom: '24px', right: '36px', fontSize: '12px', color: '#94A3B8' }}>
          Log In — DFD 1.0
        </div>
      </div>
    </div>
  );
};
