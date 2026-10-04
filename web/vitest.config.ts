import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  cacheDir: "./.candidate-vite-cache",
  test: { environment: "node", include: ["tests/unit/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
});
