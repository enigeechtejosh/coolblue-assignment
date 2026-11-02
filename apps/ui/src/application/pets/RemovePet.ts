import type { PetRemover } from "@/domain/pets/PetRemover";

export class RemovePet {
    constructor(private readonly remover: PetRemover) {}

    execute(petId: string, signal?: AbortSignal): Promise<void> {
        return this.remover.remove(petId, signal);
    }
}
