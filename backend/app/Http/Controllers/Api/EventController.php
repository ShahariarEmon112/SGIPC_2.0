<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Event::published()->orderByDesc('event_date');

        if ($year = $request->query('year')) {
            $query->whereYear('event_date', (int) $year);
        }

        return $this->ok($query->get());
    }

    public function show(Event $event): JsonResponse
    {
        if (! $event->is_published) {
            return $this->fail('Event not found.', null, 404);
        }

        return $this->ok($event);
    }
}
