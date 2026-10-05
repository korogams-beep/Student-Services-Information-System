<?php

use App\Http\Controllers\Api\SSISController;
use Illuminate\Support\Facades\Route;

Route::get('/bootstrap', [SSISController::class, 'getSystemState']);
Route::post('/enrollment/submit', [SSISController::class, 'submitEnrollment']);
Route::post('/registrar/enrollments/{id}/decide', [SSISController::class, 'decideEnrollment']);
Route::post('/registrar/grades/save', [SSISController::class, 'saveGrades']);
Route::post('/documents/request', [SSISController::class, 'requestDocument']);
Route::post('/registrar/documents/{id}/release', [SSISController::class, 'releaseDocument']);
Route::post('/cashier/payment', [SSISController::class, 'recordPayment']);
Route::post('/clearance/request', [SSISController::class, 'submitClearanceRequest']);
Route::post('/clearance/{id}/decide', [SSISController::class, 'decideClearance']);
Route::post('/admin/users/{id}/toggle-status', [SSISController::class, 'toggleUserStatus']);
Route::post('/admin/users', [SSISController::class, 'addUser']);
