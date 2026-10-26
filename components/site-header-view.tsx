import Link from "next/link";

import { LogoMark } from "@/components/icons";
import { SignOutButton } from "@/components/sign-out-button";

export function SiteHeaderView({
  displayName,
}: {
  displayName: string | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <LogoMark />
          EventPlatform
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/events" className="transition hover:text-foreground">
            Discover events
          </Link>
          <Link href="/dashboard" className="transition hover:text-foreground">
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
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover"
              >
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover"
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
