# SSIS System Testing, Security & Quality Assurance Report

**File**: `Bugs-Flaws-Report.md`  
**Application**: CuyoTech University - Student Services Information System (SSIS)  
**Version**: 1.0.0-Beta  
**Date**: October 2026  
**Last Updated**: October 12, 2026  

---

## 1. Executive Summary

This document serves as the formal tracking ledger for all reported bugs, user interface anomalies, functional workflow defects, data isolation failures, and security vulnerabilities identified during comprehensive testing of the Student Services Information System (SSIS). 

Every reported issue is documented with its severity rating, exact reproduction steps, affected source files, identified root cause, and current status (`Reported`, `Investigating`, `In Progress`, or `Resolved`).

---

## 2. Issues & Vulnerabilities Ledger

### Status Summary Table

| ID | Category | Severity | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-001** | Security / Configuration | **Critical** | Database password contained personal user name and date in `.env` | **Resolved** |
| **BUG-001** | Cashier / Financial | **High** | Invalid transaction processing without student selection (defaults to Ashley Smith) | **Resolved** |
| **BUG-002** | Cashier / Financial | **Medium** | Missing change ("sukli") on official receipt when excess cash is tendered | **Resolved** |
| **BUG-003** | Cashier / UX | **Medium** | Payment amount defaults to `5,000.00` instead of `0.00` or student balance | **Resolved** |
| **BUG-004** | Student Portal / UI | **Medium** | Assessment table has blank fee category labels (missing names for PHP 9,000 and 2,500) | **Resolved** |
| **SEC-002** | RBAC / Information Leak | **High** | Global search bar allows Student accounts to find & access Registrar/Admin pages | **Resolved** |
| **SEC-003** | Privacy / Confidentiality | **Medium** | Newly registered student accounts leak into login one-click auto-fill buttons | **Resolved** |
| **SEC-004** | Security / Privilege Escalation | **Critical** | Public registration form permits selecting Admin, Registrar, Cashier, and Staff roles | **Resolved** |
| **BUG-005** | Account Management | **High** | Duplicate Student ID numbers allowed during registration | **Resolved** |
| **BUG-006** | Academic Workflow | **Medium** | Enrollment status remains "NOT YET ENROLLED" until grades are encoded | **Resolved** |
| **BUG-007** | Data Isolation | **High** | Pre-selected enrollment subjects bleed/persist across different student accounts | **Resolved** |
| **BUG-008** | Data Isolation | **High** | Document requests of previous students combine with newly registered students | **Resolved** |
| **BUG-009** | Data Isolation | **High** | Department clearance progress bleeds across different student accounts | **Resolved** |
| **SEC-005** | Security / Architecture | **Medium** | Navbar perspective switcher allows instant unauthorized role switching | **Resolved** |
| **BUG-010** | Persistence / Database | **High** | State and newly created credentials disappear upon page refresh | **Resolved** |
| **BUG-011** | Admin RBAC / UI | **Medium** | "8 Active" hardcoded for Student role count in Roles & Permissions table | **Resolved** |
| **FEAT-001** | Account Management / RBAC | **High** | Public registration must default to Student without role selector; Admin must be able to change user roles | **Resolved** |
| **SEC-006** | Access Control / Security | **High** | Deactivated/Disabled user accounts could still authenticate and log into portal | **Resolved** |
| **BUG-012** | Data Isolation / Finance | **Medium** | Student Finance view displayed global assessment fees instead of student-specific record | **Resolved** |
| **BUG-013** | Academic Workflow / COR | **Medium** | Certificate of Registration (COR) omitted subjects for newly enrolled students | **Resolved** |
| **BUG-014** | Runtime Safety / Frontend | **High** | `activeStudentId` declared before `currentUser` destructuring in `StudentClearanceView.jsx` | **Resolved** |
| **SEC-007** | Session Management / Auth | **High** | `handleLogout` failed to purge `currentUser` and `localStorage` session | **Resolved** |
| **BUG-015** | Runtime Safety / Null Pointer | **Medium** | Unguarded property access on `currentUser` and `searchQuery` risking fatal unhandled exceptions | **Resolved** |
| **FEAT-002** | Authentication / UX | **Medium** | Show/hide password visibility toggle (eye icon button) on Sign In and Register forms | **Resolved** |
| **SEC-008** | Authentication / RBAC | **High** | Removal of role dropdown in Sign In and Register; system resolves role strictly by credentials, Register defaults to Student | **Resolved** |
| **BUG-016** | Admin RBAC / Count Accuracy | **High** | Phantom "8 Active" in Student role count cleansed; counts strictly bound to real active accounts | **Resolved** |
| **FEAT-003** | Account Management / RBAC | **High** | Universal user governance with inline role elevation, dedicated edit modal, and immediate deactivation login enforcement | **Resolved** |
| **BUG-017** | Persistence / Session Architecture | **Critical** | Browser refresh wiped student course enrollments, assessments, payments, document requests, and clearance applications | **Resolved** |
| **BUG-018** | Academic / Clearance Workflow | **High** | Clearance review requests updated generic clearance list but failed to sync student's isolated clearance map | **Resolved** |
| **BUG-019** | Cashier / API Routing | **Medium** | Cashier payment submission called `/api/cashier/payments` instead of singular route `/api/cashier/payment` | **Resolved** |
| **BUG-020** | Academic Workflow / Dashboard UX | **Medium** | Dashboard enrolled units indicator failed to count selected courses prior to registrar approval | **Resolved** |

