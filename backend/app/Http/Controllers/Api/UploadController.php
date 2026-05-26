<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class UploadController extends Controller
{
    use ApiResponse;

    public function image(Request $request, CloudinaryService $cloudinary): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,jpg,png,webp,gif', 'max:5120'],
            'folder' => ['nullable', 'string', 'max:50'],
        ]);

        try {
            $folder = $request->input('folder', 'sgipc');
            $allowedFolders = ['sgipc', 'sgipc/events', 'sgipc/contests', 'sgipc/achievements', 'sgipc/gallery', 'sgipc/blogs', 'sgipc/profiles'];
            if (! in_array($folder, $allowedFolders, true)) {
                $folder = 'sgipc';
            }

            $result = $cloudinary->upload($request->file('image'), $folder);

            return $this->ok($result, 'Uploaded.');
        } catch (Throwable $e) {
            return $this->fail('Upload failed: '.$e->getMessage(), ['code' => 'upload_failed'], 500);
        }
    }
}
