import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { ReceiptModal } from './components/ReceiptModal';
import { AddUserModal } from './components/AddUserModal';

// Views
import { LoginView } from './views/LoginView';
import { StudentDashboardView } from './views/StudentDashboardView';
import { StudentEnrollmentView } from './views/StudentEnrollmentView';
import { StudentPaymentsView } from './views/StudentPaymentsView';
import { CertificateOfRegistrationView } from './views/CertificateOfRegistrationView';
import { StudentGradesView } from './views/StudentGradesView';
import { StudentDocumentsView } from './views/StudentDocumentsView';
import { StudentClearanceView } from './views/StudentClearanceView';

// Distinct Registrar Views
import { RegistrarApprovalsView } from './views/RegistrarApprovalsView';
import { RegistrarRecordsView } from './views/RegistrarRecordsView';
import { RegistrarStudentRecordsView } from './views/RegistrarStudentRecordsView';
import { RegistrarDocumentsQueueView } from './views/RegistrarDocumentsQueueView';
import { RegistrarReportsView } from './views/RegistrarReportsView';

// Distinct Cashier Views
import { CashierPaymentView } from './views/CashierPaymentView';
import { CashierRecentPaymentsView } from './views/CashierRecentPaymentsView';
import { CashierAssessmentsView } from './views/CashierAssessmentsView';
import { CashierReceiptsArchiveView } from './views/CashierReceiptsArchiveView';
import { CashierReportsView } from './views/CashierReportsView';

// Department & Admin Views
import { DepartmentClearanceView } from './views/DepartmentClearanceView';
import { AdminAccountsAuditView } from './views/AdminAccountsAuditView';
import { CheckCircle2 } from 'lucide-react';

const MainLayout = () => {
  const { currentView, toastMessage } = useApp();

  // Route View component
  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return <LoginView />;
      case 'dashboard':
        return <StudentDashboardView />;
      case 'enrollment':
        return <StudentEnrollmentView />;
      case 'payments':
        return <StudentPaymentsView />;
      case 'cor_preview':
      case 'cor_archive':
        return <CertificateOfRegistrationView />;
      case 'grades':
        return <StudentGradesView />;
      case 'documents':
        return <StudentDocumentsView />;
      case 'clearance':
        return <StudentClearanceView />;

      // Registrar Views - each tab has its own distinct view!
      case 'approvals':
        return <RegistrarApprovalsView />;
      case 'academic_records':
        return <RegistrarRecordsView />;
      case 'student_records':
        return <RegistrarStudentRecordsView />;
      case 'documents_queue':
        return <RegistrarDocumentsQueueView />;
      case 'registrar_reports':
        return <RegistrarReportsView />;

      // Cashier Views - each tab has its own distinct view!
      case 'process_payment':
        return <CashierPaymentView />;
      case 'recent_payments':
        return <CashierRecentPaymentsView />;
      case 'assessments':
        return <CashierAssessmentsView />;
      case 'receipts':
        return <CashierReceiptsArchiveView />;
      case 'reports':
        return <CashierReportsView />;

      // Department Staff Views
      case 'clearance_requests':
      case 'completed_clearance':
      case 'department_rules':
      case 'dept_reports':
        return <DepartmentClearanceView />;

      // Admin Views
      case 'user_accounts':
      case 'audit_logs_view':
      case 'roles_view':
      case 'security_view':
      case 'system_settings_view':
        return <AdminAccountsAuditView />;

      default:
        return <StudentDashboardView />;
    }
  };

  if (currentView === 'login') {
    return (
      <>
        <LoginView />
        {toastMessage && (
          <div className="ssis-toast">
            <CheckCircle2 size={18} color="#22C55E" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="ssis-app-container">
      <Sidebar />
      <div className="ssis-main-wrapper">
        <TopNavbar />
        <main style={{ flex: 1 }}>
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Modals */}
      <ReceiptModal />
      <AddUserModal />

      {/* Floating Action / Feedback Toast */}
      {toastMessage && (
        <div className="ssis-toast">
          <CheckCircle2 size={18} color="#22C55E" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SSIS Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          background: '#0F172A',
          color: '#F8FAFC',
          padding: '24px',
          textAlign: 'center'
        }}>
          <img src="/images/pnc-logo.png" alt="CuyoTech" style={{ width: '80px', height: '80px', marginBottom: '20px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>CuyoTech University — SSIS</h1>
          <p style={{ color: '#94A3B8', maxWidth: '480px', marginBottom: '24px', fontSize: '14px' }}>
            An unexpected interface error occurred. Please click below to reset and reload the application.
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            style={{
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reset & Reload Portal
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}

const mountElement = document.getElementById('root') || document.getElementById('app');
if (mountElement) {
  const root = ReactDOM.createRoot(mountElement);
  root.render(<App />);
} else {
  console.error("SSIS: Could not find mounting container element ('root' or 'app').");
}

