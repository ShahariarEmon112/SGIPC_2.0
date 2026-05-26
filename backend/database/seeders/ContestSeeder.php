<?php

namespace Database\Seeders;

use App\Models\Contest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ContestSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $contests = [
            ['title' => 'SGIPC Monthly Rated Contest #12', 'contest_date' => Carbon::now()->addDays(14),
                'platform' => 'Codeforces',
                'description' => 'The twelfth installment of our monthly rated series. Open to all SGIPC members. Standings count toward the annual leaderboard.'],
            ['title' => 'KUET CSE Fest Programming Contest 2025', 'contest_date' => Carbon::now()->addDays(45),
                'platform' => 'Custom Judge',
                'description' => 'Flagship contest of the KUET CSE Fest 2025. Inter-university teams welcome. Problems set by alumni working at top tech companies.'],
            ['title' => 'SGIPC vs RUET Friendly Contest', 'contest_date' => Carbon::now()->subDays(30),
                'platform' => 'VJudge',
                'description' => 'Friendly rivalry round between SGIPC and the RUET programming club. Three-hour contest with a shared editorial session afterwards.'],
            ['title' => 'Inter-University Practice Round', 'contest_date' => Carbon::now()->subMonths(3),
                'platform' => 'Codeforces',
                'description' => 'Joint practice contest with six universities across Bangladesh. Designed as a regional warmup.'],
            ['title' => 'SGIPC Farewell Contest 2024', 'contest_date' => Carbon::now()->subMonths(6),
                'platform' => 'Custom Judge',
                'description' => 'Annual farewell to graduating senior members. Problemset curated by the outgoing batch.'],
        ];

        foreach ($contests as $c) {
            Contest::updateOrCreate(
                ['title' => $c['title']],
                array_merge($c, [
                    'registration_link' => 'https://codeforces.com/group/sgipc/contest/'.rand(10000, 99999),
                    'image_url' => 'https://placehold.co/800x450?text=Contest',
                    'is_published' => true,
                    'created_by' => $admin?->id,
                ])
            );
        }
    }
}
