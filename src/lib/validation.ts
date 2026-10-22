import { z } from "zod";
import { isValidDateStr, isValidTimeStr } from "@/lib/date";
import { levelChoices, venueNames } from "@/lib/site";

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
  openToOthers: z.boolean(),
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

export const bookingStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED"]),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1),
});

export const priceTierSchema = z.object({
  price: z.number().int().min(0, "Prețul nu poate fi negativ").max(10000).nullable(),
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
