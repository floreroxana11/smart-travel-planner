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
  await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
  await page.getByPlaceholder("john@email.com").fill("john@email.com");
  await page.getByPlaceholder("••••••••").fill("password123");
  await page.locator(".auth-card").getByRole("button", { name: /Log In/i }).click();

  await expect(page.getByRole("heading", { name: "My Trips" })).toBeVisible();
}

test.describe("Trip CRUD operations", () => {
  test("adds a new trip and it appears in the table", async ({ page }) => {
  await login(page);

  await page.getByRole("button", { name: /New Trip/i }).click();

  const modal = page.locator(".modal");

  await modal.getByPlaceholder("Enter trip name").fill("E2E Test Trip");
  await modal.getByPlaceholder("Enter destination").fill("Rome, Italy");

  const dateInputs = modal.locator('input[type="date"]');
  await dateInputs.nth(0).fill("2026-07-01");
  await dateInputs.nth(1).fill("2026-07-10");

  await modal.getByRole("combobox").selectOption("City");
  await modal.locator(".form-group").filter({ hasText: /Budget/i }).locator("input").fill("1500");
  await modal.locator(".form-group").filter({ hasText: /Spent/i }).locator("input").fill("500");

  await modal.getByRole("button", { name: /Add Trip/i }).click();
  await page.locator(".overlay").waitFor({ state: "detached" });

  const lastPageNumber = page.locator(".page-btn").filter({ hasText: /^[0-9]+$/ }).last();
  await lastPageNumber.click();

  await expect(page.getByText("E2E Test Trip")).toBeVisible();
});

  test("shows validation errors when adding trip with empty fields", async ({ page }) => {
    await login(page);

    await page.getByRole("button", { name: /New Trip/i }).click();
    await page.getByRole("button", { name: /Add Trip/i }).click();

    await expect(page.getByText("Trip name is required.")).toBeVisible();
    await expect(page.getByText("Destination is required.")).toBeVisible();
    await expect(page.getByText("Budget is required.")).toBeVisible();
  });

  test("edits an existing trip", async ({ page }) => {
    await login(page);

    await page.locator('[aria-label="edit-1"]').click();
    await page.getByPlaceholder("Enter trip name").fill("Updated Beach Trip");
    await page.getByRole("button", { name: /Edit Trip/i }).click();

    await expect(page.getByText("Updated Beach Trip")).toBeVisible();
  });

  test("deletes a trip with confirmation", async ({ page }) => {
    await login(page);

    await page.locator('[aria-label="delete-2"]').click();
    await expect(page.getByText("Are you sure you want to delete")).toBeVisible();
    await page.getByRole("button", { name: /^Delete$/i }).click();

    await expect(page.getByText("Alpine Adventure")).not.toBeVisible();
  });

  test("cancels delete and the trip remains", async ({ page }) => {
    await login(page);

    await page.locator('[aria-label="delete-1"]').click();
    await page.getByRole("button", { name: /Cancel/i }).click();

    await expect(page.getByText("Summer Beach Escape")).toBeVisible();
  });

  test("navigates to detail page when row is clicked", async ({ page }) => {
    await login(page);

    await page.getByText("Summer Beach Escape").click();

    await expect(page.getByText("Trip Details")).toBeVisible();
    await expect(page.getByText("Bali, Indonesia")).toBeVisible();
  });

  test("detail page edit updates the trip", async ({ page }) => {
    await login(page);

    await page.getByText("Summer Beach Escape").click();
    await expect(page.getByText("Trip Details")).toBeVisible();

    await page.getByRole("button", { name: /Edit Trip/i }).click();
    await page.getByPlaceholder("Enter trip name").fill("Beach Escape Edited");
    await page.getByRole("button", { name: /Edit Trip/i }).last().click();

    await expect(page.getByText("Beach Escape Edited")).toBeVisible();
  });
});