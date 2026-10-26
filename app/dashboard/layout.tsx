import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import {
  GlobeIcon,
  HomeIcon,
  LogoMark,
  PlusIcon,
  TicketIcon,
} from "@/components/icons";
import { getCurrentUser } from "@/lib/auth";
import { mockOrganization } from "@/lib/mock/data";
import { SignOutButton } from "@/components/sign-out-button";

const nav = [
  { href: "/dashboard", label: "Overview", Icon: HomeIcon },
  { href: "/dashboard/events", label: "Events", Icon: TicketIcon },
  { href: "/dashboard/events/new", label: "Create event", Icon: PlusIcon },
  { href: "/events", label: "Public site", Icon: GlobeIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading dashboard…
        </div>
      }
    >
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}

async function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const displayName =
    user.user_metadata?.full_name ?? user.email ?? "Organiser";
  const initials = displayName
    .split(" ")
    .map((part: string) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="border-b border-border p-5">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <LogoMark />
            EventPlatform
          </Link>
          <div className="mt-5 rounded-xl border border-border bg-muted/60 p-3.5">
            <p className="text-sm font-semibold">{mockOrganization.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {mockOrganization.plan}
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <item.Icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-4 text-xs leading-5 text-muted-foreground">
          Signed in as {displayName}. Event data is still sample data —
          live organisations arrive next in Phase 3.
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <p className="font-semibold tracking-tight md:hidden">EventPlatform</p>
          <p className="hidden text-sm font-medium text-muted-foreground md:block">
            Organiser dashboard
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-48 truncate text-sm text-muted-foreground sm:block">
              {displayName}
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-semibold text-white shadow-sm">
              {initials || "U"}
            </span>
            <SignOutButton />
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
