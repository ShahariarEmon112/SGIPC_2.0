<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            UserSeeder::class,
            SiteSettingSeeder::class,
            EventSeeder::class,
            ContestSeeder::class,
            AchievementSeeder::class,
            TeamGallerySeeder::class,
            BlogSeeder::class,
            BlogCommentSeeder::class,
            BlogLikeSeeder::class,
            CommentReportSeeder::class,
        ]);
    }
}