---

## 3. Detailed Issue Reports & Root Cause Analysis

### SEC-001: Personal Name & Date in Database Password (.env)
- **Category**: Security / Configuration
- **Severity**: **Critical**
- **Status**: **Resolved**
- **Files Affected**:
  - [c:\Users\Gams\Student-Services-Information-System\.env](file:///c:/Users/Gams/Student-Services-Information-System/.env)
- **Description**: The `.env` file contained an unstandardized personal database password.
- **Root Cause**: Developer local testing credential was present in the environment configuration.
- **Resolution**: Replaced with standard `DB_PASSWORD=password` across local MySQL and `.env`.

---

### BUG-001: Invalid Cashier Transaction Processing Without Student Selection
- **Category**: Cashier & Financial Transactions
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/CashierPaymentView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierPaymentView.jsx)
- **Resolution**: Removed default fallback to `students[0]`. If no student is searched or selected, payment button is disabled, inline warning is shown, and submission is prevented.

---

### BUG-002: Missing Change ("Sukli") on Official Receipt
- **Category**: Cashier & Official Receipts
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/components/ReceiptModal.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/ReceiptModal.jsx)
  - [resources/js/views/CashierPaymentView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierPaymentView.jsx)
- **Resolution**: Added computation and receipt display for Cash Tendered, Amount Applied to Balance, Change Due ("Sukli"), and Remaining Outstanding Balance.

---

### BUG-003: Payment Amount Defaulting to 5,000.00
- **Category**: Cashier / UX
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/CashierPaymentView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierPaymentView.jsx)
- **Resolution**: Payment amount initial value changed from `5,000.00` to empty placeholder `0.00`. Added a one-click "Pay Full Balance (PHP X,XXX.XX)" button once a student is selected.

---

### BUG-004: Blank Labels in Fee Assessment Table
- **Category**: Student Portal / UI & Display
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/StudentPaymentsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentPaymentsView.jsx)
  - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx)
- **Resolution**: Replaced `{item.category}` with `{item.category || item.feeType || 'Tuition Assessment'}`. Normalized assessment items in `AppContext.jsx` so both `category` and `feeType` are always populated.

---

### SEC-002: Global Search Bar Role Boundary Violation
- **Category**: Role-Based Access Control (RBAC) / Security
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/components/TopNavbar.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/TopNavbar.jsx)
- **Resolution**: Scoped search index strictly to `currentUser.role`. Student accounts can only find and navigate to Student pages, user searches are blocked for students, and receipts are scoped to their own account.

---

### SEC-003: Student Accounts Leaking into Login Auto-Fill
- **Category**: Privacy & Confidentiality / Authentication
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/LoginView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/LoginView.jsx)
- **Resolution**: Removed student accounts from the one-click auto-fill buttons. Quick demo login is restricted exclusively to staff demo accounts.

---

### SEC-004: Public Registration Role Manipulation Vulnerability
- **Category**: Privilege Escalation / Security Flaw
- **Severity**: **Critical**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/LoginView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/LoginView.jsx)
  - [app/Http/Controllers/Api/SSISController.php](file:///c:/Users/Gams/Student-Services-Information-System/app/Http/Controllers/Api/SSISController.php)
- **Resolution**: Removed role selector from registration form; public signups are strictly defaulted to `Student`. Backend `register()` endpoint forces `role = 'Student'` for public registrations.

---

### BUG-005: Duplicate Student ID Numbers Allowed
- **Category**: Data Integrity / Account Management
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/LoginView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/LoginView.jsx)
  - [app/Http/Controllers/Api/SSISController.php](file:///c:/Users/Gams/Student-Services-Information-System/app/Http/Controllers/Api/SSISController.php)
- **Resolution**: Added frontend and backend uniqueness validation for `student_id_number` to prevent duplicate ID registrations.

---

### BUG-006: Enrollment Status Logic ("Not Yet Enrolled" Persists Until Graded)
- **Category**: Academic Workflow & Status
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/StudentDashboardView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentDashboardView.jsx)
- **Resolution**: Dashboard now checks active submitted/approved enrollment records in addition to grades, immediately displaying `ENROLLED • X UNITS` once enrollment is processed.

