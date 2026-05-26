<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->paragraphs(2, true),
            'event_date' => fake()->dateTimeBetween('-4 years', '-1 month'),
            'location' => fake()->randomElement(['KUET CSE Lab', 'KUET Auditorium', 'Online (Codeforces)']),
            'image_url' => 'https://placehold.co/800x450?text=Event',
            'is_published' => true,
        ];
    }
}
