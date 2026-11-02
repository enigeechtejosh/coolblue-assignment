<?php

declare(strict_types=1);

namespace App\Application\Pets;

use App\Domain\Pets\Pet;
use App\Domain\Pets\PetRepository;

final readonly class GetPet
{
    public function __construct(private PetRepository $repository) {}

    public function execute(string $id): Pet
    {
        $pet = $this->repository->findById($id);

        if ($pet === null) {
            throw new PetNotFoundException($id);
        }

        return $pet;
    }
}
