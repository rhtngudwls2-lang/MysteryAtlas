import Link from "next/link";

export default function LanguageEntry() {
  return <main className="language-entry"><div className="brand-mark large">M</div><p className="kicker">MYSTERY ATLAS</p><h1>Choose your edition</h1><div className="language-options"><Link href="/en/">English</Link><Link href="/ko/">한국어</Link></div></main>;
}
