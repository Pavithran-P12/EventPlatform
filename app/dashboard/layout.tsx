import Link from "next/link";

import { mockOrganization } from "@/lib/mock/data";

const nav = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/events", label: "Events", icon: "🎟️" },
  { href: "/dashboard/events/new", label: "Create event", icon: "➕" },
  { href: "/events", label: "Public site", icon: "🌐" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="border-b border-border p-5">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              E
            </span>
            EventPlatform
          </Link>
          <div className="mt-4 rounded-xl bg-muted p-3">
            <p className="text-sm font-semibold">{mockOrganization.name}</p>
            <p className="text-xs text-muted-foreground">
              {mockOrganization.plan}
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 text-xs text-muted-foreground">
          Frontend preview — sample data only. Sign-in arrives in Phase 3.
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
          <p className="font-semibold md:hidden">EventPlatform</p>
          <p className="hidden text-sm text-muted-foreground md:block">
            Organiser dashboard
          </p>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
              Preview mode
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              TU
            </span>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
