<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Clearance extends Model
{
    protected $fillable = [
        'student_id',
        'department_id',
        'school_year',
        'semester',
        'status', // Pending, Cleared, Deficient
        'remarks',
        'request_date',
        'decision_date',
        'decided_by_admin_id',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function decidedByAdmin(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'decided_by_admin_id');
    }

    public function getStatus(): string
    {
        return $this->status;
    }
}
