<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\BlogLike;
use App\Models\User;
use Illuminate\Database\Seeder;

class BlogLikeSeeder extends Seeder
{
    public function run(): void
    {
        $blogs = Blog::where('status', 'approved')->pluck('id')->all();
        $users = User::where('status', 'approved')->pluck('id')->all();

        if (empty($blogs) || empty($users)) {
            return;
        }

        $seen = [];
        $made = 0;
        $attempts = 0;
        while ($made < 50 && $attempts < 500) {
            $attempts++;
            $blogId = $blogs[array_rand($blogs)];
            $userId = $users[array_rand($users)];
            $key = $blogId.':'.$userId;
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            BlogLike::create(['blog_id' => $blogId, 'user_id' => $userId]);
            $made++;
        }
    }
}
