import { expect, test } from "@playwright/test";

import type { Pet } from "@/domains/pets/domain/models/Pet";

test("shows pets and their API photos", async ({ page, request }) => {
    const response = await request.get("/api/pets");
    expect(response.ok()).toBe(true);
    const pets: Pet[] = await response.json();

    await page.goto("/");

    await expect(page.getByRole("article")).toHaveCount(pets.length);
    const photo = page.getByRole("img", { name: pets[0].name });
    await expect(photo).toHaveAttribute("src", pets[0].photoUrl);
    await expect
        .poll(() =>
            photo.evaluate((image: HTMLImageElement) => image.naturalWidth),
        )
        .toBeGreaterThan(0);
});

test("shows an API error", async ({ page }) => {
    await page.route("**/api/pets", (route) => route.fulfill({ status: 500 }));
    await page.goto("/");

    await expect(page.getByRole("alert")).toContainText(
        "Pets could not be loaded",
    );
});

test("switches language and remembers it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Choose language" }).click();
    await page.getByRole("menuitemradio", { name: "Nederlands" }).click();

    await expect(page.locator("html")).toHaveAttribute("lang", "nl");
    await page.reload();
    await expect(
        page.getByRole("button", { name: "Huisdier toevoegen" }),
    ).toBeVisible();
});

test("filters and opens a pet", async ({ page, request }) => {
    const pets: Pet[] = await (await request.get("/api/pets")).json();
    await page.goto("/");

    await page.getByRole("searchbox").fill(pets[0].name);
    await expect(page.getByRole("article")).toHaveCount(1);
    await page.getByRole("button", { name: `Edit ${pets[0].name}` }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByLabel("Name")).toHaveValue(pets[0].name);
});
