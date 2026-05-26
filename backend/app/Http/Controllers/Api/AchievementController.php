<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Achievement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Achievement::published()->orderByDesc('year')->orderByRaw("FIELD(position, '1st','2nd','3rd','Honorable Mention')");

        if ($year = $request->query('year')) {
            $query->where('year', (int) $year);
        }

        return $this->ok($query->get());
    }
}
