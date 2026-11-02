import type { Pet } from "@/domain/pets/Pet";
import type { PetDraft } from "@/domain/pets/PetDraft";
import type { PetWriter } from "@/domain/pets/PetWriter";

export class SavePet {
    constructor(private readonly writer: PetWriter) {}

    execute(draft: PetDraft, signal?: AbortSignal): Promise<Pet> {
        return this.writer.save(draft, signal);
    }
}
