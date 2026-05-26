<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use RuntimeException;

class CloudinaryService
{
    private Cloudinary $client;

    public function __construct()
    {
        $url = env('CLOUDINARY_URL');
        if (! $url) {
            throw new RuntimeException('CLOUDINARY_URL is not configured.');
        }
        $this->client = new Cloudinary($url);
    }

    public function upload(UploadedFile $file, string $folder = 'sgipc'): array
    {
        $result = $this->client->uploadApi()->upload($file->getRealPath(), [
            'folder' => $folder,
            'resource_type' => 'image',
        ]);

        return [
            'url' => $result['secure_url'] ?? $result['url'],
            'public_id' => $result['public_id'],
            'width' => $result['width'] ?? null,
            'height' => $result['height'] ?? null,
            'format' => $result['format'] ?? null,
            'bytes' => $result['bytes'] ?? null,
        ];
    }

    public function destroy(string $publicId): bool
    {
        $result = $this->client->uploadApi()->destroy($publicId);

        return ($result['result'] ?? '') === 'ok';
    }
}
