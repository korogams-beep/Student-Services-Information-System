<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Assessment;
use App\Models\Clearance;
use App\Models\Department;
use App\Models\DocumentRequest;
use App\Models\Enrollment;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SSISApiTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    /**
     * PHASE 1 & 2: Test bootstrap state and verify password hashes are never leaked
     */
    public function test_system_bootstrap_returns_state_and_hides_password_hashes(): void
    {
        $response = $this->getJson('/api/bootstrap');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'student',
                'sections',
                'registrarQueue',
                'cs101Grades',
                'adminUsers',
                'studentsList',
                'auditLogs',
            ]);

        $data = $response->json();
        $this->assertCount(0, $data['studentsList'], 'Clean database bootstrap must start at 0 students');
        $this->assertNull($data['student'], 'No active student selected at clean bootstrap');

        // Security Audit Check: password_hash must never be exposed
        foreach ($data['adminUsers'] as $admin) {
            $this->assertArrayNotHasKey('password_hash', $admin, 'AdminUser password_hash must be hidden from API responses');
        }
        foreach ($data['studentsList'] as $student) {
            $this->assertArrayNotHasKey('password_hash', $student, 'Student password_hash must be hidden from API responses');
        }
    }

    /**
     * PHASE 1: Test valid student registration
     */
    public function test_user_registration_creates_student(): void
    {
        $randomEmail = 'carlos.mendoza.'.rand(1000, 99999).'@cuyotech.edu.ph';
        $randomStudentId = 'STU-2026-'.rand(1000, 9999);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Carlos Mendoza',
            'email' => $randomEmail,
            'student_id_number' => $randomStudentId,
            'role' => 'Student',
            'program' => 'BS Computer Science',
            'year_level' => 2,
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'user' => [
                    'name' => 'Carlos Mendoza',
                    'email' => $randomEmail,
                    'role' => 'Student',
                ],
            ]);

        $this->assertDatabaseHas('students', [
            'email' => $randomEmail,
            'student_id_number' => $randomStudentId,
        ]);
    }

    /**
     * PHASE 1: Valid logins across all 5 institutional roles
     */
    public function test_login_authenticates_all_five_roles_with_valid_password(): void
    {
        // 1. Student (created for test)
        Student::create([
            'program_id' => 1,
            'first_name' => 'Demo',
            'last_name' => 'Student',
            'email' => 'student.demo@cuyotech.edu.ph',
            'student_id_number' => 'STU-2026-0001',
            'year_level' => 1,
            'username' => 'student.demo',
            'password_hash' => Hash::make('password'),
            'account_status' => 'Active',
        ]);

        $resStudent = $this->postJson('/api/auth/login', [
            'email_or_id' => 'STU-2026-0001',
            'password' => 'password',
        ]);
        $resStudent->assertStatus(200)->assertJson(['success' => true, 'user' => ['role' => 'Student']]);

        // 2. Registrar (seeded)
        $resReg = $this->postJson('/api/auth/login', [
            'email_or_id' => 'r.alcantara',
            'password' => 'password',
        ]);
        $resReg->assertStatus(200)->assertJson(['success' => true, 'user' => ['role' => 'Registrar']]);

        // 3. Cashier (seeded)
        $resCashier = $this->postJson('/api/auth/login', [
            'email_or_id' => 'l.navarro',
            'password' => 'password',
        ]);
        $resCashier->assertStatus(200)->assertJson(['success' => true, 'user' => ['role' => 'Cashier']]);

        // 4. Department Staff (seeded)
        $resStaff = $this->postJson('/api/auth/login', [
            'email_or_id' => 'd.flores',
            'password' => 'password',
        ]);
        $resStaff->assertStatus(200)->assertJson(['success' => true, 'user' => ['role' => 'Department Staff']]);

        // 5. Admin (seeded)
        $resAdmin = $this->postJson('/api/auth/login', [
            'email_or_id' => 'v.ramos',
            'password' => 'password',
            'login_portal' => 'admin',
        ]);
        $resAdmin->assertStatus(200)->assertJson(['success' => true, 'user' => ['role' => 'Admin']]);
    }

    /**
     * PHASE 1 & 2: Test login rejects wrong password (Authentication Protection)
     */
    public function test_login_rejects_wrong_password(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email_or_id' => 'r.alcantara',
            'password' => 'completely_wrong_password',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid credentials. Please verify your password.',
            ]);
    }

    /**
     * PHASE 1: Test login rejects empty and whitespace inputs
     */
    public function test_login_rejects_empty_and_whitespace_fields(): void
    {
        $resEmpty = $this->postJson('/api/auth/login', [
            'email_or_id' => '',
            'password' => '',
        ]);
        $resEmpty->assertStatus(422);

        $resWhitespace = $this->postJson('/api/auth/login', [
            'email_or_id' => '   ',
            'password' => '   ',
        ]);
        $resWhitespace->assertStatus(422);
    }

    /**
     * PHASE 1: Test login rejects non-existent account
     */
    public function test_login_rejects_non_existent_account(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email_or_id' => 'ghost.user.999999@cuyotech.edu.ph',
            'password' => 'password',
        ]);

        $response->assertStatus(401)
            ->assertJson(['success' => false]);
    }

    /**
     * PHASE 1 & 2: Test login rejects deactivated accounts
     */
    public function test_login_rejects_deactivated_student_and_staff(): void
    {
        Student::create([
            'program_id' => 1,
            'first_name' => 'Deactivated',
            'last_name' => 'Student',
            'email' => 'deactivated.student@cuyotech.edu.ph',
            'student_id_number' => 'STU-2026-9991',
            'year_level' => 1,
            'username' => 'deactivated.student',
            'password_hash' => Hash::make('password'),
            'account_status' => 'Deactivated',
        ]);

        $resStudent = $this->postJson('/api/auth/login', [
            'email_or_id' => 'STU-2026-9991',
            'password' => 'password',
        ]);
        $resStudent->assertStatus(403);

        AdminUser::create([
            'username' => 'disabled.staff',
            'name' => 'Disabled Staff',
            'password_hash' => Hash::make('password'),
            'role' => 'Registrar',
            'account_status' => 'Disabled',
        ]);

        $resStaff = $this->postJson('/api/auth/login', [
            'email_or_id' => 'disabled.staff',
            'password' => 'password',
        ]);
        $resStaff->assertStatus(403);
    }

    /**
     * PHASE 2: Test SQL Injection and special/Unicode inputs handled safely
     */
    public function test_login_handles_special_and_unicode_characters_safely(): void
    {
        $sqliPayloads = [
            "' OR '1'='1",
            "admin' --",
            '<script>alert("XSS")</script>',
            '学生/🎓/ñ/ü/日本語',
        ];

        foreach ($sqliPayloads as $payload) {
            $response = $this->postJson('/api/auth/login', [
                'email_or_id' => $payload,
                'password' => 'password',
            ]);
            // Must return 401 Unauthorized cleanly without 500 error or SQL exception
            $response->assertStatus(401);
        }
    }

    /**
     * PHASE 2: Test Broken Access Control & Privilege Escalation (RBAC)
     */
    public function test_rbac_blocks_unauthorized_student_from_staff_and_admin_routes(): void
    {
        // 1. Student trying to change user roles
        $resAdmin = $this->postJson('/api/admin/users/1/change-role', [
            'role' => 'Admin',
        ], ['X-User-Role' => 'Student']);
        $resAdmin->assertStatus(403);

        // 2. Student trying to save grades
        $resRegistrar = $this->postJson('/api/registrar/grades/save', [
            'subject_code' => 'CCS109',
            'grades' => [],
        ], ['X-User-Role' => 'Student']);
        $resRegistrar->assertStatus(403);

        // 3. Student trying to record payment
        $resCashier = $this->postJson('/api/cashier/payment', [
            'student_id' => 1,
            'amount' => 5000,
        ], ['X-User-Role' => 'Student']);
        $resCashier->assertStatus(403);

        // 4. Guest / Unauthenticated caller trying to decide clearance
        $resClearance = $this->postJson('/api/clearance/1/decide', [
            'status' => 'Cleared',
        ]);
        $resClearance->assertStatus(403);
    }

    /**
     * PHASE 1 & 2: Test Registrar grade encoding and range validation
     */
    public function test_registrar_grades_save_validates_range_and_updates_database(): void
    {
        $student = Student::create([
            'program_id' => 1,
            'first_name' => 'Angela',
            'last_name' => 'Reyes',
            'email' => 'angela.reyes@cuyotech.edu.ph',
            'student_id_number' => 'STU-2026-3333',
            'year_level' => 2,
            'username' => 'angela.reyes',
            'password_hash' => bcrypt('password'),
            'account_status' => 'Active',
        ]);

        // Out-of-bounds grade check
        $resInvalid = $this->postJson('/api/registrar/grades/save', [
            'subject_code' => 'CCS109',
            'grades' => [
                [
                    'student_id_number' => 'STU-2026-3333',
                    'studentName' => 'Angela Reyes',
                    'grade_value' => '9.50',
                ],
            ],
        ], ['X-User-Role' => 'Registrar']);
        $resInvalid->assertStatus(422);

        // Valid grade encoding
        $resValid = $this->postJson('/api/registrar/grades/save', [
            'subject_code' => 'CCS109',
            'grades' => [
                [
                    'student_id_number' => 'STU-2026-3333',
                    'studentName' => 'Angela Reyes',
                    'grade_value' => '1.50',
                ],
            ],
        ], ['X-User-Role' => 'Registrar']);

        $resValid->assertStatus(200);
        $this->assertDatabaseHas('grades', [
            'grade_value' => 1.50,
            'remarks' => 'Passed',
        ]);
    }

    /**
     * PHASE 1 & 2: Cashier payment updates assessment & prevents rapid duplicate submission
     */
    public function test_cashier_payment_updates_assessment_and_blocks_duplicate_submission(): void
    {
        $student = Student::create([
            'program_id' => 1,
            'first_name' => 'Pedro',
            'last_name' => 'Penduko',
            'email' => 'pedro.penduko@cuyotech.edu.ph',
            'student_id_number' => 'STU-2026-4444',
            'year_level' => 1,
            'username' => 'pedro.penduko',
            'password_hash' => bcrypt('password'),
            'account_status' => 'Active',
        ]);

        // Process legitimate payment
        $response1 = $this->postJson('/api/cashier/payment', [
            'student_id' => $student->id,
            'amount' => 15000.00,
            'payment_method' => 'Cash',
        ], ['X-User-Role' => 'Cashier']);

        $response1->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Payment recorded successfully!',
            ]);

        $this->assertDatabaseHas('payments', [
            'student_id' => $student->id,
            'amount_paid' => 15000.00,
        ]);

        // Concurrency / Race Condition test: Immediate duplicate submission
        $response2 = $this->postJson('/api/cashier/payment', [
            'student_id' => $student->id,
            'amount' => 15000.00,
            'payment_method' => 'Cash',
        ], ['X-User-Role' => 'Cashier']);

        $response2->assertStatus(409)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * PHASE 1: Department clearance hold blocks enrollment and document request
     */
    public function test_department_clearance_hold_blocks_enrollment_and_document_requests(): void
    {
        $student = Student::create([
            'program_id' => 1,
            'first_name' => 'Hold',
            'last_name' => 'Student',
            'email' => 'hold.student@cuyotech.edu.ph',
            'student_id_number' => 'STU-2026-5555',
            'year_level' => 1,
            'username' => 'hold.student',
            'password_hash' => bcrypt('password'),
            'account_status' => 'Active',
        ]);

        $dept = Department::first();

        // Create active deficient clearance hold
        Clearance::create([
            'student_id' => $student->id,
            'department_id' => $dept->id,
            'school_year' => '2025-2026',
            'semester' => 'Second Semester',
            'status' => 'Deficient',
            'request_date' => now()->toDateString(),
            'remarks' => 'Unreturned laboratory microcontrollers',
        ]);

        $section = Section::first();

        // 1. Enrollment should be blocked
        $resEnroll = $this->postJson('/api/enrollment/submit', [
            'student_id' => $student->id,
            'section_ids' => [$section->id],
        ], ['X-User-Role' => 'Student']);

        $resEnroll->assertStatus(422)
            ->assertJsonFragment(['success' => false]);

        // 2. Document request should be blocked
        $resDoc = $this->postJson('/api/documents/request', [
            'student_id' => $student->id,
            'document_type' => 'Transcript of Records (TOR)',
            'purpose' => 'Employment',
            'number_of_copies' => 1,
        ], ['X-User-Role' => 'Student']);

        $resDoc->assertStatus(422)
            ->assertJsonFragment(['success' => false]);
    }

    /**
     * PHASE 1: Unpaid assessment balance blocks document release
     */
    public function test_unpaid_fees_block_final_document_release(): void
    {
        $student = Student::create([
            'program_id' => 1,
            'first_name' => 'Debtor',
            'last_name' => 'Student',
            'email' => 'debtor.student@cuyotech.edu.ph',
            'student_id_number' => 'STU-2026-6666',
            'year_level' => 1,
            'username' => 'debtor.student',
            'password_hash' => bcrypt('password'),
            'account_status' => 'Active',
        ]);

        // Assessment with unpaid balance of 25,000
        Assessment::create([
            'student_id' => $student->id,
            'school_year' => '2025-2026',
            'semester' => 'Second Semester',
            'total_amount' => 25000.00,
            'status' => 'Unpaid',
            'date_assessed' => now()->toDateString(),
        ]);

        $doc = DocumentRequest::create([
            'student_id' => $student->id,
            'document_type' => 'Certificate of Registration (COR)',
            'purpose' => 'Scholarship',
            'number_of_copies' => 1,
            'request_date' => now()->toDateString(),
            'status' => 'Pending',
        ]);

        // Attempting to release document while fees are unpaid
        $response = $this->postJson("/api/registrar/documents/{$doc->id}/release", [
            'status' => 'Released',
        ], ['X-User-Role' => 'Registrar']);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * PHASE 1: Clearance data endpoint returns metrics
     */
    public function test_clearance_data_endpoint(): void
    {
        $response = $this->getJson('/api/clearance/data', ['X-User-Role' => 'DepartmentStaff']);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'pending',
                'completed',
                'stats' => [
                    'total_applicants',
                    'cleared_applicants',
                    'compliance_rate',
                ],
            ]);
    }

    /**
     * DUAL LOGIN PORTAL: Admin cannot login to Student & Staff portal (HTTP 403)
     */
    public function test_admin_cannot_login_to_student_staff_portal(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email_or_id' => 'v.ramos',
            'password' => 'password',
            'login_portal' => 'general',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Administrators must sign in through the dedicated Admin Portal.',
            ]);
    }

    /**
     * DUAL LOGIN PORTAL: Student and Staff cannot login to dedicated Admin portal (HTTP 403)
     */
    public function test_student_and_staff_cannot_login_to_admin_portal(): void
    {
        // Create student for testing
        Student::create([
            'program_id' => 1,
            'first_name' => 'Portal',
            'last_name' => 'Student',
            'email' => 'portal.student@cuyotech.edu.ph',
            'student_id_number' => 'STU-2026-0001',
            'year_level' => 1,
            'username' => 'portal.student',
            'password_hash' => Hash::make('password'),
            'account_status' => 'Active',
        ]);

        // Student attempting Admin portal
        $resStudent = $this->postJson('/api/auth/login', [
            'email_or_id' => 'STU-2026-0001',
            'password' => 'password',
            'login_portal' => 'admin',
        ]);
        $resStudent->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Access Denied: This portal is restricted to System Administrators only.',
            ]);

        // Staff attempting Admin portal
        $resStaff = $this->postJson('/api/auth/login', [
            'email_or_id' => 'r.alcantara',
            'password' => 'password',
            'login_portal' => 'admin',
        ]);
        $resStaff->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Access Denied: This portal is restricted to System Administrators only.',
            ]);
    }

    /**
     * DATA PURGE: Ensure legacy student names are completely purged from MySQL
     */
    public function test_previous_student_names_are_purged_from_database(): void
    {
        // Must start with exactly 0 students in clean seeded state
        $this->assertEquals(0, Student::count(), 'Students table must start at exactly 0 rows');

        $legacyKeywords = ['gams', 'yogiri', 'takatou', 'prince', 'clarence', 'lopez', 'bautista', 'maria', 'clara', 'juan', 'dela cruz'];

        foreach ($legacyKeywords as $keyword) {
            $count = Student::where('first_name', 'LIKE', "%{$keyword}%")
                ->orWhere('last_name', 'LIKE', "%{$keyword}%")
                ->orWhere('email', 'LIKE', "%{$keyword}%")
                ->orWhere('username', 'LIKE', "%{$keyword}%")
                ->count();

            $this->assertEquals(0, $count, "Legacy student record containing '{$keyword}' was found in database!");
        }
    }

    /**
     * BOOTSTRAP API: Endpoint returns system state and loads properly
     */
    public function test_bootstrap_endpoint_returns_system_state(): void
    {
        $response = $this->getJson('/api/bootstrap');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'student',
                'sections',
                'studentsList',
                'adminUsers',
            ]);
    }

    /**
     * TASK 5: Full Zero-to-Complete Multi-Role Simulation Test Flow
     * Student <-> Registrar <-> Cashier <-> Department Staff <-> Admin
     */
    public function test_full_zero_to_complete_multi_role_simulation(): void
    {
        // -------------------------------------------------------------
        // STEP 1: Clean State Verification (0 Students)
        // -------------------------------------------------------------
        $this->assertEquals(0, Student::count(), 'Step 1: Students table must start at 0 rows');
        $this->assertEquals(0, Enrollment::count(), 'Step 1: Enrollments must start at 0 rows');
        $this->assertEquals(0, Assessment::count(), 'Step 1: Assessments must start at 0 rows');
        $this->assertEquals(0, Clearance::count(), 'Step 1: Clearances must start at 0 rows');
        $this->assertEquals(0, DocumentRequest::count(), 'Step 1: Document requests must start at 0 rows');

        // Verify master catalogs and official staff exist
        $this->assertGreaterThanOrEqual(4, AdminUser::count(), 'Step 1: 4 staff/admin accounts must exist');
        $this->assertGreaterThanOrEqual(5, Department::count(), 'Step 1: 5 departments must exist');
        $this->assertGreaterThanOrEqual(7, Section::count(), 'Step 1: Sections/courses must exist');

        $bootRes = $this->getJson('/api/bootstrap');
        $bootRes->assertStatus(200);
        $bootData = $bootRes->json();
        $this->assertCount(0, $bootData['studentsList']);

        // -------------------------------------------------------------
        // STEP 2: Student Account Creation — Both Ways
        // -------------------------------------------------------------
        // 2a. Student Self-Registration via Public Portal
        $regRes = $this->postJson('/api/auth/register', [
            'name' => 'Eduardo Cruz',
            'email' => 'eduardo.cruz@cuyotech.edu.ph',
            'student_id_number' => 'STU-2026-1001',
            'role' => 'Student',
            'program' => 'BS Computer Science',
            'year_level' => 1,
            'password' => 'studentpass123',
        ]);
        $regRes->assertStatus(200)->assertJson(['success' => true]);
        $student1 = Student::where('student_id_number', 'STU-2026-1001')->first();
        $this->assertNotNull($student1, 'Student 1 must be created via self-registration');

        // 2b. Admin Creating Student Account via Admin Console
        $adminCreateStudentRes = $this->postJson('/api/admin/users', [
            'name' => 'Teresa Magbanua',
            'role' => 'Student',
            'email' => 'teresa.magbanua@cuyotech.edu.ph',
            'account_id' => 'STU-2026-1002',
            'student_id_number' => 'STU-2026-1002',
            'program' => 'BS Information Technology',
        ], ['X-User-Role' => 'Admin']);
        $adminCreateStudentRes->assertStatus(200)->assertJson(['success' => true]);
        $student2 = Student::where('student_id_number', 'STU-2026-1002')->first();
        $this->assertNotNull($student2, 'Student 2 must be created via Admin Console');

        // 2c. Admin Creating Staff Account via Admin Console
        $adminCreateStaffRes = $this->postJson('/api/admin/users', [
            'name' => 'Grace Poe',
            'role' => 'Registrar',
            'email' => 'grace.poe@cuyotech.edu.ph',
            'account_id' => 'REG-2026-1003',
        ], ['X-User-Role' => 'Admin']);
        $adminCreateStaffRes->assertStatus(200)->assertJson(['success' => true]);
        $this->assertDatabaseHas('admin_users', ['name' => 'Grace Poe', 'role' => 'Registrar']);

        // -------------------------------------------------------------
        // STEP 3: Student Portal Actions
        // -------------------------------------------------------------
        $loginRes = $this->postJson('/api/auth/login', [
            'email_or_id' => 'STU-2026-1001',
            'password' => 'studentpass123',
            'login_portal' => 'general',
        ]);
        $loginRes->assertStatus(200)->assertJson(['success' => true, 'user' => ['role' => 'Student', 'name' => 'Eduardo Cruz']]);

        // Student loads bootstrap / profile
        $studentBootRes = $this->getJson('/api/bootstrap?student_id_number=STU-2026-1001');
        $studentBootRes->assertStatus(200);
        $this->assertEquals($student1->id, $studentBootRes->json('student.id'));

        // -------------------------------------------------------------
        // STEP 4: Department Staff <-> Student Interaction
        // -------------------------------------------------------------
        // Staff logs in
        $staffLoginRes = $this->postJson('/api/auth/login', [
            'email_or_id' => 'd.flores',
            'password' => 'password',
            'login_portal' => 'general',
        ]);
        $staffLoginRes->assertStatus(200)->assertJson(['success' => true, 'user' => ['role' => 'Department Staff']]);

        // Find Student 1's clearance record
        $clearanceRecord = Clearance::where('student_id', $student1->id)->first();
        $this->assertNotNull($clearanceRecord);

        // Staff marks clearance as Deficient
        $decideDeficientRes = $this->postJson("/api/clearance/{$clearanceRecord->id}/decide", [
            'status' => 'Deficient',
            'remarks' => 'Unreturned laboratory toolkit',
        ], ['X-User-Role' => 'DepartmentStaff']);
        $decideDeficientRes->assertStatus(200);
        $this->assertDatabaseHas('clearances', ['id' => $clearanceRecord->id, 'status' => 'Deficient']);

        // Verify Student 1 is blocked from enrolling
        $section = Section::first();
        $enrollBlockedRes = $this->postJson('/api/enrollment/submit', [
            'student_id' => $student1->id,
            'section_ids' => [$section->id],
        ], ['X-User-Role' => 'Student']);
        $enrollBlockedRes->assertStatus(422);

        // Verify Student 1 is blocked from requesting documents
        $docBlockedRes = $this->postJson('/api/documents/request', [
            'student_id' => $student1->id,
            'document_type' => 'Transcript of Records (TOR)',
            'purpose' => 'Employment',
            'number_of_copies' => 1,
        ], ['X-User-Role' => 'Student']);
        $docBlockedRes->assertStatus(422);

        // Staff updates clearance to Cleared
        $decideClearedRes = $this->postJson("/api/clearance/{$clearanceRecord->id}/decide", [
            'status' => 'Cleared',
            'remarks' => 'Equipment surrendered in good condition',
        ], ['X-User-Role' => 'DepartmentStaff']);
        $decideClearedRes->assertStatus(200);
        $this->assertDatabaseHas('clearances', ['id' => $clearanceRecord->id, 'status' => 'Cleared']);

        // -------------------------------------------------------------
        // STEP 5: Registrar <-> Student Interaction
        // -------------------------------------------------------------
        // Student submits subject enrollment now that clearance deficiency is resolved
        $enrollRes = $this->postJson('/api/enrollment/submit', [
            'student_id' => $student1->id,
            'section_ids' => [$section->id],
        ], ['X-User-Role' => 'Student']);
        $enrollRes->assertStatus(200)->assertJson(['success' => true]);
        $enrollment = Enrollment::where('student_id', $student1->id)->where('section_id', $section->id)->first();
        $this->assertNotNull($enrollment);

        // Registrar logs in
        $regLoginRes = $this->postJson('/api/auth/login', [
            'email_or_id' => 'r.alcantara',
            'password' => 'password',
            'login_portal' => 'general',
        ]);
        $regLoginRes->assertStatus(200)->assertJson(['success' => true, 'user' => ['role' => 'Registrar']]);

        // Registrar approves enrollment
        $approveEnrollRes = $this->postJson("/api/registrar/enrollments/{$enrollment->id}/decide", [
            'status' => 'Enrolled',
        ], ['X-User-Role' => 'Registrar']);
        $approveEnrollRes->assertStatus(200);
        $this->assertDatabaseHas('enrollments', ['id' => $enrollment->id, 'status' => 'Enrolled']);

        // Registrar encodes subject grades
        $gradeRes = $this->postJson('/api/registrar/grades/save', [
            'subject_code' => $section->course->course_code ?? 'CCS109',
            'grades' => [
                [
                    'student_id_number' => 'STU-2026-1001',
                    'studentName' => 'Eduardo Cruz',
                    'grade_value' => '1.75',
                ],
            ],
        ], ['X-User-Role' => 'Registrar']);
        $gradeRes->assertStatus(200);
        $this->assertDatabaseHas('grades', [
            'enrollment_id' => $enrollment->id,
            'grade_value' => 1.75,
            'remarks' => 'Passed',
        ]);

        // -------------------------------------------------------------
        // STEP 6: Cashier <-> Registrar <-> Student Interaction
        // -------------------------------------------------------------
        // Student requests TOR document
        $docReqRes = $this->postJson('/api/documents/request', [
            'student_id' => $student1->id,
            'document_type' => 'Transcript of Records (TOR)',
            'purpose' => 'Employment Verification',
            'number_of_copies' => 1,
        ], ['X-User-Role' => 'Student']);
        $docReqRes->assertStatus(200);
        $docRequest = DocumentRequest::where('student_id', $student1->id)->first();
        $this->assertNotNull($docRequest);

        // Student has tuition assessment balance of 2,500.00
        $assessment = Assessment::where('student_id', $student1->id)->first();
        $assessment->update(['total_amount' => 2500.00, 'status' => 'Unpaid']);

        // Registrar attempts to release document while balance is unpaid -> MUST BE BLOCKED (422)
        $blockedReleaseRes = $this->postJson("/api/registrar/documents/{$docRequest->id}/release", [
            'status' => 'Released',
        ], ['X-User-Role' => 'Registrar']);
        $blockedReleaseRes->assertStatus(422);

        // Cashier logs in
        $cashierLoginRes = $this->postJson('/api/auth/login', [
            'email_or_id' => 'l.navarro',
            'password' => 'password',
            'login_portal' => 'general',
        ]);
        $cashierLoginRes->assertStatus(200)->assertJson(['success' => true, 'user' => ['role' => 'Cashier']]);

        // Cashier collects payment of 2,500.00
        $paymentRes = $this->postJson('/api/cashier/payment', [
            'student_id' => $student1->id,
            'amount' => 2500.00,
            'payment_method' => 'Cash',
        ], ['X-User-Role' => 'Cashier']);
        $paymentRes->assertStatus(200)->assertJson(['success' => true]);
        $this->assertDatabaseHas('payments', ['student_id' => $student1->id, 'amount_paid' => 2500.00]);

        // Assessment is now Paid
        $assessment->refresh();
        $this->assertEquals('Paid', $assessment->status);

        // Registrar now releases the document
        $releaseRes = $this->postJson("/api/registrar/documents/{$docRequest->id}/release", [
            'status' => 'Released',
        ], ['X-User-Role' => 'Registrar']);
        $releaseRes->assertStatus(200)->assertJson(['success' => true]);
        $this->assertDatabaseHas('document_requests', ['id' => $docRequest->id, 'status' => 'Released']);

        // -------------------------------------------------------------
        // STEP 7: Admin Console Management & Audit
        // -------------------------------------------------------------
        // Admin logs in via Admin Console
        $adminLoginRes = $this->postJson('/api/auth/login', [
            'email_or_id' => 'v.ramos',
            'password' => 'password',
            'login_portal' => 'admin',
        ]);
        $adminLoginRes->assertStatus(200)->assertJson(['success' => true, 'user' => ['role' => 'Admin']]);

        // Deactivate Student 2
        $toggleRes = $this->postJson("/api/admin/users/{$student2->id}/toggle-status", [
            'role' => 'Student',
        ], ['X-User-Role' => 'Admin']);
        $toggleRes->assertStatus(200);
        $student2->refresh();
        $this->assertEquals('Deactivated', $student2->account_status);

        // Deactivated user login rejected
        $deactivatedLoginRes = $this->postJson('/api/auth/login', [
            'email_or_id' => 'STU-2026-1002',
            'password' => 'password',
            'login_portal' => 'general',
        ]);
        $deactivatedLoginRes->assertStatus(403);

        // Reactivate Student 2
        $reactivateRes = $this->postJson("/api/admin/users/{$student2->id}/toggle-status", [
            'role' => 'Student',
        ], ['X-User-Role' => 'Admin']);
        $reactivateRes->assertStatus(200);
        $student2->refresh();
        $this->assertEquals('Active', $student2->account_status);
    }
}
