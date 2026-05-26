<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\TeamGallery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = TeamGallery::query()->published()->orderByDesc('year')->orderByDesc('id');

        if ($year = $request->query('year')) {
            $query->where('year', (int) $year);
        }

        return $this->ok($query->get());
    }
}
