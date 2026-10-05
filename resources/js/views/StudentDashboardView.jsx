import React from 'react';
import { useApp } from '../context/AppContext';

export const StudentDashboardView = () => {
  const { currentUser, setCurrentView, gradeReports, studentGradesMap } = useApp();

  const activeStudentId = currentUser?.student_id_number || currentUser?.studentId || '2026-0001';
  const myGrades = studentGradesMap[activeStudentId] || gradeReports || [];
  const enrolledUnits = myGrades.reduce((sum, g) => sum + (Number(g.units) || 0), 0);

  return (
    <div className="ssis-canvas">
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="ssis-page-tag">CUYOTECH UNIVERSITY • SECOND SEMESTER • AY 2025–2026</div>
          <h1 className="ssis-page-heading">Good morning, {currentUser?.name || 'Student'}</h1>
          <p className="ssis-page-desc" style={{ marginBottom: 0 }}>
            Here’s a clear view of your enrollment, academic records, and university deadlines.
          </p>
        </div>

        {/* Dynamic Status Pill */}
        <div className="ssis-highlight-pill" style={{ textTransform: 'uppercase' }}>
          {enrolledUnits > 0 ? `ENROLLED • ${enrolledUnits} UNITS` : 'NOT YET ENROLLED • 0 UNITS'}
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

      {/* Two Grid Cards matching CuyoTech Canvas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
        {/* Left Card: Announcements */}
        <div className="ssis-card">
          <h3 className="ssis-card-title">University Announcements</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ fontSize: '14.5px', color: '#1E293B', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
              CuyoTech University Enrollment confirmation period is currently open.
            </div>
            <div style={{ fontSize: '14.5px', color: '#1E293B', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
              Campus laboratory orientation & workstation validation starts next week.
            </div>
            <div style={{ fontSize: '14.5px', color: '#1E293B' }}>
              CuyoTech University Academic Scholarship renewal forms due March 5.
            </div>
          </div>
        </div>

        {/* Right Card: Upcoming Deadlines */}
        <div className="ssis-card">
          <h3 className="ssis-card-title">Academic Calendar Deadlines</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ fontSize: '14.5px', color: '#1E293B', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
              <strong style={{ color: '#0F172A', marginRight: '6px' }}>FEB 18 •</strong> Regular Enrollment confirmation
            </div>
            <div style={{ fontSize: '14.5px', color: '#1E293B', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
              <strong style={{ color: '#0F172A', marginRight: '6px' }}>MAR 05 •</strong> Scholarship validation & renewal
            </div>
            <div style={{ fontSize: '14.5px', color: '#1E293B', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
              <strong style={{ color: '#0F172A', marginRight: '6px' }}>MAR 16 •</strong> Midterm payment & assessment review
            </div>
            <div style={{ fontSize: '14.5px', color: '#1E293B' }}>
              <strong style={{ color: '#0F172A', marginRight: '6px' }}>APR 10 •</strong> Term clearance application deadline
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        CuyoTech University • Student Portal
      </div>
    </div>
  );
};
