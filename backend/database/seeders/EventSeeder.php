<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $events = [
            ['title' => 'SGIPC Intra-University Contest 2023', 'event_date' => '2023-11-12', 'location' => 'KUET CSE Lab',
                'description' => 'Annual flagship contest open to all KUET students. Teams of three battle over five hours on twelve algorithmic problems ranging from ad-hoc to advanced graph theory.'],
            ['title' => 'Freshers Programming Contest 2023', 'event_date' => '2023-04-22', 'location' => 'KUET CSE Lab',
                'description' => 'Beginner-friendly contest exclusively for first-year CSE students. Designed to introduce newcomers to competitive programming with carefully scaled problemsets.'],
            ['title' => 'KUET Inter-Department Programming Contest 2022', 'event_date' => '2022-09-18', 'location' => 'KUET Auditorium',
                'description' => 'Cross-departmental contest pitting CSE, EEE, and ME teams against each other. Highlight of the KUET CSE Fest week.'],
            ['title' => 'National Collegiate Programming League Practice 2022', 'event_date' => '2022-07-30', 'location' => 'Online (Codeforces)',
                'description' => 'Joint practice round with universities across Bangladesh. Real ACM-ICPC style mock with editorials and upsolving sessions afterwards.'],
            ['title' => 'SGIPC Summer Contest 2022', 'event_date' => '2022-06-25', 'location' => 'KUET CSE Lab',
                'description' => 'Mid-year contest themed around dynamic programming and combinatorics. Featured invited speakers from previous ICPC regionalists.'],
            ['title' => 'ACM-ICPC Practice Session 2021', 'event_date' => '2021-10-15', 'location' => 'KUET CSE Lab',
                'description' => 'Closed practice for ICPC regional contestants. Five-hour mirror of the previous year regional problemset.'],
            ['title' => 'SGIPC Annual Programming Fest 2021', 'event_date' => '2021-03-20', 'location' => 'KUET Auditorium',
                'description' => 'Day-long festival featuring a contest, panel discussions, and an editorial walkthrough by senior members. Largest SGIPC event of the year.'],
            ['title' => 'Beginners Bootcamp Contest 2020', 'event_date' => '2020-12-05', 'location' => 'Online (Codeforces)',
                'description' => 'Capstone contest closing the SGIPC beginners bootcamp. Open to all bootcamp participants regardless of department.'],
        ];

        foreach ($events as $e) {
            Event::updateOrCreate(
                ['title' => $e['title']],
                array_merge($e, [
                    'image_url' => 'https://placehold.co/800x450?text=Event',
                    'is_published' => true,
                    'created_by' => $admin?->id,
                ])
            );
        }
    }
}
