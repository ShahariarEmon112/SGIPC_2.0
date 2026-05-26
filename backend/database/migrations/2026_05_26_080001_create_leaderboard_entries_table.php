<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leaderboard_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('batch')->nullable();
            $table->string('cf_handle')->nullable();
            $table->unsignedInteger('rating')->default(0);
            $table->unsignedInteger('max_rating')->default(0);
            $table->unsignedInteger('wins')->default(0);
            $table->unsignedInteger('contests_participated')->default(0);
            $table->unsignedSmallInteger('year');
            $table->string('profile_photo_url')->nullable();
            $table->unsignedSmallInteger('rank_position')->nullable();
            $table->boolean('is_published')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['year', 'is_published']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leaderboard_entries');
    }
};
