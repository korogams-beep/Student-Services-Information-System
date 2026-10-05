<?php

namespace Database\Seeders;

use App\Models\AdminUser;
use App\Models\AuditLog;
use App\Models\Course;
use App\Models\Department;
use App\Models\Program;
use App\Models\Section;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Per requirement: Dummy data is ONLY for institutional staff roles (Registrar, Cashier, Dept Staff, Admin).
     * No preloaded dummy data for students. Fresh student accounts start at default 0.
     */
    public function run(): void
    {
        // 1. Departments
        $deptCS = Department::create(['department_name' => 'College of Computing Studies', 'building' => 'Engineering & IT Bldg']);
        $deptLib = Department::create(['department_name' => 'University Library', 'building' => 'Main Library Hall']);
        $deptLab = Department::create(['department_name' => 'Computer Laboratory', 'building' => 'Tech Center Wing B']);
        $deptSAO = Department::create(['department_name' => 'Student Affairs Office', 'building' => 'Student Center']);
        $deptAcc = Department::create(['department_name' => 'Cashiering & Accounting Office', 'building' => 'Admin Annex']);

        // 2. Programs
        $progCS = Program::create([
            'program_code' => 'BSCS',
            'program_name' => 'BS Computer Science',
            'department_id' => $deptCS->id,
        ]);
        $progIT = Program::create([
            'program_code' => 'BSIT',
            'program_name' => 'BS Information Technology',
            'department_id' => $deptCS->id,
        ]);

        // 3. Official Courses (Per PNC College of Computing Studies curriculum)
        $c1 = Course::create(['course_code' => 'CCS109', 'course_name' => 'System Analysis and Design', 'units' => 3, 'department_id' => $deptCS->id]);
        $c2 = Course::create(['course_code' => 'CCS112', 'course_name' => 'Applications Development and Emerging Technologies', 'units' => 3, 'department_id' => $deptCS->id]);
        $c3 = Course::create(['course_code' => 'CSP108', 'course_name' => 'Programming Languages', 'units' => 3, 'department_id' => $deptCS->id]);
        $c4 = Course::create(['course_code' => 'CCS106', 'course_name' => 'Social Issues and Professional Practice', 'units' => 3, 'department_id' => $deptCS->id]);
        $c5 = Course::create(['course_code' => 'CSEG1', 'course_name' => 'Game Concepts and Production', 'units' => 3, 'department_id' => $deptCS->id]);
        $c6 = Course::create(['course_code' => 'ENV101', 'course_name' => 'Environmental Science', 'units' => 3, 'department_id' => $deptCS->id]);
        $c7 = Course::create(['course_code' => 'CSP105', 'course_name' => 'Algorithms and Complexity', 'units' => 3, 'department_id' => $deptCS->id]);

        // 4. Sections
        Section::create(['course_id' => $c1->id, 'schedule' => 'M/W 9:00–10:30', 'room' => 'CL-101', 'slot_limit' => 40]);
        Section::create(['course_id' => $c2->id, 'schedule' => 'T/Th 10:30–12:00', 'room' => 'CL-102', 'slot_limit' => 40]);
        Section::create(['course_id' => $c3->id, 'schedule' => 'M/W 13:00–14:30', 'room' => 'CL-203', 'slot_limit' => 40]);
        Section::create(['course_id' => $c4->id, 'schedule' => 'T/Th 13:00–15:00', 'room' => 'AS-301', 'slot_limit' => 35]);
        Section::create(['course_id' => $c5->id, 'schedule' => 'F 8:00–11:00', 'room' => 'CL-204', 'slot_limit' => 35]);
        Section::create(['course_id' => $c6->id, 'schedule' => 'M/W 15:00–16:30', 'room' => 'SC-101', 'slot_limit' => 45]);
        Section::create(['course_id' => $c7->id, 'schedule' => 'T/Th 15:00–17:00', 'room' => 'CL-103', 'slot_limit' => 40]);

        // 5. Admin & Institutional Staff Users ONLY
        $adminRamon = AdminUser::create([
            'username' => 'r.alcantara',
            'name' => 'Ramon Alcantara',
            'password_hash' => Hash::make('password'),
            'role' => 'Registrar',
            'department_id' => $deptCS->id,
            'counter_no' => 1,
            'account_status' => 'Active',
        ]);

        $adminLeah = AdminUser::create([
            'username' => 'l.navarro',
            'name' => 'Leah Navarro',
            'password_hash' => Hash::make('password'),
            'role' => 'Cashier',
            'counter_no' => 3,
            'account_status' => 'Active',
        ]);

        $adminDina = AdminUser::create([
            'username' => 'd.flores',
            'name' => 'Dina Flores',
            'password_hash' => Hash::make('password'),
            'role' => 'DepartmentStaff',
            'department_id' => $deptLab->id,
            'account_status' => 'Active',
        ]);

        $adminVictor = AdminUser::create([
            'username' => 'v.ramos',
            'name' => 'Victor Ramos',
            'password_hash' => Hash::make('password'),
            'role' => 'Admin',
            'account_status' => 'Active',
        ]);

        // 6. System Audit Logs
        AuditLog::create([
            'admin_user_id' => $adminVictor->id,
            'student_id' => null,
            'action' => 'System Initialized',
            'table_affected' => 'database',
            'record_id' => 1,
            'logged_at' => now()->setTime(8, 0),
        ]);

        AuditLog::create([
            'admin_user_id' => $adminRamon->id,
            'student_id' => null,
            'action' => 'Curriculum Configured (7 CCS Courses)',
            'table_affected' => 'courses',
            'record_id' => $c1->id,
            'logged_at' => now()->setTime(8, 30),
        ]);
    }
}
