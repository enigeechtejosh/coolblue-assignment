<?php

declare(strict_types=1);

namespace App\Pets\Infrastructure\Images;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\UploadedFile;
use Intervention\Image\Exceptions\RuntimeException as ImageRuntimeException;
use Intervention\Image\ImageManager;
use League\Flysystem\FilesystemException;
use RuntimeException;

final readonly class PetImageStorage
{
    public function __construct(
        private Filesystem $disk,
        private string $directory,
        private ImageManager $images,
    ) {}

    public function store(string $petId, UploadedFile $image): string
    {
        $path = $this->path($petId);

        try {
            $contents = (string) $this->images
                ->read($image)
                ->scaleDown(width: 640, height: 853)
                ->toWebp(quality: 82, strip: true);
            $this->disk->put($path, $contents);
        } catch (FilesystemException|ImageRuntimeException $error) {
            throw new RuntimeException('Pet image could not be written', previous: $error);
        }

        return "/api/pet-images/{$petId}/photo.webp";
    }

    public function exists(string $petId): bool
    {
        try {
            return $this->disk->exists($this->path($petId));
        } catch (FilesystemException $error) {
            throw new RuntimeException('Pet image could not be checked', previous: $error);
        }
    }

    public function import(string $petId, string $source): void
    {
        $contents = file_get_contents($source);
        if ($contents === false) {
            throw new RuntimeException('Pet seed image could not be read');
        }

        try {
            $this->disk->put($this->path($petId), $contents);
        } catch (FilesystemException $error) {
            throw new RuntimeException('Pet seed image could not be written', previous: $error);
        }

    }

    public function contents(string $petId): string
    {
        try {
            $contents = $this->disk->get($this->path($petId));
        } catch (FilesystemException $error) {
            throw new RuntimeException('Pet image could not be read', previous: $error);
        }

        if ($contents === null) {
            throw new RuntimeException('Pet image could not be read');
        }

        return $contents;
    }

    public function delete(string $petId): void
    {
        try {
            $this->disk->delete($this->path($petId));
        } catch (FilesystemException $error) {
            throw new RuntimeException('Pet image could not be deleted', previous: $error);
        }
    }

    private function path(string $petId): string
    {
        return trim($this->directory, '/').'/'.strtolower($petId).'.webp';
    }
}
