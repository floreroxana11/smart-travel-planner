import { test, expect } from "@playwright/test";

async function clearApp(page) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
      }
    });
  });
  await page.context().clearCookies();
  await page.reload();
}

async function login(page) {
  await clearApp(page);
  await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });  await page.getByPlaceholder("john@email.com").fill("john@email.com");
  await page.getByPlaceholder("••••••••").fill("password123");
  await page.locator(".auth-card").getByRole("button", { name: /Log In/i }).click();

  await expect(page.getByRole("heading", { name: "My Trips" })).toBeVisible();
}

test.describe("Analytics page", () => {
  test("navigates to analytics and shows main sections", async ({ page }) => {
    await login(page);

    await page.getByRole("button", { name: /Analytics/i }).click();

    await expect(page.getByRole("heading", { name: "Visual Analytics" })).toBeVisible();
    await expect(page.locator(".analytics-stat-label").filter({ hasText: "Total Trips" })).toBeVisible();
    await expect(page.locator(".analytics-stat-label").filter({ hasText: "Total Spend" })).toBeVisible();
    await expect(page.locator(".analytics-stat-label").filter({ hasText: "Total Budget" })).toBeVisible();
    await expect(page.getByText("Trip Count by Category")).toBeVisible();
    await expect(page.getByText("Spent vs. Budget Breakdown")).toBeVisible();
    await expect(page.getByText("Budget Breakdown by Trip")).toBeVisible();
  });

  test("analytics page shows budget breakdown table rows", async ({ page }) => {
    await login(page);

    await page.getByRole("button", { name: /Analytics/i }).click();

    await expect(page.getByText("Summer Beach Escape").first()).toBeVisible();
    await expect(page.getByText("Alpine Adventure").first()).toBeVisible();
  });

  test("opening a trip from analytics goes to detail page", async ({ page }) => {
    await login(page);

    await page.getByRole("button", { name: /Analytics/i }).click();
    await page.getByText("Summer Beach Escape").first().click();

    await expect(page.getByText("Trip Details")).toBeVisible();
    await expect(page.getByText("Bali, Indonesia")).toBeVisible();
  });

    test("editing from master page updates analytics automatically", async ({ page }) => {
        await login(page);

        await page.locator('[aria-label="edit-1"]').click();

        const modal = page.locator(".modal");
        await modal.locator(".form-group").filter({ hasText: /Spent/i }).locator("input").fill("1600");
        await modal.getByRole("button", { name: /Edit Trip/i }).click();

        await page.locator(".overlay").waitFor({ state: "detached" });

        await page.getByRole("button", { name: /Analytics/i }).click();

        await expect(page.getByText("$1,600").first()).toBeVisible();
    });

    test("adding a new trip from master page updates analytics", async ({ page }) => {
        await login(page);

        await page.getByRole("button", { name: /New Trip/i }).click();

        const modal = page.locator(".modal");

        await modal.getByPlaceholder("Enter trip name").fill("Analytics Added Trip");
        await modal.getByPlaceholder("Enter destination").fill("Lisbon, Portugal");

        const dateInputs = modal.locator('input[type="date"]');
        await dateInputs.nth(0).fill("2026-08-01");
        await dateInputs.nth(1).fill("2026-08-07");

        await modal.getByRole("combobox").selectOption("City");
        await modal.locator(".form-group").filter({ hasText: /Budget/i }).locator("input").fill("1200");
        await modal.locator(".form-group").filter({ hasText: /Spent/i }).locator("input").fill("400");

        await modal.getByRole("button", { name: /Add Trip/i }).click();
        await page.locator(".overlay").waitFor({ state: "detached" });

        await page.getByRole("button", { name: /Analytics/i }).click();

        await expect(page.getByText("Analytics Added Trip").first()).toBeVisible();
    });
});