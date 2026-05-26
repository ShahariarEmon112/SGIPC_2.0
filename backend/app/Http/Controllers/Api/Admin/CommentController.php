<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\BlogComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = BlogComment::with([
            'user:id,name,profile_photo_url',
            'blog:id,title,slug',
        ])->withCount('reports')->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($request->boolean('reported_only')) {
            $query->where('status', 'reported');
        }

        return $this->ok($query->paginate(30)->withQueryString());
    }

    public function hide(BlogComment $comment): JsonResponse
    {
        $comment->update(['status' => 'hidden']);

        return $this->ok($comment->fresh(), 'Comment hidden.');
    }

    public function restore(BlogComment $comment): JsonResponse
    {
        $comment->update(['status' => 'visible', 'reported_at' => null]);

        return $this->ok($comment->fresh(), 'Comment restored.');
    }

    public function destroy(BlogComment $comment): JsonResponse
    {
        $comment->delete();

        return $this->ok(null, 'Comment deleted.');
    }
}
