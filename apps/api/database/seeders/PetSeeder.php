<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Pets\PetRepository;
use App\Infrastructure\Factories\PetRecordFactory;
use Illuminate\Database\Seeder;
use RuntimeException;

final class PetSeeder extends Seeder
{
    public function __construct(
        private readonly PetRepository $pets,
        private readonly PetRecordFactory $petFactory,
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

            if ($this->pets->findById($pet->id) === null) {
                $this->pets->save($pet);
            }
        }
    }
}
