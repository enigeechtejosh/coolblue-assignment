<?php

declare(strict_types=1);

namespace App\Pets\Presentation\Http\Resources;

use App\Pets\Domain\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use LogicException;

final class PetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $pet = $this->resource;

        if (! $pet instanceof Pet) {
            throw new LogicException('PetResource requires a Pet instance');
        }

        return [
            'id' => $pet->id,
            'name' => $pet->name,
            'species' => $pet->species,
            'available' => $pet->available,
            'birthYear' => $pet->birthYear,
            'dateAdded' => $pet->dateAdded,
            'photoUrl' => $pet->photoUrl,
        ];
    }
}
