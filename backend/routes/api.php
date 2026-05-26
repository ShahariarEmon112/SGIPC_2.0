<?php

use App\Http\Controllers\Api\Admin\MemberController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// ───────────────────────── Public auth ─────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::get('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/login', [AuthController::class, 'login']);

// ───────────────────────── Authenticated ─────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // ───────────────────────── Admin: members ─────────────────────────
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/members', [MemberController::class, 'index']);
        Route::patch('/members/{member}/approve', [MemberController::class, 'approve']);
        Route::patch('/members/{member}/reject', [MemberController::class, 'reject']);
        Route::delete('/members/{member}', [MemberController::class, 'destroy']);
    });
});
