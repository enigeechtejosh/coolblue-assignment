import "@/shared/styles/styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "@/app/App";
import { createAppServices } from "@/app/createAppServices";

const services = createAppServices();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App
            listPets={services.listPets}
            savePet={services.savePet}
            deletePet={services.deletePet}
        />
    </StrictMode>,
);
