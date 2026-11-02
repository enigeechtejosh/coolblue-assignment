<?php

declare(strict_types=1);

namespace App\Pets\Presentation\Http\Controllers;

use App\Pets\Application\UseCases\CreatePet;
use App\Pets\Application\UseCases\DeletePet;
use App\Pets\Application\UseCases\GetPet;
use App\Pets\Application\UseCases\ListPets;
use App\Pets\Application\UseCases\UpdatePet;
use App\Pets\Infrastructure\Images\PetImageStorage;
use App\Pets\Presentation\Http\Requests\ShowPetRequest;
use App\Pets\Presentation\Http\Requests\StorePetRequest;
use App\Pets\Presentation\Http\Requests\UpdatePetRequest;
use App\Pets\Presentation\Http\Resources\PetResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Uid\Uuid;
use Throwable;

final class PetController
{
    public function index(ListPets $listPets): AnonymousResourceCollection
    {
        return PetResource::collection($listPets->execute());
    }

    public function show(ShowPetRequest $request, GetPet $getPet): PetResource
    {
        $pet = $getPet->execute($request->petId());

        return new PetResource($pet);
    }

    public function store(
        StorePetRequest $request,
        PetImageStorage $images,
        CreatePet $createPet,
    ): JsonResponse {
        $id = Uuid::v4()->toRfc4122();
        $images->store($id, $request->uploadedImage());
        try {
            $pet = $createPet->execute(
                id: $id,
                name: $request->string('name')->trim()->toString(),
                species: $request->string('species')->trim()->toString(),
                available: $request->boolean('available'),
                birthYear: $request->integer('birthYear'),
            );
        } catch (Throwable $error) {
            $images->delete($id);
            throw $error;
        }

        return (new PetResource($pet))->response()->setStatusCode(201);
    }

    public function update(
        UpdatePetRequest $request,
        PetImageStorage $images,
        GetPet $getPet,
        UpdatePet $updatePet,
    ): PetResource {
        $getPet->execute($request->petId());
        $image = $request->uploadedImage();
        if ($image !== null) {
            $images->store($request->petId(), $image);
        }
        $pet = $updatePet->execute(
            id: $request->petId(),
            name: $request->string('name')->trim()->toString(),
            species: $request->string('species')->trim()->toString(),
            available: $request->boolean('available'),
            birthYear: $request->integer('birthYear'),
        );

        return new PetResource($pet);
    }

    public function destroy(
        ShowPetRequest $request,
        DeletePet $deletePet,
        PetImageStorage $images,
    ): Response {
        $pet = $deletePet->execute($request->petId());
        $images->delete($pet->id);

        return response()->noContent();
    }

    public function image(ShowPetRequest $request, PetImageStorage $images): Response
    {
        abort_unless($images->exists($request->petId()), 404);
        $contents = $images->contents($request->petId());
        $response = response($contents, 200, [
            'Content-Type' => 'image/webp',
            'Cache-Control' => 'public, no-cache',
        ])->setEtag(hash('sha256', $contents));
        $response->isNotModified($request);

        return $response;
    }
}
