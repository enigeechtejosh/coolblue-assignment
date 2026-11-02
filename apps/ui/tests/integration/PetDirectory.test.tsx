import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ListPets } from "@/application/pets/ListPets";
import { SavePet } from "@/application/pets/SavePet";
import { createAppServices } from "@/createAppServices";
import type { PetRepository } from "@/domain/pets/PetRepository";
import { App } from "@/presentation/App";
import photoManifest from "@/presentation/assets/pets/manifest.json";

import { pets } from "../fixtures";

function createPetsResponse(data = pets) {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

describe("Pet directory", () => {
    it("can use an injected repository without making HTTP requests", async () => {
        const repository: PetRepository = { findAll: async () => pets };
        const request = vi.fn();
        vi.stubGlobal("fetch", request);

        render(<App listPets={new ListPets(repository)} />);

        expect(
            await screen.findByRole("heading", { name: "Daamin" }),
        ).toBeInTheDocument();
        expect(request).not.toHaveBeenCalled();
    });

    it("shows a loading state while the request is pending", () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => new Promise(() => {})),
        );
        render(<App listPets={createAppServices().listPets} />);
        expect(screen.getByRole("status")).toHaveTextContent("Loading pets");
        expect(screen.queryByRole("article")).not.toBeInTheDocument();
        expect(
            screen.getByRole("searchbox", { name: "Search pets" }),
        ).toBeInTheDocument();
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
        expect(fetchPets).toHaveBeenCalledWith(
            "/api/pets",
            expect.objectContaining({ signal: expect.any(AbortSignal) }),
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

    it("shows an unsuccessful response without a retry control", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(new Response("{}", { status: 500 })),
        );
        render(<App listPets={createAppServices().listPets} />);
        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Pets could not be loaded",
        );
        expect(
            screen.queryByRole("button", { name: "Try again" }),
        ).not.toBeInTheDocument();
    });

    it("handles a network failure", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockRejectedValue(new Error("Network unavailable")),
        );
        render(<App listPets={createAppServices().listPets} />);
        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Network unavailable",
        );
    });

    it("combines case-insensitive search with availability and clears filters", async () => {
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
        const repository: PetRepository = {
            findAll: async () => directoryPets,
        };
        render(<App listPets={new ListPets(repository)} />);
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
        expect(screen.queryByText("1 of 2 pets")).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Available" }));
        expect(screen.getByText("No matching pets")).toBeInTheDocument();
        expect(screen.queryByText("No pets yet")).not.toBeInTheDocument();
        expect(screen.queryByRole("article")).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
        expect(screen.getAllByRole("article")).toHaveLength(2);
        expect(screen.getByRole("searchbox")).toHaveValue("");
        expect(
            screen.getByRole("button", { name: "Any status" }),
        ).toHaveAttribute("aria-pressed", "true");

        fireEvent.click(screen.getByRole("button", { name: "Unavailable" }));
        expect(
            screen.getByRole("article", { name: "Milo" }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("article", { name: "Daamin" }),
        ).not.toBeInTheDocument();
    });

    it("clears the search while retaining the availability filter", async () => {
        render(<App listPets={new ListPets({ findAll: async () => pets })} />);
        await screen.findByRole("heading", { name: "Daamin" });
        fireEvent.click(screen.getByRole("button", { name: "Available" }));
        fireEvent.change(screen.getByRole("searchbox"), {
            target: { value: "missing" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
        expect(
            screen.getByRole("article", { name: "Daamin" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Available" }),
        ).toHaveAttribute("aria-pressed", "true");
    });

    it("filters by pet type alongside availability and search, without a result count", async () => {
        const directoryPets = [
            ...pets,
            {
                ...pets[0],
                id: "dog",
                name: "Milo",
                species: "Dog",
                available: false,
            },
            { ...pets[0], id: "rat", name: "Arlo", species: "Rat" },
        ];
        render(
            <App
                listPets={new ListPets({ findAll: async () => directoryPets })}
            />,
        );
        await screen.findByRole("heading", { name: "Daamin" });
        expect(screen.getAllByRole("article")).toHaveLength(3);
        expect(screen.queryByText("3 pets")).not.toBeInTheDocument();

        fireEvent.mouseDown(screen.getByRole("tab", { name: "Cats" }), {
            button: 0,
            ctrlKey: false,
        });
        expect(screen.getByRole("tab", { name: "Cats" })).toHaveAttribute(
            "aria-selected",
            "true",
        );
        expect(screen.getAllByRole("article")).toHaveLength(1);
        expect(
            screen.getByRole("article", { name: "Daamin" }),
        ).toBeInTheDocument();

        fireEvent.mouseDown(screen.getByRole("tab", { name: "Dogs" }), {
            button: 0,
            ctrlKey: false,
        });
        expect(screen.getAllByRole("article")).toHaveLength(1);
        expect(
            screen.getByRole("article", { name: "Milo" }),
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Available" }));
        expect(screen.getByText("No matching pets")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Any status" }));
        fireEvent.change(screen.getByRole("searchbox"), {
            target: { value: "Daamin" },
        });
        expect(screen.getByText("No matching pets")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
        expect(screen.getByRole("tab", { name: "All pets" })).toHaveAttribute(
            "aria-selected",
            "true",
        );
        expect(screen.getAllByRole("article")).toHaveLength(3);
    });

    it("uses local thumbnails and shows a stable fallback if an image fails", async () => {
        const localPet = {
            ...pets[0],
            photoUrl: Object.keys(photoManifest)[0],
        };
        render(
            <App
                listPets={new ListPets({ findAll: async () => [localPet] })}
            />,
        );
        const image = await screen.findByRole("img", { name: localPet.name });
        expect(image.getAttribute("src")).toMatch(/\.webp/);
        expect(image.getAttribute("srcset")).toMatch(/320w, .*640w/);
        expect(image.getAttribute("src")).not.toBe(localPet.photoUrl);
        fireEvent.error(image);
        expect(
            screen.getByRole("img", {
                name: `${localPet.name}: photo unavailable`,
            }),
        ).toBeInTheDocument();
        expect(screen.getByText("Photo unavailable")).toBeInTheDocument();
    });

    it("aborts its request when unmounted", () => {
        const fetchPets = vi.fn<typeof fetch>(() => new Promise(() => {}));
        vi.stubGlobal("fetch", fetchPets);
        const { unmount } = render(
            <App listPets={createAppServices().listPets} />,
        );
        const [, options] = fetchPets.mock.calls[0];
        unmount();
        expect(options?.signal?.aborted).toBe(true);
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
