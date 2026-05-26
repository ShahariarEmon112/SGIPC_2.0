<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $authors = User::where('status', 'approved')->pluck('id')->all();
        if (empty($authors)) {
            return;
        }

        $titles = [
            'Getting Started with Competitive Programming',
            'How to Approach Dynamic Programming Problems',
            'Graph Theory for Beginners',
            'My ICPC Journey: From Campus to Regionals',
            'Segment Trees Explained with Examples',
            'Top 10 Codeforces Tips for Beginners',
            'Binary Search: Beyond the Basics',
            'How We Prepared for ICPC 2023',
            'Understanding Big-O Notation',
            'Bit Manipulation Tricks Every Programmer Should Know',
            'DFS vs BFS: When to Use Which',
            'String Algorithms: KMP and Z-Function',
            'Mastering Two-Pointer Techniques',
            'A Beginner Guide to Number Theory in Contests',
            'Why Editorial-Reading Is the Skill That Levels You Up',
        ];

        $bodyParagraphs = [
            'When you start out in competitive programming, every problem feels like a wall. The truth is that pattern recognition is built one repetition at a time — there is no shortcut, only deliberate practice.',
            'The fastest way to improve is to stop solving easy problems past the point of usefulness and start failing at problems just outside your reach. Read editorials, implement the intended solution, then come back next week and try the same problem from scratch.',
            'Teamwork in ICPC-style contests is a different skill from solo problem solving. Pair-debugging, knowing when to switch problems, and trusting your teammate to be implementing correctly while you read the next statement — that is the meta-game.',
            'Codeforces ratings can be misleading on a single contest, but the trend over twenty contests is the truth. Focus on solving problems in the +200 to +400 range from your current rating; that is the productive zone.',
        ];

        foreach ($titles as $idx => $title) {
            $status = match (true) {
                $idx < 12 => 'approved',
                $idx < 14 => 'pending',
                default => 'rejected',
            };
            $isPublished = $status === 'approved';
            $content = '<p>'.implode('</p><p>', $bodyParagraphs).'</p>';

            Blog::updateOrCreate(
                ['title' => $title],
                [
                    'slug' => Str::slug($title),
                    'content' => $content,
                    'excerpt' => Str::limit(strip_tags($bodyParagraphs[0]), 150),
                    'cover_image_url' => 'https://placehold.co/1200x630?text=Blog',
                    'author_id' => $authors[array_rand($authors)],
                    'status' => $status,
                    'rejection_reason' => $status === 'rejected' ? 'Content needs more original analysis; please revise.' : null,
                    'is_published' => $isPublished,
                    'views_count' => $isPublished ? rand(10, 500) : 0,
                    'created_at' => now()->subDays(rand(7, 365)),
                    'updated_at' => now()->subDays(rand(1, 7)),
                ]
            );
        }
    }
}
