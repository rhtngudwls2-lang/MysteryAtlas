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

console.log("Applied Korean document language to static /ko output.");
