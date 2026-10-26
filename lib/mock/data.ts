export type EventCategory =
  | "Symposium"
  | "Sports"
  | "Workshop"
  | "Community"
  | "Conference";

export type MockEvent = {
  id: string;
  slug: string;
  title: string;
  organization: string;
  category: EventCategory;
  description: string;
  startsAt: string;
  endsAt: string;
  location: string;
  isOnline: boolean;
  capacity: number | null;
  registered: number;
  isFree: boolean;
  priceCents: number;
  currency: string;
  status: "draft" | "published" | "cancelled" | "completed";
  gradient: string;
  modules: string[];
  schedule: { time: string; title: string; speaker?: string }[];
};

export const mockEvents: MockEvent[] = [
  {
    id: "evt-1",
    slug: "innovate-2026",
    title: "Innovate 2026 — National Tech Symposium",
    organization: "Tech University",
    category: "Symposium",
    description:
      "Two days of paper presentations, keynotes, and project demos from 40+ colleges. Includes cash prizes, incubation offers, and a startup expo floor.",
    startsAt: "2026-11-14T09:00:00",
    endsAt: "2026-11-15T17:00:00",
    location: "Main Auditorium, Tech University",
    isOnline: false,
    capacity: 800,
    registered: 642,
    isFree: false,
    priceCents: 49900,
    currency: "INR",
    status: "published",
    gradient: "from-indigo-500 via-purple-500 to-fuchsia-500",
    modules: ["Registration", "Payments", "Schedule", "Check-in"],
    schedule: [
      { time: "09:00", title: "Inauguration & Keynote", speaker: "Dr. A. Rao" },
      { time: "11:00", title: "Paper Presentations — Track A" },
      { time: "14:00", title: "Project Expo & Judging" },
      { time: "16:30", title: "Valedictory & Prize Distribution" },
    ],
  },
  {
    id: "evt-2",
    slug: "inter-college-football-cup",
    title: "Inter-College Football Cup",
    organization: "City Sports Council",
    category: "Sports",
    description:
      "Knockout football tournament for college teams. 16 teams, professional referees, live scoring, and trophies for winners and runners-up.",
    startsAt: "2026-11-21T07:00:00",
    endsAt: "2026-11-23T19:00:00",
    location: "University Stadium Ground",
    isOnline: false,
    capacity: 16,
    registered: 13,
    isFree: false,
    priceCents: 199900,
    currency: "INR",
    status: "published",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    modules: ["Registration", "Payments", "Schedule"],
    schedule: [
      { time: "07:00", title: "Team Reporting & Kit Check" },
      { time: "08:00", title: "Round of 16 — Matches 1–4" },
      { time: "16:00", title: "Round of 16 — Matches 5–8" },
    ],
  },
  {
    id: "evt-3",
    slug: "ai-workshop-weekend",
    title: "Hands-on AI Workshop Weekend",
    organization: "Code Community",
    category: "Workshop",
    description:
      "Build and deploy a real AI app in two days. Bring a laptop — leave with a working project, certificate, and a portfolio-ready demo.",
    startsAt: "2026-11-08T10:00:00",
    endsAt: "2026-11-09T16:00:00",
    location: "Online",
    isOnline: true,
    capacity: 200,
    registered: 187,
    isFree: true,
    priceCents: 0,
    currency: "INR",
    status: "published",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    modules: ["Registration", "Schedule", "Check-in"],
    schedule: [
      { time: "10:00", title: "Foundations & Setup" },
      { time: "12:00", title: "Build Session 1 — Guided Project" },
      { time: "15:00", title: "Demo Hour & Certificates" },
    ],
  },
  {
    id: "evt-4",
    slug: "riverside-cleanup-drive",
    title: "Riverside Cleanup & Tree Plantation Drive",
    organization: "Green Earth Collective",
    category: "Community",
    description:
      "A morning of community service: riverbank cleanup followed by planting 500 saplings. Gloves, tools, and breakfast provided for all volunteers.",
    startsAt: "2026-11-30T06:30:00",
    endsAt: "2026-11-30T11:00:00",
    location: "Riverside Park, Gate 2",
    isOnline: false,
    capacity: 300,
    registered: 214,
    isFree: true,
    priceCents: 0,
    currency: "INR",
    status: "published",
    gradient: "from-lime-500 via-green-500 to-emerald-600",
    modules: ["Registration", "Check-in"],
    schedule: [
      { time: "06:30", title: "Volunteer Check-in & Kit Distribution" },
      { time: "07:00", title: "Cleanup Drive" },
      { time: "09:30", title: "Tree Plantation & Group Photo" },
    ],
  },
  {
    id: "evt-5",
    slug: "design-systems-masterclass",
    title: "Design Systems Masterclass",
    organization: "Code Community",
    category: "Workshop",
    description:
      "A deep-dive masterclass on building design systems that scale — tokens, components, documentation, and governance for product teams.",
    startsAt: "2026-12-05T09:30:00",
    endsAt: "2026-12-05T17:30:00",
    location: "Innovation Hub, Hall B",
    isOnline: false,
    capacity: 120,
    registered: 45,
    isFree: false,
    priceCents: 99900,
    currency: "INR",
    status: "draft",
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
    modules: ["Registration", "Payments"],
    schedule: [{ time: "09:30", title: "Design Tokens Deep-Dive" }],
  },
  {
    id: "evt-6",
    slug: "annual-alumni-meet",
    title: "Annual Alumni Meet 2026",
    organization: "Tech University",
    category: "Community",
    description:
      "Reconnect with batchmates, hear from distinguished alumni, and celebrate this year's achievements over dinner and live music.",
    startsAt: "2026-12-19T17:00:00",
    endsAt: "2026-12-19T22:00:00",
    location: "University Convention Centre",
    isOnline: false,
    capacity: 500,
    registered: 500,
    isFree: false,
    priceCents: 149900,
    currency: "INR",
    status: "published",
    gradient: "from-violet-500 via-purple-500 to-pink-500",
    modules: ["Registration", "Payments", "Check-in"],
    schedule: [
      { time: "17:00", title: "Welcome & Networking" },
      { time: "19:00", title: "Alumni Awards Ceremony" },
      { time: "20:30", title: "Dinner & Live Music" },
    ],
  },
];

