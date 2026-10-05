<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    protected $fillable = [
        'enrollment_id',
        'grade_value',
        'remarks',
        'date_encoded',
        'encoded_by_admin_id',
    ];

    protected $casts = [
        'grade_value' => 'float',
    ];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function encodedByAdmin(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'encoded_by_admin_id');
    }

    public function getGradeValue(): float
    {
        return (float) $this->grade_value;
    }
}
