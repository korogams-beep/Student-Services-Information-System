<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminUser;
use App\Models\Assessment;
use App\Models\AuditLog;
use App\Models\Clearance;
use App\Models\DocumentRequest;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Payment;
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
    public function getSystemState(): JsonResponse
    {
        $maria = Student::with([
            'program',
            'enrollments.section.course',
            'enrollments.grade',
            'documentRequests',
            'assessments.items',
            'assessments.payments',
            'clearances.department',
        ])->where('student_id_number', '2024-01847')->first();

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
        $studentsList = Student::with('program')->get();

        $auditLogs = AuditLog::with(['adminUser', 'student'])
            ->latest('logged_at')
            ->take(15)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'time' => $log->logged_at->format('h:i A'),
                    'action' => $log->action,
                    'user' => $log->adminUser?->name ?? $log->student?->full_name ?? 'System',
                    'detail' => $log->table_affected,
                    'record_id' => $log->record_id,
                ];
            });

        return response()->json([
            'student' => $maria,
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
        $status = $request->input('status', 'Approved'); // Approved or Rejected
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
        $gradesData = $request->input('grades', []); // array of [enrollment_id => grade_value]
        $adminId = AdminUser::where('role', 'Registrar')->first()?->id;

        foreach ($gradesData as $item) {
            $enrollmentId = $item['enrollment_id'];
            $gradeValue = (float) $item['grade_value'];
            $remarks = $gradeValue <= 3.0 ? 'Passed' : 'Failed';

            Grade::updateOrCreate(
                ['enrollment_id' => $enrollmentId],
                [
                    'grade_value' => $gradeValue,
                    'remarks' => $remarks,
                    'date_encoded' => now()->toDateString(),
                    'encoded_by_admin_id' => $adminId,
                ]
            );
        }

        AuditLog::record(
            'Grade sheet updated (R. Alcantara • CS 101)',
            'grades',
            null,
            $adminId
        );

        return response()->json([
            'success' => true,
            'message' => 'Grades saved successfully!',
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
            return response()->json(['error' => 'Assessment not found'], 404);
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
                'cashier' => 'L. Navarro',
                'student' => $student?->full_name,
                'student_id' => $student?->student_id_number,
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
        $status = $request->input('status', 'Cleared'); // Cleared or Deficient
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
