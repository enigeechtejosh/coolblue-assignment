<?php

namespace Tests\Fixtures;

use RuntimeException;

final class PetDataset
{
    public const string MISSING_ID = '00000000-0000-4000-8000-000000000000';

    public static function firstId(): string
    {
        $pets = json_decode(self::json(), true, flags: JSON_THROW_ON_ERROR);

        return $pets[0]['id'];
    }

    public static function json(): string
    {
        $contents = file_get_contents(__DIR__.'/../../database/seeders/data/pets.json');

        if ($contents === false) {
            throw new RuntimeException('The pet test dataset could not be read');
        }

        return $contents;
    }
}