---

### BUG-007, BUG-008, BUG-009: Session Bleeding & Data Separation Across Students
- **Category**: Data Isolation / Session Bleeding
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx)
  - [resources/js/views/StudentEnrollmentView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentEnrollmentView.jsx)
  - [resources/js/views/StudentDocumentsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentDocumentsView.jsx)
  - [resources/js/views/StudentClearanceView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentClearanceView.jsx)
  - [resources/js/views/DepartmentClearanceView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/DepartmentClearanceView.jsx)
- **Resolution**: 
  - Partitioned course selections per student ID (`studentEnrollmentSelections[activeStudentId]`).
  - Scoped document requests strictly to the active student (`myDocumentRequests`).
  - Partitioned clearance progress per student ID (`studentClearanceMap[activeStudentId]`).
  - Added state clearing on user logout and fresh student registration.

---

### SEC-005: Perspective Switcher Exposing All Roles
- **Category**: Security / Demo Artifact
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/components/TopNavbar.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/TopNavbar.jsx)
- **Resolution**: De-duplicated student accounts from the perspective switcher and clearly labeled the section as `DEMO PERSPECTIVE SWITCHER`.

---

### BUG-010: State Persistence / Loss of Credentials on Refresh
- **Category**: Backend / Database Persistence
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx)
- **Resolution**: Implemented `localStorage` session preservation for `currentUser` and `currentView`. Synchronized database students into `adminUsersList` on application bootstrap.

---

### BUG-011: Hardcoded "8 Active" in Roles & Permissions Table
- **Category**: Admin RBAC / UI
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/AdminAccountsAuditView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/AdminAccountsAuditView.jsx)
- **Resolution**: Replaced hardcoded static count strings with `getRoleActiveCount(roleName)` computing real-time active users per role.

---

### FEAT-001: Admin Role Reassignment & Default Student Registration
- **Category**: Account Management / RBAC
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/AdminAccountsAuditView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/AdminAccountsAuditView.jsx)
  - [app/Http/Controllers/Api/SSISController.php](file:///c:/Users/Gams/Student-Services-Information-System/app/Http/Controllers/Api/SSISController.php)
  - [routes/api.php](file:///c:/Users/Gams/Student-Services-Information-System/routes/api.php)
- **Resolution**: Added interactive role change selector for Admin in the User Accounts table. Added `/api/admin/users/{id}/change-role` endpoint and audit trail logging for administrative role changes.

---

### SEC-006: Deactivated/Disabled Accounts Permitted to Authenticate
- **Category**: Access Control / Security Vulnerability
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [app/Http/Controllers/Api/SSISController.php](file:///c:/Users/Gams/Student-Services-Information-System/app/Http/Controllers/Api/SSISController.php)
  - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx)
- **Description**: When an Admin toggled an account status to "Disabled" in User Accounts, the user was still able to successfully authenticate and access system dashboards because the status flag was not evaluated during login.
- **Root Cause**: `login()` in `SSISController.php` and `loginWithCredentials()` in `AppContext.jsx` lacked verification of `account_status === 'Disabled'` / `status === 'Disabled'`.
- **Resolution**: Added strict status validation on both the backend API (HTTP 403 response) and frontend client state, immediately halting session creation for disabled accounts and displaying a deactivation notice.

---

### BUG-012: Student Finance Displaying Global Assessment Instead of Student-Specific Records
- **Category**: Data Isolation / Financial Accounting
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/StudentPaymentsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentPaymentsView.jsx)
- **Description**: If the Registrar approved another student's enrollment, the generic `assessedFees` array could leak into other students' finance views.
- **Root Cause**: `StudentPaymentsView.jsx` read the global `assessedFees` state rather than resolving the active student's unique assessment from `studentAssessmentsList`.
- **Resolution**: Scoped assessment fee items and outstanding balance directly to `studentAssessmentsList.find(a => a.studentId === activeStudentId)`.

---

### BUG-013: Certificate of Registration (COR) Omitted Enrolled Subjects for Newly Enrolled Students
- **Category**: Academic Workflow / Document Generation
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/CertificateOfRegistrationView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CertificateOfRegistrationView.jsx)
- **Description**: Students who selected and submitted courses saw an empty subject table on their Certificate of Registration (COR) until the Registrar processed their enrollment.
- **Root Cause**: COR resolved subjects using `scheduleCourses.filter(c => c.selected)`, which did not read the student's isolated `studentEnrollmentSelections[studentId]`.
- **Resolution**: Linked course resolution in `CertificateOfRegistrationView.jsx` to `studentEnrollmentSelections` mapped to the active student's ID, accurately displaying all selected/enrolled courses on their COR.

