<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'admin_user_id',
        'student_id',
        'action',
        'table_affected',
        'record_id',
        'logged_at',
    ];

    protected $casts = [
        'logged_at' => 'datetime',
    ];

    public function adminUser(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public static function record(string $action, string $tableAffected, ?int $recordId = null, ?int $adminUserId = null, ?int $studentId = null): self
    {
        return self::create([
            'admin_user_id' => $adminUserId,
            'student_id' => $studentId,
            'action' => $action,
            'table_affected' => $tableAffected,
            'record_id' => $recordId,
            'logged_at' => now(),
        ]);
    }
}
