<?php

declare(strict_types=1);

namespace App\Domain\Pets;

interface PetRepository
{
    public function findAll(): array;

    public function findById(string $id): ?Pet;

    public function save(Pet $pet): void;

    public function delete(string $id): void;
}
