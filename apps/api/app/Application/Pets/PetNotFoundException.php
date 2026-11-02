<?php

declare(strict_types=1);

namespace App\Application\Pets;

use RuntimeException;

final class PetNotFoundException extends RuntimeException
{
    public function __construct(string $id)
    {
        parent::__construct("Pet {$id} was not found");
    }
}