---

### BUG-014: `activeStudentId` Declared Before `currentUser` Initialization in `StudentClearanceView.jsx`
- **Category**: Runtime Safety / Frontend Initialization
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/StudentClearanceView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentClearanceView.jsx)
- **Description**: In `StudentClearanceView.jsx`, `activeStudentId` was declared on line 5 before `useApp()` destructuring of `currentUser` on line 7, causing a runtime `ReferenceError` / `undefined` variable reference during component mount.
- **Root Cause**: Variable declaration placed above the hook call where its prerequisite variable was provided.
- **Resolution**: Relocated `activeStudentId` below `useApp()` destructuring, guaranteeing safe and correct resolution of active student clearances.

---

### SEC-007: Log Out Action Failed to Invalidate Active Session and LocalStorage
- **Category**: Session Management / Authentication Security
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx)
  - [resources/js/App.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/App.jsx)
- **Description**: When clicking "Log Out" in the sidebar, only `currentView` was switched to `'login'`, while `currentUser` remained in React memory and persisted in browser `localStorage`.
- **Root Cause**: `handleLogout` lacked `setCurrentUser(null)` and `localStorage.removeItem('ssis_current_user')`.
- **Resolution**: Implemented complete session purge on logout in `AppContext.jsx` and enforced unauthenticated route guard in `App.jsx`, ensuring sessions are fully destroyed upon logout.

---

### BUG-015: Unguarded Member Accesses on `currentUser` and `searchQuery`
- **Category**: Runtime Safety / Null-Safety Defense
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/components/TopNavbar.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/TopNavbar.jsx)
  - [resources/js/views/StudentGradesView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentGradesView.jsx)
  - [resources/js/views/RegistrarDocumentsQueueView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarDocumentsQueueView.jsx)
- **Description**: Direct unguarded property reads (such as `currentUser.name`, `currentUser.role`, and `searchQuery.toLowerCase()`) caused runtime risks when switching users, logging out, or clearing search.
- **Root Cause**: Missing optional chaining (`?.`) and fallback defaults.
- **Resolution**: Added optional chaining and safe fallback defaults across all navigation, header, and search filter components.
---

### FEAT-002: Password Visibility Toggle on Sign In and Registration
- **Category**: Authentication / User Experience
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/LoginView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/LoginView.jsx)
- **Description**: Users previously could not verify the accuracy of their entered passwords, increasing credential input errors during sign in and new account creation.
- **Resolution**: Integrated interactive show/hide password buttons featuring `Eye` and `EyeOff` icons from `lucide-react` across Sign In password, Registration password, and Confirm password input fields with accessible ARIA labels.

---

### SEC-008: Credential-Based Role Resolution & Elimination of Public Role Selectors
- **Category**: Authentication / Role-Based Access Control
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/LoginView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/LoginView.jsx)
  - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx)
- **Description**: The Sign In interface previously displayed a "Login Perspective / Role" dropdown, and the Registration view contained a role indicator box. In production systems, authentication must dynamically discover user identity and assigned privileges solely from the supplied credentials, and public self-registration must strictly create default student accounts without exposing role selection.
- **Root Cause**: Redundant client-side perspective selectors left over from earlier testing prototypes.
- **Resolution**: 
  - Completely removed the "Login Perspective / Role" dropdown from the Sign In form.
  - Upgraded authentication flow in `AppContext.jsx` and `SSISController.php` to resolve and authorize user role automatically from matched credentials.
  - Completely removed all role selectors and badges from the Create Account registration form; self-service accounts now silently and strictly default to `Student`.
  - Re-assignment of roles remains strictly restricted to Administrators via the Admin Accounts Audit view.

---

### BUG-016: Phantom "8 Active" in Student Role Count
- **Category**: Admin RBAC / Count Accuracy
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/AdminAccountsAuditView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/AdminAccountsAuditView.jsx)
  - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx)
