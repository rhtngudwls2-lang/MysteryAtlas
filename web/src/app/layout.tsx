import type { Metadata } from "next";
import "./globals.css";
import { getMarket } from "@/config/market";

const defaultMarket = getMarket("en");

export const metadata: Metadata = {
  title: defaultMarket.seoTitle,
  description: defaultMarket.seoDescription,
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
