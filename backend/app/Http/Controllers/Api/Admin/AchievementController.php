<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Achievement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->ok(Achievement::orderByDesc('year')->orderByDesc('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['created_by'] = $request->user()->id;
        $achievement = Achievement::create($data);

        return $this->ok($achievement, 'Achievement created.', 201);
    }

    public function update(Achievement $achievement, Request $request): JsonResponse
    {
        $achievement->update($this->validated($request));

        return $this->ok($achievement->fresh(), 'Achievement updated.');
    }

    public function destroy(Achievement $achievement): JsonResponse
    {
        $achievement->delete();

        return $this->ok(null, 'Achievement deleted.');
    }

    public function togglePublish(Achievement $achievement): JsonResponse
    {
        $achievement->is_published = ! $achievement->is_published;
        $achievement->save();

        return $this->ok($achievement, $achievement->is_published ? 'Achievement published.' : 'Achievement unpublished.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'contest_name' => ['required', 'string', 'max:200'],
            'position' => ['required', 'string', 'max:50'],
            'year' => ['required', 'integer', 'min:1990', 'max:2100'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'members' => ['nullable', 'array'],
            'members.*' => ['string', 'max:100'],
            'is_published' => ['boolean'],
        ]);
    }
}
