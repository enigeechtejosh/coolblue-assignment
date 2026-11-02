<?php

namespace App\Providers;

use App\Pets\Domain\Repositories\PetRepository;
use App\Pets\Infrastructure\Factories\PetRecordFactory;
use App\Pets\Infrastructure\Images\PetImageStorage;
use App\Pets\Infrastructure\Persistence\DatabasePetRepository;
use Illuminate\Contracts\Filesystem\Factory as FilesystemFactory;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Database\DatabaseManager;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;
use Intervention\Image\ImageManager;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(
            ImageManager::class,
            fn (): ImageManager => ImageManager::gd(
                autoOrientation: true,
                decodeAnimation: false,
                strip: true,
            ),
        );
        $this->app->bind(
            PetRepository::class,
            fn (Application $app) => new DatabasePetRepository(
                database: $app->make(DatabaseManager::class)->connection(),
                petFactory: $app->make(PetRecordFactory::class),
            ),
        );
        $this->app->bind(
            PetImageStorage::class,
            fn (Application $app) => new PetImageStorage(
                disk: $app->make(FilesystemFactory::class)->disk(config('pets.image_disk')),
                directory: config('pets.image_directory'),
                images: $app->make(ImageManager::class),
            ),
        );
    }

    public function boot(): void
    {
        JsonResource::withoutWrapping();
    }
}
