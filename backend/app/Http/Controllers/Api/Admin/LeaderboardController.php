<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\LeaderboardEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->ok(
            LeaderboardEntry::orderByDesc('year')->orderBy('rank_position')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['created_by'] = $request->user()->id;
        $entry = LeaderboardEntry::create($data);

        return $this->ok($entry, 'Leaderboard entry created.', 201);
    }

    public function update(LeaderboardEntry $entry, Request $request): JsonResponse
    {
        $entry->update($this->validated($request));

        return $this->ok($entry->fresh(), 'Entry updated.');
    }

    public function destroy(LeaderboardEntry $entry): JsonResponse
    {
        $entry->delete();

        return $this->ok(null, 'Entry removed.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'batch' => ['nullable', 'string', 'max:10'],
            'cf_handle' => ['nullable', 'string', 'max:50'],
            'rating' => ['required', 'integer', 'min:0', 'max:5000'],
            'max_rating' => ['nullable', 'integer', 'min:0', 'max:5000'],
            'wins' => ['nullable', 'integer', 'min:0'],
            'contests_participated' => ['nullable', 'integer', 'min:0'],
            'year' => ['required', 'integer', 'min:1990', 'max:2100'],
            'profile_photo_url' => ['nullable', 'string', 'max:500'],
            'rank_position' => ['nullable', 'integer', 'min:1'],
            'is_published' => ['boolean'],
        ]);
    }
}
