import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ComponentType } from "react";

import { getCurrentUser } from "@/lib/auth";
import { getActiveOrganization, setActiveOrganizationCookie } from "@/lib/db/org-context";
import { getMyOrganizations } from "@/lib/db/queries";
import { SignOutButton } from "@/components/sign-out-button";
import NavLink from "@/components/nav-link";
import {
  CalendarIcon,
  HomeIcon,
  LogoMark,
  PlusIcon,
  TicketIcon,
} from "@/components/icons";

type NavItem = {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

const nav: NavItem[] = [
  { href: "/dashboard", label: "Overview", Icon: HomeIcon },
  { href: "/dashboard/events", label: "Events", Icon: CalendarIcon },
  { href: "/dashboard/events/new", label: "Create event", Icon: PlusIcon },
  { href: "/events", label: "Public events", Icon: TicketIcon },
];

async function DashboardShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const memberships = await getMyOrganizations(user.id);
  const active = await getActiveOrganization(user.id);

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Organiser";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-[15px] font-bold tracking-tight text-slate-900">
              EventPlatform
            </span>
          </Link>
          <div className="lg:hidden">
            <SignOutButton />
          </div>
        </div>

        <div className="px-5 pb-4">
          {active ? (
            <div className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200/70">
              <p className="truncate text-sm font-semibold text-slate-800">
                {active.organization.name}
              </p>
              <p className="text-xs capitalize text-slate-400">
                {active.role} · {active.organization.slug}
              </p>
              {memberships.length > 1 ? (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {memberships.map((membership) => (
                    <form
                      key={membership.organization.id}
                      action={async () => {
                        "use server";
                        await setActiveOrganizationCookie(membership.organization.id);
                        redirect("/dashboard");
                      }}
                    >
                      <button
                        type="submit"
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition ${
                          membership.organization.id === active.organization.id
                            ? "bg-indigo-600 text-white ring-indigo-600"
                            : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300"
                        }`}
                      >
                        {membership.organization.name}
                      </button>
                    </form>
                  ))}
                </div>
              ) : null}
              <Link
                href="/dashboard/organizations/new"
                className="mt-2.5 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                + New organisation
              </Link>
            </div>
          ) : (
            <Link
              href="/dashboard/organizations/new"
              className="block rounded-2xl bg-indigo-50 p-3.5 text-sm font-medium text-indigo-700 ring-1 ring-indigo-100 transition hover:bg-indigo-100"
            >
              Create your organisation →
            </Link>
          )}
        </div>

        <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible">
          {nav.map(({ href, label, Icon }) => (
            <NavLink key={href} href={href} label={label} Icon={Icon} />
          ))}
        </nav>

        <div className="mt-auto hidden items-center gap-3 border-t border-slate-100 px-5 py-4 lg:flex">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
            {initials || "EP"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">{displayName}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
            <p className="text-sm font-medium text-slate-600">
              {active ? active.organization.name : "Organiser dashboard"}
            </p>
            <Link
              href="/dashboard/events/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4" /> New event
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
          Loading dashboard…
        </div>
      }
    >
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
