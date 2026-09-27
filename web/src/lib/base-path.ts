export const previewBasePath = process.env.NEXT_PUBLIC_MYSTERY_ATLAS_BASE_PATH ?? "";

export function assetUrl(path: string): string {
  if (!path.startsWith("/")) return path;
  if (previewBasePath && path.startsWith(`${previewBasePath}/`)) return path;
  return `${previewBasePath}${path}`;
}

export const localeHref = (path: string) => assetUrl(path);
