export interface PetDraft {
    readonly petId?: string;
    readonly name: string;
    readonly species: string;
    readonly available: boolean;
    readonly birthYear: number;
    readonly image?: File;
}
