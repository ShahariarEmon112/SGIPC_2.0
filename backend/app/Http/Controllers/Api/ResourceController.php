<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Resource;
use Illuminate\Http\JsonResponse;

class ResourceController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $rows = Resource::published()
            ->orderBy('category')
            ->orderBy('order_index')
            ->get();

        $byCategory = $rows->groupBy('category');

        return $this->ok([
            'categories' => $byCategory,
            'total' => $rows->count(),
        ]);
    }
}
