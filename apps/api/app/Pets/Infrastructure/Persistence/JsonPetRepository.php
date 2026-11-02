<?php

declare(strict_types=1);

namespace App\Pets\Infrastructure\Persistence;

use App\Pets\Domain\Models\Pet;
use App\Pets\Domain\Repositories\PetRepository;
use App\Pets\Infrastructure\Factories\PetRecordFactory;
use Illuminate\Contracts\Filesystem\Filesystem;
use League\Flysystem\FilesystemException;
use RuntimeException;

final readonly class JsonPetRepository implements PetRepository
{
    public function __construct(
        private Filesystem $disk,
        private string $path,
        private PetRecordFactory $petFactory,
    ) {}

    public function findAll(): array
    {
        $records = $this->readRecords();
        $petsById = [];

        foreach ($records as $record) {
            $pet = $this->petFactory->fromRecord($record);

            if (isset($petsById[$pet->id])) {
                throw new RuntimeException('Pet data contains duplicate IDs');
            }

            $petsById[$pet->id] = $pet;
        }

        return array_values($petsById);
    }

    public function findById(string $id): ?Pet
    {
        $id = strtolower($id);

        foreach ($this->findAll() as $pet) {
            if ($pet->id === $id) {
                return $pet;
            }
        }

        return null;
    }

    public function save(Pet $pet): void
    {
        $pets = $this->findAll();
        $saved = false;

        foreach ($pets as $index => $storedPet) {
            if ($storedPet->id === $pet->id) {
                $pets[$index] = $pet;
                $saved = true;
                break;
            }
        }

        if (! $saved) {
            $pets[] = $pet;
        }

        $records = array_map(
            fn (Pet $storedPet): array => [
                'id' => $storedPet->id,
                'name' => $storedPet->name,
                'species' => $storedPet->species,
                'available' => $storedPet->available,
                'birthYear' => $storedPet->birthYear,
                'dateAdded' => $storedPet->dateAdded,
                'photoUrl' => $storedPet->photoUrl,
            ],
            $pets,
        );

        try {
            $this->disk->put(
                $this->path,
                json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)."\n",
            );
        } catch (FilesystemException $error) {
            throw new RuntimeException('Pet data file could not be written', previous: $error);
        }
    }

    public function delete(string $id): void
    {
        $pets = array_values(array_filter(
            $this->findAll(),
            fn (Pet $pet): bool => $pet->id !== strtolower($id),
        ));
        $records = array_map(
            fn (Pet $pet): array => [
                'id' => $pet->id,
                'name' => $pet->name,
                'species' => $pet->species,
                'available' => $pet->available,
                'birthYear' => $pet->birthYear,
                'dateAdded' => $pet->dateAdded,
                'photoUrl' => $pet->photoUrl,
            ],
            $pets,
        );

        try {
            $this->disk->put(
                $this->path,
                json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)."\n",
            );
        } catch (FilesystemException $error) {
            throw new RuntimeException('Pet data file could not be written', previous: $error);
        }
    }

    private function readRecords(): array
    {
        try {
            $contents = $this->disk->get($this->path);
        } catch (FilesystemException $error) {
            throw new RuntimeException('Pet data file could not be read', previous: $error);
        }

        if ($contents === null) {
            throw new RuntimeException('Pet data file could not be read');
        }

        $records = json_decode($contents, flags: JSON_THROW_ON_ERROR);

        if (! is_array($records) || ! array_is_list($records)) {
            throw new RuntimeException('Pet data must be a list');
        }

        return $records;
    }
}
