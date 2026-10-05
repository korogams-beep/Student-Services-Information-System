import React from 'react';
import { useApp } from '../context/AppContext';

export const DepartmentClearanceView = () => {
  const { 
    departmentStaffClearanceQueue, 
    setDepartmentStaffClearanceQueue,
    showToast,
    recordAuditLog,
    setClearanceList
  } = useApp();

  const handleApprove = (item) => {
    setDepartmentStaffClearanceQueue(prev =>
      prev.map(row => row.id === item.id ? { ...row, status: 'Cleared' } : row)
    );

    // If student is Maria or in general, update clearance progress
    setClearanceList(prev =>
      prev.map(c => c.department === 'Computer Laboratory' ? { ...c, status: 'Cleared', remarks: 'Cleared by Dept Staff' } : c)
    );

    showToast(`Clearance approved for ${item.studentName}.`);
    recordAuditLog('Clearance approved', `D. Flores • ${item.studentName} (${item.department})`);

    fetch(`/api/clearance/${item.id}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Cleared', remarks: 'Approved by Dept Staff' }),
    }).catch(err => console.log('Client-side synced', err));
  };

  const handleDecline = (item) => {
    const reason = prompt('Please enter decline remarks / deficiency:', item.remarks || 'Outstanding liability');
    if (reason === null) return;

    setDepartmentStaffClearanceQueue(prev =>
      prev.map(row => row.id === item.id ? { ...row, status: 'Deficient', remarks: reason } : row)
    );

    showToast(`Clearance declined for ${item.studentName}.`);
    recordAuditLog('Clearance declined', `D. Flores • ${item.studentName} - ${reason}`);

    fetch(`/api/clearance/${item.id}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Deficient', remarks: reason }),
    }).catch(err => console.log('Client-side synced', err));
  };

  const pendingCount = departmentStaffClearanceQueue.filter(r => r.status === 'Pending').length;

  return (
    <div className="ssis-canvas">
      <div className="ssis-page-tag">DFD 6.0 • DEPARTMENT WORKSPACE</div>
      <h1 className="ssis-page-heading">Review clearance requests</h1>
      <p className="ssis-page-desc">
        Computer Laboratory • {pendingCount} requests awaiting action.
      </p>

      {/* Clearance Requests Table matching Page 12 */}
      <div className="ssis-table-container">
        <table className="ssis-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Department / reason</th>
              <th>Remarks</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {departmentStaffClearanceQueue.map(item => (
              <tr key={item.id}>
                <td>
                  <strong style={{ color: '#0F172A' }}>{item.studentName}</strong> • {item.studentId}
                </td>
                <td style={{ color: '#475569' }}>{item.department}</td>
                <td style={{ color: '#334155' }}>{item.remarks}</td>
                <td style={{ textAlign: 'right' }}>
                  {item.status === 'Cleared' ? (
                    <span className="badge badge-success">Cleared</span>
                  ) : item.status === 'Deficient' ? (
                    <span className="badge badge-danger">Deficient</span>
                  ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleApprove(item)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#4338CA',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '13.5px',
                        }}
                      >
                        Approve
                      </button>
                      <span style={{ color: '#CBD5E1' }}>/</span>
                      <button
                        onClick={() => handleDecline(item)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#DC2626',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '13.5px',
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        Clearance Requests — DFD 6.0
      </div>
    </div>
  );
};
