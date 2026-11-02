<?php

declare(strict_types=1);

namespace App\Pets\Domain\Models;

final readonly class Pet
{
    public function __construct(
        public string $id,
        public string $name,
        public string $species,
        public bool $available,
        public int $birthYear,
        public string $dateAdded,
        public string $photoUrl,
    ) {}

}
