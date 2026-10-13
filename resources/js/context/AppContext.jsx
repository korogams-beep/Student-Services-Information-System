import React, { createContext, useContext, useState, useEffect } from 'react';

export const getRolePrefix = (role) => {
  switch (role) {
    case 'Registrar': return 'REG';
    case 'Cashier': return 'CSH';
    case 'Department Staff':
    case 'DepartmentStaff': return 'STF';
    case 'Admin': return 'ADM';
    case 'Student':
    default: return 'STU';
  }
};

export const generateUniqueAccountId = (role, existingUsers = []) => {
  const prefix = getRolePrefix(role);
  const year = '2026';
  let candidate = '';
  let attempts = 0;
  do {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    candidate = `${prefix}-${year}-${randomNum}`;
    attempts++;
  } while (
    attempts < 50 &&
    existingUsers.some(u =>
      (u.account_id && u.account_id.toLowerCase() === candidate.toLowerCase()) ||
      (u.student_id_number && u.student_id_number.toLowerCase() === candidate.toLowerCase()) ||
      (u.username && u.username.toLowerCase() === candidate.toLowerCase())
    )
  );
  return candidate;
};

export const reassignRoleAccountId = (currentId, newRole, existingUsers = []) => {
  const newPrefix = getRolePrefix(newRole);
  const year = '2026';
  // Try to preserve the unique numeric sequence from existing ID if available
  const match = (currentId || '').match(/\d{4,}$/);
  const suffixNum = match ? match[0] : Math.floor(1000 + Math.random() * 9000).toString();
  let candidate = `${newPrefix}-${year}-${suffixNum}`;

  let attempts = 0;
  while (
    attempts < 50 &&
    existingUsers.some(u =>
      ((u.account_id && u.account_id.toLowerCase() === candidate.toLowerCase() && u.account_id !== currentId) ||
       (u.student_id_number && u.student_id_number.toLowerCase() === candidate.toLowerCase() && u.student_id_number !== currentId))
    )
  ) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    candidate = `${newPrefix}-${year}-${randomNum}`;
    attempts++;
  }
  return candidate;
};

const AppContext = createContext();

export const INSTITUTIONAL_STAFF = [
  {
    id: 'staff-registrar',
    name: 'Ramon Alcantara',
    email: 'r.alcantara@cuyotech.edu.ph',
    username: 'r.alcantara',
    account_id: 'REG-2026-0001',
    student_id_number: 'REG-2026-0001',
    role: 'Registrar',
    initials: 'RA',
    status: 'Active',
    account: 'Active',
  },
  {
    id: 'staff-cashier',
    name: 'Leah Navarro',
    email: 'l.navarro@cuyotech.edu.ph',
    username: 'l.navarro',
    account_id: 'CSH-2026-0001',
    student_id_number: 'CSH-2026-0001',
    role: 'Cashier',
    initials: 'LN',
    counterNo: 3,
    status: 'Active',
    account: 'Active',
  },
  {
    id: 'staff-dept',
    name: 'Dina Flores',
    email: 'd.flores@cuyotech.edu.ph',
    username: 'd.flores',
    account_id: 'STF-2026-0001',
    student_id_number: 'STF-2026-0001',
    role: 'Department Staff',
    initials: 'DF',
    department: 'College of Computing Studies',
    status: 'Active',
    account: 'Active',
  },
  {
    id: 'staff-admin',
    name: 'Victor Ramos',
    email: 'v.ramos@cuyotech.edu.ph',
    username: 'v.ramos',
    account_id: 'ADM-2026-0001',
    student_id_number: 'ADM-2026-0001',
    role: 'Admin',
    initials: 'VR',
    status: 'Active',
    account: 'Active',
  },
];

export const formatYearLevel = (val) => {
  if (!val) return '1st Year';
  const str = String(val).trim();
  if (/^[1-4](st|nd|rd|th)\s+Year$/i.test(str)) {
    const digit = str.charAt(0);
    const suffix = digit === '1' ? 'st' : digit === '2' ? 'nd' : digit === '3' ? 'rd' : 'th';
    return `${digit}${suffix} Year`;
  }
  const match = str.match(/\d+/);
  const num = match ? parseInt(match[0], 10) : 1;
  switch (num) {
    case 1: return '1st Year';
    case 2: return '2nd Year';
    case 3: return '3rd Year';
    case 4: return '4th Year';
    default: return `${num}th Year`;
  }
};

