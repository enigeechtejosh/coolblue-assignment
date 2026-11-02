<?php

namespace Tests\Feature\Pets;

use App\Pets\Infrastructure\Factories\PetRecordFactory;
use App\Pets\Infrastructure\Persistence\JsonPetRepository;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use RuntimeException;
use Tests\Fixtures\PetDataset;
use Tests\TestCase;

class JsonPetRepositoryTest extends TestCase
{
    private FilesystemAdapter $disk;

    private JsonPetRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();

        $this->disk = Storage::fake('pets', ['throw' => true]);
        $this->repository = new JsonPetRepository(
            disk: $this->disk,
            path: 'pets.json',
            petFactory: $this->app->make(PetRecordFactory::class),
        );
    }

    public function test_it_reads_and_finds_pets_on_the_disk(): void
    {
        $this->disk->put('pets.json', PetDataset::json());
        $repository = $this->repository;
        $this->assertCount(20, $repository->findAll());
        $this->assertSame('Daamin', $repository->findById(PetDataset::firstId())?->name);
        $this->assertNull($repository->findById(PetDataset::MISSING_ID));
        $this->disk->put('pets.json', '[]');
        $this->assertSame([], $repository->findAll());
    }

    public function test_it_accepts_a_valid_leap_day_and_false_availability(): void
    {
        $dataset = json_decode(PetDataset::json(), true);
        $pet = array_replace($dataset[0], ['dateAdded' => '29-02-2024', 'available' => false]);
        $this->disk->put('pets.json', json_encode([$pet], JSON_THROW_ON_ERROR));

        $storedPet = $this->repository->findById($pet['id']);

        $this->assertNotNull($storedPet);
        $this->assertSame('29-02-2024', $storedPet->dateAdded);
        $this->assertFalse($storedPet->available);
    }

    public function test_it_rejects_a_missing_file(): void
    {
        $this->disk->delete('pets.json');
        $this->expectException(RuntimeException::class);
        $this->repository->findAll();
    }

    public function test_it_handles_a_disk_with_read_exceptions_disabled(): void
    {
        $disk = Storage::fake('quiet', ['throw' => false]);
        $repository = new JsonPetRepository(
            disk: $disk,
            path: 'missing.json',
            petFactory: $this->app->make(PetRecordFactory::class),
        );

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Pet data file could not be read');

        $repository->findAll();
    }

    #[DataProvider('invalidRecords')]
    public function test_it_rejects_invalid_records(mixed $record): void
    {
        $this->disk->put('pets.json', json_encode([$record], JSON_THROW_ON_ERROR));

        $this->expectException(RuntimeException::class);

        $this->repository->findAll();
    }

    public static function invalidRecords(): array
    {
        $dataset = json_decode(PetDataset::json(), true);
        $validPet = $dataset[0];

        return [
            'missing fields' => [['id' => $validPet['id']]],
            'a scalar instead of an object' => ['not a pet'],
            'a UUID without hyphens' => [array_replace($validPet, ['id' => str_replace('-', '', $validPet['id'])])],
            'a numeric ID' => [array_replace($validPet, ['id' => 1])],
            'a numeric string ID' => [array_replace($validPet, ['id' => '1'])],
            'a negative ID' => [array_replace($validPet, ['id' => -1])],
            'a UUID with the wrong version' => [array_replace($validPet, ['id' => '00000000-0000-7000-8000-000000000000'])],
            'an empty name' => [array_replace($validPet, ['name' => ' '])],
            'a missing species' => [array_replace($validPet, ['species' => null])],
            'an integer instead of a boolean' => [array_replace($validPet, ['available' => 1])],
            'a numeric string instead of a boolean' => [array_replace($validPet, ['available' => '0'])],
            'a string instead of a boolean' => [array_replace($validPet, ['available' => 'Yes'])],
            'a string instead of a birth year' => [array_replace($validPet, ['birthYear' => '2012'])],
            'an impossible calendar date' => [array_replace($validPet, ['dateAdded' => '31-02-2024'])],
            'an invalid date format' => [array_replace($validPet, ['dateAdded' => '2021-06-19'])],
            'an invalid photo URL' => [array_replace($validPet, ['photoUrl' => 'https://'])],
            'an unsupported photo protocol' => [array_replace($validPet, ['photoUrl' => 'ftp://example.com/pet.jpg'])],
        ];
    }

    public function test_it_rejects_duplicate_ids(): void
    {
        $data = json_decode(PetDataset::json(), true);
        $this->disk->put('pets.json', json_encode([$data[0], $data[0]], JSON_THROW_ON_ERROR));
        $this->expectExceptionMessage('duplicate IDs');
        $this->repository->findAll();
    }

    public function test_it_rejects_an_object_instead_of_a_list(): void
    {
        $this->disk->put('pets.json', '{}');
        $this->expectException(RuntimeException::class);
        $this->repository->findAll();
    }

    public function test_it_rejects_malformed_json(): void
    {
        $this->disk->put('pets.json', '{');
        $this->expectException(\JsonException::class);
        $this->repository->findAll();
    }

    public function test_it_normalizes_stored_and_lookup_uuids(): void
    {
        $pets = json_decode(PetDataset::json(), true);
        $id = $pets[0]['id'];
        $uppercasePet = array_replace($pets[0], ['id' => strtoupper($id)]);
        $this->disk->put('pets.json', json_encode([$uppercasePet], JSON_THROW_ON_ERROR));

        $storedPet = $this->repository->findById(strtoupper($id));

        $this->assertNotNull($storedPet);
        $this->assertSame($id, $storedPet->id);
    }

    public function test_it_rejects_duplicate_uuids_with_different_casing(): void
    {
        $pets = json_decode(PetDataset::json(), true);
        $uppercasePet = array_replace($pets[0], ['id' => strtoupper($pets[0]['id'])]);
        $this->disk->put('pets.json', json_encode([$pets[0], $uppercasePet], JSON_THROW_ON_ERROR));

        $this->expectExceptionMessage('duplicate IDs');

        $this->repository->findAll();
    }
}
