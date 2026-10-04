import { test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
test("capture actual ABC pilot screens", async ({ page }, info) => {
  if(info.project.name!=="desktop-chromium")return;
  const out=resolve("../../evidence/screenshots");mkdirSync(out,{recursive:true});
  for(const width of [360,1440]){
    await page.setViewportSize({width,height:900});
    for(const [name,route] of [["home","/ko/"],["explore","/ko/explore/"],["romanov","/ko/cases/romanov-remains-dna/"]]){
      await page.goto(route);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(250);
      await page.screenshot({path:resolve(out,`${name}-${width}.png`),fullPage:name==="romanov"});
    }
  }
});
