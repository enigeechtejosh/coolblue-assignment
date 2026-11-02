<?php

declare(strict_types=1);

namespace App\Pets\Application\UseCases;

use App\Pets\Domain\Models\Pet;
use App\Pets\Domain\Repositories\PetRepository;
use Carbon\CarbonImmutable;

final readonly class CreatePet
{
    public function __construct(private PetRepository $repository) {}

    public function execute(
        string $id,
        string $name,
        string $species,
        bool $available,
        int $birthYear,
        string $photoUrl,
    ): Pet {
        $pet = new Pet(
            id: strtolower($id),
            name: $name,
            species: $species,
            available: $available,
            birthYear: $birthYear,
            dateAdded: CarbonImmutable::now()->format('d-m-Y'),
            photoUrl: $photoUrl,
        );
        $this->repository->save($pet);

        return $pet;
    }
}