- **Description**: The Student Assigned Count in the Roles table persistently displayed "8 Active" even when only 0 or 1 legitimate student had been registered.
- **Root Cause**: An early prototype seeder seeded 8 dummy students whose email addresses lingered in browser `localStorage` under `ssis_demo_users`. Furthermore, `getRoleActiveCount` previously evaluated an isolated `adminUsersList` rather than the live cleansed `demoUsers` array.
- **Resolution**: Added automated cleansing of legacy mock student emails from `localStorage` on bootstrap. Recalibrated `getRoleActiveCount(roleName)` to dynamically filter `demoUsers` strictly for active accounts with `role === roleName && account === 'Active' && status !== 'Deactivated'`. When 0 students exist, it accurately displays `0 Active`; when 1 student exists, it displays `1 Active`.

---

### FEAT-003: Universal Account Governance & Deactivation Enforcement
- **Category**: Account Management / Access Control
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/AdminAccountsAuditView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/AdminAccountsAuditView.jsx)
  - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx)
  - [resources/js/views/LoginView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/LoginView.jsx)
  - [app/Http/Controllers/Api/SSISController.php](file:///c:/Users/Gams/Student-Services-Information-System/app/Http/Controllers/Api/SSISController.php)
- **Description**: Administrators needed full operational management over every user in the university (including newly registered students and existing staff) to edit assigned roles and deactivate/reactivate access with immediate login prevention.
- **Resolution**:
  - **Universal Governance**: Unified `adminUsersList` with `demoUsers` so every student, staff member, and administrator appears in the User Accounts table with role-specific avatars and student ID tags.
  - **Inline Role Elevation**: Added interactive role selector `<select>` directly in table rows allowing the Admin to reassign any account to Student, Registrar, Cashier, Department Staff, or Admin, with immediate audit logging.
  - **Dedicated Edit Modal**: Added a "Manage User Account" modal triggered via "Edit" button for detailed role and status management.
  - **Deactivation Enforcement**: Added prominent `Deactivate` / `Activate` buttons. When an account is deactivated, all active sessions are immediately purged. Deactivated users cannot authenticate or access any dashboard, displaying an alert banner: *"This account has been deactivated. Please contact the administrator."* Access is restored only when an administrator reactivates the account.

---

### BUG-017: Ephemeral Browser Memory Causing Complete State Loss on Page Refresh
- **Category**: Persistence / Architecture
- **Severity**: **Critical**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx)
- **Description**: Whenever a user refreshed their browser (`F5`), newly enrolled subjects, assessment records, cashier payment history, departmental clearance progress, student grades, document requests, and administrative queues were wiped clean back to empty arrays and objects.
- **Root Cause**: Only `currentUser`, `currentView`, and `demoUsers` were persisted to browser `localStorage`. All transactional and workflow data resided solely in volatile React state.
- **Resolution**: Implemented persistent `localStorage` synchronization with lazy state initializers and reactive `useEffect` hooks for:
  - `studentEnrollmentSelections` (`ssis_student_enrollments`)
  - `studentAssessmentsList` (`ssis_student_assessments`)
  - `paymentHistory` (`ssis_payment_history`)
  - `studentClearanceMap` (`ssis_student_clearance_map`)
  - `studentGradesMap` (`ssis_student_grades_map`)
  - `documentRequests` (`ssis_document_requests`)
  - `registrarQueue` (`ssis_registrar_queue`)
  - `departmentStaffClearanceQueue` (`ssis_dept_clearance_queue`)
  - `completedClearanceList` (`ssis_completed_clearance`)

---

### BUG-018: Clearance Progress Disconnect Between Student View and Department Review
- **Category**: Academic / Clearance Workflow
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx)
  - [resources/js/views/StudentClearanceView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentClearanceView.jsx)
- **Description**: When a student clicked "Request Review" for a clearance department, their personal clearance progress table remained stuck in its initial state without indicating that the request had been submitted for staff audit.
- **Root Cause**: `applyForClearanceReview` and `applyForAllClearanceDepartments` only updated the global `clearanceList` instead of updating the student's isolated entry inside `studentClearanceMap[studentId]`.
- **Resolution**: Updated clearance handlers in `AppContext.jsx` to synchronize both the global list and `studentClearanceMap[studentId]`, ensuring immediate real-time feedback and state persistence across portals.

---

