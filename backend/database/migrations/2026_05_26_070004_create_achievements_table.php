<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('contest_name');
            $table->string('position');
            $table->unsignedSmallInteger('year');
            $table->string('image_url')->nullable();
            $table->json('members')->nullable();
            $table->boolean('is_published')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['is_published', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('achievements');
    }
};
