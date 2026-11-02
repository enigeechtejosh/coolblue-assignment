import type { PetReader } from "@/domains/pets/application/ports/PetReader";
import type { Pet } from "@/domains/pets/domain/models/Pet";

export class ListPets {
    constructor(private readonly repository: PetReader) {}

    execute(signal?: AbortSignal): Promise<readonly Pet[]> {
        return this.repository.findAll(signal);
    }
}