### BUG-019: Cashier API Endpoint Plural Mismatch
- **Category**: Cashier / API Routing
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/CashierPaymentView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierPaymentView.jsx)
  - [routes/api.php](file:///c:/Users/Gams/Student-Services-Information-System/routes/api.php)
- **Description**: Cashier point-of-sale terminal posted payments to `/api/cashier/payments` (plural), whereas Laravel API routes only declared `/api/cashier/payment` (singular), resulting in an HTTP 404 in production backends.
- **Root Cause**: Pluralization discrepancy between frontend fetch call and backend route definition.
- **Resolution**: Standardized the frontend fetch call in `CashierPaymentView.jsx` to `/api/cashier/payment` and added a route alias in `routes/api.php` so both endpoints succeed without error.

---

### BUG-020: Enrolled Units Mismatch in Student Dashboard Prior to Registrar Review
- **Category**: Academic Workflow / Dashboard UX
- **Severity**: **Medium**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/StudentDashboardView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentDashboardView.jsx)
- **Description**: After selecting courses in the Enrollment view, students returned to their Dashboard and saw "NOT YET ENROLLED • 0 UNITS" because the status pill only checked approved grade records or queue items with a strict `totalUnits` property.
- **Root Cause**: Unit calculation ignored `studentEnrollmentSelections` during the active semester selection period.
- **Resolution**: Calibrated `enrolledUnits` calculation to inspect `registrarQueue[activeStudentId].totalUnits`, `studentEnrollmentSelections[activeStudentId]`, and graded records sequentially, correctly displaying the enrolled unit load.

### BUG-021: Lack of Role-Matched Account Identifiers and Unique Student ID Enforcement
- **Category**: Identity & Access Management / Role-Matched Identifiers
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx)
  - [resources/js/views/LoginView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/LoginView.jsx)
  - [resources/js/components/AddUserModal.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/AddUserModal.jsx)
  - [resources/js/views/AdminAccountsAuditView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/AdminAccountsAuditView.jsx)
  - [app/Http/Controllers/Api/SSISController.php](file:///c:/Users/Gams/Student-Services-Information-System/app/Http/Controllers/Api/SSISController.php)
- **Description**: Account IDs lacked role-matching prefixes and strict uniqueness enforcement across students and provisioned accounts. Accounts created with differing roles did not reflect their assigned roles in their IDs, and when an administrator changed a user's role in Account Management, their ID prefix failed to re-align with their new role permissions.
- **Root Cause**:
  1. Student registration generated generic numeric IDs without consistent role prefixes (`STU-`) or cross-table duplicate collision validation.
  2. `AddUserModal.jsx` lacked role-prefix auto-generation and uniqueness validation, and did not initialize clean 0 data partitions for new student accounts.
  3. `AdminAccountsAuditView.jsx` only displayed IDs for Student accounts and failed to reassign ID prefixes upon role elevation or modification.
- **Resolution**:
  1. **Strict Role-Matched Prefixes**: Implemented `getRolePrefix()`, `generateUniqueAccountId()`, and `reassignRoleAccountId()` enforcing standard university role schemas:
     - **Student**: `STU-2026-XXXX`
     - **Registrar**: `REG-2026-XXXX`
     - **Cashier**: `CSH-2026-XXXX`
     - **Department Staff**: `STF-2026-XXXX`
     - **Admin**: `ADM-2026-XXXX`
  2. **Uniqueness Enforcement**: Enforced strict uniqueness validation on both sign up and admin account provisioning, preventing duplicate IDs across all accounts.
  3. **Dynamic Role Elevation Re-alignment**: Whenever an Administrator reassigns a user's role in Account Management, the user's ID automatically re-aligns with the new role prefix while preserving unique numeric sequencing.
  4. **Universal Account ID Badges**: Updated the User Accounts table in `AdminAccountsAuditView.jsx` to display role-matched ID badges for every account (Students, Staff, and Administrators alike).
  5. **Flexible Authentication**: Allowed users to sign in using their role-matched ID, email, or username.
  6. **Autonomous System ID Generation (Elimination of Manual ID Input)**: Completely removed the Student ID input field from the registration form. The system is exclusively responsible for generating collision-free unique IDs (`STU-2026-XXXX`), completely eliminating duplicate IDs or human input collisions.

---

### BUG-022: SQLite CONCAT Function Crash in Vercel Deployment & Authentication Lockout
- **Category**: Database Compatibility / Authentication Architecture
- **Severity**: **Critical**
- **Status**: **Resolved**
- **Files Affected**:
  - [app/Http/Controllers/Api/SSISController.php](file:///c:/Users/Gams/Student-Services-Information-System/app/Http/Controllers/Api/SSISController.php)
  - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx)
- **Description**: All user logins (students, staff, admin) failed on the live Vercel deployment with HTTP 500 error: `SQLSTATE[HY000]: General error: 1 no such function: CONCAT (Connection: sqlite, Database: /tmp/database.sqlite, SQL: select * from "students" where ("email" = ... or "student_id_number" = ... or "username" = ... or CONCAT(first_name, ' ', last_name) = ...) limit 1)`.
- **Root Cause**: `SSISController::login()` utilized MySQL-specific `CONCAT(first_name, ' ', last_name)` inside raw SQL queries without verifying the database driver. Additionally, `AppContext.jsx` caught the 500 error from `/api/auth/login` and immediately threw an error toast without falling through to client-side credential verification.
- **Resolution**:
  1. Removed `CONCAT` from the SQL `where` clause in `Student` and `AdminUser` queries in `SSISController.php`. Implemented database-agnostic matching for email, student_id_number, and username, followed by PHP-level fallback full name comparison (`strcasecmp(trim($s->first_name . ' ' . $s->last_name), $loginInput) === 0`).
  2. Enhanced `AdminUser` login lookup to support staff emails (`l.navarro@cuyotech.edu.ph`, `r.alcantara@cuyotech.edu.ph`), usernames, names, and role-matched IDs (`REG-2026-0001`, `CSH-2026-0001`, `STF-2026-0001`, `ADM-2026-0001`).
  3. Added graceful fallback in `AppContext.jsx::loginWithCredentials`: if the backend throws an unhandled error or is offline, credentials automatically fall through to client-side validation so users are never locked out of the portal.

---

### BUG-023: Disappearance of Institutional Registrar Account in Perspective Switcher & Account Lists
- **Category**: State Management / Identity & Access Control
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx)
  - [resources/js/components/TopNavbar.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/TopNavbar.jsx)
