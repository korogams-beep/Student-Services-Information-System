import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, CheckCircle2, Clock, Send, Check } from 'lucide-react';

export const StudentClearanceView = () => {
  const { 
    currentUser, 
    clearanceList, 
    clearedCount, 
    applyForClearanceReview,
    applyForAllClearanceDepartments,
    showToast, 
    recordAuditLog 
  } = useApp();

  const pendingDepartments = clearanceList.filter(c => c.status !== 'Cleared');
  const [selectedDept, setSelectedDept] = useState(pendingDepartments[0]?.department || 'University Library');

  const handleSubmitClearance = (deptToApply = null) => {
    const target = deptToApply || selectedDept;
    if (!target) {
      showToast('All university clearance requirements are already satisfied!');
      return;
    }

    if (target === 'ALL_PENDING') {
      if (pendingDepartments.length === 0) {
        showToast('No pending departments — all clearances are already satisfied!');
        return;
      }
      // Use atomic batch function — avoids forEach stale-closure ID collision
      applyForAllClearanceDepartments(pendingDepartments);
      showToast(`Submitted clearance review requests for ${pendingDepartments.length} departments to Department Staff!`);
    } else {
      applyForClearanceReview(target);
    }
  };

  const isAllCleared = clearanceList.length > 0 && clearedCount === clearanceList.length;

  return (
    <div className="ssis-canvas">
      <div className="ssis-page-tag">CUYOTECH UNIVERSITY • STUDENT CLEARANCE</div>
      <h1 className="ssis-page-heading">Clearance progress</h1>
      <p className="ssis-page-desc">
        Complete all departmental clearances for <strong>{currentUser?.name}</strong> before semester grading release.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        {/* Department Status Table */}
        <div className="ssis-table-container">
          <table className="ssis-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Last updated</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Review Action</th>
              </tr>
            </thead>
            <tbody>
              {clearanceList.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#0F172A' }}>{c.department}</div>
                    {c.remarks && (
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                        {c.remarks}
                      </div>
                    )}
                  </td>
                  <td style={{ color: '#475569', fontSize: '13px' }}>{c.lastUpdated || 'Pending Review'}</td>
                  <td>
                    {c.status === 'Cleared' ? (
                      <span className="badge badge-success">Cleared</span>
                    ) : c.status === 'Deficient' ? (
                      <span className="badge badge-danger">Deficient</span>
                    ) : (
                      <span className="badge badge-pending">Pending</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {c.status === 'Cleared' ? (
                      <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> Cleared
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSubmitClearance(c.department)}
                        className="ssis-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px', minWidth: 'auto' }}
                        title="Submit clearance review application to Department Staff"
                      >
                        Request Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Summary Card */}
        <div>
          <div className="ssis-highlight-card" style={{ padding: '36px 20px', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
              DEPARTMENTS CLEARED
            </div>
            <div style={{ fontSize: '38px', fontWeight: '900', letterSpacing: '-0.5px' }}>
              {clearedCount} OF {clearanceList.length}
            </div>
            <p style={{ fontSize: '12.5px', marginTop: '10px', opacity: 0.9 }}>
              {isAllCleared ? '✓ Fully cleared across all university offices.' : 'Action required from remaining department heads.'}
            </p>
          </div>

          {!isAllCleared && pendingDepartments.length > 0 && (
            <div className="ssis-card" style={{ padding: '20px', marginBottom: '20px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px' }}>
                Select Department to Clear:
              </label>
              <select
                className="ssis-select"
                style={{ width: '100%', marginBottom: '14px', fontSize: '13px' }}
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="ALL_PENDING">All Pending Departments ({pendingDepartments.length})</option>
                {pendingDepartments.map(d => (
                  <option key={d.id} value={d.department}>{d.department}</option>
                ))}
              </select>

              <button
                onClick={() => handleSubmitClearance()}
                className="ssis-btn-primary"
                style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13.5px' }}
              >
                <Send size={15} />
                <span>Apply for Clearance Review</span>
              </button>
            </div>
          )}

          {isAllCleared && (
            <div className="ssis-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid #BBF7D0', backgroundColor: '#F0FDF4' }}>
              <CheckCircle2 size={32} color="#16A34A" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: '700', color: '#166534', fontSize: '15px' }}>Clearance Complete!</div>
              <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px' }}>
                All academic departments and administrative offices have signed off on your clearance.
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        CuyoTech University — Student Affairs & Clearance Services
      </div>
    </div>
  );
};
