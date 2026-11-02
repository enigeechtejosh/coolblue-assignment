<?php

declare(strict_types=1);

namespace App\Pets\Domain\Repositories;

use App\Pets\Domain\Models\Pet;

interface PetRepository
{
    public function findAll(): array;

    public function findById(string $id): ?Pet;

    public function save(Pet $pet): void;

    public function delete(string $id): void;
}