export const mockOrganization = {
  name: "Tech University",
  plan: "Hackathon Preview",
  stats: [
    { label: "Total events", value: "12", delta: "+3 this month" },
    { label: "Registrations", value: "2,847", delta: "+18% vs last month" },
    { label: "Revenue collected", value: "₹4.2L", delta: "Across 5 paid events" },
    { label: "Check-ins today", value: "386", delta: "Across 2 live events" },
  ],
  recentRegistrations: [
    { name: "Ananya Sharma", event: "Innovate 2026", status: "Confirmed", amount: "₹499" },
    { name: "Rohan Mehta", event: "AI Workshop Weekend", status: "Confirmed", amount: "Free" },
    { name: "Priya Nair", event: "Annual Alumni Meet", status: "Pending payment", amount: "₹1,499" },
    { name: "Karthik Raj", event: "Football Cup — Team Falcons", status: "Confirmed", amount: "₹1,999" },
    { name: "Sneha Kulkarni", event: "Riverside Cleanup Drive", status: "Checked in", amount: "Free" },
  ],
};

export function formatPrice(event: MockEvent): string {
  if (event.isFree) return "Free";
  const amount = event.priceCents / 100;
  return event.currency === "INR"
    ? `₹${amount.toLocaleString("en-IN")}`
    : `${event.currency} ${amount.toLocaleString()}`;
}

export function formatDateRange(event: MockEvent): string {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString("en-IN", opts);
  }
  return `${start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-IN", opts)}`;
}

export function seatsLeft(event: MockEvent): number | null {
  if (event.capacity === null) return null;
  return Math.max(event.capacity - event.registered, 0);
}
