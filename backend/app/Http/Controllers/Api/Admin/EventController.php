<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->ok(Event::orderByDesc('event_date')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['created_by'] = $request->user()->id;
        $event = Event::create($data);

        return $this->ok($event, 'Event created.', 201);
    }

    public function update(Event $event, Request $request): JsonResponse
    {
        $event->update($this->validated($request));

        return $this->ok($event->fresh(), 'Event updated.');
    }

    public function destroy(Event $event): JsonResponse
    {
        $event->delete();

        return $this->ok(null, 'Event deleted.');
    }

    public function togglePublish(Event $event): JsonResponse
    {
        $event->is_published = ! $event->is_published;
        $event->save();

        return $this->ok($event, $event->is_published ? 'Event published.' : 'Event unpublished.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['required', 'string'],
            'event_date' => ['required', 'date'],
            'location' => ['nullable', 'string', 'max:200'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'is_published' => ['boolean'],
        ]);
    }
}
