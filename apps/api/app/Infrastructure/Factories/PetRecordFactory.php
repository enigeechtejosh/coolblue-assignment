<?php

declare(strict_types=1);

namespace App\Infrastructure\Factories;

use App\Domain\Pets\Pet;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use RuntimeException;
use stdClass;
use Symfony\Component\Uid\UuidV4;

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
            'photoUrl' => ['bail', 'required', 'string', function (string $attribute, mixed $value, \Closure $fail): void {
                $scheme = is_string($value) ? parse_url($value, PHP_URL_SCHEME) : null;
                $remoteUrl = filter_var($value, FILTER_VALIDATE_URL) !== false
                    && in_array($scheme, ['http', 'https'], true);
                $localUrl = is_string($value)
                    && str_starts_with($value, '/api/pet-images/')
                    && str_ends_with($value, '/photo.webp')
                    && UuidV4::isValid(substr($value, 16, -11));

                if (! $remoteUrl && ! $localUrl) {
                    $fail("The {$attribute} field must be a valid URL.");
                }
            }],
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
            photoUrl: $fields['photoUrl'],
        );
    }
}
