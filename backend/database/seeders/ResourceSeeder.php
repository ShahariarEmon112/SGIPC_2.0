<?php

namespace Database\Seeders;

use App\Models\Resource;
use App\Models\User;
use Illuminate\Database\Seeder;

class ResourceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $rows = [
            // Algorithms
            ['title' => 'CP-Algorithms', 'url' => 'https://cp-algorithms.com/', 'category' => 'algorithms', 'difficulty' => 'intermediate',
                'description' => 'Comprehensive algorithm reference covering everything from BFS to suffix automaton.'],
            ['title' => 'Competitive Programming Handbook (Antti Laaksonen)', 'url' => 'https://cses.fi/book/book.pdf', 'category' => 'algorithms', 'difficulty' => 'beginner',
                'description' => 'Free PDF book. The default starting point for new contest programmers.'],
            ['title' => 'USACO Guide — Gold and Platinum sections', 'url' => 'https://usaco.guide/', 'category' => 'algorithms', 'difficulty' => 'advanced',
                'description' => 'Curated learning path with problem sets, useful even outside USACO.'],

            // Data Structures
            ['title' => 'Segment Tree Tutorials (cp-algorithms)', 'url' => 'https://cp-algorithms.com/data_structures/segment_tree.html', 'category' => 'data_structures', 'difficulty' => 'intermediate',
                'description' => 'Iterative and recursive segment trees with lazy propagation.'],
            ['title' => 'Fenwick Tree (BIT) explained', 'url' => 'https://cp-algorithms.com/data_structures/fenwick.html', 'category' => 'data_structures', 'difficulty' => 'beginner',
                'description' => 'Concise reference for binary indexed trees and range updates.'],
            ['title' => 'Wavelet Trees & Persistent DS', 'url' => 'https://codeforces.com/blog/entry/52854', 'category' => 'data_structures', 'difficulty' => 'advanced',
                'description' => 'For when segment trees stop being enough.'],

            // Practice
            ['title' => 'Codeforces', 'url' => 'https://codeforces.com/', 'category' => 'practice', 'difficulty' => 'beginner',
                'description' => 'The primary contest platform. Rated rounds every weekend.'],
            ['title' => 'CSES Problem Set', 'url' => 'https://cses.fi/problemset/', 'category' => 'practice', 'difficulty' => 'beginner',
                'description' => '300 problems organized by topic. Excellent for systematic practice.'],
            ['title' => 'AtCoder Beginner / Regular / Grand contests', 'url' => 'https://atcoder.jp/', 'category' => 'practice', 'difficulty' => 'intermediate',
                'description' => 'High-quality problems with careful, mathy elegance.'],
            ['title' => 'VJudge', 'url' => 'https://vjudge.net/', 'category' => 'practice', 'difficulty' => 'intermediate',
                'description' => 'Aggregator across many OJs. SGIPC runs internal contests here.'],
            ['title' => 'LeetCode', 'url' => 'https://leetcode.com/', 'category' => 'practice', 'difficulty' => 'beginner',
                'description' => 'Interview-style problems. Useful for placement prep but distinct from ICPC style.'],

            // Tutorials
            ['title' => 'Codeforces EDU — Interactive lessons', 'url' => 'https://codeforces.com/edu/courses', 'category' => 'tutorial', 'difficulty' => 'beginner',
                'description' => 'Free interactive courses on DP, segment trees, suffix structures, more.'],
            ['title' => 'Errichto — YouTube channel', 'url' => 'https://www.youtube.com/c/Errichto', 'category' => 'tutorial', 'difficulty' => 'intermediate',
                'description' => 'Topic walkthroughs and live contest streams.'],
            ['title' => 'SecondThread — YouTube channel', 'url' => 'https://www.youtube.com/c/SecondThread', 'category' => 'tutorial', 'difficulty' => 'intermediate',
                'description' => 'Approachable problem-solving content for intermediate ICPC level.'],

            // Courses
            ['title' => 'MIT 6.006 — Introduction to Algorithms', 'url' => 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/', 'category' => 'course', 'difficulty' => 'beginner',
                'description' => 'Free MIT OCW course. The foundation.'],
            ['title' => 'Stanford CS97SI — Introduction to Competitive Programming', 'url' => 'https://web.stanford.edu/class/cs97si/', 'category' => 'course', 'difficulty' => 'intermediate',
                'description' => 'Slides + lecture notes from a contest-focused Stanford course.'],
        ];

        foreach ($rows as $i => $row) {
            Resource::updateOrCreate(
                ['url' => $row['url']],
                array_merge($row, [
                    'order_index' => $i,
                    'is_published' => true,
                    'created_by' => $admin?->id,
                ])
            );
        }
    }
}
