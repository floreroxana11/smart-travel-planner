import { test, expect } from "@playwright/test";

test.describe("Authentication flow", () => {
  test.beforeEach(async ({ page }) => {
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
  });

  test("shows landing page initially", async ({ page }) => {
    await expect(page.getByText("Your Entire Journey")).toBeVisible();
    await expect(page.getByRole("button", { name: /Start Planning/i })).toBeVisible();
  });

  test("navigates to login when Start Planning is clicked", async ({ page }) => {
    await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByPlaceholder("john@email.com")).toBeVisible();
  });

  test("shows validation errors on empty login submit", async ({ page }) => {
    await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
    await page.locator(".auth-card").getByRole("button", { name: /Log In/i }).click();

    await expect(page.getByText("Email is required.")).toBeVisible();
    await expect(page.getByText("Password is required.")).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
    await page.getByPlaceholder("john@email.com").fill("wrong@email.com");
    await page.getByPlaceholder("••••••••").fill("wrongpass");
    await page.locator(".auth-card").getByRole("button", { name: /Log In/i }).click();

    await expect(page.getByText("Invalid email or password.")).toBeVisible();
  });

  test("successful login navigates to trips page", async ({ page }) => {
    await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
    await page.getByPlaceholder("john@email.com").fill("john@email.com");
    await page.getByPlaceholder("••••••••").fill("password123");
    await page.locator(".auth-card").getByRole("button", { name: /Log In/i }).click();

    await expect(page.getByRole("heading", { name: "My Trips" })).toBeVisible();
  });

  // ─── TESTE NOI JWT ────────────────────────────────────────────────

  test("JWT: token salvat in localStorage dupa login", async ({ page }) => {
    await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
    await page.getByPlaceholder("john@email.com").fill("john@email.com");
    await page.getByPlaceholder("••••••••").fill("password123");
    await page.locator(".auth-card").getByRole("button", { name: /Log In/i }).click();

    await expect(page.getByRole("heading", { name: "My Trips" })).toBeVisible();

    const token = await page.evaluate(() => localStorage.getItem("auth_token"));
    expect(token).not.toBeNull();
    expect(token.split(".").length).toBe(3); // format JWT: header.payload.signature
  });

  test("JWT: token sters din localStorage dupa logout", async ({ page }) => {
    // Login
    await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
    await page.getByPlaceholder("john@email.com").fill("john@email.com");
    await page.getByPlaceholder("••••••••").fill("password123");
    await page.locator(".auth-card").getByRole("button", { name: /Log In/i }).click();
    await expect(page.getByRole("heading", { name: "My Trips" })).toBeVisible();

    // Logout
    await page.getByRole("button", { name: /Logout|Log Out|Sign Out/i }).click();

    const token = await page.evaluate(() => localStorage.getItem("auth_token"));
    expect(token).toBeNull();
  });

  test("JWT: fara token nu poti accesa trips (redirect la login)", async ({ page }) => {
    // Nu facem login, mergem direct la pagina
    await page.goto("/");
    // Nu ar trebui sa vedem "My Trips" fara autentificare
    await expect(page.getByRole("heading", { name: "My Trips" })).not.toBeVisible();
    await expect(page.getByText("Your Entire Journey")).toBeVisible();
  });

  test("JWT: token invalid in localStorage afiseaza pagina de start", async ({ page }) => {
    // Setam un token fals
    await page.evaluate(() => localStorage.setItem("auth_token", "token.invalid.fals"));
    await page.reload();

    // App-ul trebuie sa ignore tokenul invalid si sa arate pagina initiala
    await expect(page.getByText("Your Entire Journey")).toBeVisible();
    await expect(page.getByRole("heading", { name: "My Trips" })).not.toBeVisible();
  });

  test("navigates to register page", async ({ page }) => {
    await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
    await page.getByRole("button", { name: /Register/i }).click();

    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
  });

  test("registers a new account and lands on trips page", async ({ page }) => {
    await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
    await page.getByRole("button", { name: /Register/i }).click();

    const auth = page.locator(".auth-card");
    const email = `roxana${Date.now()}@test.com`;

    await auth.getByPlaceholder("John Traveler").fill("Roxana Test");
    await auth.locator('input[type="email"]').fill(email);
    await auth.locator('input[type="password"]').nth(0).fill("parola123");
    await auth.locator('input[type="password"]').nth(1).fill("parola123");

    await auth.getByRole("button", { name: /Create Account/i }).click();

    await expect(page.getByRole("heading", { name: "My Trips" })).toBeVisible({ timeout: 10000 });
  });

  test("JWT: token salvat in localStorage dupa register", async ({ page }) => {
    await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
    await page.getByRole("button", { name: /Register/i }).click();

    const auth = page.locator(".auth-card");
    const email = `jwttest${Date.now()}@test.com`;

    await auth.getByPlaceholder("John Traveler").fill("JWT Tester");
    await auth.locator('input[type="email"]').fill(email);
    await auth.locator('input[type="password"]').nth(0).fill("parola123");
    await auth.locator('input[type="password"]').nth(1).fill("parola123");
    await auth.getByRole("button", { name: /Create Account/i }).click();

    await expect(page.getByRole("heading", { name: "My Trips" })).toBeVisible({ timeout: 10000 });

    const token = await page.evaluate(() => localStorage.getItem("auth_token"));
    expect(token).not.toBeNull();
    expect(token.split(".").length).toBe(3);
  });
});
