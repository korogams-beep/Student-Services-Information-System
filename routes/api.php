<?php

use App\Http\Controllers\Api\SSISController;
use Illuminate\Support\Facades\Route;

// Authentication & Registration
Route::post('/auth/register', [SSISController::class, 'register']);
Route::post('/auth/login', [SSISController::class, 'login']);

// Core System State
Route::get('/bootstrap', [SSISController::class, 'getSystemState']);

// Student Self-Service Operations
Route::middleware('role:Student,Admin,Registrar')->group(function () {
    Route::post('/enrollment/submit', [SSISController::class, 'submitEnrollment']);
    Route::post('/clearance/request', [SSISController::class, 'submitClearanceRequest']);
    Route::post('/documents/request', [SSISController::class, 'requestDocument']);
});

// Registrar Operations (Protected)
Route::middleware('role:Registrar,Admin')->group(function () {
    Route::post('/registrar/enrollments/{id}/decide', [SSISController::class, 'decideEnrollment']);
    Route::post('/registrar/grades/save', [SSISController::class, 'saveGrades']);
    Route::post('/registrar/documents/{id}/release', [SSISController::class, 'releaseDocument']);
});

// Cashier Operations (Protected)
Route::middleware('role:Cashier,Admin')->group(function () {
    Route::get('/cashier/data', [SSISController::class, 'getCashierData']);
    Route::post('/cashier/payment', [SSISController::class, 'recordPayment']);
    Route::post('/cashier/payments', [SSISController::class, 'recordPayment']);
});

// Department Staff Operations (Protected)
Route::middleware('role:DepartmentStaff,Department Staff,Admin')->group(function () {
    Route::get('/clearance/data', [SSISController::class, 'getClearanceData']);
    Route::post('/clearance/{id}/decide', [SSISController::class, 'decideClearance']);
});

// Admin Operations (Protected)
Route::middleware('role:Admin')->group(function () {
    Route::post('/admin/users/{id}/toggle-status', [SSISController::class, 'toggleUserStatus']);
    Route::post('/admin/users/{id}/change-role', [SSISController::class, 'changeUserRole']);
    Route::post('/admin/users', [SSISController::class, 'addUser']);
});
