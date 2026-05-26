<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Achievement;
use App\Models\Blog;
use App\Models\BlogComment;
use App\Models\CommentReport;
use App\Models\Contest;
use App\Models\Event;
use App\Models\TeamGallery;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->ok([
            'members' => [
                'total' => User::where('role', 'client')->count(),
                'pending' => User::where('status', 'pending')->where('role', 'client')->count(),
                'approved' => User::where('status', 'approved')->where('role', 'client')->count(),
                'rejected' => User::where('status', 'rejected')->where('role', 'client')->count(),
            ],
            'blogs' => [
                'total' => Blog::count(),
                'pending' => Blog::where('status', 'pending')->count(),
                'approved' => Blog::where('status', 'approved')->count(),
                'rejected' => Blog::where('status', 'rejected')->count(),
            ],
            'content' => [
                'events' => Event::count(),
                'contests' => Contest::count(),
                'achievements' => Achievement::count(),
                'gallery' => TeamGallery::count(),
            ],
            'moderation' => [
                'comments_total' => BlogComment::count(),
                'comments_reported' => BlogComment::where('status', 'reported')->count(),
                'reports_pending' => CommentReport::where('status', 'pending')->count(),
            ],
        ]);
    }
}
