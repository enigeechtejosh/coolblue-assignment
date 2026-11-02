<?php

declare(strict_types=1);

namespace App\Pets\Application\UseCases;

use App\Pets\Application\Exceptions\PetNotFoundException;
use App\Pets\Domain\Models\Pet;
use App\Pets\Domain\Repositories\PetRepository;

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
