export interface PetRemover {
    remove(petId: string, signal?: AbortSignal): Promise<void>;
}
