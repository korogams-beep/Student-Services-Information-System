import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  CheckSquare, 
  Layers, 
  Clock, 
  Printer, 
  Download, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle 
} from 'lucide-react';
import { printIsolatedElement, downloadPdfFromElement } from '../utils/pdfExport';

export const DepartmentClearanceView = () => {
  const { 
    currentView,
    setCurrentView,
    departmentStaffClearanceQueue, 
    setDepartmentStaffClearanceQueue,
    completedClearanceList,
    setCompletedClearanceList,
    departmentRulesList,
    setDepartmentRulesList,
    showToast,
    recordAuditLog,
    setClearanceList,
    searchQuery
  } = useApp();

  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Tab switching helper
  const activeTab = ['clearance_requests', 'completed_clearance', 'department_rules', 'dept_reports'].includes(currentView)
    ? currentView
    : 'clearance_requests';

  const handleApprove = (item) => {
    setDepartmentStaffClearanceQueue(prev =>
      prev.filter(row => row.id !== item.id)
    );

    // Add to completed list with unique id
    const completedEntry = {
      id: `completed-${item.id}-${Date.now()}`,
      studentName: item.studentName,
      studentId: item.studentId,
      department: item.department,
      remarks: item.remarks || 'Cleared by Department Staff',
      status: 'Cleared',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setCompletedClearanceList(prev => [completedEntry, ...prev]);

    // Update global clearance status for student — EXACT department name match only
    setClearanceList(prev =>
      prev.map(c => c.department === item.department ? {
        ...c,
        status: 'Cleared',
        remarks: 'Cleared by Department Staff (D. Flores)',
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      } : c)
    );

    showToast(`Clearance approved for ${item.studentName} (${item.department}).`);
    recordAuditLog('Clearance approved', `D. Flores • ${item.studentName} (${item.department})`);

    fetch(`/api/clearance/${item.id}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Cleared', remarks: 'Approved by Dept Staff' }),
    }).catch(err => console.log('Client-side synced', err));
  };

  const handleDecline = (item) => {
    const reason = prompt('Please enter decline remarks / deficiency:', item.remarks || 'Outstanding laboratory equipment');
    if (reason === null) return;

    setDepartmentStaffClearanceQueue(prev =>
      prev.filter(row => row.id !== item.id)
    );

    const completedEntry = {
      id: `completed-${item.id}-${Date.now()}`,
      studentName: item.studentName,
      studentId: item.studentId,
      department: item.department,
      remarks: reason,
      status: 'Deficient',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setCompletedClearanceList(prev => [completedEntry, ...prev]);

    showToast(`Clearance marked deficient for ${item.studentName}.`);
    recordAuditLog('Clearance declined', `D. Flores • ${item.studentName} - ${reason}`);

    fetch(`/api/clearance/${item.id}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Deficient', remarks: reason }),
    }).catch(err => console.log('Client-side synced', err));
  };

  const handleToggleRule = (ruleId) => {
    setDepartmentRulesList(prev =>
      prev.map(r => r.id === ruleId ? { ...r, active: !r.active } : r)
    );
    showToast('Department clearance policy rule updated.');
  };

  const handleAddRuleSubmit = (e) => {
    e.preventDefault();
    if (!newRuleTitle.trim()) return;

    const newRule = {
      id: Date.now(),
      title: newRuleTitle.trim(),
      description: newRuleDesc.trim() || 'Required clearance prerequisite.',
      active: true,
    };

    setDepartmentRulesList(prev => [...prev, newRule]);
    setNewRuleTitle('');
    setNewRuleDesc('');
    setIsAddRuleOpen(false);
    showToast('New clearance requirement rule added!');
  };

  const handlePrintReport = () => {
    printIsolatedElement('ssis-dept-clearance-report', 'Department Clearance Compliance Report');
    showToast('Sending Clearance Report to printer...');
  };

  const handleDownloadReport = async () => {
    setIsExporting(true);
    showToast('Generating clearance compliance report PDF...');
    const success = await downloadPdfFromElement('ssis-dept-clearance-report', 'Clearance_Compliance_Report_Feb2026.pdf', 'a4');
    setIsExporting(false);
    if (success) {
      showToast('Clearance report downloaded as PDF.');
    }
  };

  // Filter queues
  const filteredPending = departmentStaffClearanceQueue.filter(item =>
    !searchQuery ||
    item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.remarks?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompleted = completedClearanceList.filter(item =>
    !searchQuery ||
    item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.remarks?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = departmentStaffClearanceQueue.length;
  const clearedCount = completedClearanceList.filter(c => c.status === 'Cleared').length;
  const deficientCount = completedClearanceList.filter(c => c.status === 'Deficient').length;

  return (
    <div className="ssis-canvas">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div className="ssis-page-tag">DFD 6.0 • DEPARTMENT WORKSPACE</div>
          <h1 className="ssis-page-heading">
            {activeTab === 'clearance_requests' && 'Review Clearance Requests'}
            {activeTab === 'completed_clearance' && 'Completed Clearances Archive'}
            {activeTab === 'department_rules' && 'Department Clearance Guidelines'}
            {activeTab === 'dept_reports' && 'Clearance Compliance & Audit Reports'}
          </h1>
          <p className="ssis-page-desc">
            Computer Laboratory Department • {pendingCount} requests awaiting action.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="ssis-tabs-bar" style={{ marginBottom: 0 }}>
          <button
            onClick={() => setCurrentView('clearance_requests')}
            className={`ssis-tab-btn ${activeTab === 'clearance_requests' ? 'active' : ''}`}
          >
            <ShieldCheck size={16} />
            <span>Pending Requests ({pendingCount})</span>
          </button>
          <button
            onClick={() => setCurrentView('completed_clearance')}
            className={`ssis-tab-btn ${activeTab === 'completed_clearance' ? 'active' : ''}`}
          >
            <CheckSquare size={16} />
            <span>Completed ({completedClearanceList.length})</span>
          </button>
          <button
            onClick={() => setCurrentView('department_rules')}
            className={`ssis-tab-btn ${activeTab === 'department_rules' ? 'active' : ''}`}
          >
            <Layers size={16} />
            <span>Department Rules</span>
          </button>
          <button
            onClick={() => setCurrentView('dept_reports')}
            className={`ssis-tab-btn ${activeTab === 'dept_reports' ? 'active' : ''}`}
          >
            <Clock size={16} />
            <span>Reports</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Pending Clearance Requests */}
      {activeTab === 'clearance_requests' && (
        <div className="ssis-table-container">
          <table className="ssis-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Department / Unit</th>
                <th>Current Status / Reason</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPending.map(item => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#0F172A' }}>{item.studentName}</strong> • {item.studentId}
                  </td>
                  <td style={{ color: '#475569' }}>{item.department}</td>
                  <td style={{ color: '#334155' }}>{item.remarks}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleApprove(item)}
                        style={{
                          background: '#DCFCE7',
                          color: '#166534',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          fontSize: '12.5px',
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(item)}
                        style={{
                          background: '#FEE2E2',
                          color: '#991B1B',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          fontSize: '12.5px',
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPending.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <CheckCircle2 size={36} color="#16A34A" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontWeight: '600', color: '#0F172A' }}>All clearance requests have been reviewed!</div>
                    <div style={{ fontSize: '13px' }}>Check the Completed tab to review archived clearances.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: Completed Clearances */}
      {activeTab === 'completed_clearance' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div className="ssis-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Total Processed</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>
                {completedClearanceList.length} Students
              </div>
            </div>
            <div className="ssis-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Cleared</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#166534', marginTop: '4px' }}>
                {clearedCount} Approved
              </div>
            </div>
            <div className="ssis-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Deficient</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#991B1B', marginTop: '4px' }}>
                {deficientCount} Pending Settlement
              </div>
            </div>
          </div>

          <div className="ssis-table-container">
            <table className="ssis-table">
              <thead>
                <tr>
                  <th>Student Account</th>
                  <th>Department</th>
                  <th>Decision Remarks</th>
                  <th>Date Processed</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompleted.map(item => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ color: '#0F172A' }}>{item.studentName}</strong> • {item.studentId}
                    </td>
                    <td style={{ color: '#475569' }}>{item.department}</td>
                    <td style={{ color: '#334155' }}>{item.remarks}</td>
                    <td style={{ color: '#64748B', fontSize: '13px' }}>{item.date}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`badge ${item.status === 'Cleared' ? 'badge-success' : 'badge-danger'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Department Rules */}
      {activeTab === 'department_rules' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: '#64748B' }}>
              Configure mandatory clearance guidelines for students enrolled in computing laboratories.
            </p>
            <button
              onClick={() => setIsAddRuleOpen(!isAddRuleOpen)}
              className="ssis-btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <Plus size={15} />
              <span>Add Guideline</span>
            </button>
          </div>

          {isAddRuleOpen && (
            <div className="ssis-card" style={{ marginBottom: '24px', backgroundColor: '#FAF5F5', border: '1px solid #F1B82D' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>New Clearance Policy Requirement</h3>
              <form onSubmit={handleAddRuleSubmit}>
                <div className="ssis-form-group">
                  <label className="ssis-label">Rule Title</label>
                  <input
                    type="text"
                    className="ssis-input"
                    value={newRuleTitle}
                    onChange={(e) => setNewRuleTitle(e.target.value)}
                    placeholder="e.g. Clean Machine Audit"
                    required
                  />
                </div>
                <div className="ssis-form-group">
                  <label className="ssis-label">Requirement Details</label>
                  <textarea
                    className="ssis-input"
                    rows="2"
                    value={newRuleDesc}
                    onChange={(e) => setNewRuleDesc(e.target.value)}
                    placeholder="Instructions for students and lab technicians..."
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setIsAddRuleOpen(false)} className="ssis-btn-secondary" style={{ padding: '6px 14px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="ssis-btn-primary" style={{ padding: '6px 16px' }}>
                    Save Policy
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {departmentRulesList.map(rule => (
              <div
                key={rule.id}
                className="ssis-card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 24px',
                  borderLeft: rule.active ? '4px solid #16A34A' : '4px solid #CBD5E1',
                }}
              >
                <div style={{ flex: 1, paddingRight: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: rule.active ? '#0F172A' : '#64748B' }}>
                      {rule.title}
                    </h4>
                    <span className={`badge ${rule.active ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '11px' }}>
                      {rule.active ? 'Active Policy' : 'Inactive'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '6px' }}>
                    {rule.description}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className={rule.active ? 'ssis-btn-danger-soft' : 'ssis-btn-lavender'}
                  style={{ padding: '8px 16px', fontSize: '12.5px', whiteSpace: 'nowrap' }}
                >
                  {rule.active ? 'Deactivate' : 'Activate Rule'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: Clearance Reports */}
      {activeTab === 'dept_reports' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '20px' }}>
            <button onClick={handlePrintReport} className="ssis-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              <Printer size={15} />
              <span>Print Report</span>
            </button>
            <button onClick={handleDownloadReport} disabled={isExporting} className="ssis-btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
              <Download size={15} />
              <span>{isExporting ? 'Exporting...' : 'Download PDF'}</span>
            </button>
          </div>

          <div
            id="ssis-dept-clearance-report"
            className="printable-document ssis-card"
            style={{
              maxWidth: '840px',
              margin: '0 auto',
              padding: '40px 48px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '12px',
            }}
          >
            {/* Report Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0F172A', paddingBottom: '20px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <img src="/images/pnc-logo.png" alt="PNC Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '0.5px', color: '#0F172A', margin: 0 }}>
                    CUYOTECH UNIVERSITY
                  </h2>
                  <p style={{ fontSize: '11px', color: '#475569', margin: '2px 0 0' }}>CuyoTech University • Office of the Department Head</p>
                </div>
              </div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '4px' }}>
                COLLEGE OF COMPUTING STUDIES & COMPUTER LABORATORY
              </p>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#1E40AF', marginTop: '12px' }}>
                SEMESTER CLEARANCE COMPLIANCE & AUDIT REPORT
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '4px' }}>
                Second Semester AY 2025–2026 • Issued: February 16, 2026
              </div>
            </div>

            {/* Statistics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Total Applicants</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', marginTop: '4px' }}>
                  {completedClearanceList.length + departmentStaffClearanceQueue.length}
                </div>
              </div>
              <div style={{ backgroundColor: '#DCFCE7', padding: '16px', borderRadius: '8px', border: '1px solid #86EFAC', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>Cleared Students</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#166534', marginTop: '4px' }}>
                  {clearedCount}
                </div>
              </div>
              <div style={{ backgroundColor: '#FEE2E2', padding: '16px', borderRadius: '8px', border: '1px solid #FCA5A5', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#991B1B', fontWeight: '700', textTransform: 'uppercase' }}>Deficient Accounts</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#991B1B', marginTop: '4px' }}>
                  {deficientCount}
                </div>
              </div>
            </div>

            {/* Records Table */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', textTransform: 'uppercase', marginBottom: '12px' }}>
                Department Clearance Audit Roster
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #CBD5E1', backgroundColor: '#F8FAFC' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Student Name</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Student ID</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Remarks / Deficiencies</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedClearanceList.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '600' }}>{item.studentName}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{item.studentId}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{item.remarks}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <span className={`badge ${item.status === 'Cleared' ? 'badge-success' : 'badge-danger'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginTop: '40px', borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderTop: '1px solid #64748B', width: '220px', margin: '40px auto 0', paddingTop: '4px' }}>
                  <strong style={{ fontSize: '12.5px', color: '#0F172A', display: 'block' }}>DINA FLORES</strong>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Department Clearance Officer</span>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderTop: '1px solid #64748B', width: '220px', margin: '40px auto 0', paddingTop: '4px' }}>
                  <strong style={{ fontSize: '12.5px', color: '#0F172A', display: 'block' }}>DR. MARCELO REYES</strong>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Dean, College of Computing Studies</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        Department Clearance Management — DFD 6.0
      </div>
    </div>
  );
};
