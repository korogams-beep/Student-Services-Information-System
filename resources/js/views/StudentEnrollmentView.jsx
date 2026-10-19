import React from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, CheckSquare, Send } from 'lucide-react';

export const StudentEnrollmentView = () => {
  const { 
    currentUser,
    scheduleCourses, 
    studentEnrollmentSelections,
    setStudentEnrollmentSelections,
    registrarQueue,
    enrollmentStatus, 
    submitEnrollmentRequest,
    showToast
  } = useApp();

  const activeStudentId = currentUser?.student_id_number || currentUser?.studentId || currentUser?.account_id || 'STU-2026-0001';
  const myEnrollment = registrarQueue.find(q => q.studentIdNumber === activeStudentId || q.studentId === currentUser?.id);

  // Resolve active student's selected courses
  const currentSelections = studentEnrollmentSelections[activeStudentId] ?? 
    (myEnrollment ? (myEnrollment.courses || []).map(c => c.id) : []);

  const toggleCourse = (id) => {
    setStudentEnrollmentSelections(prev => {
      const existing = prev[activeStudentId] ?? (myEnrollment ? (myEnrollment.courses || []).map(c => c.id) : []);
      const updated = existing.includes(id) ? existing.filter(x => x !== id) : [...existing, id];
      return { ...prev, [activeStudentId]: updated };
    });
  };

  const selectedCourses = scheduleCourses.filter(c => currentSelections.includes(c.id));
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
              {scheduleCourses.map(course => {
                const isSelected = currentSelections.includes(course.id);
                return (
                  <tr 
                    key={course.id} 
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#FAF5F5' : 'transparent',
                      transition: 'background-color 0.15s ease'
                    }} 
                    onClick={() => toggleCourse(course.id)}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCourse(course.id);
                        }}
                        style={{ width: '16px', height: '16px', accentColor: '#1E293B', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-main, #0F172A)', fontFamily: 'monospace' }}>
                      {course.code}
                    </td>
                    <td style={{ fontWeight: '500' }}>{course.title}</td>
                    <td>{course.units}.0</td>
                    <td style={{ color: 'var(--text-muted, #475569)', fontSize: '13px' }}>{course.schedule}</td>
                    <td>
                      <span className="badge badge-success">{course.slots} slots</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Sticky Card */}
        <div className="ssis-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 className="ssis-card-title">Schedule Summary</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted, #64748B)', marginBottom: '16px' }}>
              Academic load limit: 24.0 units max.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--card-border, #F1F5F9)' }}>
              <span style={{ color: 'var(--text-muted, #475569)' }}>Selected subjects:</span>
              <strong style={{ color: 'var(--text-main, #0F172A)' }}>{selectedCount}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--card-border, #F1F5F9)' }}>
              <span style={{ color: 'var(--text-muted, #475569)' }}>Total units:</span>
              <strong style={{ color: 'var(--text-main, #0F172A)' }}>{totalUnits}.0</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--card-border, #F1F5F9)' }}>
              <span style={{ color: 'var(--text-muted, #475569)' }}>Status:</span>
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
