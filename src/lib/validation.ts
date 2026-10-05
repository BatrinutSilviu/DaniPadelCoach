import { z } from "zod";
import { isValidDateStr, isValidTimeStr } from "@/lib/date";
import { locationChoices } from "@/lib/site";

const dateStr = z.string().refine(isValidDateStr, "Dată invalidă");
const timeStr = z.string().refine(isValidTimeStr, "Oră invalidă");

export const bookingCreateSchema = z.object({
  serviceId: z.string().min(1),
  date: dateStr,
  startTime: timeStr,
  location: z.enum(locationChoices),
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

export const availabilityRuleCreateSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: timeStr,
    endTime: timeStr,
    serviceId: z.string().min(1).nullable(),
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
  })
  .refine(
    (v) => v.isClosed || (v.startTime && v.endTime && v.startTime < v.endTime),
    {
      message: "Intervalul orar este obligatoriu și trebuie să fie valid",
      path: ["endTime"],
    },
  );

// Turns a zod error into a single readable message for the UI.
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Date invalide";
}
