import type { PetDraft } from "@/domains/pets/application/inputs/PetDraft";
import type { PetDeleter } from "@/domains/pets/application/ports/PetDeleter";
import type { PetReader } from "@/domains/pets/application/ports/PetReader";
import type { PetSaver } from "@/domains/pets/application/ports/PetSaver";
import type { Pet } from "@/domains/pets/domain/models/Pet";
import {
    petListSchema,
    petSchema,
} from "@/domains/pets/infrastructure/http/petSchema";
import { apiRoutes } from "@/domains/pets/infrastructure/http/routes";

export class HttpPetRepository implements PetReader, PetSaver, PetDeleter {
    constructor(private readonly endpoint: string = apiRoutes.pets.list) {}

    async findAll(signal?: AbortSignal): Promise<readonly Pet[]> {
        const response = await fetch(this.endpoint, { signal });

        if (!response.ok) {
            throw new Error("Pets could not be loaded. Please try again.");
        }

        return petListSchema.parse(await response.json());
    }

    async save(draft: PetDraft, signal?: AbortSignal): Promise<Pet> {
        const body = new FormData();
        body.set("name", draft.name);
        body.set("species", draft.species);
        body.set("available", draft.available ? "1" : "0");
        body.set("birthYear", String(draft.birthYear));
        if (draft.image) {
            body.set("image", draft.image, draft.image.name);
        }
        if (draft.petId) {
            body.set("_method", "PUT");
        }

        const response = await fetch(
            draft.petId
                ? apiRoutes.pets.update(draft.petId)
                : apiRoutes.pets.create,
            { method: "POST", body, signal },
        );

        if (!response.ok) {
            throw new Error(
                draft.petId
                    ? "The pet could not be updated. Please try again."
                    : "The pet could not be added. Please try again.",
            );
        }

        return petSchema.parse(await response.json());
    }

    async delete(petId: string, signal?: AbortSignal): Promise<void> {
        const response = await fetch(apiRoutes.pets.remove(petId), {
            method: "DELETE",
            signal,
        });

        if (!response.ok) {
            throw new Error("The pet could not be removed. Please try again.");
        }
    }
}