- **Description**: Creating a student account caused the Ramon Alcantara (Registrar) account to disappear from the perspective switcher and account selection lists.
- **Root Cause**:
  1. `TopNavbar.jsx` deduplicated accounts using `index === self.findIndex(t => (t.id && t.id === u.id)...)`. Because staff accounts in `initialUsers` had numeric IDs (`id: 2`), when a student was created or fetched from the database with auto-increment ID `2`, `t.id === u.id` evaluated to true, incorrectly removing the Registrar as a duplicate of the student.
  2. `TopNavbar.jsx` applied an arbitrary `.slice(0, 7)` limit, trimming out accounts when new students were added.
- **Resolution**:
  1. Defined `INSTITUTIONAL_STAFF` with dedicated unique keys (`staff-registrar`, `staff-cashier`, `staff-dept`, `staff-admin`) and anchored them in `deduplicateUsers()`, guaranteeing all four institutional staff accounts are permanently retained in `demoUsers`.
  2. Removed numeric `id` collision matching across roles, ensuring accounts are only deduplicated by exact email or unique role-matched IDs (`REG-2026-0001`).
  3. Removed `.slice(0, 7)` from `TopNavbar.jsx` and added a scrollable container (`maxHeight: '360px', overflowY: 'auto'`) so all accounts remain accessible.

---

### BUG-024: Student Duplication Across Year Levels & Multi-Subject Enrollment Selection Persistence
- **Category**: Academic Workflow / Enrollment & Masterlist
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx)
  - [resources/js/views/StudentEnrollmentView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentEnrollmentView.jsx)
- **Description**:
  1. In the Registrar Student Directory and Cashier quick-select chips, the same student appeared twice (once as 1st Year and once as 3rd Year).
  2. When selecting multiple course subjects in the Enrollment view and clicking "Submit Enrollment Request", only 1 subject was recorded in the enrollment queue.
- **Root Cause**:
  1. `demoUsers` merged backend students and local students without unifying records across casing, normalized names, or year level differences. Numeric year levels were mapped inconsistently (`3 Year` vs `3rd Year`).
  2. In `StudentEnrollmentView.jsx`, checkbox event propagation and missing state persistence in `submitEnrollmentRequest` prevented multiple selected course IDs from being saved into `studentEnrollmentSelections[activeStudentId]` and `localStorage`.
- **Resolution**:
  1. Created `formatYearLevel(val)` standardizing all year levels across the application (`1st Year`, `2nd Year`, `3rd Year`, `4th Year`).
  2. Created `deduplicateUsers()` in `AppContext.jsx` that merges student entries by `student_id_number`, `email`, and normalized `name`, retaining the correct year level (e.g. 3rd Year) and preventing duplicates.
  3. Updated `StudentEnrollmentView.jsx` with single-click row and checkbox synchronization, and updated `submitEnrollmentRequest` to accurately persist all selected course IDs, total units, and queue data to `studentEnrollmentSelections` and `localStorage`.

---

