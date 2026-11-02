<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Application\Pets\CreatePet;
use App\Application\Pets\DeletePet;
use App\Application\Pets\GetPet;
use App\Application\Pets\ListPets;
use App\Application\Pets\UpdatePet;
use App\Http\Requests\ShowPetRequest;
use App\Http\Requests\StorePetRequest;
use App\Http\Requests\UpdatePetRequest;
use App\Http\Resources\PetResource;
use App\Infrastructure\Images\PetImageStorage;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Uid\Uuid;

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
        $photoUrl = $images->store($id, $request->uploadedImage());
        $pet = $createPet->execute(
            id: $id,
            name: $request->string('name')->trim()->toString(),
            species: $request->string('species')->trim()->toString(),
            available: $request->boolean('available'),
            birthYear: $request->integer('birthYear'),
            photoUrl: $photoUrl,
        );

        return (new PetResource($pet))->response()->setStatusCode(201);
    }

    public function update(
        UpdatePetRequest $request,
        PetImageStorage $images,
        UpdatePet $updatePet,
    ): PetResource {
        $image = $request->uploadedImage();
        $photoUrl = $image === null ? null : $images->store($request->petId(), $image);
        $pet = $updatePet->execute(
            id: $request->petId(),
            name: $request->string('name')->trim()->toString(),
            species: $request->string('species')->trim()->toString(),
            available: $request->boolean('available'),
            birthYear: $request->integer('birthYear'),
            photoUrl: $photoUrl,
        );

        return new PetResource($pet);
    }

    public function destroy(
        ShowPetRequest $request,
        DeletePet $deletePet,
        PetImageStorage $images,
    ): Response {
        $pet = $deletePet->execute($request->petId());
        if (str_starts_with($pet->photoUrl, '/api/pet-images/')) {
            $images->delete($pet->id);
        }

        return response()->noContent();
    }

    public function image(ShowPetRequest $request, PetImageStorage $images): Response
    {
        return response($images->contents($request->petId()), 200, [
            'Content-Type' => 'image/webp',
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }
}
