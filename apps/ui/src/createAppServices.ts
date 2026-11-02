import { ListPets } from "@/application/pets/ListPets";
import { RemovePet } from "@/application/pets/RemovePet";
import { SavePet } from "@/application/pets/SavePet";
import { HttpPetRepository } from "@/infrastructure/pets/HttpPetRepository";

export function createAppServices() {
    const petRepository = new HttpPetRepository();

    return {
        listPets: new ListPets(petRepository),
        removePet: new RemovePet(petRepository),
        savePet: new SavePet(petRepository),
    };
}
