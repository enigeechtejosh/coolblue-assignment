import type { Pet } from "@/domains/pets/domain/models/Pet";

export interface PetReader {
    findAll(signal?: AbortSignal): Promise<readonly Pet[]>;
}
