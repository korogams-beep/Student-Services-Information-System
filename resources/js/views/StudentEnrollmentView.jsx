import React from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, CheckSquare, Send } from 'lucide-react';

export const StudentEnrollmentView = () => {
  const { 
    currentUser,
    scheduleCourses, 
    setScheduleCourses, 
    enrollmentStatus, 
    submitEnrollmentRequest,
    showToast
  } = useApp();

  const toggleCourse = (id) => {
    setScheduleCourses(prev =>
      prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c)
    );
  };

  const selectedCourses = scheduleCourses.filter(c => c.selected);
  const selectedCount = selectedCourses.length;
  const totalUnits = selectedCourses.reduce((sum, c) => sum + (Number(c.units) || 0), 0);

  const handleSubmit = () => {
    if (selectedCount === 0) {
      alert('Please select at least one course section to enroll.');
      return;
    }

    submitEnrollmentRequest(selectedCourses);
  };

  return (
    <div className="ssis-canvas">
      <div className="ssis-page-tag">CUYOTECH UNIVERSITY • ENROLLMENT</div>
      <h1 className="ssis-page-heading">Build your class schedule</h1>
      <p className="ssis-page-desc">
        Select available sections for <strong>{currentUser?.name}</strong>. Schedule conflicts and unit limits are checked automatically.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        {/* Left Table */}
        <div className="ssis-table-container">
          <table className="ssis-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>✓</th>
                <th>Code</th>
                <th>Subject title</th>
                <th>Units</th>
                <th>Schedule</th>
                <th>Slots</th>
              </tr>
            </thead>
            <tbody>
              {scheduleCourses.map(course => (
                <tr key={course.id} style={{ cursor: 'pointer' }} onClick={() => toggleCourse(course.id)}>
                  <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={!!course.selected}
                      onChange={() => toggleCourse(course.id)}
                      style={{ width: '16px', height: '16px', accentColor: '#1E293B', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ fontWeight: '600', color: '#0F172A', fontFamily: 'monospace' }}>
                    {course.code}
                  </td>
                  <td style={{ fontWeight: '500' }}>{course.title}</td>
                  <td>{course.units}.0</td>
                  <td style={{ color: '#475569', fontSize: '13px' }}>{course.schedule}</td>
                  <td>
                    <span className="badge badge-success">{course.slots} slots</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Sticky Card */}
        <div className="ssis-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 className="ssis-card-title">Schedule Summary</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
              Academic load limit: 24.0 units max.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#475569' }}>Selected subjects:</span>
              <strong style={{ color: '#0F172A' }}>{selectedCount}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#475569' }}>Total units:</span>
              <strong style={{ color: '#0F172A' }}>{totalUnits}.0</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#475569' }}>Status:</span>
              <span className={`badge ${enrollmentStatus === 'Approved' ? 'badge-success' : 'badge-pending'}`}>
                {enrollmentStatus}
              </span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="ssis-btn-primary"
            style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Send size={16} />
            <span>Submit Enrollment Request</span>
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        CuyoTech University — Office of the Registrar
      </div>
    </div>
  );
};
