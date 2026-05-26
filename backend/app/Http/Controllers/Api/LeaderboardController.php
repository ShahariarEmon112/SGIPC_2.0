<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\LeaderboardEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $year = (int) $request->query('year', (int) date('Y'));

        $entries = LeaderboardEntry::published()
            ->where('year', $year)
            ->orderBy('rank_position')
            ->orderByDesc('rating')
            ->get();

        $years = LeaderboardEntry::published()
            ->select('year')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year');

        return $this->ok([
            'year' => $year,
            'years' => $years,
            'entries' => $entries,
        ]);
    }
}
