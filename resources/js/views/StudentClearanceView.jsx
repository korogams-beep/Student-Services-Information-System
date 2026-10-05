import React from 'react';
import { useApp } from '../context/AppContext';

export const StudentClearanceView = () => {
  const { clearanceList, clearedCount, showToast, recordAuditLog } = useApp();

  const handleSubmitClearance = () => {
    showToast('Clearance renewal request submitted to all awaiting departments.');
    recordAuditLog('Clearance requested', 'Maria Santos • Term End Clearance');

    fetch('/api/clearance/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: 1 }),
    }).catch(err => console.log('Client-side synced', err));
  };

  return (
    <div className="ssis-canvas">
      <div className="ssis-page-tag">DFD 6.0 • STUDENT CLEARANCE</div>
      <h1 className="ssis-page-heading">Clearance progress</h1>
      <p className="ssis-page-desc">
        Complete all department clearances before the end of term.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        {/* Department Status Table matching Page 8 */}
        <div className="ssis-table-container">
          <table className="ssis-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Last updated</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {clearanceList.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: '500' }}>{c.department}</td>
                  <td style={{ color: '#475569' }}>{c.lastUpdated}</td>
                  <td>
                    {c.status === 'Cleared' ? (
                      <span className="badge badge-success">Cleared</span>
                    ) : (
                      <span className="badge badge-pending">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Summary Card matching Page 8 */}
        <div>
          <div className="ssis-highlight-card" style={{ padding: '36px 20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px' }}>
              {clearedCount} OF {clearanceList.length}
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '6px' }}>
              DEPARTMENTS CLEARED
            </div>
          </div>

          <button
            onClick={handleSubmitClearance}
            className="ssis-btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '14px' }}
          >
            Submit Clearance Request
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        Clearance — DFD 6.0
      </div>
    </div>
  );
};
