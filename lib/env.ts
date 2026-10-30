import * as z from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  PAYPAL_ENV: z.enum(["sandbox", "live"]).default("sandbox"),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_WEBHOOK_ID: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
}

// Supabase renamed the anon key to "publishable key"; accept either env var
// name so local and production settings can use whichever name was copied.
function resolveAnonKey(source?: NodeJS.ProcessEnv): string | undefined {
  // Literal process.env.NEXT_PUBLIC_* references are required so Next.js
  // can inline them into the browser bundle.
  return (
    source?.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    source?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function getPublicEnv(source?: NodeJS.ProcessEnv): PublicEnv {
  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL:
      source?.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: resolveAnonKey(source),
    NEXT_PUBLIC_APP_URL:
      source?.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  });
  if (!result.success) {
    throw new Error(`Invalid public environment: ${formatIssues(result.error)}`);
  }
  return result.data;
}

export function getServerEnv(source?: NodeJS.ProcessEnv): ServerEnv {
  const env = source ?? process.env;
  const result = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL:
      source?.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: resolveAnonKey(source),
    NEXT_PUBLIC_APP_URL:
      source?.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    PAYPAL_ENV: env.PAYPAL_ENV,
    PAYPAL_CLIENT_ID: env.PAYPAL_CLIENT_ID || undefined,
    PAYPAL_CLIENT_SECRET: env.PAYPAL_CLIENT_SECRET || undefined,
    PAYPAL_WEBHOOK_ID: env.PAYPAL_WEBHOOK_ID || undefined,
    RESEND_API_KEY: env.RESEND_API_KEY || undefined,
    EMAIL_FROM: env.EMAIL_FROM || undefined,
  });
  if (!result.success) {
    throw new Error(`Invalid server environment: ${formatIssues(result.error)}`);
  }
  return result.data;
}

export function isSupabaseConfigured(source?: NodeJS.ProcessEnv): boolean {
  return publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL:
      source?.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: resolveAnonKey(source),
    NEXT_PUBLIC_APP_URL:
      source?.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  }).success;
}
