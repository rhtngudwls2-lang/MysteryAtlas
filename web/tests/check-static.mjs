import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const output = join(process.cwd(), "out");

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const target = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(target) : [target];
  }))).flat();
}

const htmlFiles = (await filesBelow(output)).filter((file) => file.endsWith(".html"));
const failures = [];

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const links = [...html.matchAll(/href="([^"#?]+)[^"#]*"/g)].map((match) => match[1]);
  for (const href of links) {
    if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/_next/")) continue;
    const relative = href === "/" ? "index.html" : href.endsWith("/") ? `${href.slice(1)}index.html` : href.slice(1);
    try {
      await access(join(output, relative));
    } catch {
      failures.push(`${file}: ${href}`);
    }
  }
}

if (failures.length) {
  console.error(`Broken internal links:\n${failures.join("\n")}`);
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} static pages: no broken internal links.`);
