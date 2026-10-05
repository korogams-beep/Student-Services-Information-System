import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Settings, 
  Plus, 
  CheckCircle2, 
  Lock, 
  Key, 
  Save, 
  Server,
  Filter
} from 'lucide-react';

export const AdminAccountsAuditView = () => {
  const { 
    currentView,
    setCurrentView,
    adminUsersList, 
    setAdminUsersList, 
    auditLogsList, 
    setIsAddUserModalOpen,
    recordAuditLog,
    showToast,
    searchQuery 
  } = useApp();

  const activeTab = ['user_accounts', 'audit_logs_view', 'roles_view', 'security_view', 'system_settings_view'].includes(currentView)
    ? currentView
    : 'user_accounts';

  // System Settings state
  const [academicYear, setAcademicYear] = useState('2025–2026');
  const [activeSemester, setActiveSemester] = useState('Second Semester');
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(true);
  const [tuitionPerUnit, setTuitionPerUnit] = useState('1,500.00');

  // Audit Logs Filter
  const [auditModuleFilter, setAuditModuleFilter] = useState('ALL');

  const handleToggleStatus = (user) => {
    const newStatus = user.account === 'Active' ? 'Disabled' : 'Active';
    setAdminUsersList(prev =>
      prev.map(u => u.id === user.id ? { ...u, account: newStatus } : u)
    );

    showToast(`Account status for ${user.name} changed to ${newStatus}.`);
    recordAuditLog(`Account ${newStatus.toLowerCase()}`, `V. Ramos • ${user.name}`);

    fetch(`/api/admin/users/${user.id}/toggle-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(err => console.log('Client-side synced', err));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast('University system settings saved successfully!');
    recordAuditLog('System settings updated', `V. Ramos • AY ${academicYear} ${activeSemester}`);
  };

  // Filter user accounts
  const filteredUsers = adminUsersList.filter(u =>
    !searchQuery ||
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.account.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter audit logs
  const filteredLogs = auditLogsList.filter(l => {
    const matchesSearch = !searchQuery ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.detail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.user?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModule = auditModuleFilter === 'ALL' || l.action.toLowerCase().includes(auditModuleFilter.toLowerCase());
    return matchesSearch && matchesModule;
  });

  return (
    <div className="ssis-canvas">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div className="ssis-page-tag">CUYOTECH UNIVERSITY • ADMINISTRATION</div>
          <h1 className="ssis-page-heading">
            {activeTab === 'user_accounts' && 'Manage Access & User Accounts'}
            {activeTab === 'audit_logs_view' && 'System Audit Trail Logs'}
            {activeTab === 'roles_view' && 'Role-Based Access Control (RBAC)'}
            {activeTab === 'security_view' && 'Security & Access Protocols'}
            {activeTab === 'system_settings_view' && 'University System Configuration'}
          </h1>
          <p className="ssis-page-desc">
            Administrative governance, identity provisioning, and sensitive system monitoring.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="ssis-tabs-bar" style={{ marginBottom: 0 }}>
          <button
            onClick={() => setCurrentView('user_accounts')}
            className={`ssis-tab-btn ${activeTab === 'user_accounts' ? 'active' : ''}`}
          >
            <Users size={16} />
            <span>User Accounts</span>
          </button>
          <button
            onClick={() => setCurrentView('audit_logs_view')}
            className={`ssis-tab-btn ${activeTab === 'audit_logs_view' ? 'active' : ''}`}
          >
            <Clock size={16} />
            <span>Audit Logs</span>
          </button>
          <button
            onClick={() => setCurrentView('roles_view')}
            className={`ssis-tab-btn ${activeTab === 'roles_view' ? 'active' : ''}`}
          >
            <Layers size={16} />
            <span>Roles</span>
          </button>
          <button
            onClick={() => setCurrentView('security_view')}
            className={`ssis-tab-btn ${activeTab === 'security_view' ? 'active' : ''}`}
          >
            <ShieldCheck size={16} />
            <span>Security</span>
          </button>
          <button
            onClick={() => setCurrentView('system_settings_view')}
            className={`ssis-tab-btn ${activeTab === 'system_settings_view' ? 'active' : ''}`}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: User Accounts Management */}
      {activeTab === 'user_accounts' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="ssis-btn-primary"
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              <Plus size={16} />
              <span>Add User Account</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px', alignItems: 'start' }}>
            <div className="ssis-table-container">
              <table className="ssis-table">
                <thead>
                  <tr>
                    <th>Account Holder</th>
                    <th>Assigned Role</th>
                    <th style={{ textAlign: 'right' }}>Account Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => {
                    const isActive = user.account === 'Active';
                    return (
                      <tr key={user.id || user.name}>
                        <td>
                          <strong style={{ color: '#0F172A' }}>{user.name}</strong>
                          <span style={{ color: '#64748B', fontSize: '12px', display: 'block' }}>
                            {user.email || `${user.name.toLowerCase().replace(/\s+/g, '.')}@university.edu`}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            user.role === 'Admin' ? 'badge-success' :
                            user.role === 'Registrar' ? 'badge-review' :
                            user.role === 'Cashier' ? 'badge-pending' : 'badge-danger'
                          }`} style={{ backgroundColor: '#F1F5F9', color: '#1E293B', border: '1px solid #CBD5E1' }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '13.5px',
                              color: isActive ? '#0F172A' : '#94A3B8',
                              fontWeight: '600',
                            }}
                            title="Click to toggle active status"
                          >
                            <span>{user.account}</span>
                            <span
                              style={{
                                display: 'inline-block',
                                width: '9px',
                                height: '9px',
                                borderRadius: '50%',
                                backgroundColor: isActive ? '#22C55E' : 'transparent',
                                border: isActive ? 'none' : '1.5px solid #94A3B8',
                              }}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Recent Audit Logs Quick Card */}
            <div className="ssis-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="ssis-card-title" style={{ marginBottom: 0 }}>Recent Activity</h3>
                <button
                  onClick={() => setActiveTab('audit_logs_view')}
                  style={{ background: 'none', border: 'none', color: '#4338CA', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                >
                  View All &rarr;
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {auditLogsList.slice(0, 5).map(log => (
                  <div key={log.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                    <div style={{ fontSize: '13.5px', color: '#1E293B', fontWeight: '600' }}>
                      <span style={{ color: '#64748B', marginRight: '6px', fontSize: '12px' }}>{log.time}</span>
                      {log.action}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                      {log.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Dedicated Audit Logs View */}
      {activeTab === 'audit_logs_view' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Filter size={15} color="#64748B" />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Filter Module:</span>
              <select
                className="ssis-select"
                style={{ width: '180px', padding: '6px 10px', fontSize: '13px' }}
                value={auditModuleFilter}
                onChange={(e) => setAuditModuleFilter(e.target.value)}
              >
                <option value="ALL">All Actions</option>
                <option value="Payment">Payments & Finance</option>
                <option value="Enrollment">Enrollments</option>
                <option value="Grade">Grade Updates</option>
                <option value="Clearance">Clearance</option>
                <option value="Account">User Accounts</option>
              </select>
            </div>

            <div style={{ fontSize: '13px', color: '#64748B' }}>
              Showing {filteredLogs.length} audit trail entries
            </div>
          </div>

          <div className="ssis-table-container">
            <table className="ssis-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Performed</th>
                  <th>Responsible User</th>
                  <th>Affected Module / Record Detail</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ color: '#475569', fontSize: '13px', fontFamily: 'monospace' }}>
                      {log.time}
                    </td>
                    <td style={{ fontWeight: '600', color: '#0F172A' }}>
                      {log.action}
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#334155' }}>
                        {log.user || 'System'}
                      </span>
                    </td>
                    <td style={{ color: '#475569', fontSize: '13.5px' }}>
                      {log.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Roles & Permissions Matrix */}
      {activeTab === 'roles_view' && (
        <div>
          <div className="ssis-table-container">
            <table className="ssis-table">
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Workspace Access</th>
                  <th>Record Access</th>
                  <th>Transaction Permissions</th>
                  <th style={{ textAlign: 'right' }}>Assigned Count</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong style={{ color: '#9F1239' }}>Student</strong></td>
                  <td>Dashboard, Enrollment, Grades, Payments, Documents, Clearance</td>
                  <td>Read Personal Academic & Financial Transcript</td>
                  <td>Enroll Subjects, Request Documents, Pay Tuition</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>8 Active</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#5B21B6' }}>Registrar</strong></td>
                  <td>Enrollment Approvals, Academic Records, COR Archive, Reports</td>
                  <td>Full Academic Records & Section Transcripts</td>
                  <td>Approve Enrollments, Encode Grades, Release Documents</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>1 Active</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#92400E' }}>Cashier</strong></td>
                  <td>Process Payment, Recent Payments, Assessments, Receipts, Reports</td>
                  <td>Financial Assessments & Payment History</td>
                  <td>Process Tuition Payments, Issue Official Receipts, Reconcile</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>1 Active</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#1E40AF' }}>Department Staff</strong></td>
                  <td>Clearance Requests, Completed Archive, Rules, Compliance Reports</td>
                  <td>Department Student Liability & Equipment Records</td>
                  <td>Approve/Decline Clearance, Post Deficiency Remarks</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>1 Active</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#166534' }}>Admin</strong></td>
                  <td>User Accounts, Audit Trail Logs, Roles Matrix, Security, Settings</td>
                  <td>Full System Database & Audit Trail</td>
                  <td>User Provisioning, Permission Override, System Configuration</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>1 Active</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: Security & Access */}
      {activeTab === 'security_view' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div className="ssis-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Lock size={20} color="#166534" />
              <h3 className="ssis-card-title" style={{ marginBottom: 0 }}>Password & Cryptography</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Password Hashing Algorithm:</span>
                <strong style={{ color: '#0F172A' }}>Bcrypt (Rounds: 12)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Database Engine:</span>
                <strong style={{ color: '#0F172A' }}>MySQL 8.0 (InnoDB)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Session Store:</span>
                <strong style={{ color: '#0F172A' }}>File / Encrypted Cookie</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>CSRF Protection:</span>
                <strong style={{ color: '#166534' }}>Enabled (Synchronizer Token)</strong>
              </div>
            </div>
          </div>

          <div className="ssis-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Server size={20} color="#1E40AF" />
              <h3 className="ssis-card-title" style={{ marginBottom: 0 }}>Access & Sessions</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Session Lifetime:</span>
                <strong style={{ color: '#0F172A' }}>120 Minutes</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Account Lockout Threshold:</span>
                <strong style={{ color: '#0F172A' }}>5 Failed Attempts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Role Verification:</span>
                <strong style={{ color: '#166534' }}>Active RBAC Guard</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Audit Trail Logging:</span>
                <strong style={{ color: '#166534' }}>Comprehensive (Real-time)</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: System Settings */}
      {activeTab === 'system_settings_view' && (
        <div className="ssis-card" style={{ maxWidth: '640px' }}>
          <h3 className="ssis-card-title" style={{ marginBottom: '20px' }}>University Portal Settings</h3>
          <form onSubmit={handleSaveSettings}>
            <div className="ssis-form-group">
              <label className="ssis-label">Active Academic Year</label>
              <input
                type="text"
                className="ssis-input"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
              />
            </div>

            <div className="ssis-form-group">
              <label className="ssis-label">Active Semester</label>
              <select
                className="ssis-select"
                value={activeSemester}
                onChange={(e) => setActiveSemester(e.target.value)}
              >
                <option value="First Semester">First Semester</option>
                <option value="Second Semester">Second Semester</option>
                <option value="Summer Term">Summer Term</option>
              </select>
            </div>

            <div className="ssis-form-group">
              <label className="ssis-label">Tuition Fee Rate per Unit (PHP)</label>
              <input
                type="text"
                className="ssis-input"
                value={tuitionPerUnit}
                onChange={(e) => setTuitionPerUnit(e.target.value)}
                required
              />
            </div>

            <div className="ssis-form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div>
                <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>Student Enrollment Module Status</strong>
                <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                  {isEnrollmentOpen ? 'Currently open for subject enlistment' : 'Enrollment closed'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEnrollmentOpen(!isEnrollmentOpen)}
                className={isEnrollmentOpen ? 'ssis-btn-primary' : 'ssis-btn-secondary'}
                style={{ padding: '6px 14px', fontSize: '13px' }}
              >
                {isEnrollmentOpen ? 'Open' : 'Closed'}
              </button>
            </div>

            <button
              type="submit"
              className="ssis-btn-primary"
              style={{ marginTop: '16px', padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} />
              <span>Save System Settings</span>
            </button>
          </form>
        </div>
      )}

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        Administration & System Governance — DFD 1.0
      </div>
    </div>
  );
};
