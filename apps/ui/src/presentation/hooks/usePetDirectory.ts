import { useState } from "react";

import type { ListPets } from "@/application/pets/ListPets";
import { usePets } from "@/presentation/hooks/usePets";

type Species = "all" | "Cat" | "Dog";

type Availability = "all" | "available" | "unavailable";

export function usePetDirectory(listPets: ListPets, refreshToken = 0) {
    const { state } = usePets(listPets, refreshToken);
    const [species, setSpecies] = useState<Species>("all");
    const [search, setSearch] = useState("");
    const [availability, setAvailability] = useState<Availability>("all");
    const query = search.trim().toLocaleLowerCase();
    const pets = state.status === "success" ? state.pets : [];
    const visiblePets = pets.filter(
        (pet) =>
            (species === "all" || pet.species === species) &&
            (!query ||
                `${pet.name} ${pet.species}`
                    .toLocaleLowerCase()
                    .includes(query)) &&
            (availability === "all" ||
                pet.available === (availability === "available")),
    );

    function resetFilters() {
        setSpecies("all");
        setSearch("");
        setAvailability("all");
    }

    return {
        species,
        setSpecies,
        state,
        search,
        setSearch,
        availability,
        setAvailability,
        visiblePets,
        resetFilters,
    };
}
