import nodemailer from "nodemailer";
import type { Booking, BookingChild, Service } from "@prisma/client";
import { formatDateRo } from "@/lib/date";

type BookingWithDetails = Booking & { service: Service; children: BookingChild[] };

// Emails the admin about every new booking. Disabled unless SMTP_HOST,
// SMTP_USER, SMTP_PASS and NOTIFY_EMAIL are all set.
export async function notifyNewBooking(booking: BookingWithDetails): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !NOTIFY_EMAIL) return;

  const date = formatDateRo(booking.date);
  const lines = [
    `Curs: ${booking.service.name}`,
    `Data: ${date}, ${booking.startTime}–${booking.endTime}`,
    `Locație: ${booking.location}`,
    `Client: ${booking.clientName}`,
    `Telefon: ${booking.clientPhone}`,
    `Jucători: ${booking.participants}`,
  ];
  if (booking.forKids && booking.children.length > 0) {
    lines.push(`Copii: ${booking.children.map((c) => `${c.name} (${c.age} ani)`).join(", ")}`);
  }
  if (booking.level) lines.push(`Nivel: ${booking.level}`);
  if (booking.clientEmail) lines.push(`Email: ${booking.clientEmail}`);
  if (booking.notes) lines.push(`Observații: ${booking.notes}`);

  const port = Number(SMTP_PORT) || 465;
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transport.sendMail({
      from: `"Programări Padel" <${SMTP_USER}>`,
      to: NOTIFY_EMAIL,
      replyTo: booking.clientEmail ?? undefined,
      subject: `Programare nouă: ${booking.clientName} – ${date}, ${booking.startTime}`,
      text: lines.join("\n"),
    });
  } catch (err) {
    console.error("Booking notification email failed:", err);
  }
}
