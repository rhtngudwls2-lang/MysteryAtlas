import type { NextConfig } from "next";
import path from "node:path";

const config: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_MYSTERY_ATLAS_BASE_PATH || undefined,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: path.resolve(process.cwd(), "..") },
};

export default config;
