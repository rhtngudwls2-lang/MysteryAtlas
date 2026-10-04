import { expect, test } from "@playwright/test";
test("Romanov 360px controls, photo, save, share and settings retain data", async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 850 });
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en/cases/romanov-remains-dna/");
  await expect(page.locator("html")).toHaveAttribute("data-reader-tone", "ivory");
  const controls = page.locator(".article-toolbar-inner > *:visible");
  const rects = await controls.evaluateAll(nodes => nodes.map(n => { const r=n.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width}; }));
  expect(rects.every((r,i)=>r.width>0 && r.right<=360 && (i===0 || r.left>=rects[i-1].right-1))).toBe(true);
  const photo = page.locator(".abc-article-photo img");
  await expect(photo).toBeVisible();
  await expect(photo).toHaveCSS("object-fit", "contain");
  await expect.poll(()=>photo.evaluate((img: HTMLImageElement)=>img.naturalWidth)).toBe(3711);
  await page.getByTestId("save-romanov-remains-dna").click();
  await page.reload();
  await expect(page.getByTestId("save-romanov-remains-dna")).toHaveAttribute("aria-pressed","true");
  await page.evaluate(()=>Object.defineProperty(navigator,"share",{value:undefined,configurable:true}));
  await page.getByRole("button",{name:"Share",exact:true}).click();
  await expect(page.getByRole("button",{name:"Link copied",exact:true})).toBeVisible();
  await page.locator(".reader-settings > summary").click();
  await page.getByRole("button",{name:"Warm gray",exact:true}).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-reader-tone","warmgray");
});
test("legacy palettes and old DNA anchor survive migration", async ({ page }) => {
  await page.goto("/en/");
  for(const tone of ["dark","dim","warm"]){
    await page.evaluate(tone=>localStorage.setItem("mystery-atlas-reader-v1",JSON.stringify({size:"18",leading:"relaxed",tone})),tone);
    await page.goto("/en/cases/romanov-remains-dna/#block-autosomal-057");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-reader-tone",tone);
    await expect(page.locator("#methods-optional")).toHaveAttribute("open","");
    await expect(page.locator("#block-autosomal-057")).toBeAttached();
  }
});
test("home and explore use no generated chart covers", async ({ page }) => {
  await page.setViewportSize({width:360,height:850});
  for(const route of ["/ko/","/ko/explore/"]){
    await page.goto(route);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(361);
    expect(await page.locator(".case-card img[src*='__ko.png']").count()).toBe(0);
  }
});
