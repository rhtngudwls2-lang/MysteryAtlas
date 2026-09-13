import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("English and Korean locale routes render", async ({ page }) => {
  await page.goto("/en/");
  await expect(page.getByRole("heading", { name: "D.B. Cooper", exact: true })).toBeVisible();
  await page.goto("/ko/");
  await expect(page.getByText("근거가 비어 있는 지점에서 시작하세요")).toBeVisible();
});

test("case page exposes evidence, canonical metadata and calculated reading time", async ({ page }) => {
  await page.goto("/en/cases/cooper/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/en\/cases\/cooper\/$/);
  await expect(page.locator(".evidence-card")).toHaveCount(5);
  await expect(page.getByText(/min read/).first()).toBeVisible();
  await expect(page.getByText("What this does not establish").first()).toBeVisible();
});

test("quick preview, visual sequence and typed rabbit hole render", async ({ page }) => {
  await page.goto("/en/cases/cooper/");
  await page.getByText("10-second preview", { exact: true }).click();
  await expect(page.locator(".quick-preview .case-preview")).toBeVisible();
  await expect(page.getByRole("heading", { name: "How the case moves" })).toBeVisible();
  await expect(page.locator(".visual-sequence li")).not.toHaveCount(0);
  await expect(page.getByText("Evidence pattern").first()).toBeVisible();
});

test("country discovery filters the catalog", async ({ page }) => {
  await page.goto("/en/explore/");
  await page.getByLabel("Country").selectOption("united-kingdom");
  await expect(page.locator(".case-card")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Rendlesham Forest" })).toBeVisible();
});

test("reaction can change, cancel and persist locally", async ({ page }) => {
  await page.goto("/en/cases/cooper/");
  const positive = page.getByRole("button", { name: /Worth reading/ });
  await positive.click();
  await expect(positive).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByRole("button", { name: /Worth reading/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Worth reading/ }).click();
  await expect(page.getByRole("button", { name: /Worth reading/ })).toHaveAttribute("aria-pressed", "false");
});

test("search uses aliases and people", async ({ page }) => {
  await page.goto("/en/search/");
  await page.getByTestId("search-input").fill("Charles Halt");
  await expect(page.locator(".case-card")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Rendlesham Forest" })).toBeVisible();
});

test("saved cases persist after reload and appear in the saved route", async ({ page }) => {
  await page.goto("/en/cases/cooper/");
  await page.getByTestId("save-cooper").click();
  await expect(page.getByTestId("save-cooper")).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByTestId("save-cooper")).toHaveAttribute("aria-pressed", "true");
  await page.goto("/en/saved/");
  await expect(page.locator('[data-case="cooper"]')).toBeVisible();
});

test("sitemap, robots and representative internal links resolve", async ({ page, request }) => {
  expect((await request.get("/sitemap.xml")).ok()).toBe(true);
  expect((await request.get("/robots.txt")).ok()).toBe(true);
  for (const route of ["/en/", "/en/explore/", "/en/search/", "/en/collections/", "/en/cases/rendlesham/", "/ko/cases/loch-ness/", "/en/methodology/"]) {
    expect((await request.get(route)).ok(), route).toBe(true);
  }
  await page.goto("/en/");
  const links = await page.locator('a[href^="/"]').evaluateAll((nodes) => [...new Set(nodes.map((node) => (node as HTMLAnchorElement).getAttribute("href")!).filter(Boolean))]);
  for (const link of links) expect((await request.get(link)).ok(), link).toBe(true);
});

test("has no serious accessibility violations on core surfaces", async ({ page }) => {
  for (const route of ["/en/", "/en/explore/", "/en/cases/cooper/", "/ko/search/"]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? "")), route).toEqual([]);
  }
});

test("captures release-candidate surfaces", async ({ page }, testInfo) => {
  await page.goto("/en/");
  await page.screenshot({ path: `artifacts/screenshots/${testInfo.project.name}-home.png`, fullPage: true });
  await page.goto("/en/cases/cooper/");
  await page.screenshot({ path: `artifacts/screenshots/${testInfo.project.name}-cooper.png`, fullPage: true });
  await page.goto("/ko/cases/rendlesham/");
  await page.screenshot({ path: `artifacts/screenshots/${testInfo.project.name}-rendlesham-ko.png`, fullPage: true });
  await page.goto("/en/explore/");
  await page.screenshot({ path: `artifacts/screenshots/${testInfo.project.name}-explore.png`, fullPage: true });
});
