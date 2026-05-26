<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Blog;
use App\Models\BlogComment;
use App\Models\BlogLike;
use App\Models\CommentReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BlogInteractionController extends Controller
{
    use ApiResponse;

    public function like(Blog $blog, Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        BlogLike::firstOrCreate(['blog_id' => $blog->id, 'user_id' => $userId]);

        $count = $blog->likes()->count();

        return $this->ok(['liked' => true, 'count' => $count]);
    }

    public function unlike(Blog $blog, Request $request): JsonResponse
    {
        BlogLike::where('blog_id', $blog->id)
            ->where('user_id', $request->user()->id)
            ->delete();

        $count = $blog->likes()->count();

        return $this->ok(['liked' => false, 'count' => $count]);
    }

    public function comment(Blog $blog, Request $request): JsonResponse
    {
        $data = $request->validate([
            'content' => ['required', 'string', 'min:2', 'max:1000'],
        ]);

        $comment = BlogComment::create([
            'blog_id' => $blog->id,
            'user_id' => $request->user()->id,
            'content' => $data['content'],
            'status' => 'visible',
        ]);

        $comment->load('user:id,name,profile_photo_url');

        return $this->ok($comment, 'Comment posted.');
    }

    public function reportComment(BlogComment $comment, Request $request): JsonResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'min:3', 'max:500'],
        ]);

        $userId = $request->user()->id;

        // Idempotent — one report per (comment, user)
        $report = CommentReport::firstOrCreate(
            ['comment_id' => $comment->id, 'reported_by' => $userId],
            ['reason' => $data['reason'], 'status' => 'pending']
        );

        // Flip the comment to 'reported' so admins see it surface in the queue.
        if ($comment->status === 'visible') {
            $comment->forceFill(['status' => 'reported', 'reported_at' => now()])->save();
        }

        return $this->ok(['report_id' => $report->id], 'Reported.');
    }
}
