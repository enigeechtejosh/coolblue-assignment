import type { Pet } from "@/domain/pets/Pet";

export interface PetRepository {
    findAll(signal?: AbortSignal): Promise<readonly Pet[]>;
}
