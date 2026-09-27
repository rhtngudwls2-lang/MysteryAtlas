import type { Metadata } from "next";
import "./globals.css";
import "./editorial.css";
import "./tokens.generated.css";
import { getMarket } from "@/config/market";
import { assetUrl } from "@/lib/base-path";

const defaultMarket = getMarket("en");

export const metadata: Metadata = {
  title: defaultMarket.seoTitle,
  description: defaultMarket.seoDescription,
  icons: { icon: assetUrl("/favicon.svg") },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
