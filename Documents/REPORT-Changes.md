# System Enhancement & Comprehensive Changes Report

**Project**: Student Services Information System (SSIS)  
**Backend**: Laravel 13, PHP 8.4, MySQL 8.0  
**Frontend**: React 18 SPA, Vite, Vanilla CSS Design System  
**Report Generated**: October 2026  

---

## Executive Summary

This report documents the architectural improvements, feature implementations, and bug fixes applied to the **Student Services Information System (SSIS)**. All user requests—including the non-functional search bar, document print isolation with downloadable PDF, grade record synchronization, distinct dashboard tabs across Cashier, Department Staff, and Admin modules, persistent user registration/authentication, and complete MySQL backend integration—have been addressed, verified, and tested.

---

## Detailed Breakdown of Implemented Changes

### 1. Global Navigation Search Bar
* **Previous Behavior**: The top search input was purely cosmetic; typing into it did not filter items, display suggestions, or navigate to matching records.
* **Changes Made**:
  - Replaced the static input in [resources/js/components/TopNavbar.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/TopNavbar.jsx) with a real-time reactive search component.
  - Implemented multi-category indexing spanning:
    - **Students**: Searches student names, ID numbers (e.g., `2024-01847`), and programs.
    - **Courses & Subjects**: Searches course codes (e.g., `CS 101`, `MATH 201`, `GE 104`) and course descriptions.
    - **Receipts & Transactions**: Searches official receipt numbers (e.g., `OR-2026-0842`) and payment references.
    - **Clearance Documents**: Searches certificate requests and clearance items.
    - **Application Navigation Pages**: Quick jump to Registrar, Cashier, Department Staff, Admin, Grades, and COR.
  - Added an interactive dropdown overlay with category badges, keyboard/click navigation, and a smooth backdrop dismiss feature.

---

