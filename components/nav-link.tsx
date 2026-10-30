"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentType } from "react";

import Spinner from "@/components/spinner";

function PendingSpinner() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Spinner className="ml-auto h-4 w-4 shrink-0" />;
}

export default function NavLink({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
    >
      <Icon className="h-4.5 w-4.5 text-slate-400" />
      {label}
      <PendingSpinner />
    </Link>
  );
}
