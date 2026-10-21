<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Clearance;
use App\Models\Course;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\Program;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class EnrollmentWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    private Department $dept;
    private Program $program;
    private Course $course1;
    private Course $course2;
    private Section $section1;
    private Section $section2;
    private Student $student;
    private AdminUser $registrar;
    private AdminUser $cashier;

    protected function setUp(): void
    {
        parent::setUp();

        $this->dept = Department::first();
        $this->program = Program::first();
        $this->course1 = Course::where('course_code', 'CCS109')->first();
        $this->course2 = Course::where('course_code', 'CCS112')->first();
        $this->section1 = Section::where('course_id', $this->course1->id)->first();
        $this->section2 = Section::where('course_id', $this->course2->id)->first();

        $this->student = Student::create([
            'student_id_number' => 'STU-2026-9001',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan.delacruz@cuyotech.edu.ph',
            'year_level' => 3,
            'program_id' => $this->program->id,
            'username' => 'j.delacruz',
            'password_hash' => Hash::make('password'),
            'account_status' => 'Active',
        ]);

        $this->registrar = AdminUser::where('role', 'Registrar')->first();
        $this->cashier = AdminUser::where('role', 'Cashier')->first();

        // Create a section with identical schedule to section1 for conflict testing
        $this->section2 = Section::create([
            'course_id' => $this->course2->id,
            'school_year' => $this->section1->school_year,
            'semester' => $this->section1->semester,
            'schedule' => $this->section1->schedule,
            'room' => 'CL-102',
            'slot_limit' => 40,
        ]);
    }

    /**
     * Scenario 1: Clicking Enroll saves and displays 'Pending', NOT 'Enrolled'.
     */
    public function test_clicking_enroll_saves_and_displays_pending(): void
    {
        $response = $this->postJson('/api/enrollment/submit', [
            'student_id' => $this->student->id,
            'section_ids' => [$this->section1->id],
        ], ['X-User-Role' => 'Student']);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Enrollment request submitted successfully!',
            ]);

        // Status in database must be 'Pending'
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $this->student->id,
            'section_id' => $this->section1->id,
            'status' => 'Pending',
        ]);

        // Must NOT be 'Enrolled' immediately after submission
        $this->assertDatabaseMissing('enrollments', [
            'student_id' => $this->student->id,
            'section_id' => $this->section1->id,
            'status' => 'Enrolled',
        ]);
    }

    /**
     * Scenario 2: A valid pending request becomes 'Enrolled' after registrar approval.
     */
    public function test_valid_pending_request_becomes_enrolled_after_registrar_approval(): void
    {
        $enrollment = Enrollment::create([
            'student_id' => $this->student->id,
            'section_id' => $this->section1->id,
            'status' => 'Pending',
        ]);

        $response = $this->postJson("/api/registrar/enrollments/{$enrollment->id}/decide", [
            'status' => 'Enrolled',
        ], ['X-User-Role' => 'Registrar']);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Enrollment status updated to Enrolled',
            ]);

        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'Enrolled',
        ]);
    }

    /**
     * Scenario 3: A request with an unresolved enrollment conflict cannot become 'Enrolled'.
     */
    public function test_request_with_unresolved_enrollment_conflict_cannot_become_enrolled(): void
    {
        // Case A: Unresolved department clearance hold
        Clearance::create([
            'student_id' => $this->student->id,
            'department_id' => $this->dept->id,
            'school_year' => '2025-2026',
            'semester' => 'Second Semester',
            'status' => 'Deficient',
            'remarks' => 'Unreturned lab equipment',
            'request_date' => now()->toDateString(),
        ]);

        $enrollment = Enrollment::create([
            'student_id' => $this->student->id,
            'section_id' => $this->section1->id,
            'status' => 'Pending',
        ]);

        $res = $this->postJson("/api/registrar/enrollments/{$enrollment->id}/decide", [
            'status' => 'Enrolled',
        ], ['X-User-Role' => 'Registrar']);

        $res->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);

        // Verify status remained Pending
        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'Pending',
        ]);

        // Case B: Schedule conflict with an already enrolled course
        // Clear the clearance deficiency
        Clearance::where('student_id', $this->student->id)->delete();

        // Enroll student in section1
        $enrollment->status = 'Enrolled';
        $enrollment->save();

        // Create pending enrollment for section2 (same schedule: M/W 9:00-10:30)
        $conflictingEnrollment = Enrollment::create([
            'student_id' => $this->student->id,
            'section_id' => $this->section2->id,
            'status' => 'Pending',
        ]);

        $conflictRes = $this->postJson("/api/registrar/enrollments/{$conflictingEnrollment->id}/decide", [
            'status' => 'Enrolled',
        ], ['X-User-Role' => 'Registrar']);

        $conflictRes->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);

        // Verify conflicting enrollment remained Pending
        $this->assertDatabaseHas('enrollments', [
            'id' => $conflictingEnrollment->id,
            'status' => 'Pending',
        ]);

        // Case C: Explicit conflict flag from client
        $explicitConflictRes = $this->postJson("/api/registrar/enrollments/{$conflictingEnrollment->id}/decide", [
            'status' => 'Enrolled',
            'has_conflict' => true,
        ], ['X-User-Role' => 'Registrar']);

        $explicitConflictRes->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * Scenario 4: Unauthorized users cannot approve enrollment requests.
     */
    public function test_unauthorized_users_cannot_approve_enrollment_requests(): void
    {
        $enrollment = Enrollment::create([
            'student_id' => $this->student->id,
            'section_id' => $this->section1->id,
            'status' => 'Pending',
        ]);

        // Attempt 1: Student role
        $studentRes = $this->postJson("/api/registrar/enrollments/{$enrollment->id}/decide", [
            'status' => 'Enrolled',
        ], ['X-User-Role' => 'Student']);
        $studentRes->assertStatus(403);

        // Attempt 2: Cashier role
        $cashierRes = $this->postJson("/api/registrar/enrollments/{$enrollment->id}/decide", [
            'status' => 'Enrolled',
        ], ['X-User-Role' => 'Cashier']);
        $cashierRes->assertStatus(403);

        // Attempt 3: No role provided
        $guestRes = $this->postJson("/api/registrar/enrollments/{$enrollment->id}/decide", [
            'status' => 'Enrolled',
        ]);
        $guestRes->assertStatus(403);

        // Verify status remained Pending throughout
        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'Pending',
        ]);
    }

    /**
     * Scenario 5: Existing enrollment functionality continues to work.
     */
    public function test_existing_enrollment_functionality_continues_to_work(): void
    {
        // 1. Student submits enrollment
        $submitRes = $this->postJson('/api/enrollment/submit', [
            'student_id' => $this->student->id,
            'section_ids' => [$this->section1->id],
        ], ['X-User-Role' => 'Student']);
        $submitRes->assertStatus(200);

        $enrollment = Enrollment::where('student_id', $this->student->id)
            ->where('section_id', $this->section1->id)
            ->first();
        $this->assertNotNull($enrollment);
        $this->assertEquals('Pending', $enrollment->status);

        // 2. Registrar approves with 'Approved' or 'Enrolled'
        $approveRes = $this->postJson("/api/registrar/enrollments/{$enrollment->id}/decide", [
            'status' => 'Approved',
        ], ['X-User-Role' => 'Registrar']);
        $approveRes->assertStatus(200);

        // Database status is Enrolled
        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'Enrolled',
        ]);

        // 3. Section available slots and slot checking continues to function
        $this->assertTrue($this->section1->hasOpenSlot());
        $this->assertEquals(39, $this->section1->availableSlots());
    }
}
