<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assessment extends Model
{
    protected $fillable = [
        'student_id',
        'school_year',
        'semester',
        'total_amount',
        'status',
        'date_assessed',
    ];

    protected $casts = [
        'total_amount' => 'float',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(AssessmentItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function getTotal(): float
    {
        return (float) $this->total_amount;
    }

    public function totalPaid(): float
    {
        return (float) $this->payments()->sum('amount_paid');
    }

    public function balanceDue(): float
    {
        return max(0, $this->getTotal() - $this->totalPaid());
    }
}
