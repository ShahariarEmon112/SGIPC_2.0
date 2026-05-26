<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Contest>
 */
class ContestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->paragraphs(2, true),
            'contest_date' => fake()->dateTimeBetween('-1 year', '+3 months'),
            'platform' => fake()->randomElement(['Codeforces', 'VJudge', 'Custom Judge']),
            'registration_link' => 'https://codeforces.com/group/sgipc/contest/'.fake()->numberBetween(1000, 9999),
            'image_url' => 'https://placehold.co/800x450?text=Contest',
            'is_published' => true,
        ];
    }
}
