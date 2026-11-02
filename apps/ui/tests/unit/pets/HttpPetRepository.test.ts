import { describe, expect, it, vi } from "vitest";

import { HttpPetRepository } from "@/domains/pets/infrastructure/http/HttpPetRepository";

import { pets } from "../../fixtures/pets";

describe("HttpPetRepository", () => {
    it("reads pets from the configured endpoint and passes the cancellation signal", async () => {
        const request = vi
            .fn()
            .mockResolvedValue(new Response(JSON.stringify(pets)));
        vi.stubGlobal("fetch", request);
        const controller = new AbortController();
        const repository = new HttpPetRepository("/api/custom-pets");

        await expect(repository.findAll(controller.signal)).resolves.toEqual(
            pets,
        );
        expect(request).toHaveBeenCalledWith("/api/custom-pets", {
            signal: controller.signal,
        });
    });

    it("hides server error details behind a user-facing message", async () => {
        vi.stubGlobal(
            "fetch",
            vi
                .fn()
                .mockResolvedValue(
                    new Response("Private storage failure", { status: 500 }),
                ),
        );

        await expect(new HttpPetRepository().findAll()).rejects.toThrow(
            "Pets could not be loaded. Please try again.",
        );
    });

    it("propagates cancellation so the presentation layer can ignore it", async () => {
        const error = new DOMException("Request cancelled", "AbortError");
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));

        await expect(new HttpPetRepository().findAll()).rejects.toBe(error);
    });

    it("rejects malformed JSON instead of returning invalid pet data", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{")));

        await expect(new HttpPetRepository().findAll()).rejects.toBeInstanceOf(
            SyntaxError,
        );
    });

    it("rejects JSON that does not match the pet API schema", async () => {
        vi.stubGlobal(
            "fetch",
            vi
                .fn()
                .mockResolvedValue(
                    new Response(
                        JSON.stringify([{ ...pets[0], available: "yes" }]),
                    ),
                ),
        );

        await expect(new HttpPetRepository().findAll()).rejects.toThrow();
    });

    it("uploads the original image for server-side normalization", async () => {
        const request = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ ...pets[0], name: "Nova" }), {
                status: 201,
            }),
        );
        vi.stubGlobal("fetch", request);
        const original = new File(["large image"], "nova.jpg", {
            type: "image/jpeg",
        });

        await new HttpPetRepository().save({
            name: "Nova",
            species: "Cat",
            available: true,
            birthYear: 2020,
            image: original,
        });

        const [url, options] = request.mock.calls[0] as [string, RequestInit];
        expect(url).toBe("/api/pets");
        expect(options.method).toBe("POST");
        const body = options.body as FormData;
        const uploadedImage = body.get("image");
        expect(uploadedImage).toBeInstanceOf(File);
        expect((uploadedImage as File).name).toBe("nova.jpg");
        expect((uploadedImage as File).type).toBe("image/jpeg");
        expect(body.get("available")).toBe("1");
        expect(body.get("_method")).toBeNull();
    });

    it("updates a pet without replacing its image", async () => {
        const request = vi
            .fn()
            .mockResolvedValue(
                new Response(JSON.stringify(pets[0]), { status: 200 }),
            );
        vi.stubGlobal("fetch", request);

        await new HttpPetRepository().save({
            petId: pets[0].id,
            name: pets[0].name,
            species: pets[0].species,
            available: false,
            birthYear: pets[0].birthYear,
        });

        const [url, options] = request.mock.calls[0] as [string, RequestInit];
        expect(url).toBe(`/api/pets/${pets[0].id}`);
        const body = options.body as FormData;
        expect(body.get("_method")).toBe("PUT");
        expect(body.get("image")).toBeNull();
    });
});
