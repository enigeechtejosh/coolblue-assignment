import type { PetDraft } from "@/domains/pets/application/inputs/PetDraft";
import type { PetSaver } from "@/domains/pets/application/ports/PetSaver";
import type { Pet } from "@/domains/pets/domain/models/Pet";

export class SavePet {
    constructor(private readonly saver: PetSaver) {}

    execute(draft: PetDraft, signal?: AbortSignal): Promise<Pet> {
        return this.saver.save(draft, signal);
    }
}
