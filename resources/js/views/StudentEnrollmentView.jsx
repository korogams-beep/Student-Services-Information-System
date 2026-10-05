import React from 'react';
import { useApp } from '../context/AppContext';

export const StudentEnrollmentView = () => {
  const { 
    scheduleCourses, 
    setScheduleCourses, 
    enrollmentStatus, 
    setEnrollmentStatus,
    showToast,
    recordAuditLog
  } = useApp();

  const toggleCourse = (id) => {
    setScheduleCourses(prev =>
      prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c)
    );
  };

  const selectedCourses = scheduleCourses.filter(c => c.selected);
  const selectedCount = selectedCourses.length;
  const totalUnits = selectedCourses.reduce((sum, c) => sum + c.units, 0);

  const handleSubmit = () => {
    setEnrollmentStatus('Pending');
    showToast(`Enrollment request for ${selectedCount} subjects (${totalUnits} units) submitted to Registrar.`);
    recordAuditLog('Enrollment requested', `Maria Santos • ${selectedCount} subjects (${totalUnits} units)`);

    fetch('/api/enrollment/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: 1,
        section_ids: selectedCourses.map(c => c.id),
      }),
    }).catch(err => console.log('Client-side synced', err));
  };

  return (
    <div className="ssis-canvas">
      <div className="ssis-page-tag">DFD 2.0 • ENROLLMENT</div>
      <h1 className="ssis-page-heading">Build your class schedule</h1>
      <p className="ssis-page-desc">
        Select available sections. Schedule conflicts and unit limits are checked automatically.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        {/* Left Table matching Page 3 */}
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
                      checked={course.selected}
                      onChange={() => toggleCourse(course.id)}
                      style={{ width: '16px', height: '16px', accentColor: '#1E293B', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ fontWeight: '600' }}>{course.code}</td>
                  <td>{course.title}</td>
                  <td>{course.units}</td>
                  <td style={{ color: '#475569' }}>{course.schedule}</td>
                  <td style={{ fontWeight: '500' }}>{course.slots}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Summary Card matching Page 3 */}
        <div className="ssis-card" style={{ padding: '32px 28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '20px' }}>
            Selection summary
          </h3>

          <div style={{ fontSize: '14.5px', color: '#64748B', marginBottom: '10px' }}>
            {selectedCount} subjects
          </div>

          <div style={{ fontSize: '42px', fontWeight: '800', color: '#BE123C', letterSpacing: '-0.5px', lineHeight: 1, marginBottom: '24px' }}>
            {totalUnits} units
          </div>

          <div style={{ fontSize: '14px', color: '#475569', marginBottom: '32px' }}>
            Status: <strong style={{ color: '#0F172A' }}>{enrollmentStatus}</strong>
          </div>

          <button
            onClick={handleSubmit}
            className="ssis-btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '14.5px' }}
          >
            Submit Enrollment Request
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        Select Subjects and Submit Enrollment Request — DFD 2.0
      </div>
    </div>
  );
};
