<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'hero_title', 'value' => 'SGIPC Club of KUET'],
            ['key' => 'hero_subtitle', 'value' => 'Where contest programmers knot ties together'],
            ['key' => 'hero_cta_primary', 'value' => 'Join Now'],
            ['key' => 'hero_cta_secondary', 'value' => 'Learn More'],
            ['key' => 'about_title', 'value' => 'About SGIPC'],
            ['key' => 'about_content', 'value' => '<p>The Special Group Interested in Programming Contest (SGIPC) is the official competitive programming club of Khulna University of Engineering &amp; Technology (KUET). Founded with the vision of nurturing problem-solvers, SGIPC brings together students who share a passion for algorithms, data structures, and the thrill of competitive coding.</p><p>We host weekly contests on Codeforces and VJudge, run beginner-friendly bootcamps each semester, and represent KUET at national and international programming events including ACM-ICPC, NCPC, and inter-university tournaments.</p><p>Whether you are writing your first <code>for</code> loop or grinding to reach Master on Codeforces, SGIPC is the community that helps you climb.</p>'],
            ['key' => 'club_motto', 'value' => 'Code. Compete. Conquer.'],
            ['key' => 'club_mission', 'value' => 'To build a vibrant community of competitive programmers at KUET by providing consistent training, peer mentorship, and contest opportunities — turning curious beginners into confident problem-solvers ready to compete at the regional, national, and international level.'],
            ['key' => 'club_vision', 'value' => 'To establish SGIPC as a top programming club in South Asia, with regular ICPC World Finals representation and a culture where every CSE undergraduate at KUET has the support, resources, and motivation to grow as a problem-solver.'],
            ['key' => 'stat_members', 'value' => '120'],
            ['key' => 'stat_events', 'value' => '35'],
            ['key' => 'stat_achievements', 'value' => '48'],
            ['key' => 'stat_since', 'value' => '2015'],
            ['key' => 'footer_description', 'value' => 'The official competitive programming club of KUET CSE. Code. Compete. Conquer.'],
            ['key' => 'footer_email', 'value' => 'sgipc@kuet.ac.bd'],
            ['key' => 'footer_facebook', 'value' => 'https://facebook.com/sgipc.kuet'],
            ['key' => 'footer_github', 'value' => 'https://github.com/sgipc-kuet'],
        ];

        foreach ($settings as $row) {
            SiteSetting::updateOrCreate(
                ['key' => $row['key']],
                ['value' => $row['value'], 'type' => 'text']
            );
        }
    }
}
