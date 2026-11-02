import { useEffect, useState } from "react";

import type { ListPets } from "@/domains/pets/application/use-cases/ListPets";
import type { Pet } from "@/domains/pets/domain/models/Pet";

type PetsState =
    | { status: "loading" }
    | { status: "success"; pets: readonly Pet[] }
    | { status: "error"; message: string };

export function usePets(listPets: ListPets, refreshToken = 0) {
    const [state, setState] = useState<PetsState>({ status: "loading" });
    const [reloadCount, setReloadCount] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadPets() {
            setState({ status: "loading" });

            try {
                const pets = await listPets.execute(controller.signal);

                if (controller.signal.aborted) {
                    return;
                }

                setState({ status: "success", pets });
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : "Pets could not be loaded.";
                setState({ status: "error", message });
            }
        }

        void loadPets();

        return () => controller.abort();
    }, [listPets, reloadCount, refreshToken]);

    function retry() {
        setReloadCount((count) => count + 1);
    }

    return { state, retry };
}
