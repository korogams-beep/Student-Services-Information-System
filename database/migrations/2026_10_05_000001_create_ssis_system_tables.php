<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Departments
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('department_name');
            $table->string('building')->nullable();
            $table->timestamps();
        });

        // 2. Programs
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('program_code');
            $table->string('program_name');
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->timestamps();
        });

        // 3. Courses
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('course_code');
            $table->string('course_name');
            $table->integer('units')->default(3);
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->timestamps();
        });

        // 4. Sections
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('school_year')->default('2025-2026');
            $table->string('semester')->default('Second Semester');
            $table->string('schedule');
            $table->string('room')->default('Online / TBA');
            $table->integer('slot_limit')->default(40);
            $table->timestamps();
        });

        // 5. Students
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('student_id_number')->unique(); // e.g. 2024-01847
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->integer('year_level')->default(1);
            $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
            $table->string('username')->unique();
            $table->string('password_hash');
            $table->string('account_status')->default('Active');
            $table->timestamps();
        });

        // 6. Admin Users
        Schema::create('admin_users', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('name');
            $table->string('password_hash');
            $table->string('role'); // Registrar, Cashier, DepartmentStaff, Admin
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->integer('counter_no')->nullable();
            $table->string('account_status')->default('Active');
            $table->timestamps();
        });

        // 7. Enrollments
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('section_id')->constrained('sections')->cascadeOnDelete();
            $table->string('status')->default('Pending'); // Pending, Approved, Rejected, For Review
            $table->timestamps();
        });

        // 8. Grades
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('enrollments')->cascadeOnDelete();
            $table->decimal('grade_value', 4, 2)->default(0.00);
            $table->string('remarks')->default('Passed');
            $table->date('date_encoded')->nullable();
            $table->foreignId('encoded_by_admin_id')->nullable()->constrained('admin_users')->nullOnDelete();
            $table->timestamps();
        });

        // 9. Document Requests
        Schema::create('document_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('document_type');
            $table->string('purpose');
            $table->integer('number_of_copies')->default(1);
            $table->date('request_date');
            $table->string('status')->default('Pending'); // Pending, Approved, Ready for Release, Released
            $table->foreignId('processed_by_admin_id')->nullable()->constrained('admin_users')->nullOnDelete();
            $table->timestamps();
        });

        // 10. Assessments
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('school_year')->default('2025-2026');
            $table->string('semester')->default('Second Semester');
            $table->decimal('total_amount', 10, 2)->default(0.00);
            $table->string('status')->default('Unpaid'); // Unpaid, Partial, Paid
            $table->date('date_assessed');
            $table->timestamps();
        });

        // 11. Assessment Items
        Schema::create('assessment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained('assessments')->cascadeOnDelete();
            $table->string('fee_type');
            $table->decimal('amount', 10, 2)->default(0.00);
            $table->timestamps();
        });

        // 12. Payments
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('assessment_id')->constrained('assessments')->cascadeOnDelete();
            $table->decimal('amount_paid', 10, 2)->default(0.00);
            $table->date('payment_date');
            $table->string('payment_method')->default('Cash');
            $table->string('or_number');
            $table->foreignId('processed_by_admin_id')->nullable()->constrained('admin_users')->nullOnDelete();
            $table->timestamps();
        });

        // 13. Clearances
        Schema::create('clearances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->string('school_year')->default('2025-2026');
            $table->string('semester')->default('Second Semester');
            $table->string('status')->default('Pending'); // Pending, Cleared, Deficient
            $table->string('remarks')->nullable();
            $table->date('request_date');
            $table->date('decision_date')->nullable();
            $table->foreignId('decided_by_admin_id')->nullable()->constrained('admin_users')->nullOnDelete();
            $table->timestamps();
        });

        // 14. Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_user_id')->nullable()->constrained('admin_users')->nullOnDelete();
            $table->foreignId('student_id')->nullable()->constrained('students')->nullOnDelete();
            $table->string('action');
            $table->string('table_affected');
            $table->unsignedBigInteger('record_id')->nullable();
            $table->dateTime('logged_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('clearances');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('assessment_items');
        Schema::dropIfExists('assessments');
        Schema::dropIfExists('document_requests');
        Schema::dropIfExists('grades');
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('admin_users');
        Schema::dropIfExists('students');
        Schema::dropIfExists('sections');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('programs');
        Schema::dropIfExists('departments');
    }
};
