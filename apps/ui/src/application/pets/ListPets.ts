import type { Pet } from "@/domain/pets/Pet";
import type { PetRepository } from "@/domain/pets/PetRepository";

export class ListPets {
    constructor(private readonly repository: PetRepository) {}

    execute(signal?: AbortSignal): Promise<readonly Pet[]> {
        return this.repository.findAll(signal);
    }
}
