<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->ok(SiteSetting::orderBy('key')->get(['key', 'value', 'type']));
    }

    public function bulkUpsert(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings' => ['required', 'array', 'min:1'],
            'settings.*.key' => ['required', 'string', 'max:100'],
            'settings.*.value' => ['nullable', 'string'],
            'settings.*.type' => ['nullable', 'in:text,image,json'],
        ]);

        $userId = $request->user()->id;

        DB::transaction(function () use ($data, $userId) {
            foreach ($data['settings'] as $row) {
                SiteSetting::updateOrCreate(
                    ['key' => $row['key']],
                    [
                        'value' => $row['value'] ?? null,
                        'type' => $row['type'] ?? 'text',
                        'updated_by' => $userId,
                    ]
                );
            }
        });

        return $this->ok(null, 'Settings saved.');
    }
}
