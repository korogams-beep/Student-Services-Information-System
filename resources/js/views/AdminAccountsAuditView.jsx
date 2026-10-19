import React, { useState } from 'react';
import { useApp, deduplicateUsers } from '../context/AppContext';
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
  Filter,
  Edit3,
  UserCheck,
  UserX,
  AlertCircle,
  X,
  Shield
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

// Strict Normalized Account Role & Status Helpers
export const isStudentAccount = (u) => {
  return ((u?.role || '').toLowerCase().trim() === 'student');
};

export const isStaffOrAdminAccount = (u) => {
  const role = (u?.role || '').toLowerCase().trim();
  return ['registrar', 'cashier', 'department staff', 'departmentstaff', 'admin', 'staff'].includes(role);
};

export const isAccountDeactivated = (u) => {
  const acc = (u?.account || '').toLowerCase().trim();
  const stat = (u?.status || '').toLowerCase().trim();
  return acc === 'deactivated' || acc === 'disabled' || stat === 'deactivated' || stat === 'disabled';
};

export const isAccountActive = (u) => {
  return !isAccountDeactivated(u);
};

export const AdminAccountsAuditView = () => {
  const { 
    currentView,
    setCurrentView,
    currentUser,
    setCurrentUser,
    demoUsers,
    setDemoUsers,
    adminUsersList, 
    setAdminUsersList, 
    auditLogsList, 
    setIsAddUserModalOpen,
    recordAuditLog,
    showToast,
    searchQuery,
    reassignRoleAccountId,
    getRolePrefix 
  } = useApp();

  const activeTab = ['user_accounts', 'audit_logs_view', 'roles_view', 'security_view', 'system_settings_view'].includes(currentView)
    ? currentView
    : 'user_accounts';

  // System Settings state
  const [academicYear, setAcademicYear] = useState('2025–2026');
  const [activeSemester, setActiveSemester] = useState('Second Semester');
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(true);
  const [tuitionPerUnit, setTuitionPerUnit] = useState('1,500.00');

  // Filter state for User Accounts
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Selected User for Edit Modal
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [editUserRole, setEditUserRole] = useState('Student');
  const [editUserStatus, setEditUserStatus] = useState('Active');

  // Audit Logs Filter
  const [auditModuleFilter, setAuditModuleFilter] = useState('ALL');

  const handleOpenEditModal = (user) => {
    setSelectedUserForEdit(user);
    setEditUserRole(user.role);
    setEditUserStatus(isAccountActive(user) ? 'Active' : 'Deactivated');
  };

  const handleSaveUserEdit = (e) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    const targetUser = selectedUserForEdit;
    const oldRole = targetUser.role;
    const newRole = editUserRole;
    const newStatus = editUserStatus;

    let updatedId = targetUser.account_id || targetUser.student_id_number;
    if (newRole !== oldRole && reassignRoleAccountId) {
      updatedId = reassignRoleAccountId(updatedId, newRole, demoUsers);
    }

    // Update demoUsers which powers adminUsersList
    setDemoUsers(prev =>
      deduplicateUsers(
        prev.map(u => (
          u.id === targetUser.id || 
          (u.email && targetUser.email && u.email === targetUser.email) ||
          (u.student_id_number && targetUser.student_id_number && u.student_id_number === targetUser.student_id_number)
        ) ? { ...u, role: newRole, account_id: updatedId, student_id_number: updatedId, status: newStatus, account: newStatus } : u)
      )
    );

    // If currently logged-in user is updated
    if (currentUser && (
      currentUser.id === targetUser.id || 
      (currentUser.email && targetUser.email && currentUser.email === targetUser.email) ||
      (currentUser.student_id_number && targetUser.student_id_number && currentUser.student_id_number === targetUser.student_id_number)
    )) {
      if (newStatus === 'Deactivated') {
        setCurrentUser(null);
        setCurrentView('login');
        localStorage.removeItem('ssis_current_user');
        showToast(`Your account was deactivated by administrator. Logged out.`);
      } else {
        setCurrentUser(prev => ({ ...prev, role: newRole, account_id: updatedId, student_id_number: updatedId, status: newStatus, account: newStatus }));
      }
    }

    showToast(`Account updated: ${targetUser.name} (${newRole} • ID: ${updatedId} • ${newStatus}).`);
    recordAuditLog(`Account updated (${newRole} • ${newStatus})`, `V. Ramos • ${targetUser.name} (ID: ${updatedId})`);

    // Call backend sync endpoints
    if (newRole !== oldRole) {
      fetch(`/api/admin/users/${targetUser.id}/change-role`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Role': currentUser?.role || 'Admin',
        },
        body: JSON.stringify({ role: newRole, account_id: updatedId }),
      }).catch(err => console.log('Role sync note:', err));
    }

    fetch(`/api/admin/users/${targetUser.id}/toggle-status`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-User-Role': currentUser?.role || 'Admin',
      },
      body: JSON.stringify({ status: newStatus, role: targetUser.role }),
    }).catch(err => console.log('Status sync note:', err));

    setSelectedUserForEdit(null);
  };

  const handleToggleStatus = (user) => {
    const isCurrentlyActive = isAccountActive(user);
    const newStatus = isCurrentlyActive ? 'Deactivated' : 'Active';

    setDemoUsers(prev =>
      deduplicateUsers(
        prev.map(u => (
          u.id === user.id || 
          (u.email && user.email && u.email === user.email) ||
          (u.student_id_number && user.student_id_number && u.student_id_number === user.student_id_number)
        ) ? { ...u, account: newStatus, status: newStatus } : u)
      )
    );

    // If currently logged-in user is deactivated, log them out immediately
    if (currentUser && (
      currentUser.id === user.id || 
      (currentUser.email && user.email && currentUser.email === user.email) ||
      (currentUser.student_id_number && user.student_id_number && currentUser.student_id_number === user.student_id_number)
    ) && newStatus === 'Deactivated') {
      setCurrentUser(null);
      setCurrentView('login');
      localStorage.removeItem('ssis_current_user');
      showToast(`Account for ${user.name} has been deactivated. User has been logged out.`);
    } else {
      showToast(`Account status for ${user.name} set to ${newStatus}.`);
    }

    recordAuditLog(`Account ${newStatus.toLowerCase()}`, `V. Ramos • ${user.name}`);

    fetch(`/api/admin/users/${user.id}/toggle-status`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-User-Role': currentUser?.role || 'Admin',
      },
      body: JSON.stringify({ status: newStatus, role: user.role }),
    }).catch(err => console.log('Client-side synced', err));
  };

  const handleRoleChange = (user, newRole) => {
    if (user.role === newRole) return;
    const oldRole = user.role;
    const currentId = user.account_id || user.student_id_number;
    const updatedId = reassignRoleAccountId ? reassignRoleAccountId(currentId, newRole, demoUsers) : currentId;

    // Update in demoUsers
    setDemoUsers(prev =>
      deduplicateUsers(
        prev.map(u => (
          u.id === user.id || 
          (u.email && user.email && u.email === user.email) ||
          (u.student_id_number && user.student_id_number && u.student_id_number === user.student_id_number)
        ) ? { ...u, role: newRole, account_id: updatedId, student_id_number: updatedId } : u)
      )
    );

    // If currently logged-in user, update session role
    if (currentUser && (
      currentUser.id === user.id || 
      (currentUser.email && user.email && currentUser.email === user.email) ||
      (currentUser.student_id_number && user.student_id_number && currentUser.student_id_number === user.student_id_number)
    )) {
      setCurrentUser(prev => ({ ...prev, role: newRole, account_id: updatedId, student_id_number: updatedId }));
    }

    showToast(`Role for ${user.name} changed to ${newRole} (ID: ${updatedId}).`);
    recordAuditLog(`Role updated to ${newRole}`, `V. Ramos • ${user.name} (was ${oldRole} • ID: ${updatedId})`);

    fetch(`/api/admin/users/${user.id}/change-role`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-User-Role': currentUser?.role || 'Admin',
      },
      body: JSON.stringify({ role: newRole, account_id: updatedId }),
    }).catch(err => console.log('Client-side synced', err));
  };

  // Strictly dynamic active count per role (never hardcoded 8!)
  const getRoleActiveCount = (roleName) => {
    return adminUsersList.filter(u => {
      const roleMatches = (u.role || '').toLowerCase().trim() === roleName.toLowerCase().trim() ||
        (roleName === 'Department Staff' && ((u.role || '').toLowerCase().trim() === 'departmentstaff' || (u.role || '').toLowerCase().trim() === 'department staff'));
      return roleMatches && isAccountActive(u);
    }).length;
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast('University system settings saved successfully!');
    recordAuditLog('System settings updated', `V. Ramos • AY ${academicYear} ${activeSemester}`);
  };

  // Filter user accounts
  const filteredUsers = adminUsersList.filter(u => {
    const query = (searchQuery || '').trim().toLowerCase();
    const matchesSearch = !query ||
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.role && u.role.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.student_id_number && u.student_id_number.toLowerCase().includes(query)) ||
      (u.account_id && u.account_id.toLowerCase().includes(query)) ||
      (u.account && u.account.toLowerCase().includes(query));

    const matchesRole = 
      userRoleFilter === 'ALL' || 
      (userRoleFilter === 'Student' && isStudentAccount(u)) ||
      (userRoleFilter === 'Staff' && isStaffOrAdminAccount(u)) ||
      (userRoleFilter === 'Active' && isAccountActive(u)) ||
      (userRoleFilter === 'Deactivated' && isAccountDeactivated(u));

    return matchesSearch && matchesRole;
  });

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
          {/* Top Bar: Action & Quick Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setUserRoleFilter('ALL')}
                className={userRoleFilter === 'ALL' ? 'ssis-btn-primary' : 'ssis-btn-secondary'}
                style={{ padding: '6px 14px', fontSize: '13px' }}
              >
                All Accounts ({adminUsersList.length})
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('Student')}
                className={userRoleFilter === 'Student' ? 'ssis-btn-primary' : 'ssis-btn-secondary'}
                style={{ padding: '6px 14px', fontSize: '13px' }}
              >
                Students ({adminUsersList.filter(isStudentAccount).length})
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('Staff')}
                className={userRoleFilter === 'Staff' ? 'ssis-btn-primary' : 'ssis-btn-secondary'}
                style={{ padding: '6px 14px', fontSize: '13px' }}
              >
                Staff & Admin ({adminUsersList.filter(isStaffOrAdminAccount).length})
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('Active')}
                className={userRoleFilter === 'Active' ? 'ssis-btn-primary' : 'ssis-btn-secondary'}
                style={{ padding: '6px 14px', fontSize: '13px' }}
              >
                Active ({adminUsersList.filter(isAccountActive).length})
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('Deactivated')}
                className={userRoleFilter === 'Deactivated' ? 'ssis-btn-primary' : 'ssis-btn-secondary'}
                style={{ padding: '6px 14px', fontSize: '13px' }}
              >
                Deactivated ({adminUsersList.filter(isAccountDeactivated).length})
              </button>
            </div>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="ssis-btn-primary"
              style={{ padding: '10px 20px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={16} />
              <span>Add User Account</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 0.95fr', gap: '28px', alignItems: 'start' }}>
            <div className="ssis-table-container">
              <table className="ssis-table">
                <thead>
                  <tr>
                    <th>Account Holder</th>
                    <th>Assigned Role</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted, #64748B)' }}>
                        {userRoleFilter === 'Student' ? 'No registered students yet.' : 'No user accounts match the selected criteria.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => {
                      const isActive = isAccountActive(user);
                      const isStudent = isStudentAccount(user);

                      const roleBadgeStyles = {
                        Student: { bg: '#FFE4E6', color: '#9F1239', border: '#FECDD3' },
                        Registrar: { bg: '#EDE9FE', color: '#5B21B6', border: '#DDD6FE' },
                        Cashier: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
                        'Department Staff': { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
                        DepartmentStaff: { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
                        Admin: { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' },
                      }[user.role] || { bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' };

                      return (
                        <tr key={`admin-user-row-${user.account_id || user.student_id_number || ''}-${user.email || ''}-${user.id || ''}-${index}`}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '50%',
                                  backgroundColor: roleBadgeStyles.bg,
                                  color: roleBadgeStyles.color,
                                  fontWeight: '800',
                                  fontSize: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {user.initials || user.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <strong style={{ color: 'var(--text-main, #0F172A)', display: 'block', fontSize: '13.5px' }}>
                                  {user.name}
                                </strong>
                                <span style={{ color: 'var(--text-muted, #64748B)', fontSize: '12px', display: 'block' }}>
                                  {user.email || `${user.username || 'user'}@cuyotech.edu.ph`}
                                </span>
                                <span style={{ fontSize: '11px', color: '#0284C7', fontWeight: '700', fontFamily: 'monospace', display: 'block', marginTop: '2px' }}>
                                  ID: {user.account_id || user.student_id_number || (
                                    user.role === 'Registrar' ? 'REG-2026-0001' :
                                    user.role === 'Cashier' ? 'CSH-2026-0001' :
                                    (user.role === 'Department Staff' || user.role === 'DepartmentStaff') ? 'STF-2026-0001' :
                                    user.role === 'Admin' ? 'ADM-2026-0001' : 'STU-2026-0001'
                                  )} {user.program ? `• ${user.program}` : ''}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user, e.target.value)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: `1.5px solid ${roleBadgeStyles.border}`,
                                fontSize: '12.5px',
                                fontWeight: '700',
                                backgroundColor: roleBadgeStyles.bg,
                                color: roleBadgeStyles.color,
                                cursor: 'pointer',
                                outline: 'none',
                              }}
                              title="Select new role to update permissions"
                            >
                              <option value="Student">Student</option>
                              <option value="Registrar">Registrar</option>
                              <option value="Cashier">Cashier</option>
                              <option value="Department Staff">Department Staff</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '700',
                                backgroundColor: isActive ? '#DCFCE7' : '#FEE2E2',
                                color: isActive ? '#166534' : '#991B1B',
                              }}
                            >
                              <span
                                style={{
                                  width: '7px',
                                  height: '7px',
                                  borderRadius: '50%',
                                  backgroundColor: isActive ? '#22C55E' : '#EF4444',
                                }}
                              />
                              {isActive ? 'Active' : 'Deactivated'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(user)}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  border: isActive ? '1px solid #FECACA' : '1px solid #BBF7D0',
                                  backgroundColor: isActive ? '#FEF2F2' : '#F0FDF4',
                                  color: isActive ? '#DC2626' : '#16A34A',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                }}
                                title={isActive ? 'Deactivate user access' : 'Reactivate user access'}
                              >
                                {isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                                <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(user)}
                                className="ssis-btn-secondary"
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                                title="Edit user role and account status"
                              >
                                <Edit3 size={13} />
                                <span>Edit</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Recent Audit Logs Quick Card */}
            <div className="ssis-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="ssis-card-title" style={{ marginBottom: 0 }}>Recent Activity</h3>
                <button
                  onClick={() => setCurrentView('audit_logs_view')}
                  style={{ background: 'none', border: 'none', color: '#F1B82D', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
                >
                  View All &rarr;
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {auditLogsList.slice(0, 6).map(log => (
                  <div key={log.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid var(--card-border, #F1F5F9)', paddingBottom: '10px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-main, #1E293B)', fontWeight: '600' }}>
                      <span style={{ color: 'var(--text-muted, #64748B)', marginRight: '6px', fontSize: '11.5px' }}>{log.time}</span>
                      {log.action}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748B)' }}>
                      {log.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* EDIT USER ACCOUNT MODAL */}
          {selectedUserForEdit && (
            <div className="ssis-modal-backdrop" onClick={() => setSelectedUserForEdit(null)}>
              <div className="ssis-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={22} color="#D97706" />
                    <h3 style={{ fontSize: '19px', fontWeight: '700', color: 'var(--text-main, #0F172A)', margin: 0 }}>
                      Manage User Account
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedUserForEdit(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #64748B)' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ padding: '14px 16px', backgroundColor: 'var(--bg-subtle, #F8FAFC)', borderRadius: '8px', border: '1px solid var(--card-border, #E2E8F0)', marginBottom: '20px' }}>
                  <strong style={{ fontSize: '15px', color: 'var(--text-main, #0F172A)', display: 'block' }}>
                    {selectedUserForEdit.name}
                  </strong>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted, #64748B)', display: 'block', marginTop: '2px' }}>
                    {selectedUserForEdit.email || selectedUserForEdit.username}
                  </span>
                  {(selectedUserForEdit.account_id || selectedUserForEdit.student_id_number) && (
                    <span style={{ fontSize: '12px', color: '#0284C7', fontWeight: '700', fontFamily: 'monospace', display: 'block', marginTop: '4px' }}>
                      Account ID: {reassignRoleAccountId ? reassignRoleAccountId(selectedUserForEdit.account_id || selectedUserForEdit.student_id_number, editUserRole, demoUsers) : (selectedUserForEdit.account_id || selectedUserForEdit.student_id_number)}
                      {editUserRole !== selectedUserForEdit.role && (
                        <span style={{ color: '#D97706', fontSize: '11px', marginLeft: '6px' }}>(Updated for {editUserRole})</span>
                      )}
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveUserEdit}>
                  <div className="ssis-form-group" style={{ marginBottom: '18px' }}>
                    <label className="ssis-label">Assigned Role</label>
                    <select
                      className="ssis-select"
                      value={editUserRole}
                      onChange={(e) => setEditUserRole(e.target.value)}
                      required
                    >
                      <option value="Student">Student</option>
                      <option value="Registrar">Registrar</option>
                      <option value="Cashier">Cashier</option>
                      <option value="Department Staff">Department Staff</option>
                      <option value="Admin">Admin</option>
                    </select>
                    <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                      Controls available workspaces, menus, and transaction authorizations.
                    </span>
                  </div>

                  <div className="ssis-form-group" style={{ marginBottom: '20px' }}>
                    <label className="ssis-label">Account Status</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <label
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: editUserStatus === 'Active' ? '2px solid #22C55E' : '1px solid #CBD5E1',
                          backgroundColor: editUserStatus === 'Active' ? '#F0FDF4' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <input
                          type="radio"
                          name="statusRadio"
                          value="Active"
                          checked={editUserStatus === 'Active'}
                          onChange={() => setEditUserStatus('Active')}
                        />
                        <span style={{ fontWeight: '700', fontSize: '13.5px', color: '#166534' }}>Active</span>
                      </label>

                      <label
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: editUserStatus === 'Deactivated' ? '2px solid #EF4444' : '1px solid #CBD5E1',
                          backgroundColor: editUserStatus === 'Deactivated' ? '#FEF2F2' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <input
                          type="radio"
                          name="statusRadio"
                          value="Deactivated"
                          checked={editUserStatus === 'Deactivated'}
                          onChange={() => setEditUserStatus('Deactivated')}
                        />
                        <span style={{ fontWeight: '700', fontSize: '13.5px', color: '#991B1B' }}>Deactivated</span>
                      </label>
                    </div>

                    {editUserStatus === 'Deactivated' && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          marginTop: '10px',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FECACA',
                          fontSize: '12px',
                          color: '#991B1B',
                        }}
                      >
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>
                          Deactivated accounts cannot authenticate or access the portal until reactivated by an administrator.
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedUserForEdit(null)}
                      className="ssis-btn-secondary"
                      style={{ padding: '10px 18px', fontSize: '13.5px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ssis-btn-primary"
                      style={{ padding: '10px 22px', fontSize: '13.5px' }}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Dedicated Audit Logs View */}
      {activeTab === 'audit_logs_view' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Filter size={15} color="#64748B" />
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted, #94A3B8)' }}>Filter Module:</span>
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

            <div style={{ fontSize: '13px', color: 'var(--text-muted, #94A3B8)' }}>
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
                    <td style={{ color: 'var(--text-muted, #475569)', fontSize: '13px', fontFamily: 'monospace' }}>
                      {log.time}
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-main, #0F172A)' }}>
                      {log.action}
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-subtle, #F1F5F9)', color: 'var(--text-main, #334155)', border: '1px solid var(--card-border, #CBD5E1)' }}>
                        {log.user || 'System'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted, #475569)', fontSize: '13.5px' }}>
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
                  <td><strong style={{ color: '#FDA4AF' }}>Student</strong></td>
                  <td>Dashboard, Enrollment, Grades, Payments, Documents, Clearance</td>
                  <td>Read Personal Academic & Financial Transcript</td>
                  <td>Enroll Subjects, Request Documents, Pay Tuition</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{getRoleActiveCount('Student')} Active</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#DDD6FE' }}>Registrar</strong></td>
                  <td>Enrollment Approvals, Academic Records, COR Archive, Reports</td>
                  <td>Full Academic Records & Section Transcripts</td>
                  <td>Approve Enrollments, Encode Grades, Release Documents</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{getRoleActiveCount('Registrar')} Active</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#FCD34D' }}>Cashier</strong></td>
                  <td>Process Payment, Recent Payments, Assessments, Receipts, Reports</td>
                  <td>Financial Assessments & Payment History</td>
                  <td>Process Tuition Payments, Issue Official Receipts, Reconcile</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{getRoleActiveCount('Cashier')} Active</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#93C5FD' }}>Department Staff</strong></td>
                  <td>Clearance Requests, Completed Archive, Rules, Compliance Reports</td>
                  <td>Department Student Liability & Equipment Records</td>
                  <td>Approve/Decline Clearance, Post Deficiency Remarks</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{getRoleActiveCount('Department Staff')} Active</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#4ADE80' }}>Admin</strong></td>
                  <td>User Accounts, Audit Trail Logs, Roles Matrix, Security, Settings</td>
                  <td>Full System Database & Audit Trail</td>
                  <td>User Provisioning, Permission Override, System Configuration</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{getRoleActiveCount('Admin')} Active</td>
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
              <Lock size={20} color="#22C55E" />
              <h3 className="ssis-card-title" style={{ marginBottom: 0 }}>Password & Cryptography</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted, #64748B)' }}>Password Hashing Algorithm:</span>
                <strong style={{ color: 'var(--text-main, #0F172A)' }}>Bcrypt (Rounds: 12)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted, #64748B)' }}>Database Engine:</span>
                <strong style={{ color: 'var(--text-main, #0F172A)' }}>MySQL 8.0 (InnoDB)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted, #64748B)' }}>Session Store:</span>
                <strong style={{ color: 'var(--text-main, #0F172A)' }}>File / Encrypted Cookie</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted, #64748B)' }}>CSRF Protection:</span>
                <strong style={{ color: '#22C55E' }}>Enabled (Synchronizer Token)</strong>
              </div>
            </div>
          </div>

          <div className="ssis-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Server size={20} color="#3B82F6" />
              <h3 className="ssis-card-title" style={{ marginBottom: 0 }}>Access & Sessions</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted, #64748B)' }}>Session Lifetime:</span>
                <strong style={{ color: 'var(--text-main, #0F172A)' }}>120 Minutes</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted, #64748B)' }}>Account Lockout Threshold:</span>
                <strong style={{ color: 'var(--text-main, #0F172A)' }}>5 Failed Attempts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted, #64748B)' }}>Role Verification:</span>
                <strong style={{ color: '#22C55E' }}>Active RBAC Guard</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted, #64748B)' }}>Audit Trail Logging:</span>
                <strong style={{ color: '#22C55E' }}>Comprehensive (Real-time)</strong>
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

            <div className="ssis-form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--surface-color, rgba(255,255,255,0.03))', borderRadius: '8px', border: '1px solid var(--card-border, #334155)' }}>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--text-main, #F8FAFC)', display: 'block' }}>Student Enrollment Module Status</strong>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted, #94A3B8)' }}>
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

            <div className="ssis-form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--surface-color, rgba(255,255,255,0.03))', borderRadius: '8px', border: '1px solid var(--card-border, #334155)' }}>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--text-main, #F8FAFC)', display: 'block' }}>Interface Theme Preference</strong>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted, #94A3B8)' }}>
                  Switch between high-contrast Light Mode and dark-slate Dark Mode
                </span>
              </div>
              <ThemeToggle showLabel={true} />
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
