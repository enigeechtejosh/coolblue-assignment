import { DeletePet } from "@/domains/pets/application/use-cases/DeletePet";
import { ListPets } from "@/domains/pets/application/use-cases/ListPets";
import { SavePet } from "@/domains/pets/application/use-cases/SavePet";
import { HttpPetRepository } from "@/domains/pets/infrastructure/http/HttpPetRepository";

export function createAppServices() {
    const petRepository = new HttpPetRepository();

    return {
        listPets: new ListPets(petRepository),
        deletePet: new DeletePet(petRepository),
        savePet: new SavePet(petRepository),
    };
}