export const isLegacyDummyStudent = (u) => {
  if (u.role !== 'Student') return false;
  const name = (u.name || '').trim().toLowerCase();
  const email = (u.email || '').trim().toLowerCase();

  const dummyNames = [
    'maria santos', 'miguel reyes', 'angela cruz', 'paolo mendoza',
    'jessa torres', 'carlo diaz', 'joyce tan', 'ana lim', 'ashley smith'
  ];
  if (dummyNames.some(d => name.includes(d))) return true;

  const dummyEmailKeywords = [
    'santos', 'reyes', 'cruz', 'mendoza', 'torres', 'diaz', 'tan', 'lim', 'ashley'
  ];
  if (dummyEmailKeywords.some(d => email.includes(d))) return true;

  return false;
};

export const deduplicateUsers = (list) => {
  if (!Array.isArray(list)) return [...INSTITUTIONAL_STAFF];

  // 1. Always retain all 4 institutional staff members in demoUsers
  const staffByRole = {};
  INSTITUTIONAL_STAFF.forEach(s => {
    staffByRole[s.role] = { ...s };
  });

  list.forEach(u => {
    if (u.role !== 'Student') {
      const targetRole = u.role === 'DepartmentStaff' ? 'Department Staff' : u.role;
      if (staffByRole[targetRole]) {
        staffByRole[targetRole] = {
          ...staffByRole[targetRole],
          status: u.status || staffByRole[targetRole].status,
          account: u.account || staffByRole[targetRole].account,
        };
      }
    }
  });

  const staffArray = Object.values(staffByRole);

  // 2. Deduplicate student accounts strictly by ID, email, or normalized name
  const students = [];
  list
    .filter(u => u.role === 'Student' && !isLegacyDummyStudent(u))
    .forEach(u => {
      const idKey = (u.student_id_number || u.account_id || '').toLowerCase().trim();
      const emailKey = (u.email || '').toLowerCase().trim();
      const nameKey = (u.name || '').toLowerCase().trim();

      const existingIdx = students.findIndex(s =>
        (idKey && (s.student_id_number || s.account_id || '').toLowerCase().trim() === idKey) ||
        (emailKey && (s.email || '').toLowerCase().trim() === emailKey) ||
        (nameKey && (s.name || '').toLowerCase().trim() === nameKey)
      );

      const formattedYear = formatYearLevel(u.yearLevel || u.year_level);
      const studentObj = {
        ...u,
        yearLevel: formattedYear,
        year_level: parseInt(formattedYear.charAt(0), 10) || 1,
      };

      if (existingIdx !== -1) {
        const existing = students[existingIdx];
        const existingYearNum = parseInt(String(existing.yearLevel || existing.year_level || 1).charAt(0), 10) || 1;
        const newYearNum = parseInt(String(studentObj.yearLevel || studentObj.year_level || 1).charAt(0), 10) || 1;
        const highestYear = Math.max(existingYearNum, newYearNum);

        students[existingIdx] = {
          ...existing,
          ...studentObj,
          yearLevel: formatYearLevel(highestYear),
          year_level: highestYear,
          student_id_number: existing.student_id_number || studentObj.student_id_number,
          account_id: existing.account_id || studentObj.account_id,
        };
      } else {
        students.push(studentObj);
      }
    });

  return [...staffArray, ...students];
};

