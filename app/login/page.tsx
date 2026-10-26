import { Suspense } from "react";
import Link from "next/link";

import { LoginForm } from "./login-form";

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <LoginForm errorCode={error} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            E
          </span>
          EventPlatform
        </Link>
        <Link
          href="/events"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Discover events
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 pb-16 pt-6">
        <Suspense
          fallback={
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground shadow-sm">
              Loading sign-in…
            </div>
          }
        >
          <LoginContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
