<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $rows = SiteSetting::all(['key', 'value', 'type']);
        $map = [];
        foreach ($rows as $row) {
            $map[$row->key] = $row->type === 'json' ? json_decode($row->value, true) : $row->value;
        }

        return $this->ok($map);
    }
}
