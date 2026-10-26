"use client";

import { useState } from "react";

import { LogoMark } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5l-3.9 3C3.3 21.3 7.3 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-3.9-3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l3.9-3z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l3.9 3c.9-2.8 3.6-4.9 6.8-4.9z"
      />
    </svg>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed:
    "Google sign-in could not be completed. Please try again.",
  missing_code: "Google sign-in was interrupted. Please try again.",
};

export function LoginForm({ errorCode }: { errorCode?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorCode ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.auth_callback_failed) : null,
  );

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (signInError) {
        setError("Google sign-in could not be started. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `Google sign-in is not available right now. (${err.message})`
          : "Google sign-in is not available right now. Please try again later.",
      );
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="flex items-center gap-2.5 font-semibold tracking-tight">
          <LogoMark />
          EventPlatform
        </div>
        <h1 className="mt-7 text-2xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage your events, registrations, schedules, and
          check-ins.
        </p>

        {error ? (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />
          {isLoading ? "Redirecting to Google…" : "Continue with Google"}
        </button>

        <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
          Organiser accounts use Google sign-in. Participants can register
          for events without an account.
        </p>
      </div>
      <p className="mt-5 text-center text-xs text-muted-foreground">
        New to EventPlatform? Signing in creates your organiser account.
      </p>
    </div>
  );
}
