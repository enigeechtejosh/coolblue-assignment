<?php

namespace Tests\Unit\Pets;

use App\Pets\Application\Exceptions\PetNotFoundException;
use App\Pets\Application\UseCases\GetPet;
use App\Pets\Domain\Models\Pet;
use App\Pets\Domain\Repositories\PetRepository;
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
