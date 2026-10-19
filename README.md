<p align="center">
  <img src="public/images/cuyotech-logo.png" width="100" alt="CuyoTech University Seal">
</p>

<h1 align="center">CuyoTech University — Student Services Information System (SSIS)</h1>

<p align="center">
  <strong>An automated, secure, and synchronized university management portal built with Laravel 13, PHP 8.4, React 18 SPA, and MySQL 8.0.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PHP-8.4-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP 8.4">
  <img src="https://img.shields.io/badge/Laravel-13.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 13">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18">
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL 8.0">
  <img src="https://img.shields.io/badge/Tests-21%20Passed-22C55E?style=for-the-badge" alt="Tests Passed">
</p>

---

## 1. System Overview

**CuyoTech University Student Services Information System (SSIS)** automates paper-based workflows across six core institutional modules into a single, high-performance web platform:

1. **Student Portal**: Self-service student dashboard, academic schedule selection, real-time grade viewing, general weighted average (GWA) calculation, tuition assessment monitoring, document request tracking, and departmental clearance monitoring.
2. **Registrar Module**: Academic enrollment review queue, batch and individual course grade encoding (1.00–5.00 grading scale), permanent student academic directory, curriculum management, and official document release workflows.
3. **Cashier Module**: Point-of-sale tuition terminal, cash tender and change ("sukli") calculator, official digital receipt (OR) generation with isolated print and PDF download capabilities, transaction archive, and revenue reporting.
4. **Department Module**: Multi-department student clearance workflow (Library, Computer Laboratory, Guidance, Student Affairs, Dean), clearance deficiency tracking, department rules configuration, and institutional compliance reporting.
5. **Admin Module**: University-wide user governance, Role-Based Access Control (RBAC), inline role elevation, immediate account deactivation enforcement, and real-time audit logging across all critical database tables.
6. **Document Request System**: Automated request, verification, and issuance pipeline for official university credentials, including Transcript of Records (TOR), Certificate of Registration (COR), Good Moral Certificates, and Honorable Dismissal.
7. **Dual-Portal Security Architecture**: Two separate, role-enforced login portals:
   - **Main Student & Staff Services Portal** (`/login`): Reserved for Students, Registrars, Cashiers, and Department Staff. Includes direct action switcher button `Switch to Admin Console →`.
   - **Dedicated Admin Console Portal** (`/admin/login`): Restricted strictly to System Administrators with high-security audit styling. Includes direct action switcher button `← Switch to Student & Staff Portal`.
8. **Universal Light & Dark Mode Theme**: High-contrast, WCAG-compliant visual customization across every view and modal, honoring system preferences (`prefers-color-scheme`) and stored in `localStorage`.
9. **Role-Enforced Navigation (Zero Perspective Switcher)**: Every authenticated role operates strictly within their dedicated dashboard and views with zero cross-role perspective switching.

### Database Design & Clean Starting State (0 Pre-Seeded Students)
- **Zero Pre-Seeded Students Rule**: The database starts cleanly with **0 student records**, **0 enrollments**, **0 grades**, **0 assessments**, **0 payments**, **0 clearances**, and **0 document requests**.
- All student data is created either through **Student Self-Registration** on the Main Portal (`/login`) or by an **Administrator** in the Admin Console (`/admin`).
- Reference catalogs (`departments`, `programs`, `courses`, `sections`) and official **Admin / Staff accounts** are permanently maintained.

---

## 2. Designated Login Portals & Institutional Staff Credentials

The authentication system strictly enforces separation of concerns between institutional administrators and operational users. All institutional accounts use the standard password: `password`.

### Portal 1: Main Student & Staff Services Portal (`/login`)
*Dedicated to Students, Registrars, Cashiers, and Departmental Staff. Administrators attempting to log in here are rejected with HTTP 403.*

| Role | Staff Name | Username / ID | Institutional Email | Password | Assigned Counter / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Registrar** | Ramon Alcantara | `r.alcantara` | `r.alcantara@cuyotech.edu.ph` | `password` | College of Computing Studies / Counter 1 |
| **Cashier** | Leah Navarro | `l.navarro` | `l.navarro@cuyotech.edu.ph` | `password` | Cashiering & Accounting Office / Counter 3 |
| **Department Staff** | Dina Flores | `d.flores` | `d.flores@cuyotech.edu.ph` | `password` | Computer Laboratory Office |
| **Student** | *(Self-Registered)* | *(e.g. `STU-2026-XXXX`)* | *(e.g. `student@cuyotech.edu.ph`)* | *(User Created)* | Self-registers via "Register New Account" on `/login` |

### Portal 2: Dedicated Admin Console Login (`/admin/login`)
*Restricted strictly to System Administrators. Non-admin users attempting access are blocked with HTTP 403.*

| Role | Staff Name | Username | Institutional Email | Account ID | Password | Department |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **System Admin** | Victor Ramos | `v.ramos` | `v.ramos@cuyotech.edu.ph` | `ADM-2026-0001` | `password` | Central University Administration |

*Note: Quick demo login pills on both login screens allow immediate staff role autofill. Students register themselves or are created by Admin.*

---

## 3. Installation & XAMPP MySQL / phpMyAdmin Setup Guide

### Prerequisites
- **PHP**: Version 8.3 or 8.4 with `pdo`, `pdo_mysql`, `bcmath`, `ctype`, `mbstring`, and `openssl` extensions.
- **XAMPP**: Running Apache and MySQL / MariaDB (Default port `3306`).
- **Composer**: Version 2.2+.
- **Node.js**: Version 18.x or 20.x with npm.

