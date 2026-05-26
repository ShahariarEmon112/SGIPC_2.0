<?php

namespace Database\Seeders;

use App\Models\TeamGallery;
use App\Models\User;
use Illuminate\Database\Seeder;

class TeamGallerySeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $entries = [
            ['contest_name' => 'ICPC Asia Dhaka Regional', 'year' => 2023, 'title' => 'Team Photo - ICPC Dhaka 2023'],
            ['contest_name' => 'ACM-ICPC Preliminary', 'year' => 2023, 'title' => 'Team Photo - ICPC Preliminary 2023'],
            ['contest_name' => 'KUET Intra-University Contest', 'year' => 2023, 'title' => 'Group Photo - Intra-KUET 2023'],
            ['contest_name' => 'National Collegiate Programming Contest', 'year' => 2022, 'title' => 'Team Photo - NCPC 2022'],
            ['contest_name' => 'BUET Inter-University Programming Contest', 'year' => 2022, 'title' => 'Team Photo - BUET IUPC 2022'],
            ['contest_name' => 'RUET CSE Fest', 'year' => 2022, 'title' => 'Team Photo - RUET CSE Fest 2022'],
            ['contest_name' => 'SUST SWE Carnival', 'year' => 2021, 'title' => 'Team Photo - SUST SWE 2021'],
            ['contest_name' => 'IUT ICT Fest', 'year' => 2021, 'title' => 'Team Photo - IUT ICT Fest 2021'],
            ['contest_name' => 'ICPC Preliminary', 'year' => 2021, 'title' => 'Team Photo - ICPC Preliminary 2021'],
            ['contest_name' => 'DIU Take-Off Programming Contest', 'year' => 2020, 'title' => 'Team Photo - DIU Take-Off 2020'],
            ['contest_name' => 'JU CSE Carnival', 'year' => 2020, 'title' => 'Team Photo - JU CSE Carnival 2020'],
            ['contest_name' => 'SGIPC Annual Programming Fest', 'year' => 2021, 'title' => 'Group Photo - SGIPC Fest 2021'],
        ];

        foreach ($entries as $e) {
            TeamGallery::updateOrCreate(
                ['title' => $e['title']],
                [
                    'description' => 'SGIPC contingent at '.$e['contest_name'].' ('.$e['year'].').',
                    'image_url' => 'https://placehold.co/800x600?text=Team+Gallery',
                    'contest_name' => $e['contest_name'],
                    'year' => $e['year'],
                    'is_published' => true,
                    'created_by' => $admin?->id,
                ]
            );
        }
    }
}
