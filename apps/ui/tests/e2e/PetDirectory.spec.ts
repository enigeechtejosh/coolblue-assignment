import { expect, test } from "@playwright/test";

import type { Pet } from "@/domain/pets/Pet";

test("shows the pets served by the Laravel API", async ({ page, request }) => {
    await page.route("https://i.imgur.com/**", (route) => route.abort());
    const response = await request.get("/api/pets");
    expect(response.ok()).toBe(true);
    const pets: Pet[] = await response.json();
    expect(pets.length).toBeGreaterThan(0);

    await page.goto("/");

    await expect(page.getByRole("button", { name: "Add pet" })).toBeVisible();
    const topbar = page.locator("header");
    await expect(topbar).toHaveCSS("position", "fixed");
    await expect(topbar).toHaveCSS("top", "0px");
    await expect(topbar).toHaveCSS("border-bottom-width", "0px");
    await expect(topbar.getByText("Pets", { exact: true })).toHaveCount(0);
    const initialTopbarBounds = await topbar.boundingBox();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const scrolledTopbarBounds = await topbar.boundingBox();
    expect(scrolledTopbarBounds!.y).toBe(initialTopbarBounds!.y);
    await expect(page.getByRole("article")).toHaveCount(pets.length);
    const card = page.getByRole("article").first();
    await expect(card).toHaveAttribute("data-slot", "card");
    await expect(card).toHaveCSS("padding-top", "0px");
    await expect(card).toHaveCSS("border-radius", "8px");
    await expect(card.locator('[data-slot="card-header"]')).toHaveCSS(
        "padding-left",
        "24px",
    );
    await expect(card).toHaveCSS("border-width", "0px");
    await expect(card).toHaveCSS("box-shadow", "none");
    const bounds = await card.boundingBox();
    expect(bounds!.height).toBeGreaterThan(bounds!.width);
    const photo = card.getByRole("img", { name: pets[0].name });
    await expect(photo).toHaveAttribute("srcset", /320w, .*640w/);
    await expect
        .poll(() =>
            photo.evaluate((image: HTMLImageElement) => image.naturalWidth),
        )
        .toBeGreaterThan(0);
    const photoUrl = new URL(
        await photo.evaluate((image: HTMLImageElement) => image.currentSrc),
    );
    expect(photoUrl.origin).toBe(new URL(page.url()).origin);
    expect(photoUrl.pathname).toMatch(/\.webp$/);
    const thumbnail = await request.get(photoUrl.href);
    expect(thumbnail.ok()).toBe(true);
    expect((await thumbnail.body()).length).toBeLessThan(100000);
    expect(thumbnail.headers()["cache-control"]).toContain("no-cache");
    await expect(card.locator('[data-slot="badge"]')).toHaveCSS(
        "height",
        "24px",
    );
    await expect(page.locator("html")).toHaveCSS(
        "font-family",
        /Inter Variable/,
    );
    await expect(
        page.getByRole("heading", { name: pets[0].name, exact: true }),
    ).toBeVisible();
});

test("shows a failed request without a retry control", async ({ page }) => {
    await page.route("**/api/pets", (route) =>
        route.fulfill({ status: 500, json: { error: "Unavailable" } }),
    );
    await page.goto("/");
    await expect(page.getByRole("alert")).toContainText(
        "Pets could not be loaded",
    );

    await expect(page.getByRole("button", { name: "Try again" })).toHaveCount(
        0,
    );
});

test("switches to Dutch and remembers the language", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Choose language" }).click();
    await page.getByRole("menuitemradio", { name: "Nederlands" }).click();

    await expect(page.locator("html")).toHaveAttribute("lang", "nl");
    await expect(
        page.getByRole("button", { name: "Huisdier toevoegen" }),
    ).toBeVisible();
    await expect(
        page.getByRole("searchbox", { name: "Huisdieren zoeken" }),
    ).toBeVisible();

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "nl");
    await expect(
        page.getByRole("button", { name: "Huisdier toevoegen" }),
    ).toBeVisible();
});

