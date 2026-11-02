<?php

declare(strict_types=1);

namespace App\Application\Pets;

use App\Domain\Pets\Pet;
use App\Domain\Pets\PetRepository;

final readonly class UpdatePet
{
    public function __construct(private PetRepository $repository) {}

    public function execute(
        string $id,
        string $name,
        string $species,
        bool $available,
        int $birthYear,
        ?string $photoUrl,
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
            photoUrl: $photoUrl ?? $existing->photoUrl,
        );
        $this->repository->save($pet);

        return $pet;
    }
}
