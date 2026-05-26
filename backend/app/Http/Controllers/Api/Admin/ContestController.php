<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Contest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContestController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->ok(Contest::orderByDesc('contest_date')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['created_by'] = $request->user()->id;
        $contest = Contest::create($data);

        return $this->ok($contest, 'Contest created.', 201);
    }

    public function update(Contest $contest, Request $request): JsonResponse
    {
        $contest->update($this->validated($request));

        return $this->ok($contest->fresh(), 'Contest updated.');
    }

    public function destroy(Contest $contest): JsonResponse
    {
        $contest->delete();

        return $this->ok(null, 'Contest deleted.');
    }

    public function togglePublish(Contest $contest): JsonResponse
    {
        $contest->is_published = ! $contest->is_published;
        $contest->save();

        return $this->ok($contest, $contest->is_published ? 'Contest published.' : 'Contest unpublished.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['required', 'string'],
            'contest_date' => ['required', 'date'],
            'platform' => ['nullable', 'string', 'max:100'],
            'registration_link' => ['nullable', 'url', 'max:500'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'is_published' => ['boolean'],
        ]);
    }
}
