<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentRequest extends Model
{
    protected $fillable = [
        'student_id',
        'document_type',
        'purpose',
        'number_of_copies',
        'request_date',
        'status',
        'processed_by_admin_id',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function processedByAdmin(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'processed_by_admin_id');
    }

    public function trackStatus(): string
    {
        return $this->status;
    }
}