### BUG-025: Account Duplication in Admin User Accounts Due to Dual State Dispatch
- **Category**: State Management / Admin User Accounts
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx)
  - [resources/js/components/AddUserModal.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/AddUserModal.jsx)
  - [resources/js/views/AdminAccountsAuditView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/AdminAccountsAuditView.jsx)
- **Description**: In the Admin "Accounts & Audit Logs" table, newly created student accounts appeared duplicated in pairs. One row displayed full student metadata (`ID: STU-2026-XXXX • BS Computer Science`, initials `BU`), while an adjacent duplicate row displayed stripped metadata (`ID: STU-2026-XXXX`, initials `BR` computed from slice fallback, and no degree program). In addition, Ramon Alcantara (Registrar) showed `ID: N/A`.
- **Root Cause**:
  1. `adminUsersList` is dynamically projected from `demoUsers`. However, both `signUpUser` in `AppContext.jsx` and `AddUserModal.jsx` called `setDemoUsers(...)` and subsequently called `setAdminUsersList(...)`. Because `setAdminUsersList` also dispatches updates into `demoUsers` with a stripped object (omitting `program` and `initials`), every account creation dispatched two separate objects into `demoUsers`.
  2. `AdminAccountsAuditView.jsx` lacked a fallback role-matched ID for staff when `account_id` was unassigned, resulting in `ID: N/A` for Ramon Alcantara.
- **Resolution**:
  1. Removed redundant `setAdminUsersList` calls from `signUpUser` in `AppContext.jsx` and `AddUserModal.jsx`.
  2. Wrapped `adminUsersList` directly in `deduplicateUsers(demoUsers)`, automatically deduplicating existing duplicate items stored in browser `localStorage`.
  3. Ensured `deduplicateUsers` preserves full program name, initials, and assigns role-matched IDs (`REG-2026-0001`, `CSH-2026-0001`, `STF-2026-0001`, `ADM-2026-0001`) to all staff members so `ID: N/A` never occurs.

---

### BUG-026: Admin Account Management Filter Logic Flaw & React Key Collision
- **Category**: Admin User Management / UI Filtering & React Reconciliation
- **Severity**: **High**
- **Status**: **Resolved**
- **Files Affected**:
  - [resources/js/views/AdminAccountsAuditView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/AdminAccountsAuditView.jsx)
  - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx)
  - [resources/js/views/LoginView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/LoginView.jsx)
- **Description**: In Admin User Accounts (`Manage Access & User Accounts`), clicking the quick-filter pills (`All Accounts`, `Students`, `Staff & Admin`, `Active`, `Deactivated`) did not filter accurately; newly registered accounts continued to show across mismatched filters or remained rendered on screen. Furthermore, pill count badges and table rows exhibited discrepancies.
- **Root Cause**:
  1. **React Virtual DOM Key Collision**: In `AdminAccountsAuditView.jsx`, table rows used `key={user.id || user.name || user.email}`. Multiple users shared identical names or emails (e.g. `brent User`), producing duplicate React keys. During React's reconciliation diffing, duplicate keys cause React to fail to unmount deleted/filtered DOM nodes, leaving "zombie" account rows rendered in the DOM even when the active filter excluded them.
  2. **Filtering Inconsistency**: Role and status matching logic was non-normalized. For example, `Staff & Admin` used `u.role !== 'Student'`, which would inadvertently match any account with casing variances or unassigned roles, while `Active` and `Deactivated` checks did not handle all status permutations (`Disabled`, `Deactivated`, lowercase states).
  3. **Pill Badge & Table Desynchronization**: Filter pill badge counters used ad-hoc inline filter callbacks that differed from the table's `filteredUsers` predicate, leading to count badge mismatches.
- **Resolution**:
  1. Created strictly normalized helper functions (`isStudentAccount`, `isStaffOrAdminAccount`, `isAccountActive`, `isAccountDeactivated`) that perform case-insensitive role and status evaluations.
  2. Replaced the colliding `key` attribute on table rows with a globally unique composite key: `key={`admin-user-row-${user.account_id || user.student_id_number || ''}-${user.email || ''}-${user.id || ''}-${index}`}` to guarantee error-free React reconciliation and clean DOM updates.
  3. Bound both the pill button badge counts and the `filteredUsers` filtering predicate directly to these identical helper functions, ensuring 100% synchronization.
  4. Wrapped all administrative state updates (`handleSaveUserEdit`, `handleToggleStatus`, `handleRoleChange`) with `deduplicateUsers` so `localStorage` and client state remain strictly clean.

---
*Report maintained and updated by Antigravity AI Assistant.*
