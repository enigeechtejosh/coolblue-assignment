import type { Pet } from "@/domain/pets/Pet";
import type { PetDraft } from "@/domain/pets/PetDraft";

export interface PetWriter {
    save(draft: PetDraft, signal?: AbortSignal): Promise<Pet>;
}
