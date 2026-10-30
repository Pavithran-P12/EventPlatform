"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import Spinner from "@/components/spinner";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      if (anchor.target && anchor.target !== "_self") return;
      const url = new URL(href, window.location.href);
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }
      setNavigating(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;
    if (!navigating) return;
    const timer = setTimeout(() => setNavigating(false), 200);
    return () => clearTimeout(timer);
  }, [pathname, navigating]);

  useEffect(() => {
    if (!navigating) return;
    const timer = setTimeout(() => setNavigating(false), 10000);
    return () => clearTimeout(timer);
  }, [navigating]);

  useEffect(() => {
    document.body.style.cursor = navigating ? "progress" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [navigating]);

  if (!navigating) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 overflow-hidden bg-indigo-100">
        <div className="h-full w-1/3 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 ep-progress-slide" />
      </div>
      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex items-center gap-2 rounded-full bg-white/95 py-1.5 pl-2 pr-3.5 shadow-lift ring-1 ring-slate-200">
        <Spinner className="h-4 w-4" />
        <span className="text-xs font-semibold text-slate-600">Loading…</span>
      </div>
    </>
  );
}
