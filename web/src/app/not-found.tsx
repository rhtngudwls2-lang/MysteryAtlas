import Link from "next/link";

export default function NotFound() {
  return <main className="not-found"><p className="kicker">404 / CLOSED FILE</p><h1>This trail ends here.</h1><p>The page may have moved or never existed.</p><Link className="primary-link" href="/en/">Return home</Link></main>;
}
