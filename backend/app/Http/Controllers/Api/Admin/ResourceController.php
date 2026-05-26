<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Resource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResourceController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->ok(Resource::orderBy('category')->orderBy('order_index')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['created_by'] = $request->user()->id;
        $resource = Resource::create($data);

        return $this->ok($resource, 'Resource added.', 201);
    }

    public function update(Resource $resource, Request $request): JsonResponse
    {
        $resource->update($this->validated($request));

        return $this->ok($resource->fresh(), 'Resource updated.');
    }

    public function destroy(Resource $resource): JsonResponse
    {
        $resource->delete();

        return $this->ok(null, 'Resource removed.');
    }

    public function togglePublish(Resource $resource): JsonResponse
    {
        $resource->is_published = ! $resource->is_published;
        $resource->save();

        return $this->ok($resource, $resource->is_published ? 'Published.' : 'Hidden.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'url' => ['required', 'url', 'max:500'],
            'category' => ['required', 'in:algorithms,data_structures,practice,tutorial,course'],
            'difficulty' => ['nullable', 'in:beginner,intermediate,advanced'],
            'order_index' => ['nullable', 'integer'],
            'is_published' => ['boolean'],
        ]);
    }
}
