<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Achievement>
 */
class AchievementFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'description' => fake()->sentence(),
            'contest_name' => 'ACM-ICPC Asia Regional',
            'position' => fake()->randomElement(['1st', '2nd', '3rd', 'Honorable Mention']),
            'year' => fake()->numberBetween(2020, 2024),
            'image_url' => 'https://placehold.co/800x450?text=Achievement',
            'members' => [],
            'is_published' => true,
        ];
    }
}
