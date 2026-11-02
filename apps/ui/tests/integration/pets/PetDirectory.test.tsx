import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { App } from "@/app/App";
import { createAppServices } from "@/app/createAppServices";
import { ListPets } from "@/domains/pets/application/use-cases/ListPets";
import { SavePet } from "@/domains/pets/application/use-cases/SavePet";

import { pets } from "../../fixtures/pets";

function createPetsResponse(data = pets) {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

describe("Pet directory", () => {
    it("shows a loading state while the request is pending", () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => new Promise(() => {})),
        );
        render(<App listPets={createAppServices().listPets} />);
        expect(screen.getByRole("status")).toHaveTextContent("Loading pets");
        expect(screen.queryByRole("article")).not.toBeInTheDocument();
    });

    it("loads pets from the API and displays availability", async () => {
        const fetchPets = vi.fn().mockResolvedValue(createPetsResponse());
        vi.stubGlobal("fetch", fetchPets);
        render(<App listPets={createAppServices().listPets} />);
        expect(
            await screen.findByRole("heading", { name: "Daamin" }),
        ).toBeInTheDocument();
        expect(
            within(screen.getByRole("article", { name: "Daamin" })).getByText(
                "Available",
            ),
        ).toBeInTheDocument();
        expect(screen.getByRole("img", { name: "Daamin" })).toHaveAttribute(
            "src",
            pets[0].photoUrl,
        );
    });

    it("shows an empty state", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(createPetsResponse([])),
        );
        render(<App listPets={createAppServices().listPets} />);
        expect(
            await screen.findByText("No pets have been added yet."),
        ).toBeInTheDocument();
    });

    it("shows an error state", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(new Response("{}", { status: 500 })),
        );
        render(<App listPets={createAppServices().listPets} />);
        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Pets could not be loaded",
        );
    });

    it("filters pets by search and availability", async () => {
        const directoryPets = [
            ...pets,
            {
                ...pets[0],
                id: "another-pet",
                name: "Milo",
                species: "Dog",
                available: false,
            },
        ];
        render(
            <App
                listPets={new ListPets({ findAll: async () => directoryPets })}
            />,
        );
        await screen.findByRole("heading", { name: "Daamin" });

        fireEvent.change(screen.getByRole("searchbox"), {
            target: { value: "  DOG  " },
        });
        expect(
            screen.queryByRole("article", { name: "Daamin" }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole("article", { name: "Milo" }),
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Available" }));
        expect(screen.getByText("No matching pets")).toBeInTheDocument();
    });

    it("loads the API photo URL and shows a stable fallback if an image fails", async () => {
        render(<App listPets={new ListPets({ findAll: async () => pets })} />);
        const image = await screen.findByRole("img", { name: pets[0].name });
        expect(image).toHaveAttribute("src", pets[0].photoUrl);
        fireEvent.error(image);
        expect(
            screen.getByRole("img", {
                name: `${pets[0].name}: photo unavailable`,
            }),
        ).toBeInTheDocument();
    });

    it("opens the add-pet sheet from the topbar and saves the form", async () => {
        const save = vi.fn().mockResolvedValue({ ...pets[0], name: "Nova" });
        render(
            <App
                listPets={new ListPets({ findAll: async () => pets })}
                savePet={new SavePet({ save })}
            />,
        );
        await screen.findByRole("heading", { name: "Daamin" });

        fireEvent.click(screen.getByRole("button", { name: "Add pet" }));
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        fireEvent.change(screen.getByLabelText("Name"), {
            target: { value: "Nova" },
        });
        fireEvent.change(screen.getByLabelText("Species"), {
            target: { value: "Cat" },
        });
        const image = new File(["image"], "nova.jpg", { type: "image/jpeg" });
        fireEvent.change(screen.getByLabelText("Choose photo"), {
            target: { files: [image] },
        });
        fireEvent.click(screen.getByRole("button", { name: "Add pet" }));

        expect(save).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "Nova",
                species: "Cat",
                image,
            }),
            undefined,
        );
    });

    it("opens a populated edit sheet when a pet card is clicked", async () => {
        render(
            <App
                listPets={new ListPets({ findAll: async () => pets })}
                savePet={new SavePet({ save: vi.fn() })}
            />,
        );
        await screen.findByRole("heading", { name: "Daamin" });

        fireEvent.click(screen.getByRole("button", { name: "Edit Daamin" }));

        expect(
            screen.getByRole("heading", { name: "Edit Daamin" }),
        ).toBeInTheDocument();
        expect(screen.getByLabelText("Name")).toHaveValue("Daamin");
        expect(screen.getByLabelText("Species")).toHaveValue("Cat");
        expect(screen.getByAltText("Pet preview")).toHaveAttribute(
            "src",
            pets[0].photoUrl,
        );
    });
});
