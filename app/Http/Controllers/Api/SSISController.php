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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SSISController extends Controller
{
    /**
     * Bootstrap alias endpoint for initial system state
     */
    public function bootstrap(Request $request): JsonResponse
    {
        return $this->getSystemState($request);
    }

    /**
     * Get the full initial system state
     */
    public function getSystemState(Request $request): JsonResponse
    {
        $studentIdOrNumber = $request->input('student_id') ?? $request->input('student_id_number');

        $student = null;
        if ($studentIdOrNumber) {
            $student = (is_numeric($studentIdOrNumber) && strlen((string) $studentIdOrNumber) < 8)
                ? Student::find($studentIdOrNumber)
                : Student::where('student_id_number', $studentIdOrNumber)->first();
        } else {
            $student = Student::first();
        }

        if ($student) {
            $student->load([
                'program',
                'enrollments.section.course',
                'enrollments.grade',
                'documentRequests',
                'assessments.items',
                'assessments.payments',
                'clearances.department',
            ]);
        }

        $sections = Section::with('course')->get();

        $registrarQueue = Enrollment::with(['student.program', 'section.course'])
            ->whereIn('status', ['Pending', 'For Review'])
            ->limit(50)
            ->get();

        $firstSection = $sections->first();
        $cs101Enrollments = $firstSection
            ? Enrollment::with(['student', 'grade'])
                ->where('section_id', $firstSection->id)
                ->get()
            : collect();

        $registrarDocuments = DocumentRequest::with('student')
            ->whereIn('status', ['Pending', 'Approved'])
            ->latest()
            ->limit(50)
            ->get();

        $departmentClearances = Clearance::with(['student', 'department'])
            ->where('status', 'Pending')
            ->limit(50)
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
     * Role Prefix Helper
     */
    public static function getRolePrefix(string $role): string
    {
        return match (trim($role)) {
            'Registrar' => 'REG',
            'Cashier' => 'CSH',
            'Department Staff', 'DepartmentStaff' => 'STF',
            'Admin' => 'ADM',
            default => 'STU',
        };
    }

    /**
     * Generate Unique Role-Matched Account ID
     */
    public static function generateUniqueAccountId(string $role): string
    {
        $prefix = self::getRolePrefix($role);
        $year = '2026';
        do {
            $num = str_pad((string) rand(1000, 9999), 4, '0', STR_PAD_LEFT);
            $candidate = "{$prefix}-{$year}-{$num}";
            $existsInStudent = Student::where('student_id_number', $candidate)->orWhere('username', $candidate)->exists();
            $existsInAdmin = AdminUser::where('username', $candidate)->exists();
        } while ($existsInStudent || $existsInAdmin);

        return $candidate;
    }

    /**
     * User registration (Sign Up) for Students and Staff
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|unique:students,email|unique:admin_users,username',
            'student_id_number' => 'nullable|string|unique:students,student_id_number',
            'password' => 'required|min:4',
        ]);

        // Public registration is strictly restricted to Student accounts
        $role = 'Student';
        $rawName = trim((string) $request->input('name', ''));
        $nameParts = explode(' ', $rawName, 2);
        $firstName = $request->input('first_name', $nameParts[0] ?? 'New');
        $lastName = $request->input('last_name', $nameParts[1] ?? 'User');
        $passwordHash = Hash::make($request->input('password'));

        $rawId = $request->input('student_id_number') ?: $request->input('account_id');
        $studentIdNumber = $rawId ? trim((string) $rawId) : self::generateUniqueAccountId('Student');

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
                'account_id' => $student->student_id_number,
                'student_id_number' => $student->student_id_number,
                'role' => 'Student',
                'initials' => strtoupper(substr($firstName, 0, 1).substr($lastName, 0, 1)),
                'program' => $program?->program_name ?? 'BS Computer Science',
                'yearLevel' => $yearLevel.$suffix,
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

        if ($loginInput === '' || trim($password) === '') {
            return response()->json([
                'success' => false,
                'message' => 'Please provide both your identification and password.',
            ], 422);
        }

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
                    ->orWhere('username', $loginInput);
            })
            ->first();

        // Fallback: match by full name if not found by unique IDs (exact match only)
        if (! $student) {
            $student = Student::with([
                'program',
                'enrollments.section.course',
                'enrollments.grade',
                'assessments.items',
                'assessments.payments',
                'clearances.department',
            ])
                ->get()
                ->first(function ($s) use ($loginInput) {
                    return strcasecmp(trim($s->first_name.' '.$s->last_name), $loginInput) === 0;
                });
        }

        $loginPortal = $request->input('login_portal', 'general');

        if ($student) {
            // Portal Restriction: Non-Admin accounts are strictly blocked from the Admin portal
            if ($loginPortal === 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access Denied: This portal is restricted to System Administrators only.',
                ], 403);
            }

            if ($student->account_status === 'Disabled' || $student->account_status === 'Deactivated') {
                return response()->json([
                    'success' => false,
                    'message' => 'Your student account has been deactivated. Please contact the University Registrar or Administrator.',
                ], 403);
            }

            if (! Hash::check($password, $student->password_hash)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials. Please verify your password.',
                ], 401);
            }

            $initials = strtoupper(substr($student->first_name, 0, 1).substr($student->last_name, 0, 1));
            $suffix = $student->year_level === 1 ? 'st Year' : ($student->year_level === 2 ? 'nd Year' : ($student->year_level === 3 ? 'rd Year' : 'th Year'));

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $student->id,
                    'name' => $student->full_name,
                    'email' => $student->email,
                    'account_id' => $student->student_id_number,
                    'student_id_number' => $student->student_id_number,
                    'role' => 'Student',
                    'initials' => $initials,
                    'program' => $student->program?->program_name ?? 'BS Computer Science',
                    'year_level' => $student->year_level,
                    'yearLevel' => $student->year_level.$suffix,
                    'status' => $student->account_status,
                ],
                'student' => $student,
            ]);
        }

        // Check AdminUser table - exact match on email, username, or recognized role-matched institutional staff ID
        $usernameCandidate = $loginInput;
        if (str_contains($loginInput, '@')) {
            $usernameCandidate = explode('@', $loginInput)[0];
        }

        $roleFromId = match (strtoupper($loginInput)) {
            'REG-2026-0001' => 'Registrar',
            'CSH-2026-0001' => 'Cashier',
            'STF-2026-0001' => 'DepartmentStaff',
            'ADM-2026-0001' => 'Admin',
            default => null,
        };

        $admin = AdminUser::with('department')
            ->where(function ($q) use ($loginInput, $usernameCandidate, $roleFromId) {
                $q->where('username', $loginInput)
                    ->orWhere('username', $usernameCandidate)
                    ->orWhere('name', $loginInput);
                if ($roleFromId) {
                    $q->orWhere('role', $roleFromId);
                }
            })
            ->first();

        if ($admin) {
            // Portal Restriction: Admin must use dedicated Admin portal; Staff must use General portal
            if ($admin->role === 'Admin') {
                if ($loginPortal !== 'admin') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Administrators must sign in through the dedicated Admin Portal.',
                    ], 403);
                }
            } else {
                if ($loginPortal === 'admin') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Access Denied: This portal is restricted to System Administrators only.',
                    ], 403);
                }
            }

            if ($admin->account_status === 'Disabled' || $admin->account_status === 'Deactivated') {
                return response()->json([
                    'success' => false,
                    'message' => 'Your staff account has been deactivated. Please contact the System Administrator.',
                ], 403);
            }

            if (! Hash::check($password, $admin->password_hash)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials. Please verify your password.',
                ], 401);
            }

            $parts = explode(' ', $admin->name);
            $initials = strtoupper(substr($parts[0], 0, 1).(isset($parts[1]) ? substr($parts[1], 0, 1) : 'A'));

            $staffId = match ($admin->role) {
                'Registrar' => 'REG-2026-0001',
                'Cashier' => 'CSH-2026-0001',
                'DepartmentStaff' => 'STF-2026-0001',
                'Admin' => 'ADM-2026-0001',
                default => 'ADM-2026-0001',
            };
            $staffEmail = str_contains($loginInput, '@') ? $loginInput : ($admin->username.'@cuyotech.edu.ph');

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $staffEmail,
                    'username' => $admin->username,
                    'account_id' => $staffId,
                    'student_id_number' => $staffId,
                    'role' => $admin->role === 'DepartmentStaff' ? 'Department Staff' : $admin->role,
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
        $request->validate([
            'student_id' => 'required|integer|exists:students,id',
            'section_ids' => 'required|array|min:1',
            'section_ids.*' => 'integer|exists:sections,id',
        ]);

        $studentId = (int) $request->input('student_id');
        $sectionIds = $request->input('section_ids', []);

        // Department clearance hold restriction
        $clearanceHold = Clearance::where('student_id', $studentId)
            ->where('status', 'Deficient')
            ->with('department')
            ->first();

        if ($clearanceHold) {
            return response()->json([
                'success' => false,
                'message' => "Enrollment blocked: Department clearance hold active with {$clearanceHold->department?->department_name} ({$clearanceHold->remarks}). Clearance must be resolved prior to enrollment.",
            ], 422);
        }

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
        $request->validate([
            'grades' => 'required|array',
            'subject_code' => 'nullable|string|max:20',
        ]);

        $gradesData = $request->input('grades', []);
        $subjectCode = $request->input('subject_code', 'CCS109');
        $adminId = AdminUser::where('role', 'Registrar')->first()?->id;

        $targetSection = Section::whereHas('course', function ($q) use ($subjectCode) {
            $q->where('course_code', $subjectCode);
        })->first() ?? Section::first();

        $updatedRows = [];

        foreach ($gradesData as $item) {
            $rawGrade = $item['grade_value'] ?? $item['grade'] ?? 0;
            if (! is_numeric($rawGrade)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid grade input format. Grades must be numeric values.',
                ], 422);
            }
            $gradeValue = (float) $rawGrade;

            if ($gradeValue < 0.00 || $gradeValue > 5.00) {
                return response()->json([
                    'success' => false,
                    'message' => "Grade value '{$gradeValue}' is out of range. Valid academic grades range from 1.00 to 5.00 (or 0.00 for unassigned).",
                ], 422);
            }

            $remarks = ($gradeValue > 0 && $gradeValue <= 3.0) ? 'Passed' : ($gradeValue == 0 ? 'Pending' : 'Failed');
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
                    $targetName = trim((string) $item['studentName']);
                    $driver = DB::connection()->getDriverName();
                    if ($driver === 'sqlite') {
                        $studentQuery->whereRaw("(first_name || ' ' || last_name) = ?", [$targetName]);
                    } else {
                        $studentQuery->whereRaw("CONCAT(first_name, ' ', last_name) = ?", [$targetName]);
                    }
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
            'student_id' => 'required|integer|exists:students,id',
            'document_type' => 'required|string|max:100',
            'purpose' => 'required|string|max:255',
            'number_of_copies' => 'required|integer|min:1|max:10',
        ]);

        $studentId = (int) $request->input('student_id');

        // Clearance hold restriction check
        $deficientClearance = Clearance::where('student_id', $studentId)
            ->where('status', 'Deficient')
            ->with('department')
            ->first();

        if ($deficientClearance) {
            return response()->json([
                'success' => false,
                'message' => "Document request blocked: Active clearance hold with {$deficientClearance->department?->department_name} ({$deficientClearance->remarks}).",
            ], 422);
        }

        $doc = DocumentRequest::create([
            'student_id' => $studentId,
            'document_type' => strip_tags(trim($request->document_type)),
            'purpose' => strip_tags(trim($request->purpose)),
            'number_of_copies' => (int) $request->number_of_copies,
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

        // Financial hold: check unpaid tuition assessment prior to final release
        if (in_array($status, ['Ready for Release', 'Released'])) {
            $assessment = Assessment::with('payments')->where('student_id', $doc->student_id)->first();
            $totalPaid = $assessment ? (float) $assessment->payments->sum('amount_paid') : 0.0;
            $balance = $assessment ? max(0, (float) $assessment->total_amount - $totalPaid) : 0.0;

            if ($balance > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document release blocked: Student has an outstanding balance of PHP '.number_format($balance, 2).'. Payment is required before releasing official documents.',
                ], 422);
            }
        }

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
        $request->validate([
            'student_id' => 'required|integer|exists:students,id',
            'amount' => 'required|numeric|min:1|max:1000000',
            'payment_method' => 'nullable|string|max:50',
        ]);

        $studentId = (int) $request->input('student_id');
        $amount = (float) $request->input('amount');
        $paymentMethod = $request->input('payment_method', 'Cash') ?: 'Cash';

        // Concurrency / rapid duplicate submission prevention (idempotency check)
        $duplicatePayment = Payment::where('student_id', $studentId)
            ->where('amount_paid', $amount)
            ->where('payment_method', $paymentMethod)
            ->where('created_at', '>=', now()->subSeconds(3))
            ->first();

        if ($duplicatePayment) {
            return response()->json([
                'success' => false,
                'message' => 'Duplicate transaction detected: A payment for this student and amount was already recorded seconds ago.',
                'payment' => $duplicatePayment,
                'orNumber' => $duplicatePayment->or_number,
            ], 409);
        }

        return DB::transaction(function () use ($studentId, $amount, $paymentMethod) {
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

            // Recalculate and update assessment status
            $totalPaid = (float) $assessment->payments()->sum('amount_paid');
            if ($totalPaid >= (float) $assessment->total_amount && (float) $assessment->total_amount > 0) {
                $assessment->status = 'Paid';
            } elseif ($totalPaid > 0) {
                $assessment->status = 'Partial';
            }
            $assessment->save();

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
        });
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
        $role = $request->input('role');
        $targetStatus = $request->input('status');
        $resolvedStatus = $targetStatus ? (($targetStatus === 'Deactivated' || $targetStatus === 'Disabled') ? 'Deactivated' : 'Active') : null;
        $adminId = AdminUser::where('role', 'Admin')->first()?->id;

        // If explicitly targeting a Student
        if ($role === 'Student' || $request->input('user_type') === 'student' || $request->input('is_student')) {
            $student = Student::find($id);
            if ($student) {
                $student->account_status = $resolvedStatus ?: (($student->account_status === 'Active') ? 'Deactivated' : 'Active');
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
        }

        // Check AdminUser if role is not Student
        $user = ($role === 'Student') ? null : AdminUser::find($id);
        if ($user) {
            $user->account_status = $resolvedStatus ?: (($user->account_status === 'Active') ? 'Deactivated' : 'Active');
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

        // Fallback: check Student if AdminUser wasn't matched
        $student = Student::find($id);
        if ($student) {
            $student->account_status = $resolvedStatus ?: (($student->account_status === 'Active') ? 'Deactivated' : 'Active');
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

        return response()->json(['success' => false, 'message' => 'User not found'], 404);
    }

    /**
     * Admin add new user
     */
    public function addUser(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|min:2|max:100',
            'role' => 'required|string|in:Student,Registrar,Cashier,DepartmentStaff,Department Staff,Admin',
            'email' => 'nullable|email|unique:students,email|unique:admin_users,username',
        ]);

        $role = $request->input('role');
        $rawId = $request->input('account_id') ?: $request->input('student_id_number');
        if ($rawId) {
            $accountId = trim((string) $rawId);
        } else {
            $accountId = self::generateUniqueAccountId($role);
        }

        $username = $request->input('username') ?: $accountId;
        $adminId = AdminUser::where('role', 'Admin')->first()?->id;

        if ($role === 'Student') {
            $rawName = trim((string) $request->name);
            $nameParts = explode(' ', $rawName, 2);
            $firstName = $nameParts[0] ?? 'New';
            $lastName = $nameParts[1] ?? 'Student';
            $email = $request->input('email') ?: strtolower($username).'@cuyotech.edu.ph';
            $programName = $request->input('program', 'BS Computer Science');
            $program = Program::where('program_name', 'LIKE', "%{$programName}%")->first() ?: Program::first();

            $student = Student::create([
                'student_id_number' => $accountId,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'year_level' => 1,
                'program_id' => $program?->id ?? 1,
                'username' => $username,
                'password_hash' => Hash::make('password'),
                'account_status' => 'Active',
            ]);

            Assessment::create([
                'student_id' => $student->id,
                'school_year' => '2025-2026',
                'semester' => 'Second Semester',
                'total_amount' => 0.00,
                'status' => 'Unassessed',
                'date_assessed' => now()->toDateString(),
            ]);

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
                "New account created (V. Ramos • {$student->full_name} • {$accountId})",
                'students',
                $student->id,
                $adminId
            );

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $student->id,
                    'name' => $student->full_name,
                    'role' => 'Student',
                    'account_id' => $accountId,
                    'student_id_number' => $accountId,
                    'email' => $student->email,
                    'account_status' => 'Active',
                ],
            ]);
        }

        $newUser = AdminUser::create([
            'name' => $request->name,
            'username' => $username,
            'role' => $role,
            'password_hash' => Hash::make('password'),
            'account_status' => 'Active',
        ]);

        AuditLog::record(
            "New account created (V. Ramos • {$newUser->name} • {$accountId})",
            'admin_users',
            $newUser->id,
            $adminId
        );

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $newUser->id,
                'name' => $newUser->name,
                'role' => $newUser->role,
                'account_id' => $accountId,
                'student_id_number' => $accountId,
                'username' => $newUser->username,
                'account_status' => 'Active',
            ],
        ]);
    }

    /**
     * Admin change user role
     */
    public function changeUserRole(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'role' => 'required|string|in:Student,Registrar,Cashier,DepartmentStaff,Department Staff,Admin',
        ]);

        $newRole = $request->input('role');
        $suppliedAccountId = $request->input('account_id');
        $adminId = AdminUser::where('role', 'Admin')->first()?->id;

        $user = AdminUser::find($id);
        if ($user) {
            $oldRole = $user->role;
            $user->role = $newRole;
            $user->save();

            AuditLog::record(
                "Role changed from {$oldRole} to {$newRole} (V. Ramos • {$user->name})",
                'admin_users',
                $user->id,
                $adminId
            );

            return response()->json([
                'success' => true,
                'message' => "Role updated to {$newRole}",
                'user' => $user,
                'account_id' => $suppliedAccountId,
            ]);
        }

        $student = Student::find($id);
        if ($student) {
            AuditLog::record(
                "Role changed from Student to {$newRole} (V. Ramos • {$student->full_name})",
                'students',
                $student->id,
                $adminId
            );

            if ($newRole !== 'Student') {
                $adminUser = AdminUser::updateOrCreate(
                    ['username' => $student->username],
                    [
                        'name' => $student->full_name,
                        'password_hash' => $student->password_hash,
                        'role' => $newRole,
                        'account_status' => $student->account_status,
                    ]
                );

                return response()->json([
                    'success' => true,
                    'message' => "Role updated to {$newRole}",
                    'user' => $adminUser,
                    'account_id' => $suppliedAccountId,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => "Role updated to {$newRole}",
                'student' => $student,
                'account_id' => $suppliedAccountId,
            ]);
        }

        return response()->json(['success' => false, 'message' => 'User not found'], 404);
    }
}
