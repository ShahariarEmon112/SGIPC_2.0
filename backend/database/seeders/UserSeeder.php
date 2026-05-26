<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    private array $names = [
        'Arif Hossain', 'Nusrat Jahan', 'Mehedi Hassan', 'Tasnim Akter', 'Sabbir Ahmed',
        'Rakibul Islam', 'Mahmuda Khatun', 'Fahim Reza', 'Sumaiya Sultana', 'Imran Khan',
        'Tahmid Rahman', 'Jannatul Ferdous', 'Shahriar Kabir', 'Anika Tabassum', 'Naimur Rashid',
        'Sadia Afrin', 'Tanvir Mahmud', 'Ridwanul Haque', 'Mahmudul Hasan', 'Farhana Akhter',
    ];

    public function run(): void
    {
        $password = Hash::make('password123');
        $batches = ['19', '20', '21', '22'];
        $idCounter = 1900100;
        $usedIds = [];

        // 15 approved + verified
        for ($i = 0; $i < 15; $i++) {
            $batch = $batches[$i % 4];
            $studentId = $this->nextId($batch, $usedIds);
            User::updateOrCreate(
                ['email' => $studentId.'@student.kuet.ac.bd'],
                [
                    'name' => $this->names[$i],
                    'password' => $password,
                    'student_id' => $studentId,
                    'batch' => $batch,
                    'department' => 'CSE',
                    'role' => 'client',
                    'status' => 'approved',
                    'email_verified_at' => now()->subDays(rand(7, 365)),
                ]
            );
        }

        // 3 pending + verified
        for ($i = 15; $i < 18; $i++) {
            $batch = '22';
            $studentId = $this->nextId($batch, $usedIds);
            User::updateOrCreate(
                ['email' => $studentId.'@student.kuet.ac.bd'],
                [
                    'name' => $this->names[$i],
                    'password' => $password,
                    'student_id' => $studentId,
                    'batch' => $batch,
                    'department' => 'CSE',
                    'role' => 'client',
                    'status' => 'pending',
                    'email_verified_at' => now()->subDays(rand(1, 5)),
                ]
            );
        }

        // 2 pending + unverified
        for ($i = 18; $i < 20; $i++) {
            $batch = '22';
            $studentId = $this->nextId($batch, $usedIds);
            User::updateOrCreate(
                ['email' => $studentId.'@student.kuet.ac.bd'],
                [
                    'name' => $this->names[$i],
                    'password' => $password,
                    'student_id' => $studentId,
                    'batch' => $batch,
                    'department' => 'CSE',
                    'role' => 'client',
                    'status' => 'pending',
                    'email_verified_at' => null,
                    'email_verification_token' => bin2hex(random_bytes(32)),
                ]
            );
        }
    }

    private function nextId(string $batch, array &$used): string
    {
        do {
            $id = $batch.str_pad((string) rand(1000, 9999), 5, '0', STR_PAD_LEFT);
        } while (in_array($id, $used, true) || $id === '2001001');
        $used[] = $id;

        return $id;
    }
}
