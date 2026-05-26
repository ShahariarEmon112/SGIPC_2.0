<?php

namespace Database\Seeders;

use App\Models\BlogComment;
use App\Models\CommentReport;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommentReportSeeder extends Seeder
{
    public function run(): void
    {
        $reportedComments = BlogComment::where('status', 'reported')->pluck('id')->all();
        $users = User::where('status', 'approved')->where('role', 'client')->pluck('id')->all();

        if (empty($reportedComments) || empty($users)) {
            return;
        }

        $reasons = ['Spam', 'Offensive language', 'Irrelevant content'];

        foreach ($reportedComments as $idx => $commentId) {
            CommentReport::create([
                'comment_id' => $commentId,
                'reported_by' => $users[array_rand($users)],
                'reason' => $reasons[$idx % count($reasons)],
                'status' => 'pending',
            ]);
        }
    }
}
