import "@/presentation/styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { createAppServices } from "@/createAppServices";
import { App } from "@/presentation/App";

const services = createAppServices();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App
            listPets={services.listPets}
            savePet={services.savePet}
            removePet={services.removePet}
        />
    </StrictMode>,
);