test("opens the pet sheet with spaced labels and the shadcn checkbox", async ({
    page,
}) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Add pet" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Photo", { exact: true })).toBeVisible();
    await expect(
        dialog.getByText("Images are resized and compressed", { exact: false }),
    ).toHaveCount(0);

    const nameLabel = dialog.getByText("Name", { exact: true });
    const nameInput = dialog.getByLabel("Name");
    const labelBounds = await nameLabel.boundingBox();
    const inputBounds = await nameInput.boundingBox();
    expect(
        inputBounds!.y - (labelBounds!.y + labelBounds!.height),
    ).toBeGreaterThanOrEqual(7);

    const checkbox = dialog.getByRole("checkbox", {
        name: "Available for adoption",
    });
    await expect(checkbox).toHaveAttribute("data-slot", "checkbox");
    await expect(checkbox).toBeChecked();
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();

    await expect(dialog.locator('[data-slot="sheet-footer"]')).toHaveCSS(
        "border-top-width",
        "0px",
    );
    await expect(page.getByText("Skip to pets", { exact: true })).toHaveCount(
        0,
    );

    await dialog.getByRole("button", { name: "Close" }).click();
    await page
        .getByRole("button", { name: /^Edit / })
        .first()
        .click();
    await expect(dialog.getByAltText("Pet preview")).toHaveCSS(
        "aspect-ratio",
        "3 / 4",
    );
    await expect(
        dialog.getByText("Update this pet’s details", { exact: false }),
    ).toHaveCount(0);
});

test("filters pets with keyboard controls on a narrow screen", async ({
    page,
    request,
}) => {
    const response = await request.get("/api/pets");
    expect(response.ok()).toBe(true);
    const pets: Pet[] = await response.json();
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByRole("article")).toHaveCount(pets.length);

    await expect(
        page.getByText(`${pets.length} pets`, { exact: true }),
    ).toHaveCount(0);
    const search = page.getByRole("searchbox");
    const searchBounds = await search.boundingBox();
    await search.click();
    await expect(search).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
    expect(
        await search.evaluate((element) => getComputedStyle(element).boxShadow),
    ).not.toBe("none");
    const tabs = page.getByRole("tablist", { name: "Pet type" });
    await expect(tabs).toHaveAttribute("data-slot", "tabs-list");
    const tabsBounds = await tabs.boundingBox();
    expect(tabsBounds!.x).toBeGreaterThanOrEqual(
        searchBounds!.x + searchBounds!.width,
    );
    expect(
        Math.abs(
            tabsBounds!.y +
                tabsBounds!.height / 2 -
                searchBounds!.y -
                searchBounds!.height / 2,
        ),
    ).toBeLessThan(3);

    const allPets = page.getByRole("tab", { name: "All pets" });
    await allPets.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Cats" })).toHaveAttribute(
        "aria-selected",
        "true",
    );
    await expect(page.getByRole("article")).toHaveCount(
        pets.filter((pet) => pet.species === "Cat").length,
    );
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Dogs" })).toHaveAttribute(
        "aria-selected",
        "true",
    );
    await expect(page.getByRole("article")).toHaveCount(
        pets.filter((pet) => pet.species === "Dog").length,
    );
    await page.getByRole("button", { name: "Available", exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(
        pets.filter((pet) => pet.species === "Dog" && pet.available).length,
    );
    await allPets.click();

    const available = page.getByRole("button", {
        name: "Available",
        exact: true,
    });
    await available.focus();
    await page.keyboard.press("Space");
    await expect(available).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("article")).toHaveCount(
        pets.filter((pet) => pet.available).length,
    );

    await page.getByRole("searchbox").fill("no-such-pet-12345");
    await expect(page.getByText("No matching pets")).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.getByRole("searchbox")).toHaveValue("");
    await expect(page.getByRole("article")).toHaveCount(pets.length);
    await expect(
        page.getByRole("button", { name: "Any status" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
    ).toBe(true);
    await page.screenshot({
        path: "test-results/pet-directory-mobile.png",
        fullPage: true,
    });
});
