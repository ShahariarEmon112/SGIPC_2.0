<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Blog::published()
            ->with(['author:id,name,profile_photo_url'])
            ->withCount(['likes', 'comments'])
            ->orderByDesc('created_at');

        if ($q = trim((string) $request->query('q', ''))) {
            $query->where(function ($w) use ($q) {
                $w->where('title', 'like', "%{$q}%")
                  ->orWhere('excerpt', 'like', "%{$q}%");
            });
        }

        $blogs = $query->paginate(10)->withQueryString();

        return $this->ok($blogs);
    }

    public function show(Blog $blog, Request $request): JsonResponse
    {
        if ($blog->status !== 'approved' || ! $blog->is_published) {
            return $this->fail('Blog not found.', null, 404);
        }

        $blog->increment('views_count');

        $blog->load([
            'author:id,name,profile_photo_url',
            'comments' => fn ($q) => $q->where('status', 'visible')->latest()->with('user:id,name,profile_photo_url'),
        ])->loadCount(['likes', 'comments']);

        $likedByMe = false;
        if ($user = $request->user()) {
            $likedByMe = $blog->likes()->where('user_id', $user->id)->exists();
        }

        return $this->ok([
            'blog' => $blog,
            'liked_by_me' => $likedByMe,
        ]);
    }
}
