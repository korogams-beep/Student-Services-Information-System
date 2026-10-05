import React from 'react';
import { useApp } from '../context/AppContext';

export const StudentDashboardView = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="ssis-canvas">
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <div className="ssis-page-tag">SECOND SEMESTER • AY 2025–2026</div>
          <h1 className="ssis-page-heading">Good morning, Maria Santos</h1>
          <p className="ssis-page-desc" style={{ marginBottom: 0 }}>
            Here’s a clear view of your enrollment, deadlines, and campus updates.
          </p>
        </div>

        {/* Status Pill matching Page 2 */}
        <div className="ssis-highlight-pill">
          ENROLLED • 21 UNITS
        </div>
      </div>

      {/* Quick Action Navigation Buttons Row */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '36px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setCurrentView('enrollment')}
          className="ssis-btn-primary"
          style={{ minWidth: '130px', padding: '12px 28px' }}
        >
          Enroll
        </button>
        <button
          onClick={() => setCurrentView('grades')}
          className="ssis-btn-secondary"
          style={{ minWidth: '130px' }}
        >
          View Grades
        </button>
        <button
          onClick={() => setCurrentView('documents')}
          className="ssis-btn-secondary"
          style={{ minWidth: '150px' }}
        >
          Request Document
        </button>
        <button
          onClick={() => setCurrentView('payments')}
          className="ssis-btn-secondary"
          style={{ minWidth: '130px' }}
        >
          Payments
        </button>
        <button
          onClick={() => setCurrentView('clearance')}
          className="ssis-btn-secondary"
          style={{ minWidth: '130px' }}
        >
          Clearance
        </button>
      </div>

      {/* Two Grid Cards matching Canva Spec */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
        {/* Left Card: Announcements */}
        <div className="ssis-card">
          <h3 className="ssis-card-title">Announcements</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ fontSize: '14.5px', color: '#1E293B', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
              Enrollment adjustment period now open
            </div>
            <div style={{ fontSize: '14.5px', color: '#1E293B', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
              Campus network maintenance on February 21
            </div>
            <div style={{ fontSize: '14.5px', color: '#1E293B' }}>
              Scholarship renewal forms due March 5
            </div>
          </div>
        </div>

        {/* Right Card: Upcoming Deadlines */}
        <div className="ssis-card">
          <h3 className="ssis-card-title">Upcoming deadlines</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ fontSize: '14.5px', color: '#1E293B', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
              <strong style={{ color: '#0F172A', marginRight: '6px' }}>FEB 18 •</strong> Enrollment confirmation
            </div>
            <div style={{ fontSize: '14.5px', color: '#1E293B', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
              <strong style={{ color: '#0F172A', marginRight: '6px' }}>MAR 05 •</strong> Scholarship renewal
            </div>
            <div style={{ fontSize: '14.5px', color: '#1E293B', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
              <strong style={{ color: '#0F172A', marginRight: '6px' }}>MAR 16 •</strong> Midterm payment
            </div>
            <div style={{ fontSize: '14.5px', color: '#1E293B' }}>
              <strong style={{ color: '#0F172A', marginRight: '6px' }}>APR 10 •</strong> Document request cutoff
            </div>
          </div>
        </div>
      </div>

      {/* Footer DFD Label */}
      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        Student Dashboard
      </div>
    </div>
  );
};
