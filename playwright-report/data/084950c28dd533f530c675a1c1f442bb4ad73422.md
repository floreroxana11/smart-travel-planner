# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> Authentication flow >> successful login navigates to trips page
- Location: e2e\auth.spec.js:48:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByPlaceholder('john@email.com')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e5] [cursor=pointer]:
      - generic [ref=e6]: ✈️
      - generic [ref=e7]: Smart Travel Planner
    - generic [ref=e8]:
      - button "Log In" [ref=e9] [cursor=pointer]
      - button "Sign Up" [ref=e10] [cursor=pointer]
  - generic [ref=e12]:
    - generic [ref=e13]: ✈️
    - heading "Welcome back" [level=1] [ref=e14]
    - paragraph [ref=e15]: Sign in to your Smart Travel Planner
    - generic [ref=e16]:
      - generic [ref=e17]: Username
      - textbox "admin" [ref=e18]
    - generic [ref=e19]:
      - generic [ref=e20]: Password
      - textbox "••••••••" [ref=e21]
    - button "Log In" [ref=e22] [cursor=pointer]
    - generic [ref=e23]:
      - text: "Admin:"
      - code [ref=e24]: admin
      - text: /
      - code [ref=e25]: admin123
      - text: "User:"
      - code [ref=e26]: alice
      - text: /
      - code [ref=e27]: user123
    - generic [ref=e28]:
      - text: Don't have an account?
      - button "Register" [ref=e29] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("Authentication flow", () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto("/");
  6   |     await page.evaluate(() => {
  7   |       localStorage.clear();
  8   |       document.cookie.split(";").forEach((cookie) => {
  9   |         const eqPos = cookie.indexOf("=");
  10  |         const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
  11  |         if (name) {
  12  |           document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  13  |         }
  14  |       });
  15  |     });
  16  |     await page.context().clearCookies();
  17  |     await page.reload();
  18  |   });
  19  | 
  20  |   test("shows landing page initially", async ({ page }) => {
  21  |     await expect(page.getByText("Your Entire Journey")).toBeVisible();
  22  |     await expect(page.getByRole("button", { name: /Start Planning/i })).toBeVisible();
  23  |   });
  24  | 
  25  |   test("navigates to login when Start Planning is clicked", async ({ page }) => {
  26  |     await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
  27  |     await expect(page.getByText("Welcome back")).toBeVisible();
  28  |     await expect(page.getByPlaceholder("john@email.com")).toBeVisible();
  29  |   });
  30  | 
  31  |   test("shows validation errors on empty login submit", async ({ page }) => {
  32  |     await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
  33  |     await page.locator(".auth-card").getByRole("button", { name: /Log In/i }).click();
  34  | 
  35  |     await expect(page.getByText("Email is required.")).toBeVisible();
  36  |     await expect(page.getByText("Password is required.")).toBeVisible();
  37  |   });
  38  | 
  39  |   test("shows error for invalid credentials", async ({ page }) => {
  40  |     await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
  41  |     await page.getByPlaceholder("john@email.com").fill("wrong@email.com");
  42  |     await page.getByPlaceholder("••••••••").fill("wrongpass");
  43  |     await page.locator(".auth-card").getByRole("button", { name: /Log In/i }).click();
  44  | 
  45  |     await expect(page.getByText("Invalid email or password.")).toBeVisible();
  46  |   });
  47  | 
  48  |   test("successful login navigates to trips page", async ({ page }) => {
  49  |     await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
> 50  |     await page.getByPlaceholder("john@email.com").fill("john@email.com");
      |                                                   ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  51  |     await page.getByPlaceholder("••••••••").fill("password123");
  52  |     await page.locator(".auth-card").getByRole("button", { name: /Log In/i }).click();
  53  | 
  54  |     await expect(page.getByRole("heading", { name: "My Trips" })).toBeVisible();
  55  |   });
  56  | 
  57  |   // ─── TESTE NOI JWT ────────────────────────────────────────────────
  58  | 
  59  |   test("JWT: token salvat in localStorage dupa login", async ({ page }) => {
  60  |     await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
  61  |     await page.getByPlaceholder("john@email.com").fill("john@email.com");
  62  |     await page.getByPlaceholder("••••••••").fill("password123");
  63  |     await page.locator(".auth-card").getByRole("button", { name: /Log In/i }).click();
  64  | 
  65  |     await expect(page.getByRole("heading", { name: "My Trips" })).toBeVisible();
  66  | 
  67  |     const token = await page.evaluate(() => localStorage.getItem("auth_token"));
  68  |     expect(token).not.toBeNull();
  69  |     expect(token.split(".").length).toBe(3); // format JWT: header.payload.signature
  70  |   });
  71  | 
  72  |   test("JWT: token sters din localStorage dupa logout", async ({ page }) => {
  73  |     // Login
  74  |     await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
  75  |     await page.getByPlaceholder("john@email.com").fill("john@email.com");
  76  |     await page.getByPlaceholder("••••••••").fill("password123");
  77  |     await page.locator(".auth-card").getByRole("button", { name: /Log In/i }).click();
  78  |     await expect(page.getByRole("heading", { name: "My Trips" })).toBeVisible();
  79  | 
  80  |     // Logout
  81  |     await page.getByRole("button", { name: /Logout|Log Out|Sign Out/i }).click();
  82  | 
  83  |     const token = await page.evaluate(() => localStorage.getItem("auth_token"));
  84  |     expect(token).toBeNull();
  85  |   });
  86  | 
  87  |   test("JWT: fara token nu poti accesa trips (redirect la login)", async ({ page }) => {
  88  |     // Nu facem login, mergem direct la pagina
  89  |     await page.goto("/");
  90  |     // Nu ar trebui sa vedem "My Trips" fara autentificare
  91  |     await expect(page.getByRole("heading", { name: "My Trips" })).not.toBeVisible();
  92  |     await expect(page.getByText("Your Entire Journey")).toBeVisible();
  93  |   });
  94  | 
  95  |   test("JWT: token invalid in localStorage afiseaza pagina de start", async ({ page }) => {
  96  |     // Setam un token fals
  97  |     await page.evaluate(() => localStorage.setItem("auth_token", "token.invalid.fals"));
  98  |     await page.reload();
  99  | 
  100 |     // App-ul trebuie sa ignore tokenul invalid si sa arate pagina initiala
  101 |     await expect(page.getByText("Your Entire Journey")).toBeVisible();
  102 |     await expect(page.getByRole("heading", { name: "My Trips" })).not.toBeVisible();
  103 |   });
  104 | 
  105 |   test("navigates to register page", async ({ page }) => {
  106 |     await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
  107 |     await page.getByRole("button", { name: /Register/i }).click();
  108 | 
  109 |     await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
  110 |   });
  111 | 
  112 |   test("registers a new account and lands on trips page", async ({ page }) => {
  113 |     await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
  114 |     await page.getByRole("button", { name: /Register/i }).click();
  115 | 
  116 |     const auth = page.locator(".auth-card");
  117 |     const email = `roxana${Date.now()}@test.com`;
  118 | 
  119 |     await auth.getByPlaceholder("John Traveler").fill("Roxana Test");
  120 |     await auth.locator('input[type="email"]').fill(email);
  121 |     await auth.locator('input[type="password"]').nth(0).fill("parola123");
  122 |     await auth.locator('input[type="password"]').nth(1).fill("parola123");
  123 | 
  124 |     await auth.getByRole("button", { name: /Create Account/i }).click();
  125 | 
  126 |     await expect(page.getByRole("heading", { name: "My Trips" })).toBeVisible({ timeout: 10000 });
  127 |   });
  128 | 
  129 |   test("JWT: token salvat in localStorage dupa register", async ({ page }) => {
  130 |     await page.getByRole("button", { name: /Start Planning/i }).click({ force: true });
  131 |     await page.getByRole("button", { name: /Register/i }).click();
  132 | 
  133 |     const auth = page.locator(".auth-card");
  134 |     const email = `jwttest${Date.now()}@test.com`;
  135 | 
  136 |     await auth.getByPlaceholder("John Traveler").fill("JWT Tester");
  137 |     await auth.locator('input[type="email"]').fill(email);
  138 |     await auth.locator('input[type="password"]').nth(0).fill("parola123");
  139 |     await auth.locator('input[type="password"]').nth(1).fill("parola123");
  140 |     await auth.getByRole("button", { name: /Create Account/i }).click();
  141 | 
  142 |     await expect(page.getByRole("heading", { name: "My Trips" })).toBeVisible({ timeout: 10000 });
  143 | 
  144 |     const token = await page.evaluate(() => localStorage.getItem("auth_token"));
  145 |     expect(token).not.toBeNull();
  146 |     expect(token.split(".").length).toBe(3);
  147 |   });
  148 | });
  149 | 
```