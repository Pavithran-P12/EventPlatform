"use client";

import Link, { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

import Spinner from "@/components/spinner";

function PendingSpinner() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Spinner className="ml-auto h-4 w-4 shrink-0" />;
}

export default function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {icon}
      {label}
      <PendingSpinner />
    </Link>
  );
}
