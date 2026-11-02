<?php

declare(strict_types=1);

namespace App\Application\Pets;

use App\Domain\Pets\PetRepository;

final readonly class ListPets
{
    public function __construct(private PetRepository $repository) {}

    public function execute(): array
    {
        return $this->repository->findAll();
    }
}
