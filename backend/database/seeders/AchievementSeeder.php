<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\User;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $achievements = [
            ['contest_name' => 'ICPC Asia Dhaka Regional 2023', 'position' => 'Honorable Mention', 'year' => 2023,
                'members' => ['Arif Hossain', 'Nusrat Jahan', 'Mehedi Hassan']],
            ['contest_name' => 'ACM-ICPC Preliminary 2023', 'position' => '1st', 'year' => 2023,
                'members' => ['Tasnim Akter', 'Sabbir Ahmed', 'Rakibul Islam']],
            ['contest_name' => 'National Collegiate Programming Contest 2022', 'position' => '2nd', 'year' => 2022,
                'members' => ['Mahmuda Khatun', 'Fahim Reza', 'Sumaiya Sultana']],
            ['contest_name' => 'BUET Inter-University Programming Contest 2022', 'position' => '3rd', 'year' => 2022,
                'members' => ['Imran Khan', 'Tahmid Rahman', 'Jannatul Ferdous']],
            ['contest_name' => 'RUET CSE Fest 2022', 'position' => '1st', 'year' => 2022,
                'members' => ['Shahriar Kabir', 'Anika Tabassum', 'Naimur Rashid']],
            ['contest_name' => 'SUST SWE Carnival 2021', 'position' => '2nd', 'year' => 2021,
                'members' => ['Sadia Afrin', 'Tanvir Mahmud', 'Ridwanul Haque']],
            ['contest_name' => 'IUT ICT Fest 2021', 'position' => 'Honorable Mention', 'year' => 2021,
                'members' => ['Mahmudul Hasan', 'Farhana Akhter', 'Arif Hossain']],
            ['contest_name' => 'ICPC Preliminary 2021', 'position' => '3rd', 'year' => 2021,
                'members' => ['Nusrat Jahan', 'Mehedi Hassan', 'Tasnim Akter']],
            ['contest_name' => 'DIU Take-Off Programming Contest 2020', 'position' => '1st', 'year' => 2020,
                'members' => ['Sabbir Ahmed', 'Rakibul Islam', 'Mahmuda Khatun']],
            ['contest_name' => 'JU CSE Carnival 2020', 'position' => '2nd', 'year' => 2020,
                'members' => ['Fahim Reza', 'Sumaiya Sultana', 'Imran Khan']],
        ];

        foreach ($achievements as $a) {
            Achievement::updateOrCreate(
                ['contest_name' => $a['contest_name'], 'year' => $a['year']],
                [
                    'title' => $a['position'].' — '.$a['contest_name'],
                    'description' => 'SGIPC secured '.$a['position'].' at '.$a['contest_name'].'. Team representing KUET CSE.',
                    'position' => $a['position'],
                    'members' => $a['members'],
                    'image_url' => 'https://placehold.co/800x450?text=Achievement',
                    'is_published' => true,
                    'created_by' => $admin?->id,
                ]
            );
        }
    }
}
