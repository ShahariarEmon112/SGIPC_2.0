<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\BlogComment;
use App\Models\User;
use Illuminate\Database\Seeder;

class BlogCommentSeeder extends Seeder
{
    public function run(): void
    {
        $blogs = Blog::where('status', 'approved')->pluck('id')->all();
        $users = User::where('status', 'approved')->where('role', 'client')->pluck('id')->all();

        if (empty($blogs) || empty($users)) {
            return;
        }

        $samples = [
            'Great explanation! This helped me solve CF 1234E.',
            'Could you write one on Dijkstra algorithm next?',
            'I struggled with this topic for months. Finally clear!',
            'The DP intuition section was gold. Saved.',
            'Nice writeup. Any recommended practice problems on segment trees with lazy propagation?',
            'Bookmarking this for the bootcamp next semester.',
            'The KMP failure function is the cleanest explanation I have read so far.',
            'Took me three reads but worth it. Thank you.',
            'Just upsolved an ICPC problem because of this. Cheers!',
            'Could you elaborate on the complexity proof in the last paragraph?',
        ];

        for ($i = 0; $i < 30; $i++) {
            $status = match (true) {
                $i < 25 => 'visible',
                $i < 28 => 'reported',
                default => 'hidden',
            };

            BlogComment::create([
                'blog_id' => $blogs[array_rand($blogs)],
                'user_id' => $users[array_rand($users)],
                'content' => $samples[array_rand($samples)],
                'status' => $status,
                'reported_at' => $status === 'reported' ? now()->subDays(rand(1, 14)) : null,
                'created_at' => now()->subDays(rand(1, 200)),
            ]);
        }
    }
}
