/**
 * Demo seed: dummy organizers, events (all categories) and participants.
 *
 * Everything is tagged `demo-seed` so it can be removed with ONE trigger:
 *   select public.purge_demo_seed();   -- in Supabase SQL Editor
 * or:
 *   npm run seed:demo:purge
 *
 * Usage:
 *   npm run seed:demo          # idempotent: purges previous demo data, re-seeds
 *   npm run seed:demo:purge    # remove all demo data only
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (service role bypasses RLS; purge only touches demo-seed rows).
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TAG = "demo-seed";
const EMAIL_DOMAIN = "demo-seed.example.com";
const purgeOnly = process.argv.includes("--purge");

function loadEnv() {
  const file = path.join(root, ".env.local");
  if (!existsSync(file)) throw new Error(".env.local not found");
  const env = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  return { url, key };
}

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261103);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (min, max) => min + Math.floor(rand() * (max - min + 1));

const ORGANIZERS = [
  { slug: "demo-seed-tech-university", name: "Demo — Tech University", description: "Demo organiser: university symposiums, alumni meets and research showcases. (demo-seed)" },
  { slug: "demo-seed-city-sports-council", name: "Demo — City Sports Council", description: "Demo organiser: inter-college tournaments and city leagues. (demo-seed)" },
  { slug: "demo-seed-code-community", name: "Demo — Code Community", description: "Demo organiser: hands-on workshops, hack nights and meetups for builders. (demo-seed)" },
  { slug: "demo-seed-green-earth", name: "Demo — Green Earth Collective", description: "Demo organiser: cleanups, plantation drives and community volunteering. (demo-seed)" },
  { slug: "demo-seed-summit-labs", name: "Demo — Summit Labs", description: "Demo organiser: conferences and leadership summits. (demo-seed)" },
  { slug: "demo-seed-campus-arts", name: "Demo — Campus Arts Society", description: "Demo organiser: cultural fests, open mics and community showcases. (demo-seed)" },
];

// category, org index, title, free?, price INR, capacity, fill %, online?, location, days from now, duration h
const EVENTS = [
  ["symposium", 0, "Innovate 2026 — National Tech Symposium", false, 499, 300, 0.72, false, "Main Auditorium, Tech University", 11, 8],
  ["symposium", 0, "Research Frontiers Paper Symposium", true, 0, 200, 0.48, false, "Seminar Hall A, Tech University", 25, 6],
  ["symposium", 4, "Future of AI Symposium", false, 899, 250, 0.61, true, "Online", 32, 5],
  ["sports", 1, "Inter-College Football Cup", false, 1999, 160, 0.81, false, "University Stadium Ground", 18, 10],
  ["sports", 1, "City Marathon — 10K Run", true, 0, 500, 0.57, false, "Riverside Park, Gate 2", 40, 4],
  ["sports", 1, "Badminton Open Championship", false, 349, 128, 0.44, false, "Indoor Sports Complex, Hall 1", 9, 9],
  ["workshop", 2, "Hands-on AI Workshop Weekend", true, 0, 200, 0.93, true, "Online", 5, 6],
  ["workshop", 2, "Design Systems Masterclass", false, 999, 120, 0.38, false, "Innovation Hub, Hall B", 16, 8],
  ["workshop", 5, "Photography & Storytelling Workshop", false, 599, 60, 0.67, false, "Campus Arts Studio", 22, 5],
  ["community", 3, "Riverside Cleanup & Tree Plantation Drive", true, 0, 300, 0.71, false, "Riverside Park, Gate 2", 27, 5],
  ["community", 5, "Annual Alumni Meet & Open Mic Night", false, 1499, 250, 0.52, false, "University Convention Centre", 46, 5],
  ["community", 3, "Neighbourhood Food & Craft Fair", true, 0, 400, 0.34, false, "Community Ground, Sector 12", 13, 7],
  ["conference", 4, "Product Leaders Conference 2026", false, 2499, 350, 0.64, false, "Grand Convention Centre, Hall 1", 35, 9],
  ["conference", 4, "DevConf India — Developer Conference", false, 1799, 450, 0.78, true, "Online", 20, 8],
  ["conference", 0, "National Education Conference", true, 0, 280, 0.41, false, "Tech University, Main Auditorium", 50, 7],
];

const FIRST = ["Aarav", "Ananya", "Arjun", "Diya", "Ishaan", "Kavya", "Karthik", "Meera", "Nikhil", "Priya", "Rahul", "Rohan", "Sneha", "Varun", "Vikram", "Aditi", "Dev", "Isha", "Kabir", "Lakshmi", "Manav", "Naina", "Om", "Pooja", "Raj", "Riya", "Sahil", "Tara", "Yash", "Zara"];
const LAST = ["Sharma", "Mehta", "Nair", "Raj", "Kulkarni", "Iyer", "Patel", "Reddy", "Khan", "Das", "Menon", "Gupta", "Rao", "Singh", "Pillai", "Chopra", "Bose", "Kumar", "Anand", "Verma"];

function eventSlug(title) {
  return `${TAG}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60)}`;
}

async function main() {
  const { url, key } = loadEnv();
  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: purged, error: purgeError } = await admin.rpc("purge_demo_seed");
  if (purgeError) {
    throw new Error(
      `purge_demo_seed() failed (${purgeError.message}). Apply migration ` +
      `20261027000008_event_category_and_demo_seed.sql first (SQL Editor or supabase db push).`,
    );
  }
  console.log("Purged previous demo data:", purged?.[0] ?? purged);
  if (purgeOnly) return;

  const organizers = [];
  for (let i = 0; i < ORGANIZERS.length; i++) {
    const org = ORGANIZERS[i];
    const email = `organizer-${i + 1}@${EMAIL_DOMAIN}`;
    const { data, error } = await admin.auth.admin.createUser({
      email, password: `DemoSeed!${i + 1}-not-a-real-login`,
      email_confirm: true, user_metadata: { full_name: org.name.replace("Demo — ", "") },
    });
    if (error) throw new Error(`createUser ${email}: ${error.message}`);
    organizers.push({ ...org, ownerId: data.user.id, email });
    console.log(`Organizer user: ${email}`);
  }

  for (const org of organizers) {
    const { data, error } = await admin.from("organizations")
      .insert({ name: org.name, slug: org.slug, description: org.description, created_by: org.ownerId })
      .select("id").single();
    if (error) throw new Error(`organization ${org.slug}: ${error.message}`);
    org.id = data.id;
    const { error: mErr } = await admin.from("organization_members")
      .insert({ organization_id: org.id, user_id: org.ownerId, role: "owner" });
    if (mErr) throw new Error(`membership ${org.slug}: ${mErr.message}`);
  }

  let totalRegistrations = 0;
  for (const [category, orgIdx, title, isFree, price, capacity, fill, isOnline, location, days, hours] of EVENTS) {
    const org = organizers[orgIdx];
    const starts = new Date(Date.now() + days * 864e5 + int(0, 6) * 36e5);
    starts.setMinutes(0, 0, 0);
    const ends = new Date(starts.getTime() + hours * 36e5);
    const slug = eventSlug(title);
    const { data: ev, error } = await admin.from("events").insert({
      organization_id: org.id, created_by: org.ownerId, title, slug,
      description: `${title} — hosted by ${org.name.replace("Demo — ", "")}. Demo event created by the demo-seed script (${TAG}); real details would come from the organiser. Expect sessions, networking and a friendly crowd.`,
      status: "published", starts_at: starts.toISOString(), ends_at: ends.toISOString(),
      timezone: "Asia/Kolkata", location: isOnline ? null : location, is_online: isOnline,
      capacity, is_free: isFree, price_cents: isFree ? 0 : price * 100, currency: "INR",
      is_public: true, category,
    }).select("id").single();
    if (error) throw new Error(`event ${slug}: ${error.message}`);

    const modules = isFree ? ["registration", "schedule", "checkin"] : ["registration", "payments", "schedule", "checkin"];
    const { error: modErr } = await admin.from("event_modules")
      .insert(modules.map((module_key) => ({ event_id: ev.id, module_key })));
    if (modErr) throw new Error(`modules ${slug}: ${modErr.message}`);
    const { data: form, error: formErr } = await admin.from("registration_forms")
      .insert({ event_id: ev.id, title: "Registration" }).select("id").single();
    if (formErr) throw new Error(`form ${slug}: ${formErr.message}`);

    const target = Math.max(5, Math.round(capacity * fill));
    const used = new Set();
    const rows = [];
    while (rows.length < target) {
      const name = `${pick(FIRST)} ${pick(LAST)}`;
      const email = `${name.toLowerCase().replace(/[^a-z]+/g, ".")}.${rows.length + 1}@${EMAIL_DOMAIN}`;
      if (used.has(email)) continue;
      used.add(email);
      const r = rand();
      rows.push({
        event_id: ev.id, form_id: form.id, full_name: name, email,
        phone: rand() > 0.3 ? `+91 ${int(70000, 99999)} ${int(10000, 99999)}` : null,
        status: isFree ? (r < 0.92 ? "confirmed" : "waitlisted") : (r < 0.78 ? "confirmed" : r < 0.94 ? "pending_payment" : "waitlisted"),
        created_at: new Date(Date.now() - int(1, 20) * 864e5 - int(0, 20) * 36e5).toISOString(),
      });
    }
    for (let i = 0; i < rows.length; i += 200) {
      const { error: regErr } = await admin.from("registrations").insert(rows.slice(i, i + 200));
      if (regErr) throw new Error(`registrations ${slug}: ${regErr.message}`);
    }
    totalRegistrations += rows.length;
    console.log(`Event [${category}] ${title}: ${rows.length}/${capacity} participants`);
  }

  console.log(`\nDone. ${organizers.length} organizers, ${EVENTS.length} events, ${totalRegistrations} registrations.`);
  console.log(`Remove everything with: select public.purge_demo_seed();  (or npm run seed:demo:purge)`);
}

main().catch((err) => { console.error(err.message ?? err); process.exit(1); });
