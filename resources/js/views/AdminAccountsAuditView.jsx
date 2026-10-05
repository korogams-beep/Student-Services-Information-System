import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';

export const AdminAccountsAuditView = () => {
  const { 
    adminUsersList, 
    setAdminUsersList, 
    auditLogsList, 
    setIsAddUserModalOpen,
    recordAuditLog,
    showToast 
  } = useApp();

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

  return (
    <div className="ssis-canvas">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <div className="ssis-page-tag">DFD 1.0 • ADMINISTRATION</div>
          <h1 className="ssis-page-heading">Manage access and accountability</h1>
          <p className="ssis-page-desc">
            Provision role-based accounts and monitor sensitive system activity.
          </p>
        </div>

        {/* + Add User Button matching Page 13 */}
        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="ssis-btn-primary"
          style={{ padding: '12px 24px', fontSize: '14.5px' }}
        >
          <Plus size={18} />
          <span>Add User</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '36px', alignItems: 'start' }}>
        {/* Left Accounts Table matching Page 13 */}
        <div className="ssis-table-container">
          <table className="ssis-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th style={{ textAlign: 'right' }}>Account</th>
              </tr>
            </thead>
            <tbody>
              {adminUsersList.map(user => {
                const isActive = user.account === 'Active';
                return (
                  <tr key={user.id}>
                    <td style={{ fontWeight: '600', color: '#0F172A' }}>{user.name}</td>
                    <td style={{ color: '#475569' }}>{user.role}</td>
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
                          fontWeight: '500',
                        }}
                        title="Click to toggle status"
                      >
                        <span>{user.account}</span>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '9px',
                            height: '9px',
                            borderRadius: '50%',
                            backgroundColor: isActive ? '#475569' : 'transparent',
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

        {/* Right Audit Logs Card matching Page 13 */}
        <div className="ssis-card" style={{ padding: '30px 28px' }}>
          <h3 className="ssis-card-title" style={{ marginBottom: '22px' }}>
            Audit logs
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {auditLogsList.map(log => (
              <div key={log.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>
                  <strong style={{ color: '#0F172A', marginRight: '6px' }}>{log.time}</strong>
                  {log.action}
                </div>
                <div style={{ fontSize: '13px', color: '#64748B' }}>
                  {log.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        Manage Accounts and Audit Logs — DFD 1.0
      </div>
    </div>
  );
};
