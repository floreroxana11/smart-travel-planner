# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> Authentication flow >> JWT: token salvat in localStorage dupa register
- Location: e2e\auth.spec.js:129:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.auth-card').getByPlaceholder('John Traveler')

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
    - heading "Create account" [level=1] [ref=e14]
    - paragraph [ref=e15]: Join Smart Travel Planner today
    - generic [ref=e16]:
      - generic [ref=e17]: Username
      - textbox "mariaioana" [ref=e18]
    - generic [ref=e19]:
      - generic [ref=e20]: Email
      - textbox "mariaioana@gmail.com" [ref=e21]
    - generic [ref=e22]:
      - generic [ref=e23]: Password
      - textbox "••••••••" [ref=e24]
    - generic [ref=e25]:
      - generic [ref=e26]: Confirm Password
      - textbox "••••••••" [ref=e27]
    - button "Create Account" [ref=e28] [cursor=pointer]
    - generic [ref=e29]:
      - text: Already have an account?
      - button "Log In" [ref=e30] [cursor=pointer]
```

# Test source

```ts
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
  50  |     await page.getByPlaceholder("john@email.com").fill("john@email.com");
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
> 136 |     await auth.getByPlaceholder("John Traveler").fill("JWT Tester");
      |                                                  ^ Error: locator.fill: Test timeout of 30000ms exceeded.
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