export const AppProvider = ({ children }) => {
  const initialUsers = INSTITUTIONAL_STAFF;

  // Auth & Navigation state with localStorage session persistence
  const [demoUsers, setDemoUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('ssis_demo_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return deduplicateUsers(parsed);
        }
      }
      return initialUsers;
    } catch {
      return initialUsers;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ssis_current_user');
      return saved ? JSON.parse(saved) : initialUsers[0];
    } catch {
      return initialUsers[0];
    }
  });

  const [currentView, setCurrentView] = useState(() => {
    try {
      const saved = localStorage.getItem('ssis_current_view');
      return saved || 'login';
    } catch {
      return 'login';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ssis_demo_users', JSON.stringify(demoUsers));
    } catch (e) {
      console.error(e);
    }
  }, [demoUsers]);

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('ssis_current_user', JSON.stringify(currentUser));
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        localStorage.removeItem('ssis_current_user');
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentView) {
      try {
        localStorage.setItem('ssis_current_view', currentView);
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentView]);
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
  const [paymentHistory, setPaymentHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('ssis_payment_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // All student financial assessments directory
  const [studentAssessmentsList, setStudentAssessmentsList] = useState(() => {
    try {
      const saved = localStorage.getItem('ssis_student_assessments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Per-student grades database (Starts empty; populated when Registrar encodes grades)
  const [studentGradesMap, setStudentGradesMap] = useState(() => {
    try {
      const saved = localStorage.getItem('ssis_student_grades_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Current logged in student's grade reports
  const [gradeReports, setGradeReports] = useState([]);

  // Student Document Requests Data (Starts empty; populated when student applies)
  const [documentRequests, setDocumentRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('ssis_document_requests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Per-student isolated states to prevent session bleeding
  const [studentEnrollmentSelections, setStudentEnrollmentSelections] = useState(() => {
    try {
      const saved = localStorage.getItem('ssis_student_enrollments');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [studentClearanceMap, setStudentClearanceMap] = useState(() => {
    try {
      const saved = localStorage.getItem('ssis_student_clearance_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Student Clearance Data (Default: all 5 university departments Pending; 0 Cleared)
  const [clearanceList, setClearanceList] = useState([
    { id: 1, department: 'University Library', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting book return audit' },
    { id: 2, department: 'Computer Laboratory', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting workstation & equipment check' },
    { id: 3, department: 'Guidance & Counseling', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting student counseling verification' },
    { id: 4, department: 'Office of Student Affairs', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting student organization clearance' },
    { id: 5, department: 'College Dean', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting Dean final sign-off' },
  ]);

  // Registrar Enrollment Request Queue
  const [registrarQueue, setRegistrarQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('ssis_registrar_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedQueueStudentId, setSelectedQueueStudentId] = useState(null);

  // Registrar Academic Records & Grade Encoding sheet
  const [encodeGradesList, setEncodeGradesList] = useState([]);

  // Registrar Document Requests Queue
  const [registrarDocumentQueue, setRegistrarDocumentQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('ssis_document_requests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Department Staff Clearance Queue (Starts empty; populated when students apply for clearance review)
  const [departmentStaffClearanceQueue, setDepartmentStaffClearanceQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('ssis_dept_clearance_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Department Staff Processed / Completed Clearance Archive
  const [completedClearanceList, setCompletedClearanceList] = useState(() => {
    try {
      const saved = localStorage.getItem('ssis_completed_clearance');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent localStorage synchronization effects for academic/financial transactions
  useEffect(() => {
    try { localStorage.setItem('ssis_student_enrollments', JSON.stringify(studentEnrollmentSelections)); } catch (e) { console.error(e); }
  }, [studentEnrollmentSelections]);

  useEffect(() => {
    try { localStorage.setItem('ssis_student_assessments', JSON.stringify(studentAssessmentsList)); } catch (e) { console.error(e); }
  }, [studentAssessmentsList]);

  useEffect(() => {
    try { localStorage.setItem('ssis_payment_history', JSON.stringify(paymentHistory)); } catch (e) { console.error(e); }
  }, [paymentHistory]);

  useEffect(() => {
    try { localStorage.setItem('ssis_student_clearance_map', JSON.stringify(studentClearanceMap)); } catch (e) { console.error(e); }
  }, [studentClearanceMap]);

  useEffect(() => {
    try { localStorage.setItem('ssis_student_grades_map', JSON.stringify(studentGradesMap)); } catch (e) { console.error(e); }
  }, [studentGradesMap]);

  useEffect(() => {
    try { localStorage.setItem('ssis_document_requests', JSON.stringify(documentRequests)); } catch (e) { console.error(e); }
  }, [documentRequests]);

  useEffect(() => {
    try { localStorage.setItem('ssis_registrar_queue', JSON.stringify(registrarQueue)); } catch (e) { console.error(e); }
  }, [registrarQueue]);

  useEffect(() => {
    try { localStorage.setItem('ssis_dept_clearance_queue', JSON.stringify(departmentStaffClearanceQueue)); } catch (e) { console.error(e); }
  }, [departmentStaffClearanceQueue]);

  useEffect(() => {
    try { localStorage.setItem('ssis_completed_clearance', JSON.stringify(completedClearanceList)); } catch (e) { console.error(e); }
  }, [completedClearanceList]);

  useEffect(() => {
    try { localStorage.setItem('ssis_student_enrollments', JSON.stringify(studentEnrollmentSelections)); } catch (e) { console.error(e); }
  }, [studentEnrollmentSelections]);

  const [departmentRulesList, setDepartmentRulesList] = useState([
    { id: 1, title: 'Hardware & Equipment Return', description: 'All laboratory headsets, test cables, microcontroller units, and toolkits must be surrendered to the custodian in good physical condition.', active: true },
    { id: 2, title: 'Workstation Cleanliness & Audit', description: 'Terminals must be checked for unauthorized software or personal local data before semester end.', active: true },
    { id: 3, title: 'Final Project Repository & Documentation', description: 'Students enrolled in computing lab subjects must submit their approved lab projects to the departmental repository.', active: true },
    { id: 4, title: 'Locker Key Surrender', description: 'Department-assigned storage lockers must be emptied and keys returned to the department secretary.', active: false },
  ]);

  // Admin User Accounts: Dynamically synchronized with demoUsers so ALL students, staff, and admins appear in User Accounts
  const adminUsersList = demoUsers.map(u => ({
    ...u,
    account: (u.status === 'Disabled' || u.status === 'Deactivated' || u.account === 'Disabled' || u.account === 'Deactivated') ? 'Deactivated' : 'Active',
    status: (u.status === 'Disabled' || u.status === 'Deactivated' || u.account === 'Disabled' || u.account === 'Deactivated') ? 'Deactivated' : 'Active',
  }));

  const setAdminUsersList = (updater) => {
    setDemoUsers(prev => {
      const currentList = prev.map(u => ({
        ...u,
        account: (u.status === 'Disabled' || u.status === 'Deactivated' || u.account === 'Disabled' || u.account === 'Deactivated') ? 'Deactivated' : 'Active',
        status: (u.status === 'Disabled' || u.status === 'Deactivated' || u.account === 'Disabled' || u.account === 'Deactivated') ? 'Deactivated' : 'Active',
      }));
      const next = typeof updater === 'function' ? updater(currentList) : updater;
      return next.map(u => ({
        ...u,
        status: (u.account === 'Disabled' || u.account === 'Deactivated' || u.status === 'Disabled' || u.status === 'Deactivated') ? 'Deactivated' : 'Active',
        account: (u.account === 'Disabled' || u.account === 'Deactivated' || u.status === 'Disabled' || u.status === 'Deactivated') ? 'Deactivated' : 'Active',
      }));
    });
  };

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
    const activeStudentId = currentUser?.student_id_number || currentUser?.studentId || currentUser?.account_id || 'STU-2026-0001';

    // Persist active student selections immediately
    setStudentEnrollmentSelections(prev => ({
      ...prev,
      [activeStudentId]: selected.map(c => c.id),
    }));

    const newQueueItem = {
      id: Date.now(),
      studentId: currentUser?.id || 1,
      studentName: currentUser?.name || 'Student',
      studentIdNumber: activeStudentId,
      program: currentUser?.program || 'BS Computer Science',
      yearLevel: formatYearLevel(currentUser?.yearLevel || currentUser?.year_level),
      courses: selected,
      totalUnits: totalUnitsCount,
      submittedAt: today,
      status: 'Pending',
      validation: { prerequisites: true, curriculum: true, accounts: true }
    };

    setEnrollmentStatus('Pending');
    setRegistrarQueue(prev => [newQueueItem, ...prev.filter(q => q.studentIdNumber !== activeStudentId)]);
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

    // Ensure student selections are synced with all approved courses
    if (targetItem.courses && targetItem.courses.length > 0) {
      setStudentEnrollmentSelections(prev => ({
        ...prev,
        [targetItem.studentIdNumber]: targetItem.courses.map(c => c.id),
      }));
    }

    // Create fee assessment for Cashier
    const units = targetItem.totalUnits || (targetItem.courses ? targetItem.courses.reduce((sum, c) => sum + (Number(c.units) || 3), 0) : 3);
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
        { id: 1, category: `Tuition & Laboratory (${units} units @ 1,500/unit)`, feeType: `Tuition & Laboratory (${units} units @ 1,500/unit)`, amount: tuitionAmount },
        { id: 2, category: 'Registration, Library & Athletic Fee', feeType: 'Registration, Library & Athletic Fee', amount: miscAmount },
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

    // Synchronize active student's isolated clearance map
    if (studentId) {
      setStudentClearanceMap(prev => {
        const studentList = prev[studentId] || clearanceList;
        return {
          ...prev,
          [studentId]: studentList.map(c => c.department === targetDepartment ? {
            ...c,
            lastUpdated: today,
            status: 'Pending',
            remarks: 'Clearance review submitted • Awaiting staff sign-off',
          } : c)
        };
      });
    }

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

    // Synchronize active student's isolated clearance map
    if (studentId) {
      setStudentClearanceMap(prev => {
        const studentList = prev[studentId] || clearanceList;
        return {
          ...prev,
          [studentId]: studentList.map(c => deptNamesSet.has(c.department) ? {
            ...c,
            lastUpdated: today,
            status: 'Pending',
            remarks: 'Clearance review submitted \u2022 Awaiting staff sign-off',
          } : c)
        };
      });
    }

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
      if (
        targetUser.status === 'Deactivated' || 
        targetUser.status === 'Disabled' || 
        targetUser.account === 'Deactivated' || 
        targetUser.account === 'Disabled'
      ) {
        showToast(`Cannot switch perspective: Account for ${targetUser.name} is deactivated.`);
        return;
      }

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
    setCurrentUser(null);
    try {
      localStorage.removeItem('ssis_current_user');
      localStorage.setItem('ssis_current_view', 'login');
    } catch (e) {
      console.error(e);
    }
    setCurrentView('login');
    setScheduleCourses(prev => prev.map(c => ({ ...c, selected: false })));
    setSearchQuery('');
    showToast('Logged out of CuyoTech University SSIS.');
  };

  const handleLogin = (selectedRole) => {
    switchRole(selectedRole);
  };

  // Login with real credentials / Sign In
  const loginWithCredentials = async (emailOrId, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_or_id: emailOrId, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          if (
            data.user.status === 'Disabled' || 
            data.user.status === 'Deactivated' || 
            data.user.account === 'Disabled' || 
            data.user.account === 'Deactivated'
          ) {
            showToast('This account has been deactivated. Please contact the administrator.');
            return { success: false, message: 'This account has been deactivated. Please contact the administrator.' };
          }

          const matchedUser = {
            ...data.user,
            yearLevel: formatYearLevel(data.user.yearLevel || data.user.year_level),
          };

          setCurrentUser(matchedUser);
          setDemoUsers(prev => deduplicateUsers([matchedUser, ...prev]));

          // Sync student data if logging in as student
          if (matchedUser.role === 'Student') {
            const sId = matchedUser.student_id_number || matchedUser.account_id;
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
          } else if (matchedUser.role === 'Registrar') setCurrentView('approvals');
          else if (matchedUser.role === 'Cashier') setCurrentView('process_payment');
          else if (matchedUser.role === 'Department Staff' || matchedUser.role === 'DepartmentStaff') setCurrentView('clearance_requests');
          else if (matchedUser.role === 'Admin') setCurrentView('user_accounts');

          showToast(`Welcome back, ${matchedUser.name}!`);
          return { success: true, user: matchedUser };
        }
      } else {
        const errData = await res.json().catch(() => null);
        if (res.status === 403 && errData?.message) {
          showToast(errData.message);
          return { success: false, message: errData.message };
        }
        console.warn('Backend login non-200, attempting client fallback:', errData);
      }
    } catch (err) {
      console.log('Login API network error, trying local demo users:', err);
    }

    // Client-side fallback check across demoUsers & INSTITUTIONAL_STAFF
    const searchTarget = emailOrId.toLowerCase().trim();
    const allCandidates = deduplicateUsers(demoUsers);
    const found = allCandidates.find(u => {
      const email = (u.email || '').toLowerCase().trim();
      const accountId = (u.account_id || '').toLowerCase().trim();
      const studentId = (u.student_id_number || '').toLowerCase().trim();
      const username = (u.username || '').toLowerCase().trim();
      const name = (u.name || '').toLowerCase().trim();
      const prefix = email.split('@')[0];

      return email === searchTarget ||
        accountId === searchTarget ||
        studentId === searchTarget ||
        username === searchTarget ||
        name === searchTarget ||
        (searchTarget.includes('@') && prefix === searchTarget.split('@')[0]);
    });

    if (found) {
      if (
        found.status === 'Disabled' || 
        found.status === 'Deactivated' || 
        found.account === 'Disabled' || 
        found.account === 'Deactivated'
      ) {
        showToast('This account has been deactivated. Please contact the administrator.');
        return { success: false, message: 'This account has been deactivated. Please contact the administrator.' };
      }

      setCurrentUser(found);
      if (found.role === 'Student') {
        const sId = found.account_id || found.student_id_number;
        const studentGrades = studentGradesMap[sId] || [];
        setGradeReports(studentGrades);
        setCurrentView('dashboard');
      } else if (found.role === 'Registrar') setCurrentView('approvals');
      else if (found.role === 'Cashier') setCurrentView('process_payment');
      else if (found.role === 'Department Staff' || found.role === 'DepartmentStaff') setCurrentView('clearance_requests');
      else if (found.role === 'Admin') setCurrentView('user_accounts');

      showToast(`Welcome back, ${found.name}!`);
      return { success: true, user: found };
    }

    showToast(`No matching account found for "${emailOrId}". Please register or check credentials.`);
    return { success: false, message: `No matching account found for "${emailOrId}".` };
  };

  // Sign Up / Register new account (Stored in MySQL backend and local state)
  // Per requirement: All student info starts as default 0.
  // IDs strictly match the role prefix (STU, REG, CSH, STF, ADM).
  const signUpUser = async (formData) => {
    const assignedRole = formData.role || 'Student';
    const assignedId = formData.account_id || formData.student_id_number || generateUniqueAccountId(assignedRole, demoUsers);
    const enrichedFormData = {
      ...formData,
      role: assignedRole,
      account_id: assignedId,
      student_id_number: assignedId,
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrichedFormData),
      });

      if (res.ok) {
        const data = await res.json();
        const serverUser = data.user || {};
        const newUser = {
          ...serverUser,
          account_id: serverUser.account_id || serverUser.student_id_number || assignedId,
          student_id_number: serverUser.student_id_number || serverUser.account_id || assignedId,
          role: serverUser.role || assignedRole,
        };

        // Register in demoUsers & adminUsersList
        setDemoUsers(prev => deduplicateUsers([newUser, ...prev]));
        setAdminUsersList(prev => [
          { id: newUser.id, name: newUser.name, role: newUser.role, account: 'Active', email: newUser.email, account_id: newUser.account_id, student_id_number: newUser.student_id_number },
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

          const freshClearance = [
            { id: 1, department: 'University Library', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting book return audit' },
            { id: 2, department: 'Computer Laboratory', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting workstation & equipment check' },
            { id: 3, department: 'Guidance & Counseling', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting student counseling verification' },
            { id: 4, department: 'Office of Student Affairs', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting student organization clearance' },
            { id: 5, department: 'College Dean', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting Dean final sign-off' },
          ];
          setClearanceList(freshClearance);
          setStudentClearanceMap(prev => ({ ...prev, [newUser.student_id_number]: freshClearance }));
          setStudentEnrollmentSelections(prev => ({ ...prev, [newUser.student_id_number]: [] }));
          setScheduleCourses(prev => prev.map(c => ({ ...c, selected: false })));

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

        showToast(`Account created! Welcome, ${newUser.name}. Your official ID is ${newUser.student_id_number || newUser.account_id}.`);
        recordAuditLog('New account registered', `${newUser.name} (${newUser.role})`);
        return { success: true, user: newUser };
      }
    } catch (err) {
      console.log('Register API network error, creating client account:', err);
    }

    // Client-side fallback registration
    const fallbackId = Date.now();
    const nameParts = (formData.name || 'New User').trim().split(' ');
    const initials = (nameParts[0]?.[0] || 'U') + (nameParts[1]?.[0] || 'S');

    const formattedYear = formatYearLevel(formData.year_level);
    const newUser = {
      id: fallbackId,
      name: formData.name,
      email: formData.email,
      account_id: assignedId,
      student_id_number: assignedId,
      role: assignedRole,
      initials: initials.toUpperCase(),
      program: formData.program || 'BS Computer Science',
      yearLevel: formattedYear,
      year_level: parseInt(formattedYear.charAt(0), 10) || 1,
      status: 'Active',
      account: 'Active',
    };

    setDemoUsers(prev => deduplicateUsers([newUser, ...prev]));
    setAdminUsersList(prev => [
      { id: newUser.id, name: newUser.name, role: newUser.role, account: 'Active', email: newUser.email, account_id: assignedId, student_id_number: assignedId },
      ...prev,
    ]);

    if (newUser.role === 'Student') {
      // Fresh student: ALL DEFAULT 0!
      setStudentGradesMap(prev => ({
        ...prev,
        [assignedId]: [],
      }));

      setGradeReports([]);
      setAssessedFees([]);
      setDocumentRequests([]);

      const freshClearance = [
        { id: 1, department: 'University Library', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting book return audit' },
        { id: 2, department: 'Computer Laboratory', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting workstation & equipment check' },
        { id: 3, department: 'Guidance & Counseling', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting student counseling verification' },
        { id: 4, department: 'Office of Student Affairs', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting student organization clearance' },
        { id: 5, department: 'College Dean', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting Dean final sign-off' },
      ];
      setClearanceList(freshClearance);
      setStudentClearanceMap(prev => ({ ...prev, [assignedId]: freshClearance }));
      setStudentEnrollmentSelections(prev => ({ ...prev, [assignedId]: [] }));
      setScheduleCourses(prev => prev.map(c => ({ ...c, selected: false })));

      setStudentAssessmentsList(prev => [
        { id: Date.now(), studentId: assignedId, name: newUser.name, program: newUser.program, totalAssessed: 0.00, totalPaid: 0.00, balance: 0.00, status: 'Unassessed' },
        ...prev,
      ]);

      setEncodeGradesList(prev => [
        ...prev,
        { id: Date.now(), studentId: assignedId, studentName: newUser.name, grade: '1.75' },
      ]);
    }

    setCurrentUser(newUser);
    if (newUser.role === 'Student') setCurrentView('dashboard');
    else if (newUser.role === 'Registrar') setCurrentView('approvals');
    else if (newUser.role === 'Cashier') setCurrentView('process_payment');
    else if (newUser.role === 'Department Staff') setCurrentView('clearance_requests');
    else if (newUser.role === 'Admin') setCurrentView('user_accounts');

    showToast(`Account created! Welcome, ${newUser.name}. Your official ID is ${newUser.student_id_number || newUser.account_id}.`);
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
          const dbStudents = data.studentsList
            .filter(s => !isLegacyDummyStudent(s))
            .map(s => ({
              id: s.id,
              name: `${s.first_name} ${s.last_name}`,
              email: s.email,
              student_id_number: s.student_id_number,
              role: 'Student',
              initials: (s.first_name[0] || 'S') + (s.last_name[0] || 'T'),
              program: s.program?.program_name || 'BS Computer Science',
              yearLevel: formatYearLevel(s.year_level),
              year_level: s.year_level || 1,
              status: s.account_status || 'Active',
              account: s.account_status || 'Active',
            }));

          setDemoUsers(prev => deduplicateUsers([...prev, ...dbStudents]));
        }
      })
      .catch(err => console.log('Running in client state with real-time reactivity:', err));
  }, []);

  return (
    <AppContext.Provider
      value={{
        demoUsers,
        setDemoUsers,
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
        studentEnrollmentSelections,
        setStudentEnrollmentSelections,
        studentClearanceMap,
        setStudentClearanceMap,
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

        // Role & Account ID Helpers
        getRolePrefix,
        generateUniqueAccountId,
        reassignRoleAccountId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
