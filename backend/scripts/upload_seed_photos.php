<?php

use App\Models\Event;
use App\Models\TeamGallery;

$publicDir = base_path('public/seed-photos');
$files = collect(glob($publicDir . '/*.{jpg,jpeg,png}', GLOB_BRACE))
    ->map(fn ($p) => basename($p))
    ->sort()
    ->values();

if ($files->isEmpty()) {
    fwrite(STDERR, "no photos in $publicDir\n");
    return;
}

$base = rtrim(config('app.url'), '/');
$urls = $files->map(fn ($name) => $base . '/seed-photos/' . rawurlencode($name))->all();
echo 'photos: ' . count($urls) . PHP_EOL;

$events = Event::orderBy('id')->get();
foreach ($events as $i => $e) {
    $e->image_url = $urls[$i % count($urls)];
    $e->save();
}
echo 'events updated: ' . $events->count() . PHP_EOL;

$gallery = TeamGallery::orderBy('id')->get();
foreach ($gallery as $i => $g) {
    $g->image_url = $urls[$i % count($urls)];
    $g->save();
}
echo 'gallery updated: ' . $gallery->count() . PHP_EOL;
