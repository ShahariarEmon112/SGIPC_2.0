<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@sgipc.kuet.ac.bd'],
            [
                'name' => 'SGIPC Admin',
                'password' => Hash::make('admin123456'),
                'student_id' => '2001001',
                'batch' => '20',
                'department' => 'CSE',
                'role' => 'admin',
                'status' => 'approved',
                'email_verified_at' => now(),
            ]
        );
    }
}
