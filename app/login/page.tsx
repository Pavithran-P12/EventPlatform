import { Suspense } from "react";
import Link from "next/link";

import { LogoMark } from "@/components/icons";
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
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute -top-32 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-4rem] h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
      </div>
      <header className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <LogoMark />
          EventPlatform
        </Link>
        <Link
          href="/events"
          className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          Discover events
        </Link>
      </header>
      <div className="relative flex flex-1 items-center justify-center px-4 pb-16 pt-6">
        <Suspense
          fallback={
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground shadow-card">
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
