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

---

## 3. Detailed Issue Reports & Root Cause Analysis

### SEC-001: Personal Name & Date in Database Password (.env)
- **Category**: Security / Configuration
- **Severity**: **Critical**
- **Status**: **Resolved**
- **Files Affected**:
  - [c:\Users\Gams\Student-Services-Information-System\.env](file:///c:/Users/Gams/Student-Services-Information-System/.env)
- **Description**: The `.env` file contained a hardcoded database password consisting of personal name and date information (`brent042006`).
- **Root Cause**: Developer local testing credential was committed into the environment configuration.
- **Resolution**: Replaced `DB_PASSWORD=brent042006` with `DB_PASSWORD=password` in `.env` as specified.

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
*Report maintained and updated by Antigravity AI Assistant.*
