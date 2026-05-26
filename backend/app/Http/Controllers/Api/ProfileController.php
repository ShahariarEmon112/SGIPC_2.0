<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Blog;
use App\Models\BlogComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    use ApiResponse;

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'profile_photo_url' => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();
        $user->fill($data)->save();

        return $this->ok([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'profile_photo_url' => $user->profile_photo_url,
        ], 'Profile updated.');
    }

    public function myBlogs(Request $request): JsonResponse
    {
        $blogs = Blog::where('author_id', $request->user()->id)
            ->withCount(['likes', 'comments'])
            ->latest()
            ->get();

        return $this->ok($blogs);
    }

    public function myComments(Request $request): JsonResponse
    {
        $comments = BlogComment::where('user_id', $request->user()->id)
            ->with('blog:id,title,slug')
            ->latest()
            ->limit(50)
            ->get();

        return $this->ok($comments);
    }
}
