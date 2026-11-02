<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Pets\Domain\Models\Pet;
use App\Pets\Domain\Repositories\PetRepository;
use App\Pets\Infrastructure\Factories\PetRecordFactory;
use App\Pets\Infrastructure\Images\PetImageStorage;
use Illuminate\Database\Seeder;
use RuntimeException;

final class PetSeeder extends Seeder
{
    public function __construct(
        private readonly PetRepository $pets,
        private readonly PetRecordFactory $petFactory,
        private readonly PetImageStorage $images,
    ) {}

    public function run(): void
    {
        $contents = file_get_contents(__DIR__.'/data/pets.json');
        if ($contents === false) {
            throw new RuntimeException('Pet seed data could not be read');
        }

        $records = json_decode($contents, flags: JSON_THROW_ON_ERROR);
        if (! is_array($records) || ! array_is_list($records)) {
            throw new RuntimeException('Pet seed data must be a list');
        }

        foreach ($records as $record) {
            $pet = $this->petFactory->fromRecord($record);
            $existing = $this->pets->findById($pet->id);

            if (! $this->images->exists($pet->id)) {
                $this->images->import($pet->id, __DIR__.'/data/images/'.$pet->id.'.webp');
            }

            $current = $existing ?? $pet;
            $this->pets->save(new Pet(
                id: $current->id,
                name: $current->name,
                species: $current->species,
                available: $current->available,
                birthYear: $current->birthYear,
                dateAdded: $current->dateAdded,
            ));
        }
    }
}