### Step-by-Step Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/korogams-beep/Student-Services-Information-System.git
   cd Student-Services-Information-System
   ```

2. **Install PHP Dependencies**:
   ```bash
   composer install
   ```

3. **Configure Environment Variables**:
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```
   Generate the application encryption key:
   ```bash
   php artisan key:generate
   ```

4. **Start XAMPP Apache & MySQL**:
   - Launch the **XAMPP Control Panel**.
   - Click **Start** on **Apache** and **MySQL** (verify MySQL is running on port `3306`).

5. **Configure Database Connection in `.env`**:
   Ensure `.env` matches your XAMPP default configuration:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=cuyotech_ssis
   DB_USERNAME=root
   DB_PASSWORD=
   ```

6. **Database Provisioning (Choose Option A or Option B)**:

   #### Option A: Automated CLI Migration & Seeder (Recommended)
   Run the following Artisan command to automatically create tables and seed realistic CuyoTech test data:
   ```bash
   php artisan migrate:fresh --seed
   ```

   #### Option B: One-Click Import via phpMyAdmin (`database/cuyotech_ssis.sql`)
   If grading or deploying on a machine without running Artisan CLI:
   1. Open **phpMyAdmin** in your browser (`http://localhost/phpmyadmin`).
   2. Click the **Import** tab on the top menu bar.
   3. Click **Choose File** and select `database/cuyotech_ssis.sql` from this project folder.
   4. Click **Import** at the bottom. The database `cuyotech_ssis` with all 14 3NF normalized tables and seeded records will be created automatically.

7. **Install Frontend Dependencies & Build Bundle**:
   ```bash
   npm install
   npm run build
   ```
   *(For active development with hot-module reloading, run `npm run dev` in a separate terminal).*

8. **Start the Laravel Application**:
   ```bash
   php artisan serve
   ```
   Open your browser to `http://127.0.0.1:8000` to launch the SSIS Portal.

---

## 4. Key Security & Quality Assurance Enhancements

During comprehensive security and QA audits, critical vulnerabilities and functional bugs were identified and hardened:

- **Cryptographic Authentication Enforcement (SEC-009)**: Closed a critical authentication bypass by enforcing `Hash::check()` across all login pathways, eliminating loose substring matches, and rejecting empty/whitespace credential inputs.
- **Data Privacy & Hash Concealment (SEC-010)**: Bound `protected $hidden = ['password_hash']` to `Student` and `AdminUser` models, eliminating password hash leakage in public API bootstrap responses.
- **Role-Based Access Control Middleware (SEC-011)**: Developed `CheckRole` middleware guarding administrative, registrar, cashier, and clearance endpoints against unauthorized role access.
- **Perspective Switcher Lockdown (SEC-012)**: Restricted client-side role switcher controls strictly to authenticated `Admin` accounts.
- **Financial Race Condition & Idempotency Defense (SEC-013)**: Hardened payment endpoints against rapid double-click submissions via transaction locking and a 3-second duplicate detection window.
- **Cross-Module Clearance & Fee Hold Enforcement (SEC-014)**: Enforced academic and financial holds blocking course enrollments and document releases for students with deficient clearance or unsettled tuition balances.
- **Dual Designated Login Portals (SEC-015)**: Split authentication into two distinct, role-enforced portals. Main Student & Staff Portal (`/`) rejects Admin accounts with HTTP 403, and Dedicated Admin Console (`/admin/login`) blocks non-admin users with HTTP 403.
- **Universal Light & Dark Mode Theming**: Full-spectrum theme customization across all 6 modules and login portals, honoring system `prefers-color-scheme` with instant `localStorage` persistence.
- **Windows High-Performance Optimization**: Eliminated Windows single-threaded `php artisan serve` deadlocks by disabling Laravel Boost browser logger watcher (`BOOST_BROWSER_LOGS_WATCHER=false`), setting explicit `127.0.0.1` bindings, and optimizing `/api/bootstrap` Eloquent queries from 8.0s down to **~27ms** (>99% latency reduction).
- **Test Data Purge & Clean 3NF Baseline**: Complete removal of legacy mock accounts from MySQL seeders and client cache (`ssis_v3_clean_`), exporting clean database to `database/cuyotech_ssis.sql` for phpMyAdmin.

For in-depth architectural specifications, security analysis, and test matrices, refer to:
- [DATABASE-3NF.md](file:///c:/Users/Gams/Student-Services-Information-System/DATABASE-3NF.md): Relational Database Architecture, Data Dictionary, 3NF Mathematical Proofs, and Mermaid ERD.
- [SECURITY.md](file:///c:/Users/Gams/Student-Services-Information-System/SECURITY.md): Full Security Vulnerability & Ethical Penetration Audit Report.
- [TESTING.md](file:///c:/Users/Gams/Student-Services-Information-System/TESTING.md): Comprehensive Software Testing Plan & Verification Results.
- [REPORT-Changes.md](file:///c:/Users/Gams/Student-Services-Information-System/REPORT-Changes.md): Master Ledger of All Functional Defects & Remediations.

---

## 5. Automated Regression Testing

To run the automated test suite covering unit, integration, system, security, and concurrency scenarios:

```bash
# Execute automated test suite with PHPUnit
php vendor/bin/phpunit tests/Feature/SSISApiTest.php

# Code style compliance formatting via Pint
php vendor/bin/pint --format agent
```

---

## 6. License & Institutional Context

Developed for **CuyoTech University of Science & Technology**. All institutional rights reserved.  
Backend built on the [Laravel Framework](https://laravel.com) under the [MIT License](https://opensource.org/licenses/MIT).
