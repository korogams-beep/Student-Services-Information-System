<?php

namespace Database\Seeders;

use App\Models\AdminUser;
use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\AuditLog;
use App\Models\Clearance;
use App\Models\Course;
use App\Models\Department;
use App\Models\DocumentRequest;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Payment;
use App\Models\Program;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Departments
        $deptCS = Department::create(['department_name' => 'College Department', 'building' => 'Engineering & IT Bldg']);
        $deptLib = Department::create(['department_name' => 'University Library', 'building' => 'Main Library Hall']);
        $deptLab = Department::create(['department_name' => 'Computer Laboratory', 'building' => 'Tech Center Wing B']);
        $deptSAO = Department::create(['department_name' => 'Student Affairs Office', 'building' => 'Student Center']);
        $deptAcc = Department::create(['department_name' => 'Accounting Office', 'building' => 'Admin Annex']);

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

        // 3. Courses
        $c1 = Course::create(['course_code' => 'CS 101', 'course_name' => 'Introduction to Computing', 'units' => 3, 'department_id' => $deptCS->id]);
        $c2 = Course::create(['course_code' => 'MATH 121', 'course_name' => 'Calculus II', 'units' => 3, 'department_id' => $deptCS->id]);
        $c3 = Course::create(['course_code' => 'ENG 103', 'course_name' => 'Academic Writing', 'units' => 3, 'department_id' => $deptCS->id]);
        $c4 = Course::create(['course_code' => 'CS 115', 'course_name' => 'Data Structures', 'units' => 4, 'department_id' => $deptCS->id]);
        $c5 = Course::create(['course_code' => 'NSTP 2', 'course_name' => 'Civic Welfare Training', 'units' => 3, 'department_id' => $deptCS->id]);
        $c6 = Course::create(['course_code' => 'CS 201', 'course_name' => 'Discrete Mathematics', 'units' => 3, 'department_id' => $deptCS->id]);
        $c7 = Course::create(['course_code' => 'STAT 101', 'course_name' => 'Probability & Statistics', 'units' => 3, 'department_id' => $deptCS->id]);
        $c8 = Course::create(['course_code' => 'IT 110', 'course_name' => 'IT Fundamentals', 'units' => 3, 'department_id' => $deptCS->id]);

        // 4. Sections
        $sec1 = Section::create(['course_id' => $c1->id, 'schedule' => 'M/W 9:00–10:30', 'room' => 'CL-101', 'slot_limit' => 40]);
        $sec2 = Section::create(['course_id' => $c2->id, 'schedule' => 'T/Th 10:30–12:00', 'room' => 'M-204', 'slot_limit' => 40]);
        $sec3 = Section::create(['course_id' => $c3->id, 'schedule' => 'M/W 13:00–14:30', 'room' => 'AS-302', 'slot_limit' => 40]);
        $sec4 = Section::create(['course_id' => $c4->id, 'schedule' => 'T/Th 13:00–15:00', 'room' => 'CL-203', 'slot_limit' => 35]);
        $sec5 = Section::create(['course_id' => $c5->id, 'schedule' => 'Sat 8:00–11:00', 'room' => 'GYM-A', 'slot_limit' => 50]);
        $sec6 = Section::create(['course_id' => $c6->id, 'schedule' => 'M/W 15:00–16:30', 'room' => 'CL-102', 'slot_limit' => 35]);
        $sec7 = Section::create(['course_id' => $c7->id, 'schedule' => 'T/Th 9:00–10:30', 'room' => 'AS-201', 'slot_limit' => 40]);
        $sec8 = Section::create(['course_id' => $c8->id, 'schedule' => 'F 8:00–11:00', 'room' => 'IT-105', 'slot_limit' => 35]);

        // 5. Admin Users
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
            'account_status' => 'Disabled',
        ]);

        $adminVictor = AdminUser::create([
            'username' => 'v.ramos',
            'name' => 'Victor Ramos',
            'password_hash' => Hash::make('password'),
            'role' => 'Admin',
            'account_status' => 'Active',
        ]);

        // 6. Students
        $maria = Student::create([
            'student_id_number' => '2024-01847',
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'email' => 'maria.santos@university.edu',
            'year_level' => 2,
            'program_id' => $progCS->id,
            'username' => 'maria.santos',
            'password_hash' => Hash::make('password'),
            'account_status' => 'Active',
        ]);

        $miguel = Student::create([
            'student_id_number' => '2024-02115',
            'first_name' => 'Miguel',
            'last_name' => 'Reyes',
            'email' => 'miguel.reyes@university.edu',
            'year_level' => 2,
            'program_id' => $progCS->id,
            'username' => 'miguel.reyes',
            'password_hash' => Hash::make('password'),
            'account_status' => 'Active',
        ]);

        $angela = Student::create([
            'student_id_number' => '2023-01442',
            'first_name' => 'Angela',
            'last_name' => 'Cruz',
            'email' => 'angela.cruz@university.edu',
            'year_level' => 3,
            'program_id' => $progCS->id,
            'username' => 'angela.cruz',
            'password_hash' => Hash::make('password'),
            'account_status' => 'Active',
        ]);

        $paolo = Student::create([
            'student_id_number' => '2024-01903',
            'first_name' => 'Paolo',
            'last_name' => 'Garcia',
            'email' => 'paolo.garcia@university.edu',
            'year_level' => 2,
            'program_id' => $progIT->id,
            'username' => 'paolo.garcia',
            'password_hash' => Hash::make('password'),
            'account_status' => 'Active',
        ]);

        $jessa = Student::create([
            'student_id_number' => '2022-00881',
            'first_name' => 'Jessa',
            'last_name' => 'Villanueva',
            'email' => 'jessa.villanueva@university.edu',
            'year_level' => 4,
            'program_id' => $progIT->id,
            'username' => 'jessa.villanueva',
            'password_hash' => Hash::make('password'),
            'account_status' => 'Active',
        ]);

        $ana = Student::create([
            'student_id_number' => '2024-03102',
            'first_name' => 'Ana',
            'last_name' => 'Lim',
            'email' => 'ana.lim@university.edu',
            'year_level' => 1,
            'program_id' => $progCS->id,
            'username' => 'ana.lim',
            'password_hash' => Hash::make('password'),
            'account_status' => 'Active',
        ]);

        $carlo = Student::create([
            'student_id_number' => '2024-03103',
            'first_name' => 'Carlo',
            'last_name' => 'Mendoza',
            'email' => 'carlo.mendoza@university.edu',
            'year_level' => 2,
            'program_id' => $progIT->id,
            'username' => 'carlo.mendoza',
            'password_hash' => Hash::make('password'),
            'account_status' => 'Active',
        ]);

        $joyce = Student::create([
            'student_id_number' => '2024-03104',
            'first_name' => 'Joyce',
            'last_name' => 'Tan',
            'email' => 'joyce.tan@university.edu',
            'year_level' => 3,
            'program_id' => $progCS->id,
            'username' => 'joyce.tan',
            'password_hash' => Hash::make('password'),
            'account_status' => 'Active',
        ]);

        // 7. Maria's Enrollments
        $e1 = Enrollment::create(['student_id' => $maria->id, 'section_id' => $sec1->id, 'status' => 'Approved']);
        $e2 = Enrollment::create(['student_id' => $maria->id, 'section_id' => $sec2->id, 'status' => 'Approved']);
        $e3 = Enrollment::create(['student_id' => $maria->id, 'section_id' => $sec3->id, 'status' => 'Approved']);
        $e4 = Enrollment::create(['student_id' => $maria->id, 'section_id' => $sec4->id, 'status' => 'Approved']);
        $e5 = Enrollment::create(['student_id' => $maria->id, 'section_id' => $sec5->id, 'status' => 'Approved']);

        // Other students' pending enrollments in Registrar queue
        Enrollment::create(['student_id' => $miguel->id, 'section_id' => $sec1->id, 'status' => 'Pending']);
        Enrollment::create(['student_id' => $miguel->id, 'section_id' => $sec2->id, 'status' => 'Pending']);
        Enrollment::create(['student_id' => $miguel->id, 'section_id' => $sec3->id, 'status' => 'Pending']);

        Enrollment::create(['student_id' => $angela->id, 'section_id' => $sec6->id, 'status' => 'Pending']);
        Enrollment::create(['student_id' => $angela->id, 'section_id' => $sec7->id, 'status' => 'Pending']);

        Enrollment::create(['student_id' => $paolo->id, 'section_id' => $sec8->id, 'status' => 'For Review']);
        Enrollment::create(['student_id' => $paolo->id, 'section_id' => $sec2->id, 'status' => 'For Review']);

        // 8. Maria's Grades
        Grade::create(['enrollment_id' => $e1->id, 'grade_value' => 1.50, 'remarks' => 'Passed', 'date_encoded' => '2026-02-15', 'encoded_by_admin_id' => $adminRamon->id]);
        Grade::create(['enrollment_id' => $e2->id, 'grade_value' => 1.75, 'remarks' => 'Passed', 'date_encoded' => '2026-02-15', 'encoded_by_admin_id' => $adminRamon->id]);
        Grade::create(['enrollment_id' => $e3->id, 'grade_value' => 1.25, 'remarks' => 'Passed', 'date_encoded' => '2026-02-15', 'encoded_by_admin_id' => $adminRamon->id]);
        Grade::create(['enrollment_id' => $e4->id, 'grade_value' => 1.50, 'remarks' => 'Passed', 'date_encoded' => '2026-02-15', 'encoded_by_admin_id' => $adminRamon->id]);
        Grade::create(['enrollment_id' => $e5->id, 'grade_value' => 1.00, 'remarks' => 'Passed', 'date_encoded' => '2026-02-15', 'encoded_by_admin_id' => $adminRamon->id]);

        // 9. Document Requests
        DocumentRequest::create([
            'student_id' => $maria->id,
            'document_type' => 'Certificate of Enrollment',
            'purpose' => 'Scholarship verification',
            'number_of_copies' => 1,
            'request_date' => '2026-02-10',
            'status' => 'Ready for Release',
            'processed_by_admin_id' => $adminRamon->id,
        ]);
        DocumentRequest::create([
            'student_id' => $maria->id,
            'document_type' => 'Good Moral Certificate',
            'purpose' => 'Internship requirement',
            'number_of_copies' => 1,
            'request_date' => '2026-02-06',
            'status' => 'Approved',
            'processed_by_admin_id' => $adminRamon->id,
        ]);
        DocumentRequest::create([
            'student_id' => $maria->id,
            'document_type' => 'Transcript of Records',
            'purpose' => 'Graduate school application',
            'number_of_copies' => 2,
            'request_date' => '2026-01-30',
            'status' => 'Pending',
        ]);

        // Other document requests in Registrar queue
        DocumentRequest::create([
            'student_id' => $ana->id,
            'document_type' => 'Transcript of Records',
            'purpose' => 'Transfer application',
            'number_of_copies' => 2,
            'request_date' => '2026-02-14',
            'status' => 'Pending',
        ]);
        DocumentRequest::create([
            'student_id' => $carlo->id,
            'document_type' => 'Certificate of Enrollment',
            'purpose' => 'DFA Passport application',
            'number_of_copies' => 1,
            'request_date' => '2026-02-15',
            'status' => 'Pending',
        ]);
        DocumentRequest::create([
            'student_id' => $joyce->id,
            'document_type' => 'Good Moral Certificate',
            'purpose' => 'Employment requirement',
            'number_of_copies' => 1,
            'request_date' => '2026-02-16',
            'status' => 'Pending',
        ]);

        // 10. Maria's Assessment
        $assessment = Assessment::create([
            'student_id' => $maria->id,
            'school_year' => '2025-2026',
            'semester' => 'Second Semester',
            'total_amount' => 43550.00,
            'status' => 'Partial',
            'date_assessed' => '2026-02-10',
        ]);

        AssessmentItem::create(['assessment_id' => $assessment->id, 'fee_type' => 'Tuition • 21 units', 'amount' => 31500.00]);
        AssessmentItem::create(['assessment_id' => $assessment->id, 'fee_type' => 'Laboratory fees', 'amount' => 4800.00]);
        AssessmentItem::create(['assessment_id' => $assessment->id, 'fee_type' => 'Miscellaneous fees', 'amount' => 7250.00]);

        // 11. Payments for Maria
        Payment::create([
            'student_id' => $maria->id,
            'assessment_id' => $assessment->id,
            'amount_paid' => 10000.00,
            'payment_date' => '2026-01-28',
            'payment_method' => 'Cash',
            'or_number' => 'OR-2026-002107',
            'processed_by_admin_id' => $adminLeah->id,
        ]);
        Payment::create([
            'student_id' => $maria->id,
            'assessment_id' => $assessment->id,
            'amount_paid' => 15000.00,
            'payment_date' => '2026-02-12',
            'payment_method' => 'Cash',
            'or_number' => 'OR-2026-004821',
            'processed_by_admin_id' => $adminLeah->id,
        ]);

        // 12. Clearances for Maria
        Clearance::create([
            'student_id' => $maria->id,
            'department_id' => $deptLib->id,
            'school_year' => '2025-2026',
            'semester' => 'Second Semester',
            'status' => 'Cleared',
            'remarks' => 'All library books returned',
            'request_date' => '2026-02-10',
            'decision_date' => '2026-02-14',
            'decided_by_admin_id' => $adminDina->id,
        ]);
        Clearance::create([
            'student_id' => $maria->id,
            'department_id' => $deptLab->id,
            'school_year' => '2025-2026',
            'semester' => 'Second Semester',
            'status' => 'Cleared',
            'remarks' => 'No equipment liabilities',
            'request_date' => '2026-02-10',
            'decision_date' => '2026-02-13',
            'decided_by_admin_id' => $adminDina->id,
        ]);
        Clearance::create([
            'student_id' => $maria->id,
            'department_id' => $deptSAO->id,
            'school_year' => '2025-2026',
            'semester' => 'Second Semester',
            'status' => 'Cleared',
            'remarks' => 'Good student standing',
            'request_date' => '2026-02-10',
            'decision_date' => '2026-02-11',
            'decided_by_admin_id' => $adminVictor->id,
        ]);
        Clearance::create([
            'student_id' => $maria->id,
            'department_id' => $deptAcc->id,
            'school_year' => '2025-2026',
            'semester' => 'Second Semester',
            'status' => 'Pending',
            'remarks' => 'Awaiting balance completion',
            'request_date' => '2026-02-10',
        ]);
        Clearance::create([
            'student_id' => $maria->id,
            'department_id' => $deptCS->id,
            'school_year' => '2025-2026',
            'semester' => 'Second Semester',
            'status' => 'Pending',
            'remarks' => 'Awaiting department chair sign-off',
            'request_date' => '2026-02-10',
        ]);

        // Department staff clearance queue (Page 12)
        Clearance::create([
            'student_id' => $miguel->id,
            'department_id' => $deptLab->id,
            'school_year' => '2025-2026',
            'semester' => 'Second Semester',
            'status' => 'Pending',
            'remarks' => 'No outstanding equipment',
            'request_date' => '2026-02-16',
        ]);
        Clearance::create([
            'student_id' => $angela->id,
            'department_id' => $deptLab->id,
            'school_year' => '2025-2026',
            'semester' => 'Second Semester',
            'status' => 'Pending',
            'remarks' => 'Return headset #H-208',
            'request_date' => '2026-02-16',
        ]);
        Clearance::create([
            'student_id' => $paolo->id,
            'department_id' => $deptLab->id,
            'school_year' => '2025-2026',
            'semester' => 'Second Semester',
            'status' => 'Pending',
            'remarks' => 'No outstanding equipment',
            'request_date' => '2026-02-16',
        ]);
        Clearance::create([
            'student_id' => $jessa->id,
            'department_id' => $deptLab->id,
            'school_year' => '2025-2026',
            'semester' => 'Second Semester',
            'status' => 'Pending',
            'remarks' => 'Pending workstation check',
            'request_date' => '2026-02-16',
        ]);

        // 13. Audit Logs
        AuditLog::create([
            'admin_user_id' => $adminLeah->id,
            'student_id' => $maria->id,
            'action' => 'Payment recorded',
            'table_affected' => 'payments',
            'record_id' => 2,
            'logged_at' => now()->setTime(10, 42),
        ]);
        AuditLog::create([
            'admin_user_id' => $adminRamon->id,
            'student_id' => $miguel->id,
            'action' => 'Enrollment approved',
            'table_affected' => 'enrollments',
            'record_id' => 1,
            'logged_at' => now()->setTime(10, 31),
        ]);
        AuditLog::create([
            'admin_user_id' => $adminVictor->id,
            'student_id' => null,
            'action' => 'Account disabled',
            'table_affected' => 'admin_users',
            'record_id' => $adminDina->id,
            'logged_at' => now()->setTime(9, 58),
        ]);
        AuditLog::create([
            'admin_user_id' => $adminRamon->id,
            'student_id' => $maria->id,
            'action' => 'Grade sheet updated',
            'table_affected' => 'grades',
            'record_id' => 1,
            'logged_at' => now()->setTime(9, 17),
        ]);
    }
}
