import { expect, test } from "@playwright/test";

test("locale switch stays in the same story near the same chapter", async ({ page }) => {
  await page.goto("/ko/cases/cooper/");
  await page.evaluate(() => document.fonts.ready);
  const chapter = page.locator(".narrative-chapter").nth(3);
  const id = await chapter.getAttribute("id");
  await chapter.evaluate((element) => window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 160, behavior: "instant" }));
  await page.locator('.article-languages a[href^="/en/"]').evaluate((element) => (element as HTMLAnchorElement).click());
  await expect(page).toHaveURL(new RegExp(`/en/cases/cooper/#${id}$`));
  await expect(page.getByRole("heading", { name: "D.B. Cooper", exact: true })).toBeVisible();
  await page.locator('.article-languages a[href^="/ko/"]').evaluate((element) => (element as HTMLAnchorElement).click());
  await expect(page).toHaveURL(/\/ko\/cases\/cooper\/#block-/);
});

test("reader controls persist and claim detail opens in place", async ({ page }) => {
  await page.goto("/en/cases/cooper/");
  await page.locator(".reader-settings > summary").click();
  await page.getByRole("group", { name: "Text size" }).getByRole("button", { name: "18" }).click();
  await page.getByRole("group", { name: "Line spacing" }).getByRole("button", { name: "Relaxed" }).click();
  await page.getByRole("group", { name: "Theme" }).getByRole("button", { name: "Warm" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-reader-size", "18");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-reader-tone", "warm");
  await expect(page.locator(".narrative p:not(.section-number)").first()).toHaveCSS("font-size", "18px");
  const evidence = page.locator(".evidence-card").first();
  await evidence.locator(".claim-detail > summary").click();
  await expect(evidence.locator(".source-block a").first()).toBeVisible();
  await evidence.locator(".claim-detail > summary").click();
  await expect(evidence.locator(".source-block a").first()).toBeHidden();
});

test("reader and discovery avoid page overflow at six viewport widths", async ({ page }) => {
  for (const width of [360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    for (const route of ["/ko/", "/ko/cases/cooper/", "/ko/search/"]) {
      await page.goto(route);
      const data = await page.evaluate(() => ({ viewport: innerWidth, scroll: document.documentElement.scrollWidth }));
      expect(data.scroll, `${route} at ${width}px`).toBeLessThanOrEqual(data.viewport + 1);
    }
    await page.goto("/ko/cases/cooper/");
    const toolbar = await page.locator(".article-toolbar-inner > *").evaluateAll((elements) => elements.map((element) => { const rect = element.getBoundingClientRect(); return { left: rect.left, right: rect.right, width: rect.width }; }));
    expect(toolbar.every((item, index) => item.width > 0 && item.right <= width + 1 && (index === 0 || item.left >= toolbar[index - 1].right - 1)), `${width}px toolbar overlap`).toBe(true);
  }
});
