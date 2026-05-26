<?php

namespace Database\Seeders;

use App\Models\LeaderboardEntry;
use App\Models\User;
use Illuminate\Database\Seeder;

class LeaderboardSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $year = (int) date('Y');

        $entries = [
            ['name' => 'Arif Hossain',     'batch' => '20', 'cf_handle' => 'arif_hossain',   'rating' => 2105, 'max_rating' => 2180, 'wins' => 12, 'contests_participated' => 38],
            ['name' => 'Nusrat Jahan',     'batch' => '20', 'cf_handle' => 'nusrat_j',       'rating' => 2042, 'max_rating' => 2098, 'wins' => 9,  'contests_participated' => 41],
            ['name' => 'Mehedi Hassan',    'batch' => '21', 'cf_handle' => 'mehedi_h',       'rating' => 1987, 'max_rating' => 2025, 'wins' => 7,  'contests_participated' => 35],
            ['name' => 'Tasnim Akter',     'batch' => '21', 'cf_handle' => 'tasnim_a',       'rating' => 1923, 'max_rating' => 1980, 'wins' => 6,  'contests_participated' => 32],
            ['name' => 'Sabbir Ahmed',     'batch' => '20', 'cf_handle' => 'sabbir_a',       'rating' => 1875, 'max_rating' => 1920, 'wins' => 5,  'contests_participated' => 40],
            ['name' => 'Rakibul Islam',    'batch' => '21', 'cf_handle' => 'rakibul_i',      'rating' => 1812, 'max_rating' => 1860, 'wins' => 4,  'contests_participated' => 34],
            ['name' => 'Mahmuda Khatun',   'batch' => '22', 'cf_handle' => 'mahmuda_k',      'rating' => 1768, 'max_rating' => 1790, 'wins' => 3,  'contests_participated' => 28],
            ['name' => 'Fahim Reza',       'batch' => '22', 'cf_handle' => 'fahim_r',        'rating' => 1722, 'max_rating' => 1755, 'wins' => 3,  'contests_participated' => 30],
            ['name' => 'Sumaiya Sultana',  'batch' => '22', 'cf_handle' => 'sumaiya_s',      'rating' => 1684, 'max_rating' => 1710, 'wins' => 2,  'contests_participated' => 26],
            ['name' => 'Imran Khan',       'batch' => '21', 'cf_handle' => 'imran_k',        'rating' => 1641, 'max_rating' => 1690, 'wins' => 2,  'contests_participated' => 29],
            ['name' => 'Tahmid Rahman',    'batch' => '22', 'cf_handle' => 'tahmid_r',       'rating' => 1598, 'max_rating' => 1620, 'wins' => 1,  'contests_participated' => 22],
            ['name' => 'Jannatul Ferdous', 'batch' => '22', 'cf_handle' => 'jannatul_f',     'rating' => 1554, 'max_rating' => 1580, 'wins' => 1,  'contests_participated' => 21],
            ['name' => 'Shahriar Kabir',   'batch' => '23', 'cf_handle' => 'shahriar_k',     'rating' => 1487, 'max_rating' => 1510, 'wins' => 0,  'contests_participated' => 18],
            ['name' => 'Anika Tabassum',   'batch' => '23', 'cf_handle' => 'anika_t',        'rating' => 1432, 'max_rating' => 1465, 'wins' => 0,  'contests_participated' => 16],
            ['name' => 'Naimur Rashid',    'batch' => '23', 'cf_handle' => 'naimur_r',       'rating' => 1389, 'max_rating' => 1410, 'wins' => 0,  'contests_participated' => 14],
        ];

        foreach ($entries as $i => $row) {
            LeaderboardEntry::updateOrCreate(
                ['cf_handle' => $row['cf_handle'], 'year' => $year],
                array_merge($row, [
                    'year' => $year,
                    'rank_position' => $i + 1,
                    'is_published' => true,
                    'created_by' => $admin?->id,
                ])
            );
        }

        // Last year's top three for the year filter
        foreach (array_slice($entries, 0, 3) as $i => $row) {
            LeaderboardEntry::updateOrCreate(
                ['cf_handle' => $row['cf_handle'], 'year' => $year - 1],
                array_merge($row, [
                    'rating' => $row['rating'] - 150,
                    'wins' => max(0, $row['wins'] - 2),
                    'contests_participated' => max(0, $row['contests_participated'] - 10),
                    'year' => $year - 1,
                    'rank_position' => $i + 1,
                    'is_published' => true,
                    'created_by' => $admin?->id,
                ])
            );
        }
    }
}
