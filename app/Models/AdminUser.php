<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdminUser extends Model
{
    protected $fillable = [
        'username',
        'name',
        'password_hash',
        'role', // Registrar, Cashier, DepartmentStaff, Admin
        'department_id',
        'counter_no',
        'account_status',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function login(): bool
    {
        return $this->account_status === 'Active';
    }

    public function logout(): void
    {
        // session clear
    }
}
