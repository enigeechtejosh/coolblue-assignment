<?php

namespace Tests\Fixtures;

use RuntimeException;

final class PetDataset
{
    public const string MISSING_ID = '00000000-0000-4000-8000-000000000000';

    public static function firstId(): string
    {
        return self::records()[0]['id'];
    }

    public static function records(): array
    {
        $pets = json_decode(self::json(), true, flags: JSON_THROW_ON_ERROR);

        return array_map(static function (array $pet): array {
            $pet['photoUrl'] = "/api/pet-images/{$pet['id']}/photo.webp";

            return $pet;
        }, $pets);
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
