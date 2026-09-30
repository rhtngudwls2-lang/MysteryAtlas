import { expect, test, type Locator, type Page } from "@playwright/test";

async function waitForAnchorLayout(page: Page, id: string) {
  await page.waitForFunction((targetId) => {
    const target = document.getElementById(targetId);
    if (!target) return false;
    const images = [...document.querySelectorAll<HTMLImageElement>(".productized-page img")].filter((image) =>
      Boolean(image.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING)
    );
    return images.every((image) => image.complete && image.naturalWidth > 0);
  }, id, { timeout: 10000 });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

async function placeChapterNearTop(chapter: Locator) {
  await chapter.evaluate((element) => {
    const root = document.documentElement;
    const body = document.body;
    const rootBehavior = root.style.scrollBehavior;
    const bodyBehavior = body.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";
    window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 140);
    root.style.scrollBehavior = rootBehavior;
    body.style.scrollBehavior = bodyBehavior;
  });
  await expect.poll(async () => chapter.evaluate((element) => element.getBoundingClientRect().top), { timeout: 5000 }).toBeLessThan(300);
  const top = await chapter.evaluate((element) => element.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(0);
}

async function expectAnchorNearTop(page: Page, id: string) {
  await expect.poll(async () => page.locator(`#${id}`).evaluate((element) => element.getBoundingClientRect().top), { timeout: 10000 }).toBeLessThan(300);
  const top = await page.locator(`#${id}`).evaluate((element) => element.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(0);
}

test("Batch50 locale switch keeps language and chapter position at 390/430", async ({ page }) => {
  for (const { width, slug } of [
    { width: 390, slug: "edmund-fitzgerald" },
    { width: 430, slug: "borley-rectory-investigation" },
  ]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto(`/ko/cases/${slug}/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");

    const chapter = page.locator(".narrative-chapter").nth(3);
    const id = await chapter.getAttribute("id");
    expect(id).toBeTruthy();
    await waitForAnchorLayout(page, id!);
    await placeChapterNearTop(chapter);

    await page.locator('.article-languages a[lang="en"]').click();
    await expect(page).toHaveURL(new RegExp(`/en/cases/${slug}/#${id}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await waitForAnchorLayout(page, id!);
    await expectAnchorNearTop(page, id!);
  }
});

test("Continue Reading restores the saved chapter after image layout settles", async ({ page }) => {
  for (const width of [390, 430]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/en/");
    await page.evaluate(() => {
      localStorage.setItem("mystery-atlas-reading-v1", JSON.stringify({
        canonicalId: "edmund-fitzgerald",
        locale: "en",
        blockId: "block-04",
        updatedAt: Date.now(),
      }));
    });
    await page.reload();

    const link = page.locator(".continue-reading .continue-link");
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/en\/cases\/edmund-fitzgerald\/#block-04$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await waitForAnchorLayout(page, "block-04");
    await expectAnchorNearTop(page, "block-04");
  }
});
