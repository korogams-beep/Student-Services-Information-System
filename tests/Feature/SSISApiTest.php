<?php

namespace Tests\Feature;

use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SSISApiTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    /**
     * Test bootstrap system state endpoint
     */
    public function test_system_bootstrap_returns_state(): void
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
    }

    /**
     * Test user sign up / registration
     */
    public function test_user_registration_creates_student(): void
    {
        $randomEmail = 'test.student.'.rand(1000, 99999).'@university.edu';
        $randomStudentId = '2026-'.rand(10000, 99999);

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
                    'student_id_number' => $randomStudentId,
                    'role' => 'Student',
                ],
            ]);

        $this->assertDatabaseHas('students', [
            'email' => $randomEmail,
            'student_id_number' => $randomStudentId,
        ]);
    }

    /**
     * Test user login authentication
     */
    public function test_user_login_authenticates_student(): void
    {
        Student::create([
            'program_id' => 1,
            'first_name' => 'Carlos',
            'last_name' => 'Mendoza',
            'email' => 'carlos.mendoza@pnc.edu.ph',
            'student_id_number' => '2026-99999',
            'year_level' => 2,
            'username' => 'carlos.mendoza',
            'password_hash' => bcrypt('password'),
            'account_status' => 'Active',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email_or_id' => 'carlos.mendoza@pnc.edu.ph',
            'password' => 'password',
            'role' => 'Student',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'user' => [
                    'student_id_number' => '2026-99999',
                    'role' => 'Student',
                ],
            ]);
    }

    /**
     * Test registrar saves and updates grades
     */
    public function test_registrar_grades_save_updates(): void
    {
        Student::create([
            'program_id' => 1,
            'first_name' => 'Carlos',
            'last_name' => 'Mendoza',
            'email' => 'carlos.grade@pnc.edu.ph',
            'student_id_number' => '2026-88888',
            'year_level' => 2,
            'username' => 'carlos.grade',
            'password_hash' => bcrypt('password'),
            'account_status' => 'Active',
        ]);

        $response = $this->postJson('/api/registrar/grades/save', [
            'subject_code' => 'CCS109',
            'grades' => [
                [
                    'student_id_number' => '2026-88888',
                    'studentName' => 'Carlos Mendoza',
                    'grade_value' => '1.25',
                ],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('grades', [
            'grade_value' => 1.25,
            'remarks' => 'Passed',
        ]);
    }

    /**
     * Test Cashier data endpoint returns ledger & assessments
     */
    public function test_cashier_data_endpoint(): void
    {
        $response = $this->getJson('/api/cashier/data');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'payments',
                'assessments',
                'summary' => [
                    'total_revenue',
                    'cash_total',
                    'online_total',
                    'transaction_count',
                ],
            ]);
    }

    /**
     * Test Clearance data endpoint returns compliance statistics
     */
    public function test_clearance_data_endpoint(): void
    {
        $response = $this->getJson('/api/clearance/data');

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
}
