import Link from "next/link";

import { SignOutButton } from "@/components/sign-out-button";

export function SiteHeaderView({
  displayName,
}: {
  displayName: string | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            E
          </span>
          EventPlatform
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/events" className="hover:text-foreground">
            Discover events
          </Link>
          <Link href="/dashboard" className="hover:text-foreground">
            For organisers
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {displayName ? (
            <>
              <span className="hidden max-w-40 truncate text-sm text-muted-foreground sm:inline">
                {displayName}
              </span>
              <Link
                href="/dashboard"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Organiser dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
