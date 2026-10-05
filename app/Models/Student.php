<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    protected $fillable = [
        'student_id_number',
        'first_name',
        'last_name',
        'email',
        'year_level',
        'program_id',
        'username',
        'password_hash',
        'account_status',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function documentRequests(): HasMany
    {
        return $this->hasMany(DocumentRequest::class);
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function clearances(): HasMany
    {
        return $this->hasMany(Clearance::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function enroll(int $sectionId): Enrollment
    {
        return $this->enrollments()->create([
            'section_id' => $sectionId,
            'status' => 'Pending',
        ]);
    }

    public function requestDocument(string $docType, string $purpose, int $copies = 1): DocumentRequest
    {
        return $this->documentRequests()->create([
            'document_type' => $docType,
            'purpose' => $purpose,
            'number_of_copies' => $copies,
            'request_date' => now()->toDateString(),
            'status' => 'Pending',
        ]);
    }
}
