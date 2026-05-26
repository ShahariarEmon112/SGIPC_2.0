<?php

use App\Http\Controllers\Api\Admin\MemberController;
use App\Http\Controllers\Api\AchievementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\BlogInteractionController;
use App\Http\Controllers\Api\ContestController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\SettingsController;
use Illuminate\Support\Facades\Route;

// ───────────────────────── Public ─────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::get('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/settings', [SettingsController::class, 'index']);

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);

Route::get('/contests', [ContestController::class, 'index']);
Route::get('/contests/{contest}', [ContestController::class, 'show']);

Route::get('/achievements', [AchievementController::class, 'index']);

Route::get('/gallery', [GalleryController::class, 'index']);

Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{blog:slug}', [BlogController::class, 'show']);

// ───────────────────────── Authenticated ─────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Blog interactions — bind on id since slug is reserved for public read URLs
    Route::post('/blogs/{blog:id}/like', [BlogInteractionController::class, 'like']);
    Route::delete('/blogs/{blog:id}/like', [BlogInteractionController::class, 'unlike']);
    Route::post('/blogs/{blog:id}/comments', [BlogInteractionController::class, 'comment']);
    Route::post('/comments/{comment:id}/report', [BlogInteractionController::class, 'reportComment']);

    // ───────────────────────── Admin: members ─────────────────────────
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/members', [MemberController::class, 'index']);
        Route::patch('/members/{member}/approve', [MemberController::class, 'approve']);
        Route::patch('/members/{member}/reject', [MemberController::class, 'reject']);
        Route::delete('/members/{member}', [MemberController::class, 'destroy']);
    });
});
