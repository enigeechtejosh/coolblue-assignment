<?php

declare(strict_types=1);

namespace App\Pets\Infrastructure\Persistence;

use App\Pets\Domain\Models\Pet;
use App\Pets\Domain\Repositories\PetRepository;
use App\Pets\Infrastructure\Factories\PetRecordFactory;
use Illuminate\Database\ConnectionInterface;
use stdClass;

final readonly class DatabasePetRepository implements PetRepository
{
    public function __construct(
        private ConnectionInterface $database,
        private PetRecordFactory $petFactory,
    ) {}

    public function findAll(): array
    {
        return $this->database
            ->table('pets')
            ->orderBy('sequence')
            ->get()
            ->map(fn (stdClass $record): Pet => $this->fromDatabaseRecord($record))
            ->all();
    }

    public function findById(string $id): ?Pet
    {
        $record = $this->database
            ->table('pets')
            ->where('id', strtolower($id))
            ->first();

        return $record instanceof stdClass ? $this->fromDatabaseRecord($record) : null;
    }

    public function save(Pet $pet): void
    {
        $record = [
            'name' => $pet->name,
            'species' => $pet->species,
            'available' => $pet->available,
            'birth_year' => $pet->birthYear,
            'date_added' => $pet->dateAdded,
        ];

        $updated = $this->database
            ->table('pets')
            ->where('id', $pet->id)
            ->update($record);

        if ($updated === 0 && ! $this->database->table('pets')->where('id', $pet->id)->exists()) {
            $this->database->table('pets')->insert(['id' => $pet->id, ...$record]);
        }
    }

    public function delete(string $id): void
    {
        $this->database->table('pets')->where('id', strtolower($id))->delete();
    }

    private function fromDatabaseRecord(stdClass $record): Pet
    {
        return $this->petFactory->fromRecord((object) [
            'id' => $record->id,
            'name' => $record->name,
            'species' => $record->species,
            'available' => (bool) $record->available,
            'birthYear' => $record->birth_year,
            'dateAdded' => $record->date_added,
        ]);
    }
}
