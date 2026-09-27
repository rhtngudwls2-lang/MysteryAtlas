import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const target = join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(target) : target.endsWith(".html") ? [target] : [];
  }));
  return files.flat();
}

for (const file of await htmlFiles(join(process.cwd(), "out", "ko"))) {
  const html = await readFile(file, "utf8");
  await writeFile(file, html.replace('<html lang="en">', '<html lang="ko">'));
}

// Static-export CSS is served below the repository path on GitHub Pages.
// Next.js handles JS/navigation basePath; plain CSS url() needs a prefix too.
const basePath = process.env.NEXT_PUBLIC_MYSTERY_ATLAS_BASE_PATH;
if (basePath) {
  const cssDir = join(process.cwd(), "out", "_next", "static", "chunks");
  for (const file of await readdir(cssDir)) {
    if (!file.endsWith(".css")) continue;
    const target = join(cssDir, file);
    const css = await readFile(target, "utf8");
    await writeFile(target, css.replaceAll('url("/fonts/', `url("${basePath}/fonts/`).replaceAll('url(/fonts/', `url(${basePath}/fonts/`));
  }
}

console.log("Applied Korean document language to static /ko output.");
