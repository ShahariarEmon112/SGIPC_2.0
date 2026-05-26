<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('url');
            $table->enum('category', ['algorithms', 'data_structures', 'practice', 'tutorial', 'course']);
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced'])->nullable();
            $table->integer('order_index')->default(0);
            $table->boolean('is_published')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['category', 'is_published', 'order_index']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resources');
    }
};
