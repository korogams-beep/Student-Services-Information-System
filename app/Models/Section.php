<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
{
    protected $fillable = [
        'course_id',
        'school_year',
        'semester',
        'schedule',
        'room',
        'slot_limit',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function hasOpenSlot(): bool
    {
        $enrolledCount = $this->enrollments()->where('status', 'Approved')->count();

        return $enrolledCount < $this->slot_limit;
    }

    public function availableSlots(): int
    {
        $enrolledCount = $this->enrollments()->where('status', 'Approved')->count();

        return max(0, $this->slot_limit - $enrolledCount);
    }
}
