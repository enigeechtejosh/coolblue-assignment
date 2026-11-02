<?php

namespace Tests\Feature\Pets;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Tests\Fixtures\PetDataset;
use Tests\TestCase;

class PetsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['pets.image_disk' => 'pets']);
        Storage::fake('pets', ['throw' => true]);
        $this->seed();
    }

    public function test_it_lists_the_real_dataset(): void
    {
        $pets = PetDataset::records();

        $this->getJson('/api/pets')->assertOk()->assertExactJson($pets);
    }

    public function test_it_returns_a_single_pet(): void
    {
        $pets = PetDataset::records();

        $this->getJson('/api/pets/'.$pets[0]['id'])->assertOk()->assertExactJson($pets[0]);
    }

    public function test_seeded_photos_are_served_from_image_storage(): void
    {
        $pet = PetDataset::records()[0];
        Storage::disk('pets')->delete('pet-images/'.$pet['id'].'.webp');
        $this->get($pet['photoUrl'])->assertNotFound();

        $this->seed();

        $this->get($pet['photoUrl'])
            ->assertOk()
            ->assertHeader('Content-Type', 'image/webp')
            ->assertHeader('Cache-Control', 'no-cache, public');
    }

    public function test_it_creates_a_pet_with_a_webp_image(): void
    {
        $response = $this->post('/api/pets', [
            'name' => 'Nova',
            'species' => 'Cat',
            'available' => '1',
            'birthYear' => '2020',
            'image' => $this->webp('nova.webp'),
        ]);

        $response->assertCreated()
            ->assertJsonPath('name', 'Nova')
            ->assertJsonPath('photoUrl', fn (string $url): bool => str_ends_with($url, '/photo.webp'));
        $id = $response->json('id');
        $this->assertIsString($id);
        Storage::disk('pets')->assertExists("pet-images/{$id}.webp");
        $this->get("/api/pet-images/{$id}/photo.webp")
            ->assertOk()
            ->assertHeader('Content-Type', 'image/webp');
        $this->getJson('/api/pets')->assertJsonFragment(['id' => $id, 'name' => 'Nova']);
    }

    public function test_it_normalizes_a_jpeg_upload_to_webp(): void
    {
        $response = $this->post('/api/pets', [
            'name' => 'Pixel',
            'species' => 'Dog',
            'available' => '1',
            'birthYear' => '2021',
            'image' => UploadedFile::fake()->image('pixel.jpg', 2000, 1200),
        ])->assertCreated();

        $id = $response->json('id');
        $this->assertIsString($id);
        $contents = Storage::disk('pets')->get("pet-images/{$id}.webp");
        if ($contents === null) {
            self::fail('Normalized pet image was not stored');
        }
        $details = getimagesizefromstring($contents);

        $this->assertIsArray($details);
        $this->assertSame('image/webp', $details['mime']);
        $this->assertLessThanOrEqual(640, $details[0]);
        $this->assertLessThanOrEqual(853, $details[1]);
    }

    public function test_it_updates_a_pet_and_keeps_its_date_and_photo_without_a_replacement(): void
    {
        $pets = PetDataset::records();
        $pet = $pets[0];

        $response = $this->put('/api/pets/'.$pet['id'], [
            'name' => 'Daamin updated',
            'species' => $pet['species'],
            'available' => '1',
            'birthYear' => (string) $pet['birthYear'],
        ]);

        $response->assertOk()
            ->assertJsonPath('name', 'Daamin updated')
            ->assertJsonPath('available', true)
            ->assertJsonPath('dateAdded', $pet['dateAdded'])
            ->assertJsonPath('photoUrl', $pet['photoUrl']);
        $this->getJson('/api/pets/'.$pet['id'])->assertJsonPath('name', 'Daamin updated');
    }

    public function test_it_rejects_invalid_image_uploads(): void
    {
        $this->post('/api/pets', [
            'name' => 'Nova',
            'species' => 'Cat',
            'available' => '1',
            'birthYear' => '2020',
            'image' => UploadedFile::fake()->createWithContent('pet.jpg', 'not an image'),
        ])->assertUnprocessable();
    }

    public function test_it_reports_a_missing_pet(): void
    {
        $id = PetDataset::MISSING_ID;

        $this->getJson('/api/pets/'.$id)->assertNotFound()->assertExactJson([
            'error' => ['code' => 'PET_NOT_FOUND', 'message' => "Pet {$id} was not found"],
        ]);
    }

    #[DataProvider('invalidIds')]
    public function test_it_rejects_invalid_ids(string $id): void
    {
        $this->getJson('/api/pets/'.$id)->assertBadRequest()->assertExactJson([
            'error' => ['code' => 'INVALID_PET_ID', 'message' => 'Pet ID must be a valid UUIDv4'],
        ]);
    }

    public static function invalidIds(): array
    {
        return [
            'letters' => ['abc'],
            'legacy numeric ID' => ['1'],
            'zero' => ['0'],
            'negative number' => ['-1'],
            'UUID without hyphens' => ['00000000000040008000000000000000'],
            'invalid hexadecimal character' => ['00000000-0000-4000-8000-00000000000g'],
            'wrong UUID version' => ['00000000-0000-7000-8000-000000000000'],
            'invalid UUID variant' => ['00000000-0000-4000-0000-000000000000'],
            'nil UUID' => ['00000000-0000-0000-0000-000000000000'],
        ];
    }

    public function test_invalid_stored_fields_return_a_server_error(): void
    {
        $pets = PetDataset::records();
        DB::table('pets')->where('id', $pets[0]['id'])->update(['date_added' => 'invalid']);

        $this->getJson('/api/pets')->assertStatus(500)->assertExactJson([
            'error' => ['code' => 'INTERNAL_SERVER_ERROR', 'message' => 'An unexpected error occurred'],
        ]);
    }

    public function test_unknown_routes_return_json_without_an_accept_header(): void
    {
        $this->get('/api/missing')->assertNotFound()->assertJsonPath('error.code', 'NOT_FOUND');
    }

    public function test_query_parameters_cannot_override_the_route_id(): void
    {
        $id = PetDataset::firstId();
        $otherId = PetDataset::MISSING_ID;

        $this->getJson('/api/pets/'.$id.'?id='.$otherId)->assertOk()->assertJsonPath('id', $id);
        $this->getJson('/api/pets/abc?id='.$id)->assertBadRequest()->assertJsonPath('error.code', 'INVALID_PET_ID');
    }

    public function test_it_accepts_uppercase_uuids(): void
    {
        $id = PetDataset::firstId();

        $this->getJson('/api/pets/'.strtoupper($id))->assertOk()->assertJsonPath('id', $id);
    }

    public function test_an_empty_listing_is_not_wrapped(): void
    {
        DB::table('pets')->delete();

        $this->getJson('/api/pets')->assertOk()->assertContent('[]');
    }

    public function test_method_errors_preserve_the_allow_header(): void
    {
        $this->deleteJson('/api/pets')->assertStatus(405)->assertHeader('Allow', 'GET, HEAD, POST')
            ->assertExactJson(['error' => ['code' => 'HTTP_ERROR', 'message' => 'Request could not be processed']]);
    }

    public function test_http_errors_preserve_the_retry_after_header(): void
    {
        Route::get('/api/test-rate-limit',
            function (): never {
                throw new TooManyRequestsHttpException(60, 'Internal rate limiter details');
            },
        );

        $this->getJson('/api/test-rate-limit')->assertStatus(429)->assertHeader('Retry-After', '60')
            ->assertExactJson(['error' => ['code' => 'HTTP_ERROR', 'message' => 'Request could not be processed']]);
    }

    public function test_uuid_ids_remain_stable_between_listing_and_detail_requests(): void
    {
        $id = $this->getJson('/api/pets')->assertOk()->json('0.id');

        $this->assertIsString($id);
        $this->getJson('/api/pets/'.$id)->assertOk()->assertJsonPath('id', $id);
        $this->getJson('/api/pets')->assertOk()->assertJsonPath('0.id', $id);
    }

    private function webp(string $name): UploadedFile
    {
        $contents = base64_decode(
            'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
            true,
        );
        if ($contents === false) {
            throw new \RuntimeException('Test WebP fixture could not be decoded');
        }

        return UploadedFile::fake()->createWithContent(
            $name,
            $contents,
        );
    }
}
