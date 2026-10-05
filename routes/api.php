<?php

use App\Http\Controllers\Api\SSISController;
use Illuminate\Support\Facades\Route;

// Authentication & Registration
Route::post('/auth/register', [SSISController::class, 'register']);
Route::post('/auth/login', [SSISController::class, 'login']);

// Core System State
Route::get('/bootstrap', [SSISController::class, 'getSystemState']);

// Student Enrollment & Clearance
Route::post('/enrollment/submit', [SSISController::class, 'submitEnrollment']);
Route::post('/clearance/request', [SSISController::class, 'submitClearanceRequest']);
Route::post('/documents/request', [SSISController::class, 'requestDocument']);

// Registrar Operations
Route::post('/registrar/enrollments/{id}/decide', [SSISController::class, 'decideEnrollment']);
Route::post('/registrar/grades/save', [SSISController::class, 'saveGrades']);
Route::post('/registrar/documents/{id}/release', [SSISController::class, 'releaseDocument']);

// Cashier Operations
Route::get('/cashier/data', [SSISController::class, 'getCashierData']);
Route::post('/cashier/payment', [SSISController::class, 'recordPayment']);

// Department Staff Operations
Route::get('/clearance/data', [SSISController::class, 'getClearanceData']);
Route::post('/clearance/{id}/decide', [SSISController::class, 'decideClearance']);

// Admin Operations
Route::post('/admin/users/{id}/toggle-status', [SSISController::class, 'toggleUserStatus']);
Route::post('/admin/users', [SSISController::class, 'addUser']);
