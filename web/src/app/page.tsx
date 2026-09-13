import Link from "next/link";
import { getMarket } from "@/config/market";

export default function LanguageEntry() {
  const market = getMarket("en");
  return <main className="language-entry"><div className="brand-mark large">{market.shortName.slice(0, 1)}</div><p className="kicker">{market.publicDisplayName}</p><h1>Choose your edition</h1><div className="language-options"><Link href="/en/">English</Link><Link href="/ko/">한국어</Link></div></main>;
}
