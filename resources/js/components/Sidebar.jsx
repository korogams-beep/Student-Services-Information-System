import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  CreditCard, 
  ShieldCheck, 
  CheckSquare, 
  Users, 
  Receipt, 
  Settings, 
  LogOut,
  Clock,
  Layers
} from 'lucide-react';

const ROLE_ACCENT = {
  Student:          { pill: '#FDE8E9', text: '#881337' },
  Registrar:        { pill: '#EDE9FE', text: '#5B21B6' },
  Cashier:          { pill: '#FEF3C7', text: '#92400E' },
  'Department Staff': { pill: '#DBEAFE', text: '#1E40AF' },
  Admin:            { pill: '#DCFCE7', text: '#166534' },
};

export const Sidebar = () => {
  const { currentUser, currentView, setCurrentView, handleLogout } = useApp();

  const accent = ROLE_ACCENT[currentUser?.role] || ROLE_ACCENT.Student;

  const getNavItems = () => {
    switch (currentUser?.role) {
      case 'Student':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'enrollment', label: 'Enrollment', icon: BookOpen },
          { id: 'grades', label: 'Grades', icon: GraduationCap },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'clearance', label: 'Clearance', icon: ShieldCheck },
        ];
      case 'Registrar':
        return [
          { id: 'approvals', label: 'Enrollment Approvals', icon: CheckSquare },
          { id: 'academic_records', label: 'Academic Records', icon: GraduationCap },
          { id: 'student_records', label: 'Student Records', icon: Users },
          { id: 'documents_queue', label: 'Documents', icon: FileText },
          { id: 'cor_archive', label: 'COR Archive', icon: Layers },
          { id: 'registrar_reports', label: 'Reports', icon: Clock },
        ];
      case 'Cashier':
        return [
          { id: 'process_payment', label: 'Process Payment', icon: CreditCard },
          { id: 'recent_payments', label: 'Recent Payments', icon: Receipt },
          { id: 'assessments', label: 'Assessments', icon: Layers },
          { id: 'receipts', label: 'Receipts', icon: FileText },
          { id: 'reports', label: 'Reports', icon: Clock },
        ];
      case 'Department Staff':
        return [
          { id: 'clearance_requests', label: 'Clearance Requests', icon: ShieldCheck },
          { id: 'completed_clearance', label: 'Completed', icon: CheckSquare },
          { id: 'department_rules', label: 'Department Rules', icon: Layers },
          { id: 'dept_reports', label: 'Reports', icon: Clock },
        ];
      case 'Admin':
        return [
          { id: 'user_accounts', label: 'User Accounts', icon: Users },
          { id: 'audit_logs_view', label: 'Audit Logs', icon: Clock },
          { id: 'roles_view', label: 'Roles', icon: Layers },
          { id: 'security_view', label: 'Security', icon: ShieldCheck },
          { id: 'system_settings_view', label: 'System Settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="ssis-sidebar">
      {/* Brand Header with CuyoTech University Logo */}
      <div className="ssis-sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '24px 20px' }}>
        <img 
          src="/images/pnc-logo.png" 
          alt="CuyoTech University Logo" 
          style={{ width: '42px', height: '42px', objectFit: 'contain' }} 
        />
        <div>
          <h1 className="ssis-brand-title" style={{ fontSize: '17px', fontWeight: '900', color: '#F1B82D', margin: 0, lineHeight: 1.1 }}>
            CUYOTECH • SSIS
          </h1>
          <p className="ssis-brand-subtitle" style={{ fontSize: '10.5px', color: '#94A3B8', margin: '2px 0 0', fontWeight: '600' }}>
            CuyoTech University
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="ssis-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`ssis-nav-item ${isActive ? 'active' : ''}`}
              style={isActive ? { backgroundColor: accent.pill, color: accent.text } : {}}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout / Switch Role footer */}
      <div className="ssis-sidebar-footer">
        <button
          onClick={handleLogout}
          className="ssis-nav-item"
          style={{ color: '#EF4444' }}
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
