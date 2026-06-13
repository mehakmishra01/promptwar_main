import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PUBLIC_ROUTES = ["/", "/login", "/signup"];

const APP_ROUTES = ["/dashboard", "/journal", "/insights", "/chat", "/settings"];

async function analyzePage(page: import("@playwright/test").Page) {
  return new AxeBuilder({ page }).disableRules(["region"]).analyze();
}

test.describe("MindMirror accessibility and happy path", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} has no axe violations`, async ({ page }) => {
      await page.goto(route);
      const results = await analyzePage(page);
      expect(results.violations).toEqual([]);
    });
  }

  test("landing page loads with CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /MindMirror/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /get started with mindmirror/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in to your account/i })).toBeVisible();
  });

  test("login page has labeled form fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/sign in$/i)).toBeVisible();
  });

  test("signup page has labeled form fields", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });
});

test.describe("Authenticated app routes", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto("/login");
    await page.getByLabel(/email address/i).fill("demo@mindmirror.app");
    await page.getByLabel(/^password$/i).fill("demo123456");
    await page.getByLabel(/sign in$/i).click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30_000 });
    if (page.url().includes("/onboarding")) {
      testInfo.skip(true, "Demo user requires onboarding completion");
    }
  });

  for (const route of APP_ROUTES) {
    test(`${route} has no axe violations when authenticated`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const results = await analyzePage(page);
      expect(results.violations).toEqual([]);
    });
  }

  test("journal to dashboard flow is reachable", async ({ page }) => {
    await page.goto("/journal");
    await expect(page.getByRole("heading", { name: /reflection/i })).toBeVisible();
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /wellness dashboard/i })).toBeVisible();
  });
});
