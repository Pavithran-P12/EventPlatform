import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// Vitest does not load Next.js .env.local automatically. Load it only when
// RUN_INTEGRATION_TESTS=1 so unit tests that pass explicit env sources stay
// isolated from the developer's real environment.
const envPath = path.join(process.cwd(), ".env.local");
if (process.env.RUN_INTEGRATION_TESTS === "1" && existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}
