<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Blog>
 */
class BlogFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->sentence(6);
        $content = fake()->paragraphs(4, true);

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1000, 99999),
            'content' => $content,
            'excerpt' => Str::limit(strip_tags($content), 150),
            'cover_image_url' => 'https://placehold.co/1200x630?text=Blog',
            'status' => 'approved',
            'is_published' => true,
            'views_count' => fake()->numberBetween(10, 500),
        ];
    }
}
