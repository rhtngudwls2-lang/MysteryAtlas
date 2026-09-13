import Link from "next/link";
import type { Locale } from "@/content/schema";
import { copy } from "@/lib/copy";

export function Footer({ locale }: { locale: Locale }) {
  const c = copy(locale);
  return <footer className="site-footer"><div className="footer-inner">
    <div><strong>MYSTERY ATLAS</strong><p>{locale === "en" ? "Stories with their evidentiary limits intact." : "이야기와 근거의 한계를 함께 읽습니다."}</p></div>
    <nav aria-label={locale === "en" ? "Information" : "정보"}>
      <Link href={`/${locale}/about/`}>{c.about}</Link>
      <Link href={`/${locale}/methodology/`}>{c.methodology}</Link>
      <Link href={`/${locale}/editorial-policy/`}>{c.editorial}</Link>
      <Link href={`/${locale}/privacy/`}>Privacy</Link>
      <Link href={`/${locale}/terms/`}>Terms</Link>
    </nav>
  </div></footer>;
}
