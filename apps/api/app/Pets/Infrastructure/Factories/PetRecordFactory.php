<?php

declare(strict_types=1);

namespace App\Pets\Infrastructure\Factories;

use App\Pets\Domain\Models\Pet;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use RuntimeException;
use stdClass;

final readonly class PetRecordFactory
{
    public function __construct(private ValidationFactory $validator) {}

    public function fromRecord(mixed $record): Pet
    {
        if (! $record instanceof stdClass) {
            throw new RuntimeException('Pet data has an invalid structure');
        }

        $validation = $this->validator->make((array) $record, [
            'id' => ['bail', 'required', 'string', 'size:36', 'uuid:4'],
            'name' => ['required', 'string'],
            'species' => ['required', 'string'],
            'available' => ['required', 'boolean:strict'],
            'birthYear' => ['bail', 'required', 'integer:strict', 'min:1'],
            'dateAdded' => ['bail', 'required', 'string', 'date_format:d-m-Y'],
        ]);

        if ($validation->fails()) {
            throw new RuntimeException('Pet data has an invalid structure');
        }

        $fields = $validation->validated();

        return new Pet(
            id: strtolower($fields['id']),
            name: $fields['name'],
            species: $fields['species'],
            available: $fields['available'],
            birthYear: $fields['birthYear'],
            dateAdded: $fields['dateAdded'],
        );
    }
}
