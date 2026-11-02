<?php

namespace Tests\Unit;

use App\Application\Pets\GetPet;
use App\Application\Pets\PetNotFoundException;
use App\Domain\Pets\Pet;
use App\Domain\Pets\PetRepository;
use PHPUnit\Framework\TestCase;
use Tests\Fixtures\PetDataset;

class GetPetTest extends TestCase
{
    public function test_it_reports_missing_pets_without_http_or_storage_dependencies(): void
    {
        $repository = new class implements PetRepository
        {
            public function findAll(): array
            {
                return [];
            }

            public function findById(string $id): ?Pet
            {
                return null;
            }

            public function save(Pet $pet): void {}

            public function delete(string $id): void {}
        };
        $this->expectException(PetNotFoundException::class);
        (new GetPet($repository))->execute(PetDataset::MISSING_ID);
    }
}
