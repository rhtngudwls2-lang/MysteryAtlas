"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type SavedContextValue = { ready: boolean; saved: string[]; toggle: (slug: string) => void; has: (slug: string) => boolean };
const SavedContext = createContext<SavedContextValue | null>(null);
const key = "mystery-atlas:v3:saved";

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setSaved(JSON.parse(localStorage.getItem(key) ?? "[]")); } catch { setSaved([]); }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const toggle = useCallback((slug: string) => setSaved((current) => {
    const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
    localStorage.setItem(key, JSON.stringify(next));
    return next;
  }), []);
  const value = useMemo(() => ({ ready, saved, toggle, has: (slug: string) => saved.includes(slug) }), [ready, saved, toggle]);
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const value = useContext(SavedContext);
  if (!value) throw new Error("useSaved must be used inside SavedProvider");
  return value;
}
