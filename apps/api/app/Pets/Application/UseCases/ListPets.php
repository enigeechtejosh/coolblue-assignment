<?php

declare(strict_types=1);

namespace App\Pets\Application\UseCases;

use App\Pets\Domain\Repositories\PetRepository;

final readonly class ListPets
{
    public function __construct(private PetRepository $repository) {}

    public function execute(): array
    {
        return $this->repository->findAll();
    }
}
