<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\TeamGallery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->ok(TeamGallery::orderByDesc('year')->orderByDesc('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.title' => ['required', 'string', 'max:200'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.image_url' => ['required', 'string', 'max:500'],
            'items.*.contest_name' => ['nullable', 'string', 'max:200'],
            'items.*.year' => ['nullable', 'integer', 'min:1990', 'max:2100'],
            'items.*.is_published' => ['boolean'],
        ]);

        $userId = $request->user()->id;
        $created = collect($data['items'])->map(function ($row) use ($userId) {
            return TeamGallery::create(array_merge($row, [
                'created_by' => $userId,
                'is_published' => $row['is_published'] ?? true,
            ]));
        });

        return $this->ok($created, "{$created->count()} item(s) added.", 201);
    }

    public function destroy(TeamGallery $gallery): JsonResponse
    {
        $gallery->delete();

        return $this->ok(null, 'Gallery item removed.');
    }

    public function togglePublish(TeamGallery $gallery): JsonResponse
    {
        $gallery->is_published = ! $gallery->is_published;
        $gallery->save();

        return $this->ok($gallery, $gallery->is_published ? 'Published.' : 'Unpublished.');
    }
}