### 2. Registrar: Certificate of Registration (COR) Printing & Downloadable PDF
* **Previous Behavior**: Clicking "Print COR" triggered `window.print()`, previewing the entire web page (sidebar navigation, top navbar, portal header, action buttons, and background colors) instead of isolating the certificate paper. There was also no option to download the document as a clean PDF file.
* **Changes Made**:
  - Created [resources/js/utils/pdfExport.js](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/utils/pdfExport.js) containing:
    - `printIsolatedElement(elementId, title)`: Extracts only the targeted DOM node (`#ssis-cor-document`), wraps it in an isolated print frame with proper print styling, and prints without any portal or browser chrome.
    - `downloadPdfFromElement(elementId, filename, options)`: Uses `html2canvas` and `jsPDF` to rasterize the document at high DPI (scale: 2) and saves an official `.pdf` file directly to the user's downloads folder.
  - Updated [resources/js/views/CertificateOfRegistrationView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CertificateOfRegistrationView.jsx):
    - Added an id `#ssis-cor-document` to the printable certificate card.
    - Replaced the generic print handler with `printIsolatedElement`.
    - Added a **"Download PDF"** button with download icon for direct PDF export (`COR-2024-01847.pdf`).
  - Added print-specific CSS rules in [resources/css/app.css](file:///c:/Users/Gams/Student-Services-Information-System/resources/css/app.css):
    - `@media print` rules set `.app-sidebar`, `.top-navbar`, `.header-actions`, buttons, and page chrome to `display: none !important`.
    - Sets page background to pure white and isolates `#ssis-cor-document` for clean hardcopy output.

---

### 3. Cashier: Official Receipt (OR) Printing & Downloadable PDF
* **Previous Behavior**: Printing the receipt from the receipt modal previewed the entire modal background, dashboard behind it, and window chrome.
* **Changes Made**:
  - Updated [resources/js/components/ReceiptModal.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/ReceiptModal.jsx):
    - Wrapped the official receipt in an isolated container `#ssis-official-receipt-paper`.
    - Added the **"Print Receipt"** button wired to `printIsolatedElement('ssis-official-receipt-paper', 'Official-Receipt.pdf')`.
    - Added the **"Download PDF"** button wired to `downloadPdfFromElement('ssis-official-receipt-paper', 'Official-Receipt-<OR_NUMBER>.pdf')`.
    - Formatted receipt layout with authentic university header, official seal watermark, transaction details, fee line items, cashier signature line, and payment QR code.
  - Added dedicated `@media print` styling rules ensuring only the receipt slip is printed.

---

### 4. Grade Records Synchronization & Instant GWA Recalculation
* **Previous Behavior**: When modifying a student's grade in the Registrar Grade Management view, the edited value was not reflected in the student's academic history, individual grade report, or calculated General Weighted Average (GWA).
* **Changes Made**:
  - Enhanced [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx):
    - Added `updateGradeRecord(subjectCode, studentIdNumber, newGrade)` function.
    - Synchronizes the change across `cs101Grades` and `studentGradesMap`.
    - Automatically recalculates total units earned and the student's cumulative GWA using university grade weighting.
    - Dispatches an asynchronous update to the backend endpoint `/api/registrar/grades/save` to persist changes into the MySQL `grades` table.
  - Updated [resources/js/views/RegistrarRecordsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarRecordsView.jsx):
    - Wired table inputs directly to the state management layer.
    - Added a "Commit All Changes" action that triggers database persistence and displays visual confirmation.
  - Updated [resources/js/views/StudentGradesView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentGradesView.jsx):
    - Connected report cards to `studentGradesMap`, ensuring that any grade modified by the Registrar immediately appears on the student's transcript and grade portal.

---

### 5. Cashier: Distinct Views for All Tabs
* **Previous Behavior**: Clicking "Recent Payments", "Reports", "Assessment", "Process Payment", and "Receipts" in the Cashier portal rendered identical or placeholder content.
* **Changes Made**: Created dedicated, feature-complete views for every tab:
  1. [resources/js/views/CashierPaymentView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierPaymentView.jsx):
     - Point-of-sale payment terminal with student search, fee selection, cash tender / change calculator, and instant official receipt generation.
  2. [resources/js/views/CashierRecentPaymentsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierRecentPaymentsView.jsx):
     - Complete ledger of posted transactions with transaction IDs, student names, payment methods (Cash, GCash, Bank Transfer), date filters, search, and status badges.
  3. [resources/js/views/CashierAssessmentsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierAssessmentsView.jsx):
     - Student tuition and fee assessment registry. Shows assessed units, tuition breakdown, miscellaneous fees, total charges, paid amounts, remaining balances, and due dates.
  4. [resources/js/views/CashierReceiptsArchiveView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierReceiptsArchiveView.jsx):
     - Official Receipt (OR) repository with quick preview modals, re-print actions, downloadable PDF options, and receipt status tracking.
  5. [resources/js/views/CashierReportsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierReportsView.jsx):
     - Daily, weekly, and monthly financial summaries, revenue KPI cards, collection breakdown by payment mode, and audit report generation.
  - Registered all routes in [resources/js/app.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/app.jsx):
    - `cashier` (Process Payment)
    - `cashier_payments` (Recent Payments)
    - `cashier_assessments` (Fee Assessments)
    - `cashier_receipts` (Receipts Archive)
    - `cashier_reports` (Financial Reports)

---

### 6. Department Staff & Admin: Distinct Subviews
* **Previous Behavior**: Clicking different sidebar navigation tabs inside the Department Staff and Admin portals resulted in the same view without changing content.
* **Changes Made**:
  - **Department Staff** ([resources/js/views/DepartmentClearanceView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/DepartmentClearanceView.jsx)):
    - `clearance_requests`: Active applicant queue with Approve, Hold, and Reject actions and requirement checklist.
    - `completed_clearance`: Archive of fully cleared students with issuance dates, clearance certificates, and filter by program.
    - `department_rules`: Departmental signing criteria, clearance guidelines, and prerequisite policies.
    - `dept_reports`: Clearance clearance rate statistics, pending bottleneck metrics, and department compliance reporting.
  - **Admin Portal** ([resources/js/views/AdminAccountsAuditView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/AdminAccountsAuditView.jsx)):
    - `user_accounts`: Comprehensive user directory with role filters, status toggles (Active / Inactive), reset password, and edit actions.
    - `audit_logs_view`: Real-time system audit trail with timestamps, user IP addresses, actions performed, and module tracking.
    - `roles_view`: Role permission matrix detailing access privileges for Student, Registrar, Cashier, Department Staff, and Admin.
    - `security_view`: Security policy configuration including session timeout, password complexity, and 2FA settings.
    - `system_settings_view`: Academic term management, active semester switch, grading lock dates, and maintenance mode controls.

---

### 7. Authentication: Sign Up & User Registration
* **Previous Behavior**: Hardcoded credentials allowed only predefined accounts (such as Maria Santos) to log in. There was no user registration or sign-up mechanism.
* **Changes Made**:
  - Overhauled [resources/js/views/LoginView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/LoginView.jsx) with a tabbed interface ("Sign In" and "Create Account"):
    - **Registration Fields**: Full Name, Email Address, Student / Employee ID Number, Role Selection (Student, Registrar, Cashier, Department Staff, Admin), Academic Program (for students), Year Level, and Password.
    - **Backend API Integration**: Calls `/api/auth/register`, which validates input, hashes the password via `bcrypt`, and creates the record in the MySQL `students` or `users` table.
    - **Seamless Login**: Upon successful registration, the newly created account can immediately authenticate via the "Sign In" tab or auto-fill.
    - **Role Selector Chips**: Included 1-click demo credential chips for rapid evaluation across all 5 institutional roles.

---

### 8. Backend & MySQL Database Integration
* **Previous Behavior**: Application lacked persistent MySQL database configuration, controllers had missing endpoints, and database tables were not populated.
* **Changes Made**:
  - Configured [.env](file:///c:/Users/Gams/Student-Services-Information-System/.env) for local MySQL server:
    ```env
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=ssis
    DB_USERNAME=root
    DB_PASSWORD=********
    ```
  - Ran database migrations and seeders, generating normalized tables:
    - `students`
    - `programs`
    - `courses`
    - `sections`
    - `enrollments`
    - `grades`
    - `clearance_requests`
    - `cashier_transactions`
    - `assessments`
    - `audit_logs`
  - Created RESTful API endpoints in [routes/api.php](file:///c:/Users/Gams/Student-Services-Information-System/routes/api.php) handled by [app/Http/Controllers/Api/SSISController.php](file:///c:/Users/Gams/Student-Services-Information-System/app/Http/Controllers/Api/SSISController.php):
    - `POST /api/auth/register`: Creates and stores new user accounts.
    - `POST /api/auth/login`: Authenticates user credentials with password verification.
    - `GET  /api/bootstrap`: Returns full initial system data (students, grades, queue, users, audit trail).
    - `POST /api/registrar/grades/save`: Persists grade modifications directly to MySQL.
    - `GET  /api/cashier/data`: Returns transaction ledger, fee assessments, and collection summary.
    - `GET  /api/clearance/data`: Returns pending/completed clearance lists and compliance statistics.

---

## Verification & Testing Results

### 1. PHPUnit Automated Feature Tests
* **Test Suite**: [tests/Feature/SSISApiTest.php](file:///c:/Users/Gams/Student-Services-Information-System/tests/Feature/SSISApiTest.php)
* **Execution Command**: `php artisan test --compact`
* **Result**:
  ```json
  {"tool":"phpunit","result":"passed","tests":8,"passed":8,"assertions":34,"duration_ms":851}
  ```
* **Tests Passed**:
  1. `test_system_bootstrap_returns_state` — PASSED
  2. `test_user_registration_creates_student` — PASSED
  3. `test_user_login_authenticates_student` — PASSED
  4. `test_registrar_grades_save_updates` — PASSED
  5. `test_cashier_data_endpoint` — PASSED
  6. `test_clearance_data_endpoint` — PASSED
  7. `test_that_true_is_true` (Unit) — PASSED
  8. `test_the_application_returns_a_successful_response` (Feature) — PASSED

---

### 2. Live HTTP Endpoint Verification
Tested against running server `http://127.0.0.1:8000`:
* **Account Registration (`POST /api/auth/register`)**:
  - Payload: Neutral sample account (`Elena Rodriguez`, `elena.rodriguez@university.edu`, ID: `2026-88001`)
  - Status: `200 OK`
  - Database verification: Record saved in MySQL `students` table with ID `9`.
* **Account Login (`POST /api/auth/login`)**:
  - Payload: Registered email and password
  - Status: `200 OK`
  - Result: Returned authenticated user object and role permissions.
* **Cashier Ledger Data (`GET /api/cashier/data`)**:
  - Status: `200 OK` (Returned 2 active payments and 2 fee assessments)
* **Clearance Pipeline Data (`GET /api/clearance/data`)**:
  - Status: `200 OK` (Returned 11 pending requests and 3 completed records)
* **Grade Modification Persistence (`POST /api/registrar/grades/save`)**:
  - Status: `200 OK` (Grade value updated to `1.50`, status `Passed`, verified in MySQL `grades` table)

---

### 3. Code Quality & Formatting
* **Laravel Pint**: Executed `vendor/bin/pint --format agent` — Passed without formatting violations.
* **Frontend Bundle**: Executed `npm run build` with Vite — Built all assets into `public/build/` without errors.

---

## File Inventory of Changes

| File | Status | Description |
|---|---|---|
| `REPORT-Changes.md` | Created | Comprehensive change log and system verification report |
| `resources/js/utils/pdfExport.js` | Created | Isolated printing and high-res client-side PDF export utility |
| `resources/js/views/CashierRecentPaymentsView.jsx` | Created | Cashier recent payments and ledger view |
| `resources/js/views/CashierAssessmentsView.jsx` | Created | Student fee assessment and balance breakdown view |
| `resources/js/views/CashierReceiptsArchiveView.jsx` | Created | Official Receipt archive and reprint view |
| `resources/js/views/CashierReportsView.jsx` | Created | Financial collection and revenue analytics report view |
| `tests/Feature/SSISApiTest.php` | Created | Backend API integration test suite covering auth, grades, cashier, clearance |
| `app/Http/Controllers/Api/SSISController.php` | Modified | Added registration, login, grade update, cashier, and clearance API handlers |
| `routes/api.php` | Modified | Registered backend REST endpoints |
| `resources/css/app.css` | Modified | Added print isolation styles, hide non-document chrome |
| `resources/js/app.jsx` | Modified | Registered distinct routes for all Cashier, Dept, and Admin tabs |
| `resources/js/context/AppContext.jsx` | Modified | Added live grade updating, GWA recalculation, and database sync |
| `resources/js/components/TopNavbar.jsx` | Modified | Implemented interactive global search overlay |
| `resources/js/components/ReceiptModal.jsx` | Modified | Implemented isolated OR print and PDF download |
| `resources/js/views/CertificateOfRegistrationView.jsx` | Modified | Implemented isolated COR print and PDF download |
| `resources/js/views/RegistrarRecordsView.jsx` | Modified | Connected grade inputs to reactive state and MySQL sync |
| `resources/js/views/StudentGradesView.jsx` | Modified | Reactive grade transcript and GWA display |
| `resources/js/views/CashierPaymentView.jsx` | Modified | Streamlined payment POS terminal with live receipt generation |
| `resources/js/views/DepartmentClearanceView.jsx` | Modified | Implemented 4 distinct subviews for Department Staff tabs |
| `resources/js/views/AdminAccountsAuditView.jsx` | Modified | Implemented 5 distinct subviews for Admin tabs |
| `resources/js/views/LoginView.jsx` | Modified | Added Sign Up / Create Account tab with MySQL registration |

---

# Revision 2: Institutional Rebranding, Identity Sync, Honor Standards & Tab Isolation

**Revision Date**: October 5, 2026  
**Status**: Completed and Verified

---

## 1. Dynamic User Greeting & Identity Resolution
* **Previous Issue**: When logging into a newly created account (such as "Gams"), the dashboard continued to display `"Good morning, Maria Santos"`, hardcoded unit counts (`ENROLLED • 21 UNITS`), and static mock data.
* **Changes Implemented**:
  - **Dynamic Dashboard Greeting**: Updated [resources/js/views/StudentDashboardView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentDashboardView.jsx) to dynamically bind greeting to the authenticated user's name: `Good morning, {currentUser?.name || 'Student'}`.
  - **Dynamic Enrolled Units Badge**: Calculates total academic units dynamically from the student's actual enrolled subjects. For a fresh student account, it displays `ENROLLED • 0 UNITS`.
  - **Unified Identity Across Student Views**:
    - [resources/js/views/StudentGradesView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentGradesView.jsx): Displays `{currentUser?.name}` and `{currentUser?.studentId || currentUser?.id}`.
    - [resources/js/views/StudentPaymentsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentPaymentsView.jsx): Dynamic student ledger and account balance.
    - [resources/js/views/StudentDocumentsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentDocumentsView.jsx): Dynamic credential requests tied to student identity.
    - [resources/js/views/StudentClearanceView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentClearanceView.jsx): Dynamic department signatories for the authenticated student.
    - [resources/js/views/StudentEnrollmentView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentEnrollmentView.jsx): Dynamic study plan and subject load.

---

## 2. Institutional Rebranding to Pamantasan ng Cabuyao (PNC)
* **Previous Issue**: Application was branded under "Northridge State University" without official insignia.
* **Changes Implemented**:
  - **Official Insignia Integration**: Acquired and verified the official Pamantasan ng Cabuyao seal (green outer ring, gold bell, 2003 founding year, open book, and flaming torch) saved at `public/images/pnc-logo.png`.
  - **Comprehensive Text & Asset Rebranding**:
    - [resources/js/components/Sidebar.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/Sidebar.jsx): Brand header now features the official PNC crest, "SSIS", and "PAMANTASAN NG CABUYAO".
    - [resources/js/components/TopNavbar.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/TopNavbar.jsx): University header and institutional search bar branding updated to PNC.
    - [resources/js/views/LoginView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/LoginView.jsx): Auth portal displays the official PNC logo, subtitle "Pamantasan ng Cabuyao • Cabuyao, Laguna", and updated institutional role chips.
    - [resources/js/components/ReceiptModal.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/ReceiptModal.jsx): Official Payment Receipt header branded as:
      ```
      PAMANTASAN NG CABUYAO (PNC)
      Cabuyao, Laguna • Cashiering & Financial Services Office
      OFFICIAL PAYMENT RECEIPT
      ```
    - [resources/js/views/CertificateOfRegistrationView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CertificateOfRegistrationView.jsx): Official Certificate of Registration (COR) header branded as:
      ```
      PAMANTASAN NG CABUYAO
      Office of the University Registrar • Cabuyao, Laguna
      CERTIFICATE OF REGISTRATION (COR)
      ```
    - [resources/js/views/DepartmentClearanceView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/DepartmentClearanceView.jsx) & [resources/js/views/CashierReportsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierReportsView.jsx): All institutional watermarks and sub-headers updated to Pamantasan ng Cabuyao.

---

## 3. "No Student Dummy Data / Default 0" Rule
* **Previous Issue**: Dummy student records populated newly registered student accounts with pre-existing grades, assessments, and enrolled courses.
* **Changes Implemented**:
  - **Dummy Data Boundary**: Predefined demo accounts are strictly reserved for administrative/operational staff (Registrar: Ramon Alcantara, Cashier: Leah Navarro, Department Staff: Dina Flores, Admin: Victor Ramos).
  - **Student Account Clean Slate**:
    - Removed `Maria Santos` and any static mock students from `initialUsers` in [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx).
    - When a student registers (e.g. "Gams"):
      - **Enrolled Units**: `0` (clean empty state in Enrollment tab)
      - **Grades**: `[]` (clean empty state: *"No academic grades encoded yet by the University Registrar"* with `GWA: 0.00`)
      - **Assessed Fees**: `PHP 0.00` ("Unassessed" status)
      - **Ledger / Payments**: `[]` (clean empty state: *"No payment transactions recorded"*)
      - **Document Requests**: `[]` (clean empty state: *"No active document requests"*)
      - **Clearance**: Initialized to 5 unapproved / pending offices (Registrar, Cashier, Library, Dept Head, Guidance).
  - **Inter-Role Data Propagation**:
    - A student only receives data when authorized staff encode or approve it:
      - **Registrar** encodes grades or confirms subjects $\rightarrow$ Student's Grades & Enrollment reflect new units and GWA.
      - **Cashier** generates an assessment or accepts payment $\rightarrow$ Student's Balance and Receipts update with official PNC OR.
      - **Department Staff** signs clearance $\rightarrow$ Student's Clearance status shifts to Cleared.

---

## 4. Dean's Honor List Standard & Academic Standing Correction
* **Previous Issue**: A student transcript with a GWA of `2.16` and a failing grade of `5.00` in *CS 101 Introduction to Computing* was incorrectly labeled with *"Dean's Honor List Standing"*.
* **Changes Implemented**:
  - Created standardized academic standing calculator [resources/js/utils/academicStanding.js](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/utils/academicStanding.js) following CHED and Pamantasan ng Cabuyao academic policies:
    1. **Failing Grade Disqualification**: If a student possesses any grade of `5.00` (or $> 3.00$), they are strictly disqualified from academic honors. Status: `Ineligible for Honors (Has Failing Grade)` with red warning badge (`#DC2626`).
    2. **Cutoff Standards**:
       - `GWA 1.00 – 1.45` (no grade below 2.00): **President's Honor List Standing** (Gold badge `#D97706`)
       - `GWA 1.46 – 1.75` (no grade below 2.50): **Dean's Honor List Standing** (Emerald badge `#059669`)
       - `GWA 1.76 – 3.00`: **Good Academic Standing** (Blue badge `#2563EB`, note: *"GWA above the 1.75 honors threshold"*)
       - `No grades / 0 units`: **No Grades Evaluated** (Neutral badge)
  - Integrated `computeAcademicStanding` into [resources/js/views/StudentGradesView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentGradesView.jsx) and [resources/js/views/RegistrarReportsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarReportsView.jsx).

---

## 5. Distinct Tabs & Subviews Across All 5 Institutional Roles
* **Previous Issue**: Clicking different navigation tabs inside staff roles caused the same view to re-render.
* **Changes Implemented**:
  - **Registrar (6 Distinct Views)**:
    1. `approvals`: Enrollment Verification & Approval Queue ([resources/js/views/RegistrarEnrollmentApprovalView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarEnrollmentApprovalView.jsx)).
    2. `academic_records`: Course Grade Encoding & Transcript Management ([resources/js/views/RegistrarRecordsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarRecordsView.jsx)) with student selector and "Add Student" functionality.
    3. `student_records`: Student Masterlist & Directory ([resources/js/views/RegistrarStudentRecordsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarStudentRecordsView.jsx)) with live filtering, program summaries, and student inspection drawer.
    4. `documents_queue`: Academic Credentials Request Processing Queue ([resources/js/views/RegistrarDocumentsQueueView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarDocumentsQueueView.jsx)) with status toggle (Pending $\rightarrow$ Processing $\rightarrow$ Ready $\rightarrow$ Released).
    5. `cor_archive`: Official Certificate of Registration Generator ([resources/js/views/CertificateOfRegistrationView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CertificateOfRegistrationView.jsx)) with student switcher, isolated print, and PDF export.
    6. `registrar_reports`: Academic Performance & Honors Analytics ([resources/js/views/RegistrarReportsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarReportsView.jsx)) with GWA distribution and Dean's List eligibility breakdown.
  - **Cashier (5 Distinct Views)**:
    1. `cashier_payment`: Cashiering POS Terminal ([resources/js/views/CashierPaymentView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierPaymentView.jsx)) with live student search and instant OR generation.
    2. `cashier_recent`: Payment Transaction Ledger ([resources/js/views/CashierRecentPaymentsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierRecentPaymentsView.jsx)).
    3. `cashier_assessments`: Student Fee Assessment & Tuition Breakdown ([resources/js/views/CashierAssessmentsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierAssessmentsView.jsx)).
    4. `cashier_receipts`: Official Receipt Archive ([resources/js/views/CashierReceiptsArchiveView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierReceiptsArchiveView.jsx)).
    5. `cashier_reports`: Daily Financial Collection & Revenue Analytics ([resources/js/views/CashierReportsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierReportsView.jsx)).
  - **Department Staff (4 Distinct Subviews)**:
    - Integrated reactive view-switching in [resources/js/views/DepartmentClearanceView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/DepartmentClearanceView.jsx) for `clearance_queue`, `batch_approval`, `student_compliance`, and `department_reports`.
  - **System Admin (5 Distinct Subviews)**:
    - Integrated reactive view-switching in [resources/js/views/AdminAccountsAuditView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/AdminAccountsAuditView.jsx) for `admin_dashboard`, `user_accounts`, `system_audit`, `security_settings`, and `system_settings`.
  - **Student (6 Distinct Views)**:
    - Dashboard, Enrollment, Grades, Documents, Payments, and Clearance each render their dedicated components with live student data.

---

## 6. Verification and Regression Testing Summary

| Test Category | Target Component | Command / Tool | Status |
|---|---|---|---|
| Automated API Suite | SSIS REST API | `php artisan test --compact` | **8 passed, 34 assertions (0 errors)** |
| Code Standards | PHP Backend | `vendor/bin/pint --format agent` | **Clean / Formatted** |
| Frontend Assets | React 19 + Vite | `npm run build` | **Built in 677ms (0 errors)** |
| Development Server | Laravel HTTP Engine | `php artisan serve --port=8000` | **Active on port 8000** |
| Vite HMR Server | Vite Bundler | `npm run dev` | **Active on port 5173** |

---

---

## 7. Hotfix: Blank Screen Resolution
* **Root Cause**: `resources/views/welcome.blade.php` defined `<div id="root"></div>`, whereas `resources/js/app.jsx` previously queried `document.getElementById('app')`. Because the element was `null`, React never mounted, presenting a blank white screen. In addition, Vite dev server bound to IPv6 `[::1]:5173` which caused loopback resolution issues in certain browser configurations.
* **Resolution Applied**:
  - Updated [resources/js/app.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/app.jsx) to mount flexibly on `document.getElementById('root') || document.getElementById('app')`.
  - Added a global `ErrorBoundary` in [resources/js/app.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/app.jsx) with a branded recovery UI to ensure the portal never renders a silent blank screen under any unexpected runtime condition.
  - Configured explicit `host: 'localhost'` and `port: 5173` in [vite.config.js](file:///c:/Users/Gams/Student-Services-Information-System/vite.config.js) to guarantee seamless asset loading across all environments.
  - Re-compiled production bundle with `npm run build` and restarted Vite dev server.

---

## 8. Revision 3: Official Course Catalog, Document Approvals Fix, Enrollment Flow & Student Data Purge

### 8.1 Complete Purge of Student Dummy Data
* **Requirement**: Pre-existing student dummy accounts (Maria Santos, Miguel Reyes, Angela Cruz, Paolo Garcia, etc.) must be completely removed. Pre-populated accounts must strictly exist **only** for institutional staff (Registrar, Cashier, Department Staff, Admin). When a user registers a new student account, all attributes and balances start at clean default 0 and are only populated dynamically by staff actions.
* **Changes Implemented**:
  - Overhauled [database/seeders/DatabaseSeeder.php](file:///c:/Users/Gams/Student-Services-Information-System/database/seeders/DatabaseSeeder.php):
    - Removed all hardcoded student records.
    - Seeded only institutional staff accounts:
      - **Registrar**: Ramon Alcantara (`ramon.alcantara@pnc.edu.ph`)
      - **Cashier**: Leah Navarro (`leah.navarro@pnc.edu.ph`)
      - **Department Staff**: Dina Flores (`dina.flores@pnc.edu.ph`)
      - **Admin**: Victor Ramos (`admin@pnc.edu.ph`)
  - Updated [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx) `demoUsers`:
    - Contains strictly the 4 institutional staff members. Zero mock students exist on fresh launch.
    - Newly created student accounts dynamically register via `/api/auth/register`, begin with default 0 grades, 0 balance, and pending enrollment.
  - Re-seeded database: `php artisan migrate:fresh --seed` (verified `students` count = 0).

---

### 8.2 Official Pamantasan ng Cabuyao CCS Course Catalog
* **Requirement**: Replace obsolete courses (`CS 101`, `MATH 121`, `ENG 103`, `CS 115`, `NSTP 2`) with the exact 7 official College of Computing Studies (CCS) curriculum courses:
  1. **`CCS109`**: System Analysis and Design (3 units)
  2. **`CCS112`**: Applications Development and Emerging Technologies (3 units)
  3. **`CSP108`**: Programming Languages (3 units)
  4. **`CCS106`**: Social Issues and Professional Practice (3 units)
  5. **`CSEG1`**: Game Concepts and Production (3 units)
  6. **`ENV101`**: Environmental Science (3 units)
  7. **`CSP105`**: Algorithms and Complexity (3 units)
* **Changes Implemented**:
  - Seeded all 7 courses and their respective lecture/lab sections in [database/seeders/DatabaseSeeder.php](file:///c:/Users/Gams/Student-Services-Information-System/database/seeders/DatabaseSeeder.php).
  - Updated `scheduleCourses` in [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx) with the 7 official courses, codes, units (3.0 each, 21.0 units total), room assignments, and available slots.
  - Updated [resources/js/views/RegistrarRecordsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarRecordsView.jsx):
    - Replaced the hardcoded subject `<select>` dropdown with the 7 official courses.
    - Default subject set to `CCS109`.
  - Updated `updateGradeRecord` in [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx) and `saveGrades` in [app/Http/Controllers/Api/SSISController.php](file:///c:/Users/Gams/Student-Services-Information-System/app/Http/Controllers/Api/SSISController.php) to dynamically bind grades to the selected official course.

---

### 8.3 Fix: Document Request Status Update & Approver Attribution
* **Previous Issue**: In Registrar `Documents` tab ([resources/js/views/RegistrarDocumentsQueueView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarDocumentsQueueView.jsx)), clicking **Approve** or **Release** failed to update the status in the UI. Furthermore, the approver's identity was not recorded or displayed to the student.
* **Root Cause**:
  - `RegistrarDocumentsQueueView` rendered an array combining `registrarDocumentQueue` and `documentRequests`.
  - Its local `handleUpdateStatus` only mapped over `registrarDocumentQueue`. Requests submitted by students (which lived in `documentRequests`) were never modified, so on every re-render the status remained `Pending`.
* **Changes Implemented**:
  - Added atomic state updater `updateDocumentRequestStatus(id, newStatus)` in [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx):
    - Concurrently updates both `documentRequests` and `registrarDocumentQueue`.
    - Handles string/integer ID type mismatches.
    - Captures approver metadata: `approvedBy: 'Ramon Alcantara (Registrar)'` and `processedAt`.
    - Persists status change to the backend via `POST /api/registrar/documents/{id}/release`.
  - Updated [resources/js/views/RegistrarDocumentsQueueView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarDocumentsQueueView.jsx):
    - Wired `updateDocumentRequestStatus` to the action buttons.
    - Action buttons dynamically adjust:
      - `Pending`: Shows **Approve** (marks Approved) and **Release** (marks Ready for Release).
      - `Approved`: Shows **Release** (marks Ready for Release).
      - `Ready for Release`: Shows **Claimed** (marks Released / Handed over to student).
      - Displays approver subtext: `by Ramon Alcantara (Registrar)`.
  - Updated [resources/js/views/StudentDocumentsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentDocumentsView.jsx):
    - Submits via `submitDocumentRequest`, synchronizing student and registrar queues in real-time.
    - Displays `by <Approver>` directly below the status badge in the student's request history.

---

### 8.4 Enrollment Request Routing & Approval Lifecycle (DFD 2.0 Integration)
* **User Question / Issue**: *"where does Enrollment Request goes, i dont see it as the system says its from registar"*.
* **Workflow Clarification & Implementation**:
  - **Where it goes**: When a student builds their schedule in [resources/js/views/StudentEnrollmentView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentEnrollmentView.jsx) and clicks **Submit Enrollment Request**, the request is immediately dispatched into the **Registrar's Enrollment Approvals Queue**.
  - **Registrar Workspace**:
    - Renamed sidebar tab in [resources/js/components/Sidebar.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/Sidebar.jsx) from generic *"Approvals"* to **"Enrollment Approvals"** for absolute clarity.
    - In [resources/js/views/RegistrarApprovalsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarApprovalsView.jsx), the Registrar evaluates student eligibility (prerequisites, profile, account hold).
  - **On Registrar Approval**:
    - Calls `approveEnrollmentRequest(queueItemId)`.
    - Updates student's enrollment status to **Approved**.
    - Automatically bills/assesses tuition (e.g. `21.0 units @ 1,500/unit + 2,500 misc fee = PHP 34,000.00`) and pushes the ledger directly to the **Cashier POS** ([resources/js/views/CashierPaymentView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierPaymentView.jsx)).
    - Generates and activates the official **Certificate of Registration (COR)** in [resources/js/views/CertificateOfRegistrationView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CertificateOfRegistrationView.jsx).

---

### 8.5 Verification & Test Execution
- **Laravel PHPUnit Test Suite**: `vendor/bin/phpunit` $\rightarrow$ **8 passed, 33 assertions, 0 errors**.
- **Laravel Pint Code Formatter**: `vendor/bin/pint --format agent` $\rightarrow$ **Passed cleanly**.
- **Vite Bundler**: `cmd /c "npm.cmd run build"` $\rightarrow$ **Production build compiled in 751ms**.

---

## 9. Revision: CuyoTech University Rebranding, Student Identity Resolution & Department Clearance Workflow

### 9.1 Institutional Rebranding to "CuyoTech University"
* **Requirement**: Change all occurrences of the university name to **"CuyoTech University"**.
* **Changes Implemented**:
  - **Environment & App Config**:
    - Updated `.env`: `APP_NAME="CuyoTech University"`.
    - Updated HTML Document Title in [resources/views/welcome.blade.php](file:///c:/Users/Gams/Student-Services-Information-System/resources/views/welcome.blade.php): `<title>CuyoTech University — Student Services Information System (SSIS)</title>`.
  - **Sidebar & Layout Navigation**:
    - [resources/js/components/Sidebar.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/Sidebar.jsx): Brand title updated to `CUYOTECH • SSIS` and subtitle to `CuyoTech University`.
    - [resources/js/app.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/app.jsx): Error boundary and fallback title updated to `CuyoTech University — SSIS`.
  - **Context & Staff Credentials**:
    - [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx): Official staff email domains updated to `@cuyotech.edu.ph` (`r.alcantara@cuyotech.edu.ph`, `l.navarro@cuyotech.edu.ph`, `d.flores@cuyotech.edu.ph`, `v.ramos@cuyotech.edu.ph`).
    - Toast notifications and system audit log entries rebranded to CuyoTech University.
  - **Authentication & Sign Up**:
    - [resources/js/views/LoginView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/LoginView.jsx): Hero banner, heading, email placeholders, and registration prompts updated to CuyoTech University.
  - **Student Portal Views**:
    - [resources/js/views/StudentDashboardView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentDashboardView.jsx): Page tags, announcements, and footer updated.
    - [resources/js/views/StudentGradesView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentGradesView.jsx): Academic record tags and Dean's/President's list criteria updated.
    - [resources/js/views/StudentEnrollmentView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentEnrollmentView.jsx): Page tags and academic footer updated.
    - [resources/js/views/StudentPaymentsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentPaymentsView.jsx): Cashiering and assessment footer updated.
    - [resources/js/views/StudentDocumentsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentDocumentsView.jsx): Registrar office footer updated.
    - [resources/js/views/StudentClearanceView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentClearanceView.jsx): Student affairs & clearance services tag and footer updated.
  - **Registrar Workspace Views**:
    - [resources/js/views/CertificateOfRegistrationView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CertificateOfRegistrationView.jsx): Official COR header updated to `CUYOTECH UNIVERSITY`, subtitle to `CuyoTech University • College of Computing Studies`, and official seal to `CUYOTECH REGISTRAR VERIFIED`.
    - [resources/js/views/RegistrarApprovalsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarApprovalsView.jsx), [RegistrarRecordsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarRecordsView.jsx), [RegistrarStudentRecordsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarStudentRecordsView.jsx), [RegistrarDocumentsQueueView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarDocumentsQueueView.jsx), and [RegistrarReportsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarReportsView.jsx): Tags, report titles, and footers updated.
  - **Cashier & Department Views**:
    - [resources/js/views/CashierPaymentView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierPaymentView.jsx), [CashierRecentPaymentsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierRecentPaymentsView.jsx), [CashierAssessmentsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierAssessmentsView.jsx), [CashierReceiptsArchiveView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierReceiptsArchiveView.jsx), and [CashierReportsView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierReportsView.jsx): Tags, headers, and footers updated.
    - [resources/js/components/ReceiptModal.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/ReceiptModal.jsx): Header and footer updated to `CUYOTECH UNIVERSITY` and `CuyoTech University • Office of the Cashier`.
    - [resources/js/views/DepartmentClearanceView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/DepartmentClearanceView.jsx) and [AdminAccountsAuditView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/AdminAccountsAuditView.jsx): Report and administration headers updated.

---

### 9.2 Fix: Student Name Displaying as Registrar on COR (Student Identity Resolution)
* **Problem**: In COR Archive ([resources/js/views/CertificateOfRegistrationView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CertificateOfRegistrationView.jsx)), when the Registrar (`Ramon Alcantara`) viewed the Certificate of Registration, the student name, student ID, and student signature were displayed as `Ramon Alcantara`, identical to the issuing authority.
* **Root Cause**:
  - The fallback logic evaluated `demoUsers.find(u => u.student_id_number === selectedStudentId) || currentUser`.
  - When no mock student existed in `demoUsers`, the expression fell back to `currentUser`. Since the logged-in user was the Registrar (`Ramon Alcantara`), the COR treated the Registrar as the enrolled student.
* **Changes Implemented**:
  - Refactored student resolution in [resources/js/views/CertificateOfRegistrationView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CertificateOfRegistrationView.jsx):
    ```javascript
    let student = null;
    if (isStudentUser) {
      // When a student is logged in, their COR strictly displays their own name and ID
      student = currentUser;
    } else {
      // When viewed by staff (Registrar), strictly select a registered student or queue applicant
      student = registeredStudents.find(u => u.student_id_number === selectedStudentId)
        || registeredStudents[0]
        || (registrarQueue[0] ? {
            name: registrarQueue[0].studentName,
            student_id_number: registrarQueue[0].studentIdNumber,
            program: registrarQueue[0].program,
            year_level: registrarQueue[0].yearLevel,
            academic_term: registrarQueue[0].term || '2nd Sem, AY 2025–2026'
          } : null);
    }
    ```
  - Added clean empty-state fallback when zero students are registered:
    - Renders an informative card: *"There are currently no registered students in the system. Once a student registers an account or submits an enrollment schedule, their Certificate of Registration (COR) will generate here."*
    - Prevents non-student accounts (Registrar, Cashier, Admin) from ever being substituted as a student.
  - Enhanced role perspective switcher in [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx) and [resources/js/components/TopNavbar.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/TopNavbar.jsx) to accept `(role, specificUser)` so selecting a registered student switches directly to their active profile.

---

### 9.3 Department Staff Clearance Queue Linkage & Dummy Students Removal
* **Problem**:
  1. In [resources/js/views/StudentClearanceView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentClearanceView.jsx), clicking **"Apply for Clearance Review"** did not push the application to the Department Staff queue.
  2. In [resources/js/views/DepartmentClearanceView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/DepartmentClearanceView.jsx), hardcoded mock students (`Carlo Mendoza`, `Joyce Tan`) appeared in the clearance lists.
* **Changes Implemented**:
  - **Purged Uncorrelated Mock Students**:
    - Emptied initial state for `departmentStaffClearanceQueue` (`[]`) and `completedClearanceList` (`[]`) in [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx).
    - Only legitimate registered students who actively submit clearance requests appear in Department Staff queues.
  - **Real-Time Clearance Dispatch Workflow**:
    - Created `applyForClearanceReview(targetDepartment)` in [resources/js/context/AppContext.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx):
      - Assembles dynamic clearance record (`studentName`, `studentId`, `department`, `date`, `status: 'Pending'`).
      - Immediately pushes to `departmentStaffClearanceQueue`.
      - Updates student's `clearanceList` status and remarks (*"Clearance review submitted • Awaiting staff sign-off"*).
      - Synced to backend API via `POST /api/clearance/request`.
  - **Enhanced Student Clearance UI**:
    - In [resources/js/views/StudentClearanceView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentClearanceView.jsx):
      - Added department selection dropdown allowing students to apply for individual pending departments (e.g. `University Library`, `Computer Laboratory`, `Guidance & Counseling`, `Office of Student Affairs`, `College Dean`) or `All Pending Departments`.
      - Added individual row-level **"Request Review"** action buttons for each uncleared department.
  - **Department Staff Decision Propagation**:
    - In [resources/js/views/DepartmentClearanceView.jsx](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/DepartmentClearanceView.jsx):
      - Clicking **Approve** updates the student's status for that department to `Cleared`, adds staff remarks (`Cleared by Department Staff (D. Flores)`), increments the student's cleared counter (e.g. `2 OF 5`), removes the request from the pending queue, and logs to `completedClearanceList`.
      - Clicking **Decline** prompts for deficiency reason, updates student's status to `Deficient` with custom deficiency remarks, and registers it in completed clearances.

---

### 9.4 Verification & Validation Results
- **PHPUnit Feature Tests**: `vendor/bin/phpunit` $\rightarrow$ **8 passed, 33 assertions, 0 errors**.
- **Laravel Pint**: `vendor/bin/pint --format agent` $\rightarrow$ **Passed with zero code style violations**.
- **Vite Bundler**: `cmd /c "npm.cmd run build"` $\rightarrow$ **Compiled successfully with zero errors**.
---

## 10. Bugfix: Clearance Duplication, ID Collision & Approval Cascade

### 10.1 Root Causes Identified
Three separate bugs contributed to the reported symptoms ("College Dean duplicated", "approving one clears all others", "Completed count shows 6 instead of 5"):

| # | Bug | Location |
|---|-----|----------|
| 1 | **ID collision on batch submit** | `AppContext.jsx` `applyForClearanceReview` |
| 2 | **Substring `.includes()` match in setClearanceList** | `AppContext.jsx` `applyForClearanceReview` |
| 3 | **Substring `.includes()` match in handleApprove** | `DepartmentClearanceView.jsx` `handleApprove` |
| 4 | **forEach stale-closure: each call sees stale queue state** | `StudentClearanceView.jsx` `handleSubmitClearance` |

### 10.2 Bug 1 & 4 — ID Collision + forEach Stale-Closure Duplication

**Symptoms**: When "All Pending Departments" was selected, the batch loop called `applyForClearanceReview(dept)` 5 times in the same render cycle via `forEach`. Because `Date.now()` is millisecond-precision, multiple calls in the same millisecond produced identical IDs. The deduplication filter inside the function used that ID as the key, so the last department (College Dean) was added twice. Also, React batches state updates — each subsequent `setDepartmentStaffClearanceQueue(prev => ...)` call received the *same stale* previous queue because state had not committed between iterations.

**Fix**:
- Created a dedicated `applyForAllClearanceDepartments(pendingDeptList)` in `AppContext.jsx` that:
  - Builds **all** queue items first (using a per-item index offset `idx` in the ID formula).
  - Executes **a single** `setDepartmentStaffClearanceQueue` call with all items.
  - Executes **a single** `setClearanceList` call using a `Set` of department names.
- In `StudentClearanceView.jsx`, the "ALL_PENDING" branch now calls `applyForAllClearanceDepartments(pendingDepartments)` instead of `forEach(applyForClearanceReview)`.
- Unique ID formula: `${studentId}-${dept.replace(/\s+/g, '_')}-${Date.now()}-${idx}-${randomStr}` — guarantees no two items ever share an ID regardless of timing.

### 10.3 Bug 2 — Substring Match in setClearanceList (AppContext)

**Symptoms**: When submitting clearance for "Office of Student Affairs", the `c.department.includes(targetDepartment)` check matched "Office" as a substring in other department names, potentially marking wrong departments as Pending.

**Fix**: Changed to strict equality `c.department === targetDepartment` — only the exact matching department entry is updated.

### 10.4 Bug 3 — Substring Match in handleApprove (DepartmentClearanceView)

**Symptoms**: When Department Staff approved "College Dean", the condition `c.department.toLowerCase().includes(item.department.toLowerCase())` also matched any clearance entry whose name contained "College" (e.g., future "College of Arts") — effectively mass-clearing unrelated departments with one click.

**Fix**: Changed to strict equality `c.department === item.department` — only the department with that exact name is marked Cleared.

### 10.5 Additional Hardening
- `handleApprove` and `handleDecline` completed entry IDs changed from `Date.now()` to `completed-${item.id}-${Date.now()}` — unique composite key prevents archival list duplicates.

### 10.6 Files Changed
| File | Change |
|------|--------|
| [`AppContext.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx) | Fixed `applyForClearanceReview` substring match; added `applyForAllClearanceDepartments` batch function |
| [`DepartmentClearanceView.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/DepartmentClearanceView.jsx) | Fixed `handleApprove` and `handleDecline` to use exact equality and unique IDs |
| [`StudentClearanceView.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/StudentClearanceView.jsx) | Replaced `forEach` batch with `applyForAllClearanceDepartments` |

### 10.7 Verification
- **Vite Build**: `npm.cmd run build` → **Compiled successfully, 0 errors**.
- **PHPUnit**: All 8 tests pass, 33 assertions.

---

## 11. Bugfix: Certificate of Registration (COR) PDF Download Cut-Out

### 11.1 Root Causes Identified
When clicking "Download PDF" on the Certificate of Registration (COR) view, the downloaded PDF appeared cut out/clipped due to three compounding issues:

| # | Bug | Location | Impact |
|---|-----|----------|--------|
| 1 | **Forced `windowWidth` to element width** | `pdfExport.js` `downloadPdfFromElement` | Passing `windowWidth: element.scrollWidth` (820px) forced html2canvas into an 820px virtual viewport. With the app layout having a 250px sidebar and 88px total canvas padding, the document was shifted 294px to the right, causing the right ~300px of the COR (including schedule column and registrar signature) to be clipped off. |
| 2 | **Omission of `scrollX: 0, scrollY: 0`** | `pdfExport.js` `downloadPdfFromElement` | If the user scrolled down to view the COR before clicking "Download PDF", html2canvas calculated bounding box coordinates with the vertical window scroll offset, shifting the capture and cutting off the top or bottom of the document. |
| 3 | **Single-page vertical overflow in jsPDF** | `pdfExport.js` `downloadPdfFromElement` & `CertificateOfRegistrationView.jsx` | Excessive padding (48px top/bottom, 56px left/right) and large spacing in `#ssis-cor-document` caused the rendered document height to exceed the standard A4 printable height (273mm). In jsPDF, `pdf.addImage()` on a single page simply clipped off everything beyond the bottom page boundary (the student & registrar signatures and official seal). |

### 11.2 Solutions & Implementation

#### 1. Isolated Virtual Viewport in `pdfExport.js`
- Removed `windowWidth: element.scrollWidth`.
- Set `windowWidth: Math.max(document.documentElement.scrollWidth, 1280)` and `windowHeight: Math.max(document.documentElement.scrollHeight, 1024)` to provide an unconstrained rendering canvas.
- Added `scrollX: 0` and `scrollY: 0` so capturing is completely immune to page scroll position.
- Added `onclone` hook to strip raster box-shadows and ensure clean centering.

#### 2. Smart Single-Page Auto-Fitting & Multi-Page Pagination in `jsPDF`
- Calculated aspect ratio: `aspectRatio = canvas.width / canvas.height`.
- **Single-Sheet Auto-Fit**: If `renderHeight` exceeds `availableHeight` by up to 1.35x (typical of official certificates or receipts that slightly overflow), it proportionally scales to `renderHeight = availableHeight` and centers horizontally with symmetrical margins (`xOffset = margin + (availableWidth - renderWidth) / 2`). The entire COR fits 100% complete and legible on a single pristine A4 sheet.
- **Multi-Page Handling**: If content exceeds 1.35x page height, it paginates cleanly across multiple pages via `pdf.addPage()` with correct vertical offset slicing.

#### 3. Optimized Proportions in `CertificateOfRegistrationView.jsx`
- Reduced container padding from `48px 56px` to `36px 40px` and set explicit `boxSizing: 'border-box'`.
- Streamlined header and badge spacing (`marginBottom: 18px`, `paddingBottom: 14px`).
- Adjusted table cell padding from `12px` to `8px 10px` for course code, description, units, and schedule.
- Compacted units summary and signature blocks (`paddingTop: 20px`, signature line `paddingBottom: 24px`, official university seal `70px × 70px`).

### 11.3 Files Changed
| File | Changes |
|------|---------|
| [`resources/js/utils/pdfExport.js`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/utils/pdfExport.js) | Fixed html2canvas virtual viewport and scroll settings; added smart single-page proportional fitting and multi-page support in jsPDF |
| [`resources/js/views/CertificateOfRegistrationView.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CertificateOfRegistrationView.jsx) | Optimized document container padding and element spacing for standard A4 aspect ratio |

### 11.4 Verification
- **Vite Build**: `npm.cmd run build` → **2121 modules transformed, 0 errors, built in 722ms**.
- **PHPUnit**: `php84.bat vendor\bin\phpunit` → **8 passed, 33 assertions**.
- **Laravel Pint**: `php84.bat vendor\bin\pint --dirty --format agent` → **Passed, 0 formatting issues**.

---

## 12. Security Audit, Penetration Hardening & QA Automation (October 2026)

### 12.1 Background & Objectives
An autonomous security vulnerability assessment and quality assurance stress test were conducted to identify authentication bypasses, broken access control vectors, PII data leaks, and race conditions across the six university modules.

### 12.2 Implemented Security & QA Hardening
1. **Cryptographic Authentication Enforcement**:
   - Integrated `Hash::check()` verification in `SSISController::login()` for both `Student` and `AdminUser` accounts.
   - Replaced loose substring SQL matching (`LIKE "%{$loginInput}%"`) with exact matching on identifier, email, or username.
   - Enforced validation rejecting empty or whitespace-only credentials with HTTP 422.
2. **Data Privacy & Password Hash Redaction**:
   - Added `protected $hidden = ['password_hash'];` to `Student` and `AdminUser` models, eliminating hash exposure in `/api/bootstrap`.
3. **Role-Based Access Control (RBAC) Middleware**:
   - Implemented `App\Http\Middleware\CheckRole` protecting `/api/admin/*`, `/api/registrar/*`, `/api/cashier/*`, and `/api/clearance/*`.
   - Updated client-side React dispatches to supply verified role authorization headers.
4. **Perspective Switcher Lockdown**:
   - Wrapped the navigation bar perspective dropdown inside `{currentUser?.role === 'Admin' && (...)}`, completely removing role-switching controls from Student accounts.
5. **Financial Concurrency Defense & Idempotency**:
   - Enforced amount validation (`amount >= 1.00`) and transaction locking (`DB::transaction`).
   - Implemented a 3-second duplicate detection window returning HTTP 409 Conflict upon rapid double-clicks.
6. **Cross-Module Clearance & Fee Hold Enforcement**:
   - Enforced academic holds on course enrollment and credential requests for students with active `Deficient` clearances.
   - Enforced financial holds blocking document releases for students with unsettled tuition balances.
7. **Comprehensive Automated Test Suite**:
   - Created 14 feature tests covering unit, integration, system, security, and stress testing with 62 assertions (100% passing).
8. **Documentation Overhaul**:
   - Created [`SECURITY.md`](file:///c:/Users/Gams/Student-Services-Information-System/SECURITY.md) (Full Vulnerability Assessment Report).
   - Created [`TESTING.md`](file:///c:/Users/Gams/Student-Services-Information-System/TESTING.md) (Software Testing Plan & Results).
   - Completely rewrote [`README.md`](file:///c:/Users/Gams/Student-Services-Information-System/README.md) with full institutional documentation and setup guides.
   - Updated [`Bugs-Flaws-Report.md`](file:///c:/Users/Gams/Student-Services-Information-System/Bugs-Flaws-Report.md) with SEC-009 to SEC-014.

### 12.3 Verification Results
- **PHPUnit**: `php vendor/bin/phpunit tests/Feature/SSISApiTest.php` → **14 passed, 62 assertions, 0 failures**.
- **Laravel Pint**: `php vendor/bin/pint --format agent` → **Clean code styling**.
- **Vite Build**: `npm.cmd run build` → **2121 modules transformed, 0 errors**.

---

## 13. System Upgrades: Local Latency Fix, Test Data Purge, Dual Login Portals & Universal Dark Mode (October 2026)

### 13.1 Background & Objectives
During local evaluation on Windows with single-threaded `php artisan serve` and XAMPP MySQL, the system experienced extreme request deadlocks (`1m 22s` hangs and `/api/bootstrap` taking `8.0s`), legacy test student names (`gams User`, `Yogiri Takatou`, `Prince Clarence Lopez`) persisting in client dropdowns, an unseparated single login form combining administrative and student credentials, and a lack of user-configurable light/dark visual theming. Five comprehensive upgrades were executed to remediate these issues.

---

### 13.2 Upgrade 1: Local Loading Speed Optimization & Deadlock Elimination
1. **Root Cause Analysis**:
   - On Windows, `php artisan serve` runs PHP's built-in web server (`php -S`), which is single-threaded and handles only one synchronous HTTP connection at a time.
   - Laravel Boost's browser logger injected an inline script that continuously posted DOM and console events to `/_boost/browser-logs`. Because the browser fired these requests concurrently while loading initial resources, the single-threaded server entered deadlock, resulting in `1m 22s` hangs.
   - Windows IPv6 DNS resolution for `localhost` introduced multi-second connection timeouts.
   - `SSISController::getSystemState()` executed unindexed subqueries and redundant relational lookups.
2. **Remediations Implemented**:
   - **Boost Logger Disablement**: Created [`config/boost.php`](file:///c:/Users/Gams/Student-Services-Information-System/config/boost.php) and configured `BOOST_BROWSER_LOGS_WATCHER=false` in `.env` and `.env.example`. This stops script injection and halts `/_boost/browser-logs` background traffic completely.
   - **Strict IPv4 127.0.0.1 Binding**: Updated `.env` (`APP_URL=http://127.0.0.1:8000`, `DB_HOST=127.0.0.1`), configured `SESSION_DRIVER=file` and `CACHE_STORE=file`, and bound [`vite.config.js`](file:///c:/Users/Gams/Student-Services-Information-System/vite.config.js) strictly to `127.0.0.1`.
   - **Optimized Controller Logic**: Added explicit alias `SSISController::bootstrap()` mapped to `Route::get('/bootstrap')` in [`routes/api.php`](file:///c:/Users/Gams/Student-Services-Information-System/routes/api.php), optimized eager-loading with selective relation constraints, and removed inline hashing overhead during GET operations.
3. **Performance Outcome**:
   - `/api/bootstrap` response latency dropped from **8,000ms (8.0s)** to an average of **27.42ms** (>99.6% reduction in response time).
   - Zero Windows web server hangs or deadlocks.

---

### 13.3 Upgrade 2: Complete Purge of Previous Student Records & Clean 3NF MySQL Baseline
1. **Codebase & State Purge**:
   - Searched and eliminated all occurrences of legacy mock names (`gams User`, `Yogiri Takatou`, `Prince Clarence Lopez`) from [`database/seeders/DatabaseSeeder.php`](file:///c:/Users/Gams/Student-Services-Information-System/database/seeders/DatabaseSeeder.php), [`resources/js/views/CashierPaymentView.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierPaymentView.jsx), [`resources/js/views/LoginView.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/LoginView.jsx), and client mock lists.
2. **Client-Side Cache Versioning**:
   - Updated [`resources/js/context/AppContext.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx) with state key prefix `ssis_v3_clean_` and added a startup routine that automatically sweeps away legacy `localStorage` keys (`ssis_demo_users`, `ssis_student_list_cache`, etc.).
   - Added regex filter `isLegacyDummyStudent` to reject obsolete student profiles from re-entering active state.
3. **Database Rebuild & phpMyAdmin Dump**:
   - Seeded clean, formal CuyoTech University data across all 14 3NF normalized tables with official demo students (`Juan Dela Cruz` - `STU-2026-0001` and `Maria Clara Bautista` - `STU-2026-0002`).
   - Ran `php artisan migrate:fresh --seed` against MySQL (`127.0.0.1:3306`, database `cuyotech_ssis`).
   - Re-exported the clean database to [`database/cuyotech_ssis.sql`](file:///c:/Users/Gams/Student-Services-Information-System/database/cuyotech_ssis.sql) using `mysqldump` for seamless import in phpMyAdmin (`http://localhost/phpmyadmin`).

---

### 13.4 Upgrade 3: Designated Separate Login Portals (Admin Login vs. Student & Staff Login)
1. **Dual Portal Architecture**:
   - **Portal 1 — Main Student & Staff Services Login (`/`)**: Designed with welcoming university styling for Students, Registrars, Cashiers, and Department Staff. Includes quick role demo chips and a dedicated button: *"System Administrator? Go to Admin Console Login →"*.
   - **Portal 2 — Dedicated Admin Console Login (`/admin/login`)**: Built with high-security administrative terminal styling ([`resources/js/views/AdminLoginView.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/AdminLoginView.jsx)), security audit badge, credentials fields with demo autofill, and a link: *"← Back to Student & Staff Login"*.
2. **Strict Backend Role Enforcement**:
   - Updated `SSISController::login()` to accept and enforce `login_portal`:
     - When `login_portal === 'general'`: Any user with role `Admin` is rejected with **HTTP 403 Forbidden**: `"Administrators must sign in through the dedicated Admin Portal."`
     - When `login_portal === 'admin'`: Any user who is NOT an `Admin` (e.g. Student, Registrar, Cashier, Department Staff) is rejected with **HTTP 403 Forbidden**: `"Access Denied: This portal is restricted to System Administrators only."`
3. **Frontend Routing & History Synchronization**:
   - Wired URL popstate synchronization in [`resources/js/context/AppContext.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx) and dynamic view rendering in [`resources/js/app.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/app.jsx).

---

### 13.5 Upgrade 4: Universal Light & Dark Mode Theming
1. **Theme State & Persistence**:
   - Implemented `theme` preference state (`'light' | 'dark'`) in `AppContext.jsx`, honoring the user's OS preference (`window.matchMedia('(prefers-color-scheme: dark)')`) and persisting choices in `localStorage` under `ssis_theme_preference`.
   - Bound theme switching to `document.documentElement` via `data-theme="dark"` attribute and `.dark` CSS class.
2. **Accessible Theme Toggle Component**:
   - Created [`resources/js/components/ThemeToggle.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/ThemeToggle.jsx) featuring sun (☀️) and moon (🌙) SVGs, accessible `aria-label`, and interactive hover/active states.
   - Embedded the toggle in:
     - Top Navbar ([`resources/js/components/TopNavbar.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/TopNavbar.jsx)) for authenticated sessions.
     - Portal 1 Header ([`resources/js/views/LoginView.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/LoginView.jsx)) for pre-login theme adjustment.
     - Portal 2 Header ([`resources/js/views/AdminLoginView.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/AdminLoginView.jsx)).
     - Admin System Settings ([`resources/js/views/AdminAccountsAuditView.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/AdminAccountsAuditView.jsx)).
3. **Comprehensive Styling Coverage**:
   - Extended [`resources/css/app.css`](file:///c:/Users/Gams/Student-Services-Information-System/resources/css/app.css) with high-contrast dark palette variables:
     - `--bg-primary: #0b1120`
     - `--bg-secondary: #0f172a`
     - `--bg-surface: #1e293b`
     - `--border-color: #334155`
     - `--text-primary: #f8fafc`
     - `--text-secondary: #94a3b8`
   - Styled top navigation bar, cards, data tables, modals, action buttons, role chips, and form controls for balanced contrast and readability.

---

### 13.6 Upgrade 5: Verification, Benchmarking & phpMyAdmin Guide
1. **PHPUnit Automated Test Suite**:
   - Updated [`tests/Feature/SSISApiTest.php`](file:///c:/Users/Gams/Student-Services-Information-System/tests/Feature/SSISApiTest.php) with tests for dual portal boundary enforcement, legacy student data purging, and bootstrap endpoint responsiveness:
     - `test_admin_cannot_login_to_student_staff_portal` (HTTP 403)
     - `test_student_and_staff_cannot_login_to_admin_portal` (HTTP 403)
     - `test_previous_student_names_are_purged_from_database` (0 matches)
     - `test_bootstrap_endpoint_returns_system_state` (JSON structure)
   - Executed test suite: **18 passed, 81 assertions, 0 failures** in **1.10s**.
2. **Production Bundle Compilation**:
   - Executed `npm run build`: **2,123 modules transformed, 0 warnings/errors, built in 7.34s**.
3. **Pint Code Formatting**:
   - Ran `vendor/bin/pint --dirty --format agent`: **Passed with 0 violations**.
4. **Endpoint Performance Benchmark**:
   - Executed automated 5-iteration benchmark measuring `GET /api/bootstrap`:
     - Run 1: `27.07 ms`
     - Run 2: `27.80 ms`
     - Run 3: `27.63 ms`
     - Run 4: `28.08 ms`
     - Run 5: `26.51 ms`
     - **Average Latency: 27.42 ms** (down from 8,000ms delay).
5. **phpMyAdmin Import Instructions**:
   - Access **phpMyAdmin** at `http://localhost/phpmyadmin`.
   - Select the **Import** tab.
   - Choose `database/cuyotech_ssis.sql` and click **Import**.
   - Database `cuyotech_ssis` is instantly restored with clean, normalized 3NF data.

---

## 14. October 2026 Critical UI, Database, Routing & QA Upgrades (Version 1.3.0)

### 14.1 Task 1: Dark Mode Text Contrast & Visibility Overhaul Across All Screens
1. **Root Cause Analysis**:
   - Multiple views contained hardcoded inline dark styles (such as `#0F172A`, `#1E293B`, `#334155`, `#475569`, `#111827`) for labels, table headers, table cells, card titles, search overlay boxes, and input elements. In Dark Mode (`data-theme="dark"`), these rendered dark-on-dark, causing severe readability issues.
2. **Design Tokens & High-Contrast Overrides**:
   - Updated [`resources/css/app.css`](file:///c:/Users/Gams/Student-Services-Information-System/resources/css/app.css):
     - Added `--bg-subtle`, dark `--input-bg: #1E293B`, dark `--input-border: #475569`, `--search-box-bg: #1E293B`.
     - Added universal `.dark` overrides for `.ssis-card`, `.ssis-btn-secondary`, `.ssis-tabs-bar`, `.ssis-tab-btn`, `select option`, `.ssis-search-results-overlay`.
     - Injected a global inline dark color defense rule targeting inline elements that hardcoded dark text values (`#0F172A`, `#1E293B`, `#111827`, `#000`), automatically remapping them to `#F8FAFC` or `#E2E8F0`.
3. **Component-Level Overhauls**:
   - [`AdminAccountsAuditView.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/AdminAccountsAuditView.jsx): Replaced hardcoded `#0F172A` in table cells, headers, and Recent Activity with `var(--text-main)` (`#F8FAFC`) and `var(--text-muted)` (`#94A3B8`).
   - [`CashierPaymentView.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/CashierPaymentView.jsx): Updated student assessment card and receipt panel to theme-aware backgrounds and high-contrast text.
   - [`RegistrarRecordsView.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/RegistrarRecordsView.jsx): Updated grade sheet rows, subject headers, and input controls to theme variables.
   - [`DepartmentClearanceView.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/DepartmentClearanceView.jsx): Updated clearance queue table cells, status badges, and empty states to theme-aware variables.
   - [`TopNavbar.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/TopNavbar.jsx): Remapped search box and user titles to `var(--text-main)` and `var(--text-muted)`.

### 14.2 Task 2: Elimination of All Student Demo Accounts & 0-Student Starting Baseline
1. **Purged All Student Demo Accounts**:
   - Edited [`database/seeders/DatabaseSeeder.php`](file:///c:/Users/Gams/Student-Services-Information-System/database/seeders/DatabaseSeeder.php) to completely remove "Maria Clara Bautista", "Juan Dela Cruz", and all initial student records, enrollments, grades, assessments, payments, clearances, and document requests.
   - Seeder now retains **ONLY**:
     1. The 4 official institutional staff accounts (`Admin`, `Registrar`, `Cashier`, `Department Staff`) in `admin_users`.
     2. Reference master catalogs (`departments`, `programs`, `courses`, `sections`).
   - Database tables `students`, `enrollments`, `grades`, `assessments`, `payments`, `clearances`, and `document_requests` strictly start at **`0 rows`**.
2. **Frontend Clean Empty States & Cache Wiping**:
   - Added clean empty states across all views (`AdminAccountsAuditView.jsx`, `CashierPaymentView.jsx`, `RegistrarRecordsView.jsx`, `DepartmentClearanceView.jsx`) displaying informative messages such as *"No registered students yet. Students must register or be created by Admin."*
   - Updated [`resources/js/context/AppContext.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx) to wipe stale student records from previous sessions on boot when `studentsList` is empty.

### 14.3 Task 3: Complete Removal of Demo Perspective Switcher & Role Route Protection
1. **Navbar Perspective Switcher Removal**:
   - Updated [`resources/js/components/TopNavbar.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/components/TopNavbar.jsx): Completely deleted the Demo Perspective Switcher button, dropdown menu, and internal toggle state for **ALL roles, including Admin**.
2. **Role Boundaries & Route Enforcement**:
   - Defined strict role permissions in [`resources/js/context/AppContext.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/context/AppContext.jsx):
     - `ROLE_ALLOWED_VIEWS` and `ROLE_DEFAULT_VIEW` enforce deterministic sidebar links and views.
     - `Student` → Dashboard, Enrollment, Grades, Clearance, Document Requests (`/student/...`).
     - `Registrar` → Enrollment Approval, Grades Encoding, Document Releases (`/registrar/...`).
     - `Cashier` → Process Payment, Assessments, Receipts, Reports (`/cashier/...`).
     - `Department Staff` → Department Clearance Processing (`/department/...`).
     - `Admin` → User Account Management & Audit Logs (`/admin/...`).

### 14.4 Task 4: Direct Action Portal Switchers & Login/Logout Routing
1. **Replaced Question-Style Text with Direct Action Toggles**:
   - [`resources/js/views/LoginView.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/LoginView.jsx): Replaced `"System Administrator? Go to Admin Console Login →"` with sleek styled button **`Switch to Admin Console →`** (`#goto-admin-portal-link`).
   - [`resources/js/views/AdminLoginView.jsx`](file:///c:/Users/Gams/Student-Services-Information-System/resources/js/views/AdminLoginView.jsx): Replaced `"Back to Student & Staff Login"` with **`← Switch to Student & Staff Portal`** (`#back-to-general-login-link`).
2. **Deterministic Login & Logout Routing**:
   - Logging in immediately routes to the user's role-specific default view via `window.history.pushState`.
   - Logging out from an Admin session directs strictly to `/admin/login`.
   - Logging out from a Student, Registrar, Cashier, or Department Staff session directs strictly to `/login`.

### 14.5 Task 5: 7-Stage Multi-Role End-to-End Simulation & Database Reset
1. **Comprehensive PHPUnit Simulation Test**:
   - Implemented `test_full_zero_to_complete_multi_role_simulation()` in [`tests/Feature/SSISApiTest.php`](file:///c:/Users/Gams/Student-Services-Information-System/tests/Feature/SSISApiTest.php) verifying all 7 stages:
     - **Stage 1**: Bootstrap starts at 0 students; Maria Clara / Juan Dela Cruz absent.
     - **Stage 2**: Student self-registration (`STU-2026-1001`) AND Admin creating a student account (`STU-2026-1002`).
     - **Stage 3**: Student logs in and attempts enrollment.
     - **Stage 4**: Department Staff sets clearance to `Deficient` (blocking enrollment/documents), then updates to `Cleared`.
     - **Stage 5**: Student enrolls; Registrar approves enrollment and encodes subject grades (`1.75`); Student views transcript.
     - **Stage 6**: Student requests TOR; Registrar blocked from release due to balance; Cashier collects fee payment (`2,500.00`); Registrar releases document; Student sees zero balance and released document.
     - **Stage 7**: Admin logs in via `/admin/login`, audits log entries across all roles, deactivates Student 2 (login rejected 403), reactivates Student 2, logs out cleanly.
2. **Full Regression Results**:
   - Ran `php artisan test --compact`: **21 passed, 152 assertions, 0 failures** in **1.01s**.
3. **Database Reset to 0-Student Clean Baseline**:
   - Executed `php artisan migrate:fresh --seed` on live XAMPP MySQL (`cuyotech_ssis`).
   - Verified row counts: `students = 0`, `enrollments = 0`, `grades = 0`, `assessments = 0`, `payments = 0`, `clearances = 0`, `document_requests = 0`, `admin_users = 4`, `departments = 5`, `courses = 7`, `sections = 7`.
   - Re-exported clean SQL dump via `mysqldump.exe` into `database/cuyotech_ssis.sql` for instant phpMyAdmin import.
4. **Vite Production Bundle**:
   - Executed `npm run build`: **2,123 modules transformed, 0 warnings/errors, built in 427ms**.
5. **Laravel Pint**:
   - Executed `vendor/bin/pint --dirty --format agent`: **Passed with 0 violations**.


