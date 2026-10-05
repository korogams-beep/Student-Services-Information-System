import React from 'react';
import { useApp } from '../context/AppContext';

export const RegistrarApprovalsView = () => {
  const { 
    registrarQueue, 
    setRegistrarQueue, 
    selectedQueueStudentId, 
    setSelectedQueueStudentId,
    approveEnrollmentRequest,
    rejectEnrollmentRequest,
    setCurrentView,
    showToast
  } = useApp();

  const selectedStudent = registrarQueue.find(s => s.id === selectedQueueStudentId) || registrarQueue[0];

  const handleToggleCheck = (field) => {
    if (!selectedStudent) return;
    setRegistrarQueue(prev =>
      prev.map(item =>
        item.id === selectedStudent.id
          ? {
              ...item,
              validation: {
                ...item.validation,
                [field]: !item.validation?.[field],
              },
            }
          : item
      )
    );
  };

  const handleApprove = () => {
    if (!selectedStudent) return;
    approveEnrollmentRequest(selectedStudent.id);
  };

  const handleReject = () => {
    if (!selectedStudent) return;
    rejectEnrollmentRequest(selectedStudent.id);
  };

  const handleGenerateCOR = () => {
    if (!selectedStudent) return;
    showToast(`Opening Certificate of Registration for ${selectedStudent.studentName}...`);
    setCurrentView('cor_preview');
  };

  return (
    <div className="ssis-canvas">
      <div className="ssis-page-tag">DFD 2.0 • REGISTRAR WORKSPACE</div>
      <h1 className="ssis-page-heading">Enrollment request queue</h1>
      <p className="ssis-page-desc">
        Validate records, review requested subjects, and issue the official COR.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>
        {/* Left Queue Table */}
        <div className="ssis-table-container">
          {registrarQueue.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748B' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>
                No Enrollment Requests in Queue
              </h4>
              <p style={{ fontSize: '13.5px', maxWidth: '400px', margin: '0 auto' }}>
                When students select subjects and submit an enrollment request from their portal, their application will appear here for verification and approval.
              </p>
            </div>
          ) : (
            <table className="ssis-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Requested subjects</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registrarQueue.map(item => {
                  const isSelected = item.id === selectedStudent?.id;
                  const subjectsList = item.courses ? item.courses.map(c => c.code).join(', ') : (item.requestedSubjects || 'Selected Subjects');
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedQueueStudentId(item.id)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#FAF5F5' : 'transparent',
                      }}
                    >
                      <td>
                        <strong style={{ color: '#0F172A' }}>{item.studentName}</strong>
                        <div style={{ fontSize: '11.5px', color: '#64748B', fontFamily: 'monospace' }}>
                          {item.studentIdNumber || item.studentId} • {item.program || 'Student'}
                        </div>
                      </td>
                      <td style={{ color: '#475569' }}>
                        <div style={{ fontWeight: '600' }}>{subjectsList}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{item.totalUnits || 0} Units total</div>
                      </td>
                      <td>
                        {item.status === 'Approved' ? (
                          <span className="badge badge-success">Approved</span>
                        ) : item.status === 'Rejected' ? (
                          <span className="badge badge-danger">Rejected</span>
                        ) : item.status === 'For Review' ? (
                          <span className="badge badge-review">For Review</span>
                        ) : (
                          <span className="badge badge-pending">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right Validation Card */}
        <div className="ssis-card" style={{ padding: '32px 28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '22px' }}>
            Validate student records
          </h3>

          {selectedStudent ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!selectedStudent.validation?.profileComplete}
                    onChange={() => handleToggleCheck('profileComplete')}
                    style={{ width: '16px', height: '16px', accentColor: '#1E293B' }}
                  />
                  <span>Student profile complete</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!selectedStudent.validation?.prerequisites}
                    onChange={() => handleToggleCheck('prerequisites')}
                    style={{ width: '16px', height: '16px', accentColor: '#1E293B' }}
                  />
                  <span>Prerequisites satisfied</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!selectedStudent.validation?.noConflicts}
                    onChange={() => handleToggleCheck('noConflicts')}
                    style={{ width: '16px', height: '16px', accentColor: '#1E293B' }}
                  />
                  <span>No schedule conflicts</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!selectedStudent.validation?.financeCleared}
                    onChange={() => handleToggleCheck('financeCleared')}
                    style={{ width: '16px', height: '16px', accentColor: '#1E293B' }}
                  />
                  <span>Finance hold cleared</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <button onClick={handleReject} className="ssis-btn-danger-soft">
                  Reject
                </button>
                <button onClick={handleApprove} className="ssis-btn-lavender">
                  Approve
                </button>
              </div>

              <button
                onClick={handleGenerateCOR}
                className="ssis-btn-primary"
                style={{ width: '100%', padding: '13px' }}
              >
                Generate COR
              </button>
            </>
          ) : (
            <p style={{ color: '#94A3B8', fontSize: '13px' }}>
              Select an enrollment request from the queue to review and approve.
            </p>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        Enrollment Approvals — DFD 2.0
      </div>
    </div>
  );
};
