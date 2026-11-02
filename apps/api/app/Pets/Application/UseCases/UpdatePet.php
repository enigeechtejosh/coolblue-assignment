<?php

declare(strict_types=1);

namespace App\Pets\Application\UseCases;

use App\Pets\Application\Exceptions\PetNotFoundException;
use App\Pets\Domain\Models\Pet;
use App\Pets\Domain\Repositories\PetRepository;

final readonly class UpdatePet
{
    public function __construct(private PetRepository $repository) {}

    public function execute(
        string $id,
        string $name,
        string $species,
        bool $available,
        int $birthYear,
    ): Pet {
        $existing = $this->repository->findById($id);
        if ($existing === null) {
            throw new PetNotFoundException($id);
        }

        $pet = new Pet(
            id: $existing->id,
            name: $name,
            species: $species,
            available: $available,
            birthYear: $birthYear,
            dateAdded: $existing->dateAdded,
        );
        $this->repository->save($pet);

        return $pet;
    }
}
