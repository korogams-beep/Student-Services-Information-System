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
import { RegistrarApprovalsView } from './views/RegistrarApprovalsView';
import { RegistrarRecordsView } from './views/RegistrarRecordsView';
import { CashierPaymentView } from './views/CashierPaymentView';
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
      case 'recent_payments':
      case 'assessments':
      case 'reports':
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
      case 'approvals':
        return <RegistrarApprovalsView />;
      case 'academic_records':
      case 'documents_queue':
      case 'registrar_reports':
        return <RegistrarRecordsView />;
      case 'process_payment':
      case 'receipts':
        return <CashierPaymentView />;
      case 'clearance_requests':
      case 'completed_clearance':
      case 'department_rules':
      case 'dept_reports':
        return <DepartmentClearanceView />;
      case 'user_accounts':
      case 'audit_logs_view':
      case 'roles_view':
      case 'security_view':
      case 'system_settings_view':
      case 'student_records':
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

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
