import * as z from "zod";

export const slugSchema = z
  .string()
  .trim()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens");

export const organizationInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  description: z.string().trim().max(2000).optional(),
});

export const eventStatusSchema = z.enum([
  "draft",
  "published",
  "cancelled",
  "completed",
]);

export const eventInputSchema = z
  .object({
    title: z.string().trim().min(3).max(200),
    slug: slugSchema,
    description: z.string().trim().max(10000).optional(),
    startsAt: z.iso.datetime(),
    endsAt: z.iso.datetime(),
    timezone: z.string().trim().min(1).max(64).default("UTC"),
    location: z.string().trim().max(500).optional(),
    isOnline: z.boolean().default(false),
    capacity: z.number().int().positive().max(1000000).nullable().optional(),
    isFree: z.boolean().default(true),
    priceCents: z.number().int().min(0).max(100000000).default(0),
    currency: z
      .string()
      .trim()
      .length(3)
      .transform((value) => value.toUpperCase())
      .default("USD"),
    isPublic: z.boolean().default(true),
  })
  .refine((value) => new Date(value.endsAt) > new Date(value.startsAt), {
    message: "End time must be after start time",
    path: ["endsAt"],
  })
  .refine((value) => value.isFree || value.priceCents > 0, {
    message: "Paid events must have a price greater than zero",
    path: ["priceCents"],
  });

export type OrganizationInput = z.infer<typeof organizationInputSchema>;
export type EventInput = z.infer<typeof eventInputSchema>;
