<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminUser;
use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\Clearance;
use App\Models\Department;
use App\Models\DocumentRequest;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Payment;
use App\Models\Program;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SSISController extends Controller
{
    /**
     * Get the full initial system state
     */
    public function getSystemState(Request $request): JsonResponse
    {
        $studentIdOrNumber = $request->input('student_id') ?? $request->input('student_id_number');

        $studentQuery = Student::with([
            'program',
            'enrollments.section.course',
            'enrollments.grade',
            'documentRequests',
            'assessments.items',
            'assessments.payments',
            'clearances.department',
        ]);

        if ($studentIdOrNumber) {
            $student = (is_numeric($studentIdOrNumber) && strlen((string) $studentIdOrNumber) < 8)
                ? $studentQuery->where('id', $studentIdOrNumber)->first()
                : $studentQuery->where('student_id_number', $studentIdOrNumber)->first();
        } else {
            $student = $studentQuery->where('student_id_number', '2024-01847')->first()
                ?: $studentQuery->first();
        }

        $sections = Section::with('course')->get();

        $registrarQueue = Enrollment::with(['student.program', 'section.course'])
            ->whereIn('status', ['Pending', 'For Review'])
            ->get();

        $cs101Section = Section::whereHas('course', function ($q) {
            $q->where('course_code', 'CS 101');
        })->first();

        $cs101Enrollments = Enrollment::with(['student', 'grade'])
            ->where('section_id', $cs101Section?->id)
            ->get();

        $registrarDocuments = DocumentRequest::with('student')
            ->whereIn('status', ['Pending', 'Approved'])
            ->latest()
            ->get();

        $departmentClearances = Clearance::with(['student', 'department'])
            ->where('status', 'Pending')
            ->get();

        $adminUsers = AdminUser::with('department')->get();
        $studentsList = Student::with(['program', 'assessments.payments'])->get();

        $auditLogs = AuditLog::with(['adminUser', 'student'])
            ->latest('logged_at')
            ->take(25)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'time' => $log->logged_at ? $log->logged_at->format('h:i A') : now()->format('h:i A'),
                    'action' => $log->action,
                    'user' => $log->adminUser?->name ?? $log->student?->full_name ?? 'System',
                    'detail' => $log->table_affected,
                    'record_id' => $log->record_id,
                ];
            });

        return response()->json([
            'student' => $student,
            'sections' => $sections,
            'registrarQueue' => $registrarQueue,
            'cs101Grades' => $cs101Enrollments,
            'registrarDocuments' => $registrarDocuments,
            'departmentClearances' => $departmentClearances,
            'adminUsers' => $adminUsers,
            'studentsList' => $studentsList,
            'auditLogs' => $auditLogs,
        ]);
    }

    /**
     * User registration (Sign Up) for Students and Staff
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|unique:students,email|unique:admin_users,username',
            'password' => 'required|min:4',
            'role' => 'required|string',
        ]);

        $role = $request->input('role', 'Student');
        $rawName = trim((string) $request->input('name', ''));
        $nameParts = explode(' ', $rawName, 2);
        $firstName = $request->input('first_name', $nameParts[0] ?? 'New');
        $lastName = $request->input('last_name', $nameParts[1] ?? 'User');
        $passwordHash = Hash::make($request->input('password'));

        if (strtolower($role) === 'student') {
            $studentIdNumber = $request->input('student_id_number')
                ?: ('2026-'.str_pad((string) rand(1000, 9999), 5, '0', STR_PAD_LEFT));

            $programName = $request->input('program', 'BS Computer Science');
            $program = Program::where('program_name', 'LIKE', "%{$programName}%")->first()
                ?: Program::first();

            $yearLevel = (int) $request->input('year_level', 1);
            $username = strtolower(explode('@', $request->email)[0]);

            $student = Student::create([
                'student_id_number' => $studentIdNumber,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $request->email,
                'year_level' => $yearLevel,
                'program_id' => $program?->id ?? 1,
                'username' => $username,
                'password_hash' => $passwordHash,
                'account_status' => 'Active',
            ]);

            // Create initial financial assessment starting at default 0
            $assessment = Assessment::create([
                'student_id' => $student->id,
                'school_year' => '2025-2026',
                'semester' => 'Second Semester',
                'total_amount' => 0.00,
                'status' => 'Unassessed',
                'date_assessed' => now()->toDateString(),
            ]);

            // Create default department clearances
            $departments = Department::all();
            foreach ($departments as $dept) {
                Clearance::create([
                    'student_id' => $student->id,
                    'department_id' => $dept->id,
                    'school_year' => '2025-2026',
                    'semester' => 'Second Semester',
                    'status' => 'Pending',
                    'request_date' => now()->toDateString(),
                    'remarks' => 'Awaiting department review',
                ]);
            }

            AuditLog::record(
                "New student account registered ({$student->full_name})",
                'students',
                $student->id,
                null,
                $student->id
            );

            $suffix = $yearLevel === 1 ? 'st Year' : ($yearLevel === 2 ? 'nd Year' : ($yearLevel === 3 ? 'rd Year' : 'th Year'));

            return response()->json([
                'success' => true,
                'message' => 'Account registered successfully!',
                'user' => [
                    'id' => $student->id,
                    'name' => $student->full_name,
                    'email' => $student->email,
                    'student_id_number' => $student->student_id_number,
                    'role' => 'Student',
                    'initials' => strtoupper(substr($firstName, 0, 1).substr($lastName, 0, 1)),
                    'program' => $program?->program_name ?? 'BS Computer Science',
                    'yearLevel' => $yearLevel.$suffix,
                    'status' => 'Active',
                ],
            ]);
        }

        // Staff / Admin registration
        $username = strtolower(explode('@', $request->email)[0]);
        $fullName = "{$firstName} {$lastName}";
        $admin = AdminUser::create([
            'username' => $username,
            'name' => $fullName,
            'password_hash' => $passwordHash,
            'role' => $role,
            'account_status' => 'Active',
        ]);

        AuditLog::record(
            "New {$role} account registered ({$fullName})",
            'admin_users',
            $admin->id,
            $admin->id
        );

        $initials = strtoupper(substr($firstName, 0, 1).(isset($lastName[0]) ? substr($lastName, 0, 1) : 'S'));

        return response()->json([
            'success' => true,
            'message' => "{$role} account registered successfully!",
            'user' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $request->email,
                'username' => $admin->username,
                'role' => $admin->role,
                'initials' => $initials,
                'status' => 'Active',
            ],
        ]);
    }

    /**
     * User login verification
     */
    public function login(Request $request): JsonResponse
    {
        $loginInput = trim((string) $request->input('email_or_id', ''));
        $password = (string) $request->input('password', '');
        $requestedRole = $request->input('role');

        // Check students table
        $student = Student::with([
            'program',
            'enrollments.section.course',
            'enrollments.grade',
            'assessments.items',
            'assessments.payments',
            'clearances.department',
        ])
            ->where(function ($q) use ($loginInput) {
                $q->where('email', $loginInput)
                    ->orWhere('student_id_number', $loginInput)
                    ->orWhere('username', $loginInput)
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) = ?", [$loginInput]);
            })
            ->first();

        if ($student) {
            $initials = strtoupper(substr($student->first_name, 0, 1).substr($student->last_name, 0, 1));
            $suffix = $student->year_level === 1 ? 'st Year' : ($student->year_level === 2 ? 'nd Year' : ($student->year_level === 3 ? 'rd Year' : 'th Year'));

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $student->id,
                    'name' => $student->full_name,
                    'email' => $student->email,
                    'student_id_number' => $student->student_id_number,
                    'role' => 'Student',
                    'initials' => $initials,
                    'program' => $student->program?->program_name ?? 'BS Computer Science',
                    'yearLevel' => $student->year_level.$suffix,
                    'status' => $student->account_status,
                ],
                'student' => $student,
            ]);
        }

        // Check AdminUser table
        $admin = AdminUser::with('department')
            ->where(function ($q) use ($loginInput) {
                $q->where('username', $loginInput)
                    ->orWhere('name', 'LIKE', "%{$loginInput}%");
            })
            ->first();

        if ($admin) {
            $parts = explode(' ', $admin->name);
            $initials = strtoupper(substr($parts[0], 0, 1).(isset($parts[1]) ? substr($parts[1], 0, 1) : 'A'));

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->username.'@university.edu',
                    'username' => $admin->username,
                    'role' => $admin->role,
                    'initials' => $initials,
                    'department' => $admin->department?->department_name,
                    'status' => $admin->account_status,
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No matching account found. Please check your credentials or register a new account.',
        ], 401);
    }

    /**
     * Submit student enrollment schedule
     */
    public function submitEnrollment(Request $request): JsonResponse
    {
        $studentId = $request->input('student_id', 1);
        $sectionIds = $request->input('section_ids', []);

        foreach ($sectionIds as $secId) {
            Enrollment::updateOrCreate(
                ['student_id' => $studentId, 'section_id' => $secId],
                ['status' => 'Pending']
            );
        }

        $student = Student::find($studentId);

        AuditLog::record(
            "Enrollment submitted ({$student?->full_name})",
            'enrollments',
            $studentId,
            null,
            $studentId
        );

        return response()->json([
            'success' => true,
            'message' => 'Enrollment request submitted successfully!',
        ]);
    }

    /**
     * Registrar approve or reject student enrollment
     */
    public function decideEnrollment(Request $request, int $id): JsonResponse
    {
        $status = $request->input('status', 'Approved');
        $enrollment = Enrollment::with('student', 'section.course')->findOrFail($id);
        $enrollment->status = $status;
        $enrollment->save();

        $adminId = AdminUser::where('role', 'Registrar')->first()?->id;

        AuditLog::record(
            "Enrollment {$status} (R. Alcantara • {$enrollment->student->full_name})",
            'enrollments',
            $enrollment->id,
            $adminId,
            $enrollment->student_id
        );

        return response()->json([
            'success' => true,
            'message' => "Enrollment status updated to {$status}",
            'enrollment' => $enrollment,
        ]);
    }

    /**
     * Save/Encode grades for CS 101 or any section
     */
    public function saveGrades(Request $request): JsonResponse
    {
        $gradesData = $request->input('grades', []);
        $subjectCode = $request->input('subject_code', 'CCS109');
        $adminId = AdminUser::where('role', 'Registrar')->first()?->id;

        $targetSection = Section::whereHas('course', function ($q) use ($subjectCode) {
            $q->where('course_code', $subjectCode);
        })->first() ?? Section::first();

        $updatedRows = [];

        foreach ($gradesData as $item) {
            $gradeValue = (float) ($item['grade_value'] ?? $item['grade'] ?? 0);
            $remarks = ($gradeValue > 0 && $gradeValue <= 3.0) ? 'Passed' : 'Failed';
            $enrollmentId = $item['enrollment_id'] ?? null;

            // If enrollmentId is not an active enrollment, match by student_id or student_id_number
            if (! $enrollmentId || ! Enrollment::find($enrollmentId)) {
                $studentQuery = Student::query();
                if (! empty($item['student_id_number']) || ! empty($item['studentId'])) {
                    $idNum = $item['student_id_number'] ?? $item['studentId'];
                    $studentQuery->where('student_id_number', $idNum);
                } elseif (! empty($item['student_id'])) {
                    $studentQuery->where('id', $item['student_id']);
                } elseif (! empty($item['studentName'])) {
                    $studentQuery->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$item['studentName']}%"]);
                }
                $foundStudent = $studentQuery->first();

                if ($foundStudent && $targetSection) {
                    $enrollment = Enrollment::firstOrCreate(
                        ['student_id' => $foundStudent->id, 'section_id' => $targetSection->id],
                        ['status' => 'Approved']
                    );
                    $enrollmentId = $enrollment->id;
                }
            }

            if ($enrollmentId) {
                $grade = Grade::updateOrCreate(
                    ['enrollment_id' => $enrollmentId],
                    [
                        'grade_value' => $gradeValue,
                        'remarks' => $remarks,
                        'date_encoded' => now()->toDateString(),
                        'encoded_by_admin_id' => $adminId,
                    ]
                );
                $updatedRows[] = $grade;
            }
        }

        AuditLog::record(
            "Grade sheet updated (R. Alcantara • {$subjectCode})",
            'grades',
            null,
            $adminId
        );

        $refreshed = Enrollment::with(['student', 'grade'])
            ->where('section_id', $targetSection?->id)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Grades saved successfully!',
            'cs101Grades' => $refreshed,
            'updatedGrades' => $updatedRows,
        ]);
    }

    /**
     * Student request an academic document
     */
    public function requestDocument(Request $request): JsonResponse
    {
        $request->validate([
            'document_type' => 'required|string',
            'purpose' => 'required|string',
            'number_of_copies' => 'required|integer|min:1',
        ]);

        $studentId = $request->input('student_id', 1);

        $doc = DocumentRequest::create([
            'student_id' => $studentId,
            'document_type' => $request->document_type,
            'purpose' => $request->purpose,
            'number_of_copies' => $request->number_of_copies,
            'request_date' => now()->toDateString(),
            'status' => 'Pending',
        ]);

        $student = Student::find($studentId);

        AuditLog::record(
            "Document requested ({$student?->full_name} • {$doc->document_type})",
            'document_requests',
            $doc->id,
            null,
            $studentId
        );

        return response()->json([
            'success' => true,
            'message' => 'Document request submitted successfully!',
            'document' => $doc,
        ]);
    }

    /**
     * Registrar release or approve document request
     */
    public function releaseDocument(Request $request, int $id): JsonResponse
    {
        $doc = DocumentRequest::with('student')->findOrFail($id);
        $status = $request->input('status', 'Ready for Release');
        $adminId = AdminUser::where('role', 'Registrar')->first()?->id;

        $doc->status = $status;
        $doc->processed_by_admin_id = $adminId;
        $doc->save();

        AuditLog::record(
            "Document {$status} (R. Alcantara • {$doc->document_type})",
            'document_requests',
            $doc->id,
            $adminId,
            $doc->student_id
        );

        return response()->json([
            'success' => true,
            'message' => "Document request status updated to {$status}",
            'document' => $doc,
        ]);
    }

    /**
     * Cashier record a student payment
     */
    public function recordPayment(Request $request): JsonResponse
    {
        $studentId = $request->input('student_id', 1);
        $amount = (float) $request->input('amount', 10000.00);
        $paymentMethod = $request->input('payment_method', 'Cash');

        $assessment = Assessment::where('student_id', $studentId)->first();
        if (! $assessment) {
            $assessment = Assessment::create([
                'student_id' => $studentId,
                'school_year' => '2025-2026',
                'semester' => 'Second Semester',
                'total_amount' => 43550.00,
                'status' => 'Unpaid',
                'date_assessed' => now()->toDateString(),
            ]);
        }

        $adminId = AdminUser::where('role', 'Cashier')->first()?->id;
        $orNumber = 'OR-2026-'.str_pad((string) rand(1000, 999999), 6, '0', STR_PAD_LEFT);

        $payment = Payment::create([
            'student_id' => $studentId,
            'assessment_id' => $assessment->id,
            'amount_paid' => $amount,
            'payment_date' => now()->toDateString(),
            'payment_method' => $paymentMethod,
            'or_number' => $orNumber,
            'processed_by_admin_id' => $adminId,
        ]);

        $student = Student::find($studentId);

        AuditLog::record(
            "Payment recorded (L. Navarro • {$orNumber})",
            'payments',
            $payment->id,
            $adminId,
            $studentId
        );

        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully!',
            'payment' => $payment->load('student', 'processedByAdmin'),
            'orNumber' => $orNumber,
            'receipt' => [
                'or_number' => $orNumber,
                'date' => now()->format('F d, Y • h:i A'),
                'description' => 'Tuition payment',
                'amount' => $amount,
                'cashier' => 'L. Navarro (Counter 3)',
                'student' => $student?->full_name,
                'student_id' => $student?->student_id_number,
                'method' => $paymentMethod,
            ],
        ]);
    }

    /**
     * Cashier Data View (Payments ledger, assessments, receipts, financial summaries)
     */
    public function getCashierData(): JsonResponse
    {
        $payments = Payment::with(['student.program', 'processedByAdmin'])
            ->latest('created_at')
            ->get();

        $assessments = Assessment::with(['student.program', 'items', 'payments'])
            ->get()
            ->map(function ($a) {
                $totalPaid = $a->payments->sum('amount_paid');
                $balance = max(0, $a->total_amount - $totalPaid);
                $status = $balance <= 0 ? 'Paid in Full' : ($totalPaid > 0 ? 'Partial' : 'Unpaid');

                return [
                    'id' => $a->id,
                    'student_id' => $a->student_id,
                    'student_name' => $a->student?->full_name ?? 'Unknown Student',
                    'student_id_number' => $a->student?->student_id_number ?? 'N/A',
                    'program' => $a->student?->program?->program_name ?? 'BSCS',
                    'total_assessed' => (float) $a->total_amount,
                    'total_paid' => (float) $totalPaid,
                    'balance_due' => (float) $balance,
                    'status' => $status,
                    'items' => $a->items,
                ];
            });

        $totalRevenue = $payments->sum('amount_paid');
        $cashTotal = $payments->where('payment_method', 'Cash')->sum('amount_paid');
        $onlineTotal = $payments->whereIn('payment_method', ['Online (GCash/Maya)', 'Debit/Credit Card', 'Bank Transfer'])->sum('amount_paid');

        return response()->json([
            'payments' => $payments,
            'assessments' => $assessments,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'cash_total' => $cashTotal,
                'online_total' => $onlineTotal,
                'transaction_count' => $payments->count(),
            ],
        ]);
    }

    /**
     * Submit student clearance request
     */
    public function submitClearanceRequest(Request $request): JsonResponse
    {
        $studentId = $request->input('student_id', 1);
        $student = Student::find($studentId);

        $pendingClearances = Clearance::where('student_id', $studentId)->where('status', 'Pending')->get();
        foreach ($pendingClearances as $cl) {
            $cl->request_date = now()->toDateString();
            $cl->save();
        }

        AuditLog::record(
            "Clearance review requested ({$student?->full_name})",
            'clearances',
            null,
            null,
            $studentId
        );

        return response()->json([
            'success' => true,
            'message' => 'Clearance request submitted for review!',
        ]);
    }

    /**
     * Department staff decide clearance (Approve / Decline)
     */
    public function decideClearance(Request $request, int $id): JsonResponse
    {
        $clearance = Clearance::with('student', 'department')->findOrFail($id);
        $status = $request->input('status', 'Cleared');
        $remarks = $request->input('remarks', $clearance->remarks);

        $adminId = AdminUser::where('role', 'DepartmentStaff')->first()?->id;

        $clearance->status = $status;
        $clearance->remarks = $remarks;
        $clearance->decision_date = now()->toDateString();
        $clearance->decided_by_admin_id = $adminId;
        $clearance->save();

        AuditLog::record(
            "Clearance {$status} ({$clearance->student->full_name} • {$clearance->department->department_name})",
            'clearances',
            $clearance->id,
            $adminId,
            $clearance->student_id
        );

        return response()->json([
            'success' => true,
            'message' => "Clearance updated to {$status}",
            'clearance' => $clearance,
        ]);
    }

    /**
     * Department staff clearance data (queue, completed, compliance)
     */
    public function getClearanceData(): JsonResponse
    {
        $pending = Clearance::with(['student.program', 'department'])
            ->where('status', 'Pending')
            ->get();

        $completed = Clearance::with(['student.program', 'department'])
            ->whereIn('status', ['Cleared', 'Deficient'])
            ->latest('updated_at')
            ->get();

        $totalApplicants = Clearance::distinct('student_id')->count('student_id');
        $clearedApplicants = Clearance::where('status', 'Cleared')->distinct('student_id')->count('student_id');

        return response()->json([
            'pending' => $pending,
            'completed' => $completed,
            'stats' => [
                'total_applicants' => $totalApplicants,
                'cleared_applicants' => $clearedApplicants,
                'compliance_rate' => $totalApplicants > 0 ? round(($clearedApplicants / $totalApplicants) * 100) : 80,
            ],
        ]);
    }

    /**
     * Admin toggle user status
     */
    public function toggleUserStatus(Request $request, int $id): JsonResponse
    {
        $user = AdminUser::find($id);
        $adminId = AdminUser::where('role', 'Admin')->first()?->id;

        if ($user) {
            $user->account_status = $user->account_status === 'Active' ? 'Disabled' : 'Active';
            $user->save();

            AuditLog::record(
                "Account {$user->account_status} (V. Ramos • {$user->name})",
                'admin_users',
                $user->id,
                $adminId
            );

            return response()->json([
                'success' => true,
                'user' => $user,
            ]);
        }

        $student = Student::findOrFail($id);
        $student->account_status = $student->account_status === 'Active' ? 'Disabled' : 'Active';
        $student->save();

        AuditLog::record(
            "Account {$student->account_status} (V. Ramos • {$student->full_name})",
            'students',
            $student->id,
            $adminId
        );

        return response()->json([
            'success' => true,
            'student' => $student,
        ]);
    }

    /**
     * Admin add new user
     */
    public function addUser(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string',
            'role' => 'required|string',
            'username' => 'required|string|unique:admin_users,username',
        ]);

        $adminId = AdminUser::where('role', 'Admin')->first()?->id;

        $newUser = AdminUser::create([
            'name' => $request->name,
            'username' => $request->username,
            'role' => $request->role,
            'password_hash' => Hash::make('password'),
            'account_status' => 'Active',
        ]);

        AuditLog::record(
            "New account created (V. Ramos • {$newUser->name})",
            'admin_users',
            $newUser->id,
            $adminId
        );

        return response()->json([
            'success' => true,
            'user' => $newUser,
        ]);
    }
}
