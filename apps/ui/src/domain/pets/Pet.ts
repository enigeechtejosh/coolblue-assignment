export interface Pet {
    readonly id: string;
    readonly name: string;
    readonly species: string;
    readonly available: boolean;
    readonly birthYear: number;
    readonly dateAdded: string;
    readonly photoUrl: string;
}
