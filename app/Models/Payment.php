<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'student_id',
        'assessment_id',
        'amount_paid',
        'payment_date',
        'payment_method',
        'or_number',
        'processed_by_admin_id',
    ];

    protected $casts = [
        'amount_paid' => 'float',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function processedByAdmin(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'processed_by_admin_id');
    }

    public function generateReceipt(): array
    {
        return [
            'or_number' => $this->or_number,
            'payment_date' => $this->payment_date,
            'amount_paid' => $this->amount_paid,
            'payment_method' => $this->payment_method,
            'student' => $this->student?->full_name,
            'cashier' => $this->processedByAdmin?->name,
        ];
    }
}
