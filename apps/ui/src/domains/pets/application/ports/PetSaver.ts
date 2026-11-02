import type { PetDraft } from "@/domains/pets/application/inputs/PetDraft";
import type { Pet } from "@/domains/pets/domain/models/Pet";

export interface PetSaver {
    save(draft: PetDraft, signal?: AbortSignal): Promise<Pet>;
}
