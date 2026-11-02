import type { PetDeleter } from "@/domains/pets/application/ports/PetDeleter";

export class DeletePet {
    constructor(private readonly deleter: PetDeleter) {}

    execute(petId: string, signal?: AbortSignal): Promise<void> {
        return this.deleter.delete(petId, signal);
    }
}
