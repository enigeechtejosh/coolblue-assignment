export interface PetDeleter {
    delete(petId: string, signal?: AbortSignal): Promise<void>;
}
