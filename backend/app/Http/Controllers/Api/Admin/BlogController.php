<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Blog::with('author:id,name,profile_photo_url')
            ->withCount(['comments', 'likes'])
            ->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return $this->ok($query->paginate(20)->withQueryString());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'content' => ['required', 'string', 'min:30'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'cover_image_url' => ['nullable', 'string', 'max:500'],
            'is_published' => ['boolean'],
        ]);

        $data['author_id'] = $request->user()->id;
        $data['status'] = 'approved';
        $data['is_published'] = $data['is_published'] ?? true;
        $data['slug'] = Blog::uniqueSlug($data['title']);
        $data['excerpt'] = $data['excerpt'] ?? Str::limit(strip_tags($data['content']), 150);

        $blog = Blog::create($data);

        return $this->ok($blog, 'Blog post created.', 201);
    }

    public function approve(Blog $blog): JsonResponse
    {
        $blog->forceFill(['status' => 'approved', 'is_published' => true, 'rejection_reason' => null])->save();

        return $this->ok($blog->fresh(), 'Blog approved and published.');
    }

    public function reject(Blog $blog, Request $request): JsonResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $blog->forceFill([
            'status' => 'rejected',
            'is_published' => false,
            'rejection_reason' => $data['reason'],
        ])->save();

        return $this->ok($blog->fresh(), 'Blog rejected.');
    }

    public function destroy(Blog $blog): JsonResponse
    {
        $blog->delete();

        return $this->ok(null, 'Blog deleted.');
    }
}
