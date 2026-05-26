<?php

use App\Http\Controllers\Api\Admin\AchievementController as AdminAchievementController;
use App\Http\Controllers\Api\Admin\BlogController as AdminBlogController;
use App\Http\Controllers\Api\Admin\CommentController as AdminCommentController;
use App\Http\Controllers\Api\Admin\ContestController as AdminContestController;
use App\Http\Controllers\Api\Admin\EventController as AdminEventController;
use App\Http\Controllers\Api\Admin\GalleryController as AdminGalleryController;
use App\Http\Controllers\Api\Admin\MemberController;
use App\Http\Controllers\Api\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Api\Admin\StatsController as AdminStatsController;
use App\Http\Controllers\Api\AchievementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\BlogInteractionController;
use App\Http\Controllers\Api\ContestController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\UploadController;
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

    // Image upload (auth-only, admin enforced for non-profile folders downstream)
    Route::post('/upload/image', [UploadController::class, 'image']);

    // Blog interactions
    Route::post('/blogs/{blog:id}/like', [BlogInteractionController::class, 'like']);
    Route::delete('/blogs/{blog:id}/like', [BlogInteractionController::class, 'unlike']);
    Route::post('/blogs/{blog:id}/comments', [BlogInteractionController::class, 'comment']);
    Route::post('/comments/{comment:id}/report', [BlogInteractionController::class, 'reportComment']);

    // ───────────────────────── Admin ─────────────────────────
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminStatsController::class, 'index']);

        // Members
        Route::get('/members', [MemberController::class, 'index']);
        Route::patch('/members/{member}/approve', [MemberController::class, 'approve']);
        Route::patch('/members/{member}/reject', [MemberController::class, 'reject']);
        Route::delete('/members/{member}', [MemberController::class, 'destroy']);

        // Settings (CMS)
        Route::get('/settings', [AdminSettingsController::class, 'index']);
        Route::post('/settings', [AdminSettingsController::class, 'bulkUpsert']);

        // Events
        Route::get('/events', [AdminEventController::class, 'index']);
        Route::post('/events', [AdminEventController::class, 'store']);
        Route::put('/events/{event}', [AdminEventController::class, 'update']);
        Route::delete('/events/{event}', [AdminEventController::class, 'destroy']);
        Route::patch('/events/{event}/toggle-publish', [AdminEventController::class, 'togglePublish']);

        // Contests
        Route::get('/contests', [AdminContestController::class, 'index']);
        Route::post('/contests', [AdminContestController::class, 'store']);
        Route::put('/contests/{contest}', [AdminContestController::class, 'update']);
        Route::delete('/contests/{contest}', [AdminContestController::class, 'destroy']);
        Route::patch('/contests/{contest}/toggle-publish', [AdminContestController::class, 'togglePublish']);

        // Achievements
        Route::get('/achievements', [AdminAchievementController::class, 'index']);
        Route::post('/achievements', [AdminAchievementController::class, 'store']);
        Route::put('/achievements/{achievement}', [AdminAchievementController::class, 'update']);
        Route::delete('/achievements/{achievement}', [AdminAchievementController::class, 'destroy']);
        Route::patch('/achievements/{achievement}/toggle-publish', [AdminAchievementController::class, 'togglePublish']);

        // Gallery
        Route::get('/gallery', [AdminGalleryController::class, 'index']);
        Route::post('/gallery', [AdminGalleryController::class, 'store']);
        Route::delete('/gallery/{gallery}', [AdminGalleryController::class, 'destroy']);
        Route::patch('/gallery/{gallery}/toggle-publish', [AdminGalleryController::class, 'togglePublish']);

        // Blogs
        Route::get('/blogs', [AdminBlogController::class, 'index']);
        Route::post('/blogs', [AdminBlogController::class, 'store']);
        Route::patch('/blogs/{blog}/approve', [AdminBlogController::class, 'approve']);
        Route::patch('/blogs/{blog}/reject', [AdminBlogController::class, 'reject']);
        Route::delete('/blogs/{blog}', [AdminBlogController::class, 'destroy']);

        // Comments
        Route::get('/comments', [AdminCommentController::class, 'index']);
        Route::patch('/comments/{comment}/hide', [AdminCommentController::class, 'hide']);
        Route::patch('/comments/{comment}/restore', [AdminCommentController::class, 'restore']);
        Route::delete('/comments/{comment}', [AdminCommentController::class, 'destroy']);

        // Reports
        Route::get('/reports', [AdminReportController::class, 'index']);
        Route::patch('/reports/{report}/resolve', [AdminReportController::class, 'resolve']);
        Route::delete('/reports/{report}', [AdminReportController::class, 'destroy']);
    });
});
