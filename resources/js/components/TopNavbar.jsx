import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ChevronDown, UserCheck } from 'lucide-react';

export const TopNavbar = () => {
  const { currentUser, currentView, searchQuery, setSearchQuery, switchRole, demoUsers } = useApp();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'enrollment': return 'Enrollment';
      case 'payments': return 'Payments';
      case 'cor_preview': return 'Certificate of Registration';
      case 'grades': return 'Grades';
      case 'documents': return 'Document Requests';
      case 'clearance': return 'Clearance';
      case 'approvals': return 'Enrollment Approvals';
      case 'academic_records': return 'Academic Records';
      case 'student_records': return 'Student Records';
      case 'documents_queue': return 'Document Approvals';
      case 'cor_archive': return 'COR Archive';
      case 'registrar_reports': return 'Registrar Reports';
      case 'process_payment': return 'Process Payment';
      case 'recent_payments': return 'Recent Payments';
      case 'assessments': return 'Assessments';
      case 'receipts': return 'Official Receipts';
      case 'reports': return 'Financial Reports';
      case 'clearance_requests': return 'Clearance Requests';
      case 'completed_clearance': return 'Completed Clearances';
      case 'department_rules': return 'Department Rules';
      case 'dept_reports': return 'Clearance Reports';
      case 'user_accounts': return 'Accounts & Audit Logs';
      case 'audit_logs_view': return 'System Audit Logs';
      case 'roles_view': return 'Roles & Permissions';
      case 'security_view': return 'Security & Access';
      case 'system_settings_view': return 'System Settings';
      default: return 'SSIS Portal';
    }
  };

  return (
    <header className="ssis-top-navbar">
      {/* Page Title */}
      <h2 className="ssis-header-title">{getPageTitle()}</h2>

      {/* Right Controls */}
      <div className="ssis-header-right">
        {/* Search Input pill */}
        <div className="ssis-search-box">
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            className="ssis-search-input"
            placeholder="Search SSIS"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status dot */}
        <div className="ssis-status-dot" title="System Online" />

        {/* Quick Role Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="ssis-role-switcher-btn"
            title="Switch demo perspective"
          >
            <UserCheck size={14} color="#F1B82D" />
            <span>Role: {currentUser.role}</span>
            <ChevronDown size={14} />
          </button>

          {isRoleDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                border: '1px solid #E2E8F0',
                padding: '8px',
                width: '230px',
                zIndex: 100,
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', padding: '6px 12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Select Active Role
              </div>
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchRole(u.role);
                    setIsRoleDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: currentUser.role === u.role ? '#FBE8E9' : 'transparent',
                    color: currentUser.role === u.role ? '#9F1239' : '#1E293B',
                    fontSize: '13px',
                    fontWeight: currentUser.role === u.role ? '700' : '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div>{u.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{u.role}</div>
                  </div>
                  <span style={{ fontSize: '11px', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                    {u.initials}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Avatar Circle */}
        <div
          className="ssis-avatar"
          title={currentUser.name}
          style={{
            backgroundColor: (() => {
              switch (currentUser.role) {
                case 'Registrar': return '#EDE9FE';
                case 'Cashier': return '#FEF3C7';
                case 'Department Staff': return '#DBEAFE';
                case 'Admin': return '#DCFCE7';
                default: return '#FBE8E9';
              }
            })(),
            color: (() => {
              switch (currentUser.role) {
                case 'Registrar': return '#5B21B6';
                case 'Cashier': return '#92400E';
                case 'Department Staff': return '#1E40AF';
                case 'Admin': return '#166534';
                default: return '#9F1239';
              }
            })(),
          }}
        >
          {currentUser.initials}
        </div>

        {/* Role Label */}
        <span
          className="ssis-user-role-label"
          style={{
            color: (() => {
              switch (currentUser.role) {
                case 'Registrar': return '#5B21B6';
                case 'Cashier': return '#92400E';
                case 'Department Staff': return '#1E40AF';
                case 'Admin': return '#166534';
                default: return '#9F1239';
              }
            })(),
            fontWeight: '600',
          }}
        >
          {currentUser.role}
        </span>
      </div>
    </header>
  );
};
