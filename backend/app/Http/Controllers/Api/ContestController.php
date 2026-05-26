<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Contest;
use Illuminate\Http\JsonResponse;

class ContestController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $contests = Contest::published()->orderBy('contest_date', 'desc')->get();

        return $this->ok([
            'upcoming' => $contests->where('contest_date', '>=', now())->sortBy('contest_date')->values(),
            'past' => $contests->where('contest_date', '<', now())->values(),
        ]);
    }

    public function show(Contest $contest): JsonResponse
    {
        if (! $contest->is_published) {
            return $this->fail('Contest not found.', null, 404);
        }

        return $this->ok($contest);
    }
}
