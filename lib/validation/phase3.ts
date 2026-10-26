import * as z from "zod";

import { slugSchema } from "@/lib/validation/foundation";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  description: z.string().trim().max(2000).optional(),
});

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(3).max(200),
    description: z.string().trim().max(10000).optional(),
    startsAt: z.string().min(1),
    endsAt: z.string().min(1),
    location: z.string().trim().max(500).optional(),
    isOnline: z.boolean().default(false),
    capacity: z.number().int().positive().max(1000000).nullable().optional(),
    isFree: z.boolean().default(true),
    priceInr: z.number().min(0).max(1000000).default(0),
    modules: z
      .array(z.enum(["registration", "payments", "schedule", "checkin"]))
      .default(["registration"]),
  })
  .refine(
    (value) => new Date(value.endsAt) > new Date(value.startsAt),
    { message: "End time must be after start time", path: ["endsAt"] },
  )
  .refine((value) => value.isFree || value.priceInr > 0, {
    message: "Paid events must have a price greater than zero",
    path: ["priceInr"],
  });

export const registrationFormSchema = z.object({
  fullName: z.string().trim().min(1).max(200),
  email: z.email(),
  phone: z.string().trim().max(50).optional(),
});

export type EventFormInput = z.infer<typeof eventFormSchema>;
export type RegistrationFormInput = z.infer<typeof registrationFormSchema>;
