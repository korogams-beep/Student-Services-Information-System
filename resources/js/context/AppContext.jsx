import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Institutional Staff Accounts for CuyoTech University
  // Per requirement: Dummy data is strictly for Cashier, Registrar, Dept Staff, and Admin.
  // Student accounts start fresh with all default 0 upon Sign Up.
  const initialUsers = [
    {
      id: 2,
      name: 'Ramon Alcantara',
      email: 'r.alcantara@cuyotech.edu.ph',
      username: 'r.alcantara',
      role: 'Registrar',
      initials: 'RA',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Leah Navarro',
      email: 'l.navarro@cuyotech.edu.ph',
      username: 'l.navarro',
      role: 'Cashier',
      initials: 'LN',
      counterNo: 3,
      status: 'Active',
    },
    {
      id: 4,
      name: 'Dina Flores',
      email: 'd.flores@cuyotech.edu.ph',
      username: 'd.flores',
      role: 'Department Staff',
      initials: 'DF',
      department: 'College of Computing Studies',
      status: 'Active',
    },
    {
      id: 5,
      name: 'Victor Ramos',
      email: 'v.ramos@cuyotech.edu.ph',
      username: 'v.ramos',
      role: 'Admin',
      initials: 'VR',
      status: 'Active',
    },
  ];

  // Auth & Navigation state
  const [demoUsers, setDemoUsers] = useState(initialUsers);
  const [currentUser, setCurrentUser] = useState(initialUsers[0]);
  const [currentView, setCurrentView] = useState('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Student Enrollment Schedule catalog (Official PNC College of Computing Studies Courses)
  const [scheduleCourses, setScheduleCourses] = useState([
    { id: 1, code: 'CCS109', title: 'System Analysis and Design', units: 3, schedule: 'M/W 9:00–10:30', room: 'CL-101', slots: 15, selected: false },
    { id: 2, code: 'CCS112', title: 'Applications Development and Emerging Technologies', units: 3, schedule: 'T/Th 10:30–12:00', room: 'CL-102', slots: 12, selected: false },
    { id: 3, code: 'CSP108', title: 'Programming Languages', units: 3, schedule: 'M/W 13:00–14:30', room: 'CL-203', slots: 18, selected: false },
    { id: 4, code: 'CCS106', title: 'Social Issues and Professional Practice', units: 3, schedule: 'T/Th 13:00–15:00', room: 'AS-301', slots: 20, selected: false },
    { id: 5, code: 'CSEG1', title: 'Game Concepts and Production', units: 3, schedule: 'F 8:00–11:00', room: 'CL-204', slots: 10, selected: false },
    { id: 6, code: 'ENV101', title: 'Environmental Science', units: 3, schedule: 'M/W 15:00–16:30', room: 'SC-101', slots: 25, selected: false },
    { id: 7, code: 'CSP105', title: 'Algorithms and Complexity', units: 3, schedule: 'T/Th 15:00–17:00', room: 'CL-103', slots: 14, selected: false },
  ]);
  const [enrollmentStatus, setEnrollmentStatus] = useState('Pending');

  // Student Financial Data (Default 0 for new students; populated when Cashier assesses or processes payments)
  const [assessedFees, setAssessedFees] = useState([]);

  // Cashier Historical Payment Ledger
  const [paymentHistory, setPaymentHistory] = useState([]);

  // All student financial assessments directory
  const [studentAssessmentsList, setStudentAssessmentsList] = useState([]);

  // Per-student grades database (Starts empty; populated when Registrar encodes grades)
  const [studentGradesMap, setStudentGradesMap] = useState({});

  // Current logged in student's grade reports
  const [gradeReports, setGradeReports] = useState([]);

  // Student Document Requests Data (Starts empty; populated when student applies)
  const [documentRequests, setDocumentRequests] = useState([]);

  // Student Clearance Data (Default: all 5 university departments Pending; 0 Cleared)
  const [clearanceList, setClearanceList] = useState([
    { id: 1, department: 'University Library', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting book return audit' },
    { id: 2, department: 'Computer Laboratory', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting workstation & equipment check' },
    { id: 3, department: 'Guidance & Counseling', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting student counseling verification' },
    { id: 4, department: 'Office of Student Affairs', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting student organization clearance' },
    { id: 5, department: 'College Dean', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting Dean final sign-off' },
  ]);

  // Registrar Enrollment Request Queue
  const [registrarQueue, setRegistrarQueue] = useState([]);
  const [selectedQueueStudentId, setSelectedQueueStudentId] = useState(null);

  // Registrar Academic Records & Grade Encoding sheet
  const [encodeGradesList, setEncodeGradesList] = useState([]);

  // Registrar Document Requests Queue
  const [registrarDocumentQueue, setRegistrarDocumentQueue] = useState([]);

  // Department Staff Clearance Queue (Starts empty; populated when students apply for clearance review)
  const [departmentStaffClearanceQueue, setDepartmentStaffClearanceQueue] = useState([]);

  // Department Staff Processed / Completed Clearance Archive
  const [completedClearanceList, setCompletedClearanceList] = useState([]);

  const [departmentRulesList, setDepartmentRulesList] = useState([
    { id: 1, title: 'Hardware & Equipment Return', description: 'All laboratory headsets, test cables, microcontroller units, and toolkits must be surrendered to the custodian in good physical condition.', active: true },
    { id: 2, title: 'Workstation Cleanliness & Audit', description: 'Terminals must be checked for unauthorized software or personal local data before semester end.', active: true },
    { id: 3, title: 'Final Project Repository & Documentation', description: 'Students enrolled in computing lab subjects must submit their approved lab projects to the departmental repository.', active: true },
    { id: 4, title: 'Locker Key Surrender', description: 'Department-assigned storage lockers must be emptied and keys returned to the department secretary.', active: false },
  ]);

  // Admin User Accounts & Audit Logs
  const [adminUsersList, setAdminUsersList] = useState([
    { id: 2, name: 'Ramon Alcantara', role: 'Registrar', account: 'Active', email: 'r.alcantara@cuyotech.edu.ph' },
    { id: 3, name: 'Leah Navarro', role: 'Cashier', account: 'Active', email: 'l.navarro@cuyotech.edu.ph' },
    { id: 4, name: 'Dina Flores', role: 'Department Staff', account: 'Active', email: 'd.flores@cuyotech.edu.ph' },
    { id: 5, name: 'Victor Ramos', role: 'Admin', account: 'Active', email: 'v.ramos@cuyotech.edu.ph' },
  ]);

  const [auditLogsList, setAuditLogsList] = useState([
    { id: 1, time: '10:42 AM', action: 'System initialized', detail: 'CuyoTech SSIS Database connected', user: 'System' },
    { id: 2, time: '10:31 AM', action: 'Session started', detail: 'CuyoTech University Portal online', user: 'System' },
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
      { id: Date.now(), time: timeStr, action, detail, user: currentUser?.name || 'User' },
      ...prev,
    ]);
  };

  // Official Course Title Lookup
  const OFFICIAL_COURSE_TITLES = {
    'CCS109': 'System Analysis and Design',
    'CCS112': 'Applications Development and Emerging Technologies',
    'CSP108': 'Programming Languages',
    'CCS106': 'Social Issues and Professional Practice',
    'CSEG1': 'Game Concepts and Production',
    'ENV101': 'Environmental Science',
    'CSP105': 'Algorithms and Complexity',
  };

  // Update grades and keep student records completely synchronized!
  const updateGradeRecord = (studentIdNum, newGradeValue, subjectCode = 'CCS109') => {
    const numericGrade = parseFloat(newGradeValue) || 0.00;
    const remarks = (numericGrade > 0 && numericGrade <= 3.0) ? 'Passed' : 'Failed';
    const courseTitle = OFFICIAL_COURSE_TITLES[subjectCode] || 'Course Subject';

    // 1. Update encodeGradesList in Registrar view
    setEncodeGradesList(prev =>
      prev.map(row => row.studentId === studentIdNum ? { ...row, grade: newGradeValue } : row)
    );

    // 2. Update studentGradesMap
    setStudentGradesMap(prev => {
      const studentGrades = prev[studentIdNum] || [];
      const exists = studentGrades.some(g => g.code === subjectCode || (g.subject && g.subject.includes(subjectCode)));

      let updated;
      if (exists) {
        updated = studentGrades.map(g => {
          if (g.code === subjectCode || (g.subject && g.subject.includes(subjectCode))) {
            return { ...g, grade: numericGrade, remarks, subject: `${subjectCode} - ${courseTitle}` };
          }
          return g;
        });
      } else {
        const newCourseGrade = {
          id: Date.now(),
          code: subjectCode,
          subject: `${subjectCode} - ${courseTitle}`,
          units: 3,
          grade: numericGrade,
          remarks,
        };
        updated = [...studentGrades, newCourseGrade];
      }

      return { ...prev, [studentIdNum]: updated };
    });

    // 3. If currently logged in as this student, update active gradeReports immediately
    const currentStudentId = currentUser?.student_id_number || currentUser?.studentId;
    if (studentIdNum === currentStudentId) {
      setGradeReports(prev => {
        const exists = prev.some(g => g.code === subjectCode || (g.subject && g.subject.includes(subjectCode)));
        if (exists) {
          return prev.map(g => {
            if (g.code === subjectCode || (g.subject && g.subject.includes(subjectCode))) {
              return { ...g, grade: numericGrade, remarks, subject: `${subjectCode} - ${courseTitle}` };
            }
            return g;
          });
        }
        return [...prev, {
          id: Date.now(),
          code: subjectCode,
          subject: `${subjectCode} - ${courseTitle}`,
          units: 3,
          grade: numericGrade,
          remarks,
        }];
      });
    }
  };

  // Submit Enrollment Request (pushes to Registrar Queue & backend)
  const submitEnrollmentRequest = (courses) => {
    const selected = courses || scheduleCourses.filter(c => c.selected);
    if (!selected || selected.length === 0) return false;

    const totalUnitsCount = selected.reduce((sum, c) => sum + (Number(c.units) || 3), 0);
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const newQueueItem = {
      id: Date.now(),
      studentId: currentUser?.id || 1,
      studentName: currentUser?.name || 'Student',
      studentIdNumber: currentUser?.student_id_number || currentUser?.studentId || '2026-0001',
      program: currentUser?.program || 'BS Computer Science',
      yearLevel: currentUser?.year_level ? `${currentUser.year_level} Year` : '2nd Year',
      courses: selected,
      totalUnits: totalUnitsCount,
      submittedAt: today,
      status: 'Pending',
      validation: { prerequisites: true, curriculum: true, accounts: true }
    };

    setEnrollmentStatus('Pending');
    setRegistrarQueue(prev => [newQueueItem, ...prev.filter(q => q.studentIdNumber !== newQueueItem.studentIdNumber)]);
    setSelectedQueueStudentId(newQueueItem.id);

    showToast(`Enrollment request for ${selected.length} subjects (${totalUnitsCount} units) submitted to Registrar!`);
    recordAuditLog('Enrollment submitted', `${currentUser?.name || 'Student'} • ${selected.length} subjects (${totalUnitsCount} units)`);

    fetch('/api/enrollment/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: currentUser?.id || 1,
        section_ids: selected.map(c => c.id),
      }),
    }).catch(err => console.log('Client-side synced', err));

    return true;
  };

  // Registrar Approve Enrollment Request
  const approveEnrollmentRequest = (queueItemId) => {
    const targetItem = registrarQueue.find(q => q.id === queueItemId);
    if (!targetItem) return;

    setRegistrarQueue(prev =>
      prev.map(q => q.id === queueItemId ? { ...q, status: 'Approved' } : q)
    );

    // Update student's enrollmentStatus
    setEnrollmentStatus('Approved');

    // Create fee assessment for Cashier
    const units = targetItem.totalUnits || 3;
    const tuitionAmount = units * 1500;
    const miscAmount = 2500;
    const totalAssessedAmount = tuitionAmount + miscAmount;

    const newAssessment = {
      id: Date.now(),
      studentId: targetItem.studentIdNumber || targetItem.studentId,
      studentName: targetItem.studentName,
      program: targetItem.program,
      schoolYear: '2025-2026',
      semester: '2nd Semester',
      totalAmount: totalAssessedAmount,
      totalAssessed: totalAssessedAmount,
      totalPaid: 0.00,
      balance: totalAssessedAmount,
      status: 'Unpaid',
      units: units,
      items: [
        { id: 1, feeType: `Tuition & Laboratory (${units} units @ 1,500/unit)`, amount: tuitionAmount },
        { id: 2, feeType: 'Registration, Library & Athletic Fee', amount: miscAmount },
      ]
    };

    setStudentAssessmentsList(prev => [
      newAssessment,
      ...prev.filter(a => a.studentId !== newAssessment.studentId)
    ]);

    setAssessedFees(newAssessment.items);

    showToast(`Enrollment for ${targetItem.studentName} approved! Assessment forwarded to Cashier.`);
    recordAuditLog('Enrollment approved', `R. Alcantara • ${targetItem.studentName} (${units} units)`);

    fetch(`/api/registrar/enrollments/${queueItemId}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Approved' }),
    }).catch(err => console.log('Client-side synced', err));
  };

  // Registrar Reject Enrollment Request
  const rejectEnrollmentRequest = (queueItemId) => {
    const targetItem = registrarQueue.find(q => q.id === queueItemId);
    if (!targetItem) return;

    setRegistrarQueue(prev =>
      prev.map(q => q.id === queueItemId ? { ...q, status: 'Rejected' } : q)
    );
    setEnrollmentStatus('Rejected');

    showToast(`Enrollment for ${targetItem.studentName} rejected.`);
    recordAuditLog('Enrollment rejected', `R. Alcantara • ${targetItem.studentName}`);

    fetch(`/api/registrar/enrollments/${queueItemId}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Rejected' }),
    }).catch(err => console.log('Client-side synced', err));
  };

  // Student Submit Document Request
  const submitDocumentRequest = ({ docType, purpose, copies }) => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const numCopies = parseInt(copies, 10) || 1;
    const newDoc = {
      id: Date.now(),
      document: docType,
      request: docType,
      purpose: purpose || 'Official requirements',
      copies: numCopies,
      submitted: today,
      date: today,
      status: 'Pending',
      studentName: currentUser?.name || 'Student',
      studentId: currentUser?.student_id_number || currentUser?.studentId || '2026-0001',
    };

    setDocumentRequests(prev => [newDoc, ...prev]);
    setRegistrarDocumentQueue(prev => [newDoc, ...prev]);

    showToast(`Request for ${docType} submitted to the Registrar!`);
    recordAuditLog('Document requested', `${currentUser?.name || 'Student'} • ${docType} (${numCopies} copy)`);

    fetch('/api/documents/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: currentUser?.id || 1,
        document_type: docType,
        purpose,
        number_of_copies: numCopies,
      }),
    }).catch(err => console.log('Client-side synced', err));

    return newDoc;
  };

  // Registrar Update Document Request Status (Approve or Release)
  const updateDocumentRequestStatus = (id, newStatus) => {
    const approverName = currentUser?.name ? `${currentUser.name} (${currentUser.role || 'Registrar'})` : 'Ramon Alcantara (Registrar)';
    const processedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    // Synchronize both Student and Registrar lists
    setDocumentRequests(prev => {
      const match = prev.some(row => row.id === id || String(row.id) === String(id));
      if (match) {
        return prev.map(row => (row.id === id || String(row.id) === String(id)) ? { 
          ...row, 
          status: newStatus,
          approvedBy: approverName,
          processedAt,
        } : row);
      }
      const inQueue = registrarDocumentQueue.find(row => row.id === id || String(row.id) === String(id));
      if (inQueue) {
        return [{ ...inQueue, status: newStatus, approvedBy: approverName, processedAt }, ...prev];
      }
      return prev;
    });

    setRegistrarDocumentQueue(prev => {
      const exists = prev.some(row => row.id === id || String(row.id) === String(id));
      if (exists) {
        return prev.map(row => (row.id === id || String(row.id) === String(id)) ? { 
          ...row, 
          status: newStatus,
          approvedBy: approverName,
          processedAt,
        } : row);
      }
      const doc = documentRequests.find(row => row.id === id || String(row.id) === String(id));
      if (doc) {
        return [{ ...doc, status: newStatus, approvedBy: approverName, processedAt }, ...prev];
      }
      return prev;
    });

    showToast(`Document request updated to "${newStatus}" by ${approverName}.`);
    recordAuditLog('Document request updated', `${approverName} • Status: ${newStatus}`);

    fetch(`/api/registrar/documents/${id}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, approved_by: approverName }),
    }).catch(err => console.log('Client-side synced', err));
  };

  // Student Apply for Departmental Clearance Review
  const applyForClearanceReview = (targetDepartment = 'Computer Laboratory') => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const studentName = currentUser?.name || 'Student';
    const studentId = currentUser?.student_id_number || currentUser?.studentId || '2026-0001';

    // Use a composite key (studentId + department + timestamp) to guarantee uniqueness
    // even when multiple departments are submitted in the same millisecond via forEach
    const uniqueId = `${studentId}-${targetDepartment.replace(/\s+/g, '_')}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const newClearanceItem = {
      id: uniqueId,
      studentName,
      studentId,
      department: targetDepartment,
      remarks: 'Student applied for departmental clearance review & audit',
      status: 'Pending Review',
      date: today,
    };

    // Forward immediately to Department Staff queue
    // De-duplicate by (studentId + department) exact match only
    setDepartmentStaffClearanceQueue(prev => [
      newClearanceItem,
      ...prev.filter(q => !(q.studentId === studentId && q.department === targetDepartment)),
    ]);

    // Update student's local clearance table — EXACT match only, no substring
    setClearanceList(prev =>
      prev.map(c => c.department === targetDepartment ? {
        ...c,
        lastUpdated: today,
        status: 'Pending',
        remarks: 'Clearance review submitted • Awaiting staff sign-off',
      } : c)
    );

    showToast(`Clearance review application for ${targetDepartment} submitted to Department Staff!`);
    recordAuditLog('Clearance applied', `${studentName} • ${targetDepartment}`);

    fetch('/api/clearance/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: currentUser?.id || 1, department: targetDepartment }),
    }).catch(err => console.log('Client-side synced', err));

    return newClearanceItem;
  };

  // Batch-apply clearance review for multiple departments atomically (single state update per setter)
  // This avoids the forEach stale-closure bug where rapid successive calls see stale queue state.
  const applyForAllClearanceDepartments = (pendingDeptList) => {
    if (!pendingDeptList || pendingDeptList.length === 0) return;

    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const studentName = currentUser?.name || 'Student';
    const studentId = currentUser?.student_id_number || currentUser?.studentId || '2026-0001';

    // Build one unique item per department
    const newItems = pendingDeptList.map((dept, idx) => ({
      id: `${studentId}-${dept.department.replace(/\s+/g, '_')}-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      studentName,
      studentId,
      department: dept.department,
      remarks: 'Student applied for departmental clearance review & audit',
      status: 'Pending Review',
      date: today,
    }));

    const deptNamesSet = new Set(pendingDeptList.map(d => d.department));

    // Single atomic state update for the queue
    setDepartmentStaffClearanceQueue(prev => [
      ...newItems,
      ...prev.filter(q => !(q.studentId === studentId && deptNamesSet.has(q.department))),
    ]);

    // Single atomic state update for student clearance list
    setClearanceList(prev =>
      prev.map(c => deptNamesSet.has(c.department) ? {
        ...c,
        lastUpdated: today,
        status: 'Pending',
        remarks: 'Clearance review submitted \u2022 Awaiting staff sign-off',
      } : c)
    );

    recordAuditLog('Clearance applied (batch)', `${studentName} • ${pendingDeptList.length} departments`);
  };

  // Financial Calculations for active student
  const activeStudentId = currentUser?.student_id_number || currentUser?.studentId;
  const currentStudentAssessment = studentAssessmentsList.find(a => a.studentId === activeStudentId);
  const totalAssessed = currentStudentAssessment?.totalAssessed || (assessedFees.reduce((acc, curr) => acc + curr.amount, 0));
  const totalPaid = currentStudentAssessment?.totalPaid || paymentHistory.filter(p => p.studentId === activeStudentId).reduce((acc, curr) => acc + curr.amount, 0);
  const outstandingBalance = Math.max(0, totalAssessed - totalPaid);

  // GWA Calculation
  const totalUnits = gradeReports.reduce((acc, curr) => acc + (Number(curr.units) || 3), 0);
  const totalGradePoints = gradeReports.reduce((acc, curr) => acc + (parseFloat(curr.grade) * (Number(curr.units) || 3)), 0);
  const overallGWA = totalUnits > 0 ? (totalGradePoints / totalUnits).toFixed(2) : '0.00';

  // Cleared Departments Count
  const clearedCount = clearanceList.filter(c => c.status === 'Cleared').length;

  // Change user role and redirect to default view
  const switchRole = (role, specificUser = null) => {
    const targetUser = specificUser || demoUsers.find(u => u.role.toLowerCase() === role.toLowerCase());
    if (targetUser) {
      setCurrentUser(targetUser);

      if (targetUser.role === 'Student') {
        const studentGrades = studentGradesMap[targetUser.student_id_number] || [];
        setGradeReports(studentGrades);
        setCurrentView('dashboard');
      } else if (targetUser.role === 'Registrar') setCurrentView('approvals');
      else if (targetUser.role === 'Cashier') setCurrentView('process_payment');
      else if (targetUser.role === 'Department Staff') setCurrentView('clearance_requests');
      else if (targetUser.role === 'Admin') setCurrentView('user_accounts');

      showToast(`Switched view to ${targetUser.name} (${targetUser.role})`);
    }
  };

  // Logout
  const handleLogout = () => {
    setCurrentView('login');
    showToast('Logged out of CuyoTech University SSIS.');
  };

  const handleLogin = (selectedRole) => {
    switchRole(selectedRole);
  };

  // Login with real credentials / Sign In
  const loginWithCredentials = async (emailOrId, password, selectedRole) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_or_id: emailOrId, password, role: selectedRole }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          setDemoUsers(prev => {
            if (!prev.some(u => u.id === data.user.id || u.email === data.user.email)) {
              return [data.user, ...prev];
            }
            return prev;
          });

          // Sync student data if logging in as student
          if (data.user.role === 'Student') {
            const sId = data.user.student_id_number;
            const grades = studentGradesMap[sId] || [];
            setGradeReports(grades);

            const assess = studentAssessmentsList.find(a => a.studentId === sId);
            if (assess && assess.totalAssessed > 0) {
              setAssessedFees([
                { id: 1, category: 'Tuition Assessment', amount: assess.totalAssessed * 0.75 },
                { id: 2, category: 'Laboratory & Misc fees', amount: assess.totalAssessed * 0.25 },
              ]);
            } else {
              setAssessedFees([]);
            }

            setCurrentView('dashboard');
          } else if (data.user.role === 'Registrar') setCurrentView('approvals');
          else if (data.user.role === 'Cashier') setCurrentView('process_payment');
          else if (data.user.role === 'Department Staff') setCurrentView('clearance_requests');
          else if (data.user.role === 'Admin') setCurrentView('user_accounts');

          showToast(`Welcome back, ${data.user.name}!`);
          return { success: true, user: data.user };
        }
      }
    } catch (err) {
      console.log('Login API network error, trying local demo users:', err);
    }

    // Client-side fallback check
    const found = demoUsers.find(u =>
      (u.email?.toLowerCase() === emailOrId.toLowerCase()) ||
      (u.student_id_number?.toLowerCase() === emailOrId.toLowerCase()) ||
      (u.username?.toLowerCase() === emailOrId.toLowerCase()) ||
      (u.name?.toLowerCase() === emailOrId.toLowerCase())
    );

    if (found) {
      setCurrentUser(found);
      if (found.role === 'Student') {
        const sId = found.student_id_number;
        const studentGrades = studentGradesMap[sId] || [];
        setGradeReports(studentGrades);
        setCurrentView('dashboard');
      } else if (found.role === 'Registrar') setCurrentView('approvals');
      else if (found.role === 'Cashier') setCurrentView('process_payment');
      else if (found.role === 'Department Staff') setCurrentView('clearance_requests');
      else if (found.role === 'Admin') setCurrentView('user_accounts');

      showToast(`Welcome back, ${found.name}!`);
      return { success: true };
    }

    showToast(`User not found. Please register or check credentials.`);
    return { success: false };
  };

  // Sign Up / Register new account (Stored in MySQL backend and local state)
  // Per requirement: All student info starts as default 0.
  const signUpUser = async (formData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        const newUser = data.user;

        // Register in demoUsers & adminUsersList
        setDemoUsers(prev => [newUser, ...prev]);
        setAdminUsersList(prev => [
          { id: newUser.id, name: newUser.name, role: newUser.role, account: 'Active', email: newUser.email },
          ...prev,
        ]);

        if (newUser.role === 'Student') {
          // Fresh student: ALL DEFAULT 0!
          // 0 grades, 0 assessments, 0 balance, 0 clearance
          setStudentGradesMap(prev => ({
            ...prev,
            [newUser.student_id_number]: [],
          }));

          setGradeReports([]);
          setAssessedFees([]);
          setDocumentRequests([]);

          setStudentAssessmentsList(prev => [
            { id: Date.now(), studentId: newUser.student_id_number, name: newUser.name, program: newUser.program, totalAssessed: 0.00, totalPaid: 0.00, balance: 0.00, status: 'Unassessed' },
            ...prev,
          ]);

          // Also add to encodeGradesList so Registrar can immediately encode grades for them!
          setEncodeGradesList(prev => [
            ...prev,
            { id: Date.now(), studentId: newUser.student_id_number, studentName: newUser.name, grade: '1.75' },
          ]);
        }

        // Set active user and navigate
        setCurrentUser(newUser);
        if (newUser.role === 'Student') setCurrentView('dashboard');
        else if (newUser.role === 'Registrar') setCurrentView('approvals');
        else if (newUser.role === 'Cashier') setCurrentView('process_payment');
        else if (newUser.role === 'Department Staff') setCurrentView('clearance_requests');
        else if (newUser.role === 'Admin') setCurrentView('user_accounts');

        showToast(`Account created! Welcome to CuyoTech University, ${newUser.name}.`);
        recordAuditLog('New account registered', `${newUser.name} (${newUser.role})`);
        return { success: true, user: newUser };
      }
    } catch (err) {
      console.log('Register API network error, creating client account:', err);
    }

    // Client-side fallback registration
    const fallbackId = Date.now();
    const studentIdNum = formData.student_id_number || `2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const nameParts = formData.name.split(' ');
    const initials = (nameParts[0]?.[0] || 'U') + (nameParts[1]?.[0] || 'S');

    const newUser = {
      id: fallbackId,
      name: formData.name,
      email: formData.email,
      student_id_number: studentIdNum,
      role: formData.role || 'Student',
      initials: initials.toUpperCase(),
      program: formData.program || 'BS Computer Science',
      yearLevel: formData.year_level ? `${formData.year_level} Year` : '1st Year',
      status: 'Active',
    };

    setDemoUsers(prev => [newUser, ...prev]);
    setAdminUsersList(prev => [
      { id: newUser.id, name: newUser.name, role: newUser.role, account: 'Active', email: newUser.email },
      ...prev,
    ]);

    if (newUser.role === 'Student') {
      // Fresh student: ALL DEFAULT 0!
      setStudentGradesMap(prev => ({
        ...prev,
        [studentIdNum]: [],
      }));

      setGradeReports([]);
      setAssessedFees([]);
      setDocumentRequests([]);

      setStudentAssessmentsList(prev => [
        { id: Date.now(), studentId: studentIdNum, name: newUser.name, program: newUser.program, totalAssessed: 0.00, totalPaid: 0.00, balance: 0.00, status: 'Unassessed' },
        ...prev,
      ]);

      setEncodeGradesList(prev => [
        ...prev,
        { id: Date.now(), studentId: studentIdNum, studentName: newUser.name, grade: '1.75' },
      ]);
    }

    setCurrentUser(newUser);
    if (newUser.role === 'Student') setCurrentView('dashboard');
    else if (newUser.role === 'Registrar') setCurrentView('approvals');
    else if (newUser.role === 'Cashier') setCurrentView('process_payment');
    else if (newUser.role === 'Department Staff') setCurrentView('clearance_requests');
    else if (newUser.role === 'Admin') setCurrentView('user_accounts');

    showToast(`Account created! Welcome, ${newUser.name}.`);
    recordAuditLog('New account registered', `${newUser.name} (${newUser.role})`);
    return { success: true, user: newUser };
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
            user: l.user,
          })));
        }
        if (data.studentsList && data.studentsList.length > 0) {
          // Merge registered students into demoUsers
          const dbStudents = data.studentsList.map(s => ({
            id: s.id,
            name: `${s.first_name} ${s.last_name}`,
            email: s.email,
            student_id_number: s.student_id_number,
            role: 'Student',
            initials: (s.first_name[0] || 'S') + (s.last_name[0] || 'T'),
            program: s.program?.program_name || 'BS Computer Science',
            yearLevel: `${s.year_level || 1} Year`,
            status: s.account_status || 'Active',
          }));

          setDemoUsers(prev => {
            const existingEmails = new Set(prev.map(p => p.email));
            const newOnes = dbStudents.filter(s => !existingEmails.has(s.email));
            return [...prev, ...newOnes];
          });
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
        loginWithCredentials,
        signUpUser,
        recordAuditLog,

        // Student Enrollment
        scheduleCourses,
        setScheduleCourses,
        enrollmentStatus,
        setEnrollmentStatus,
        submitEnrollmentRequest,
        approveEnrollmentRequest,
        rejectEnrollmentRequest,

        // Financials & Cashier
        assessedFees,
        setAssessedFees,
        paymentHistory,
        setPaymentHistory,
        studentAssessmentsList,
        setStudentAssessmentsList,
        totalAssessed,
        totalPaid,
        outstandingBalance,

        // Grades & Records
        gradeReports,
        setGradeReports,
        studentGradesMap,
        setStudentGradesMap,
        updateGradeRecord,
        overallGWA,

        // Documents
        documentRequests,
        setDocumentRequests,
        submitDocumentRequest,
        updateDocumentRequestStatus,

        // Clearance & Department Staff
        clearanceList,
        setClearanceList,
        clearedCount,
        departmentStaffClearanceQueue,
        setDepartmentStaffClearanceQueue,
        completedClearanceList,
        setCompletedClearanceList,
        departmentRulesList,
        setDepartmentRulesList,
        applyForClearanceReview,
        applyForAllClearanceDepartments,

        // Registrar
        registrarQueue,
        setRegistrarQueue,
        selectedQueueStudentId,
        setSelectedQueueStudentId,
        encodeGradesList,
        setEncodeGradesList,
        registrarDocumentQueue,
        setRegistrarDocumentQueue,

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
