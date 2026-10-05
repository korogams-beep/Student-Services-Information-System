import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Available demo users for seamless presentation / grading
  const demoUsers = [
    {
      id: 1,
      name: 'Maria Santos',
      email: 'maria.santos@university.edu',
      student_id_number: '2024-01847',
      role: 'Student',
      initials: 'MS',
      program: 'BS Computer Science',
      yearLevel: '2nd Year',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Ramon Alcantara',
      email: 'r.alcantara@university.edu',
      username: 'r.alcantara',
      role: 'Registrar',
      initials: 'RA',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Leah Navarro',
      email: 'l.navarro@university.edu',
      username: 'l.navarro',
      role: 'Cashier',
      initials: 'CR',
      counterNo: 3,
      status: 'Active',
    },
    {
      id: 4,
      name: 'Dina Flores',
      email: 'd.flores@university.edu',
      username: 'd.flores',
      role: 'Department Staff',
      initials: 'DS',
      department: 'Computer Laboratory',
      status: 'Active',
    },
    {
      id: 5,
      name: 'Victor Ramos',
      email: 'v.ramos@university.edu',
      username: 'v.ramos',
      role: 'Admin',
      initials: 'AD',
      status: 'Active',
    },
  ];

  // Auth state
  const [currentUser, setCurrentUser] = useState(demoUsers[0]); // Starts as Maria Santos
  const [currentView, setCurrentView] = useState('login'); // Start at login screen
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Student Enrollment Schedule state (Page 3)
  const [scheduleCourses, setScheduleCourses] = useState([
    { id: 1, code: 'CS 101', title: 'Introduction to Computing', units: 3, schedule: 'M/W 9:00–10:30', slots: 12, selected: true },
    { id: 2, code: 'MATH 121', title: 'Calculus II', units: 3, schedule: 'T/Th 10:30–12:00', slots: 8, selected: true },
    { id: 3, code: 'ENG 103', title: 'Academic Writing', units: 3, schedule: 'M/W 13:00–14:30', slots: 21, selected: false },
    { id: 4, code: 'CS 115', title: 'Data Structures', units: 4, schedule: 'T/Th 13:00–15:00', slots: 5, selected: true },
    { id: 5, code: 'NSTP 2', title: 'Civic Welfare Training', units: 3, schedule: 'Sat 8:00–11:00', slots: 16, selected: false },
  ]);
  const [enrollmentStatus, setEnrollmentStatus] = useState('Pending');

  // Student Financial Data (Page 4)
  const [assessedFees, setAssessedFees] = useState([
    { id: 1, category: 'Tuition • 21 units', amount: 31500.00 },
    { id: 2, category: 'Laboratory fees', amount: 4800.00 },
    { id: 3, category: 'Miscellaneous fees', amount: 7250.00 },
  ]);

  const [paymentHistory, setPaymentHistory] = useState([
    { id: 1, date: 'February 12, 2026', reference: 'OR-2026-004821', amount: 15000.00, method: 'Cash' },
    { id: 2, date: 'January 28, 2026', reference: 'OR-2026-002107', amount: 10000.00, method: 'Cash' },
  ]);

  // Student Grades Data (Page 6)
  const [gradeReports, setGradeReports] = useState([
    { id: 1, subject: 'CS 101 • Introduction to Computing', units: 3, grade: 1.50, remarks: 'Passed' },
    { id: 2, subject: 'MATH 121 • Calculus II', units: 3, grade: 1.75, remarks: 'Passed' },
    { id: 3, subject: 'ENG 103 • Academic Writing', units: 3, grade: 1.25, remarks: 'Passed' },
    { id: 4, subject: 'CS 115 • Data Structures', units: 4, grade: 1.50, remarks: 'Passed' },
    { id: 5, subject: 'NSTP 2 • Civic Welfare Training', units: 3, grade: 1.00, remarks: 'Passed' },
  ]);

  // Student Document Requests Data (Page 7)
  const [documentRequests, setDocumentRequests] = useState([
    { id: 1, request: 'Certificate of Enrollment', submitted: 'Feb 10, 2026', status: 'Ready for Release', copies: 1, purpose: 'Scholarship' },
    { id: 2, request: 'Good Moral Certificate', submitted: 'Feb 06, 2026', status: 'Approved', copies: 1, purpose: 'Internship' },
    { id: 3, request: 'Transcript of Records', submitted: 'Jan 30, 2026', status: 'Pending', copies: 2, purpose: 'Graduate school application' },
  ]);

  // Student Clearance Data (Page 8)
  const [clearanceList, setClearanceList] = useState([
    { id: 1, department: 'University Library', lastUpdated: 'Feb 14, 2026', status: 'Cleared', remarks: 'All library books returned' },
    { id: 2, department: 'Computer Laboratory', lastUpdated: 'Feb 13, 2026', status: 'Cleared', remarks: 'No outstanding equipment' },
    { id: 3, department: 'Student Affairs Office', lastUpdated: 'Feb 11, 2026', status: 'Cleared', remarks: 'Good student standing' },
    { id: 4, department: 'Accounting Office', lastUpdated: 'Awaiting review', status: 'Pending', remarks: 'Awaiting balance completion' },
    { id: 5, department: 'College Department', lastUpdated: 'Awaiting review', status: 'Pending', remarks: 'Awaiting department chair sign-off' },
  ]);

  // Registrar Enrollment Request Queue (Page 9)
  const [registrarQueue, setRegistrarQueue] = useState([
    {
      id: 1,
      studentName: 'Miguel Reyes',
      studentId: '2024-02115',
      requestedSubjects: 'CS 101, MATH 121, ENG 103',
      status: 'Pending',
      validation: { profileComplete: true, prerequisites: true, noConflicts: true, financeCleared: false },
    },
    {
      id: 2,
      studentName: 'Angela Cruz',
      studentId: '2023-01442',
      requestedSubjects: 'CS 201, STAT 101',
      status: 'Pending',
      validation: { profileComplete: true, prerequisites: true, noConflicts: true, financeCleared: true },
    },
    {
      id: 3,
      studentName: 'Paolo Garcia',
      studentId: '2024-01903',
      requestedSubjects: 'IT 110, MATH 121',
      status: 'For Review',
      validation: { profileComplete: true, prerequisites: false, noConflicts: true, financeCleared: false },
    },
  ]);
  const [selectedQueueStudentId, setSelectedQueueStudentId] = useState(1);

  // Registrar Academic Records (CS 101) & Document Approvals (Page 10)
  const [encodeGradesList, setEncodeGradesList] = useState([
    { id: 1, studentId: '2024-01847', studentName: 'Maria Santos', grade: '1.50' },
    { id: 2, studentId: '2024-02115', studentName: 'Miguel Reyes', grade: '1.75' },
    { id: 3, studentId: '2024-01903', studentName: 'Paolo Garcia', grade: '2.00' },
    { id: 4, studentId: '2023-01442', studentName: 'Angela Cruz', grade: '1.25' },
  ]);

  const [registrarDocumentQueue, setRegistrarDocumentQueue] = useState([
    { id: 1, studentName: 'Ana Lim', request: 'Transcript of Records • 2 copies', status: 'Pending', selected: true },
    { id: 2, studentName: 'Carlo Mendoza', request: 'Certificate of Enrollment • 1 copy', status: 'Pending', selected: false },
    { id: 3, studentName: 'Joyce Tan', request: 'Good Moral Certificate • 1 copy', status: 'Pending', selected: false },
  ]);

  // Department Staff Clearance Requests (Page 12)
  const [departmentStaffClearanceQueue, setDepartmentStaffClearanceQueue] = useState([
    { id: 1, studentName: 'Miguel Reyes', studentId: '2024-02115', department: 'Computer Laboratory', remarks: 'No outstanding equipment', status: 'Pending' },
    { id: 2, studentName: 'Angela Cruz', studentId: '2023-01442', department: 'Computer Laboratory', remarks: 'Return headset #H-208', status: 'Pending' },
    { id: 3, studentName: 'Paolo Garcia', studentId: '2024-01903', department: 'Computer Laboratory', remarks: 'No outstanding equipment', status: 'Pending' },
    { id: 4, studentName: 'Jessa Villanueva', studentId: '2022-00881', department: 'Computer Laboratory', remarks: 'Pending workstation check', status: 'Pending' },
  ]);

  // Admin User Accounts & Audit Logs (Page 13)
  const [adminUsersList, setAdminUsersList] = useState([
    { id: 1, name: 'Maria Santos', role: 'Student', account: 'Active' },
    { id: 2, name: 'Ramon Alcantara', role: 'Registrar', account: 'Active' },
    { id: 3, name: 'Leah Navarro', role: 'Cashier', account: 'Active' },
    { id: 4, name: 'Dina Flores', role: 'Department Staff', account: 'Disabled' },
    { id: 5, name: 'Victor Ramos', role: 'Admin', account: 'Active' },
  ]);

  const [auditLogsList, setAuditLogsList] = useState([
    { id: 1, time: '10:42 AM', action: 'Payment recorded', detail: 'L. Navarro • OR-2026-005104' },
    { id: 2, time: '10:31 AM', action: 'Enrollment approved', detail: 'R. Alcantara • Miguel Reyes' },
    { id: 3, time: '09:58 AM', action: 'Account disabled', detail: 'V. Ramos • Dina Flores' },
    { id: 4, time: '09:17 AM', action: 'Grade sheet updated', detail: 'R. Alcantara • CS 101' },
  ]);

  // Trigger toast helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add an audit log entry helper
  const recordAuditLog = (action, detail) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAuditLogsList(prev => [
      { id: Date.now(), time: timeStr, action, detail },
      ...prev,
    ]);
  };

  // Financial Calculations
  const totalAssessed = assessedFees.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = paymentHistory.reduce((acc, curr) => acc + curr.amount, 0);
  const outstandingBalance = Math.max(0, totalAssessed - totalPaid);

  // GWA Calculation
  const totalUnits = gradeReports.reduce((acc, curr) => acc + curr.units, 0);
  const totalGradePoints = gradeReports.reduce((acc, curr) => acc + (curr.grade * curr.units), 0);
  const overallGWA = totalUnits > 0 ? (totalGradePoints / totalUnits).toFixed(2) : '1.45';

  // Cleared Departments Count
  const clearedCount = clearanceList.filter(c => c.status === 'Cleared').length;

  // Change user role and redirect to default view
  const switchRole = (role) => {
    const targetUser = demoUsers.find(u => u.role.toLowerCase() === role.toLowerCase());
    if (targetUser) {
      setCurrentUser(targetUser);
      if (targetUser.role === 'Student') setCurrentView('dashboard');
      else if (targetUser.role === 'Registrar') setCurrentView('approvals');
      else if (targetUser.role === 'Cashier') setCurrentView('process_payment');
      else if (targetUser.role === 'Department Staff') setCurrentView('clearance_requests');
      else if (targetUser.role === 'Admin') setCurrentView('user_accounts');
      showToast(`Switched view to ${targetUser.name} (${targetUser.role})`);
    }
  };

  // Switch to Login View
  const handleLogout = () => {
    setCurrentView('login');
    showToast('Logged out of SSIS.');
  };

  const handleLogin = (selectedRole) => {
    switchRole(selectedRole);
  };

  // Load backend state on mount if API available
  useEffect(() => {
    fetch('/api/bootstrap')
      .then(res => res.json())
      .then(data => {
        if (data.auditLogs && data.auditLogs.length > 0) {
          setAuditLogsList(data.auditLogs.map(l => ({
            id: l.id,
            time: l.time,
            action: l.action,
            detail: `${l.user} • ${l.detail}`,
          })));
        }
      })
      .catch(err => console.log('Running in client state with real-time reactivity:', err));
  }, []);

  return (
    <AppContext.Provider
      value={{
        demoUsers,
        currentUser,
        setCurrentUser,
        currentView,
        setCurrentView,
        searchQuery,
        setSearchQuery,
        toastMessage,
        showToast,
        activeReceipt,
        setActiveReceipt,
        isAddUserModalOpen,
        setIsAddUserModalOpen,
        switchRole,
        handleLogout,
        handleLogin,
        recordAuditLog,

        // Student Enrollment
        scheduleCourses,
        setScheduleCourses,
        enrollmentStatus,
        setEnrollmentStatus,

        // Financials
        assessedFees,
        paymentHistory,
        setPaymentHistory,
        totalAssessed,
        totalPaid,
        outstandingBalance,

        // Grades
        gradeReports,
        setGradeReports,
        overallGWA,

        // Documents
        documentRequests,
        setDocumentRequests,

        // Clearance
        clearanceList,
        setClearanceList,
        clearedCount,

        // Registrar
        registrarQueue,
        setRegistrarQueue,
        selectedQueueStudentId,
        setSelectedQueueStudentId,
        encodeGradesList,
        setEncodeGradesList,
        registrarDocumentQueue,
        setRegistrarDocumentQueue,

        // Department Staff
        departmentStaffClearanceQueue,
        setDepartmentStaffClearanceQueue,

        // Admin
        adminUsersList,
        setAdminUsersList,
        auditLogsList,
        setAuditLogsList,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
