import { z } from "zod";
import { isValidDateStr, isValidTimeStr } from "@/lib/date";
import { levelChoices, SESSION_LENGTHS, venueNames } from "@/lib/site";

const dateStr = z.string().refine(isValidDateStr, "Dată invalidă");
const timeStr = z.string().refine(isValidTimeStr, "Oră invalidă");
const venue = z.enum(venueNames, { errorMap: () => ({ message: "Alege locația" }) });

const childSchema = z.object({
  name: z.string().trim().min(2, "Completează numele fiecărui copil").max(60),
  age: z
    .number({ invalid_type_error: "Completează vârsta fiecărui copil" })
    .int()
    .min(6, "Vârsta copilului trebuie să fie între 6 și 17 ani")
    .max(17, "Vârsta copilului trebuie să fie între 6 și 17 ani"),
});

export const bookingCreateSchema = z.object({
  serviceId: z.string().min(1),
  date: dateStr,
  startTime: timeStr,
  level: z.enum(levelChoices, { errorMap: () => ({ message: "Alege nivelul de joc" }) }),
  participants: z.number().int().min(1).max(20),
  // Kids course: whether others may join the group.
  openToOthers: z.boolean(),
  // Adult course: how many strangers may join; null = any, 0 = none.
  maxStrangers: z.number().int().min(0).max(3).nullable().default(null),
  children: z.array(childSchema).max(20).default([]),
  clientName: z.string().trim().min(2, "Numele este prea scurt").max(100),
  clientPhone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s().-]{9,20}$/, "Număr de telefon invalid"),
  clientEmail: z
    .string()
    .trim()
    .email("Email invalid")
    .max(200)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notes: z.string().trim().max(500).optional(),
});

// A slot the admin occupies by hand: the visitor's options, but contact
// details and level are optional so a slot can simply be blocked.
export const manualBookingSchema = z.object({
  serviceId: z.string().min(1),
  date: dateStr,
  startTime: timeStr,
  participants: z.number().int().min(1).max(20),
  // null = any number of strangers may join, 0 = none.
  maxStrangers: z.number().int().min(0).max(20).nullable(),
  level: z
    .enum(levelChoices, { errorMap: () => ({ message: "Nivel de joc invalid" }) })
    .optional()
    .or(z.literal("").transform(() => undefined)),
  children: z.array(childSchema).max(20).default([]),
  clientEmail: z
    .string()
    .trim()
    .email("Email invalid")
    .max(200)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  clientName: z.string().trim().max(100).default(""),
  clientPhone: z
    .string()
    .trim()
    .regex(/^(\+?[\d\s().-]{9,20})?$/, "Număr de telefon invalid")
    .default(""),
  notes: z.string().trim().max(500).optional(),
});

export const bookingStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED"]),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1),
});

export const priceTierSchema = z.object({
  price: z.number().int().min(0, "Prețul nu poate fi negativ").max(10000).nullable(),
});

// Admin: a slot's length; the default length clears the override.
export const slotLengthSchema = z.object({
  date: dateStr,
  startTime: timeStr,
  durationMin: z.union([z.literal(SESSION_LENGTHS[0]), z.literal(SESSION_LENGTHS[1])], {
    errorMap: () => ({ message: "Durata poate fi 60 sau 90 de minute" }),
  }),
});

export const serviceVenueSchema = z.object({
  isOffered: z.boolean(),
});

export const availabilityRuleCreateSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: timeStr,
    endTime: timeStr,
    serviceId: z.string({ invalid_type_error: "Alege cursul" }).min(1, "Alege cursul"),
    location: venue,
  })
  .refine((v) => v.startTime < v.endTime, {
    message: "Ora de început trebuie să fie înainte de ora de final",
    path: ["endTime"],
  });

export const exceptionCreateSchema = z
  .object({
    date: dateStr,
    isClosed: z.boolean(),
    startTime: timeStr.optional(),
    endTime: timeStr.optional(),
    location: venue.nullable().default(null),
    kidsOnly: z.boolean().default(false),
  })
  .refine(
    (v) => v.isClosed || (v.startTime && v.endTime && v.startTime < v.endTime),
    {
      message: "Intervalul orar este obligatoriu și trebuie să fie valid",
      path: ["endTime"],
    },
  )
  .refine((v) => v.isClosed || v.location, {
    message: "Alege locația",
    path: ["location"],
  });

export const availabilityRuleLocationSchema = z.object({ location: venue });

export const eventCreateSchema = z.object({
  title: z.string().trim().min(3, "Titlul este prea scurt").max(120),
  date: dateStr,
  startTime: timeStr.optional(),
  location: z.string().trim().min(2, "Completează locația").max(120),
  description: z.string().trim().min(1, "Completează descrierea").max(1000),
});

// Turns a zod error into a single readable message for the UI.
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Date invalide";
}

// Logo formats accepted for sponsors, and their size limit.
export const SPONSOR_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
export const SPONSOR_LOGO_MAX_BYTES = 2 * 1024 * 1024;

export const sponsorSchema = z.object({
  name: z.string().trim().min(1, "Completează numele sponsorului").max(80),
  url: z
    .string()
    .trim()
    .url("Link invalid (ex: https://exemplu.ro)")
    .max(300)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const sponsorMoveSchema = z.object({ direction: z.enum(["up", "down"]) });
