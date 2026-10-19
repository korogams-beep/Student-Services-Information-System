import React from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ showLabel = true, size = 'normal', style = {} }) => {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      id="theme-toggle-btn"
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: size === 'compact' ? '6px 10px' : '8px 14px',
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : '#F1F5F9',
        border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
        borderRadius: '9999px',
        color: isDark ? '#F1B82D' : '#0F172A',
        fontSize: size === 'compact' ? '12px' : '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
        backdropFilter: 'blur(8px)',
        userSelect: 'none',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.borderColor = isDark ? '#F1B82D' : '#94A3B8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = isDark ? '#334155' : '#CBD5E1';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size === 'compact' ? '18px' : '20px',
          height: size === 'compact' ? '18px' : '20px',
          borderRadius: '50%',
          backgroundColor: isDark ? '#0F172A' : '#FEF3C7',
          color: isDark ? '#F1B82D' : '#D97706',
          transition: 'transform 0.3s ease',
        }}
      >
        {isDark ? <Moon size={size === 'compact' ? 12 : 14} /> : <Sun size={size === 'compact' ? 12 : 14} />}
      </div>
      {showLabel && (
        <span style={{ letterSpacing: '0.2px' }}>
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
};
