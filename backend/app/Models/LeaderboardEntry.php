<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaderboardEntry extends Model
{
    protected $fillable = [
        'user_id', 'name', 'batch', 'cf_handle', 'rating', 'max_rating',
        'wins', 'contests_participated', 'year', 'profile_photo_url',
        'rank_position', 'is_published', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'max_rating' => 'integer',
            'wins' => 'integer',
            'contests_participated' => 'integer',
            'year' => 'integer',
            'rank_position' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
