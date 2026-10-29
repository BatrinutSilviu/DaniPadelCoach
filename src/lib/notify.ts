import nodemailer from "nodemailer";
import type { Booking, BookingChild, Service } from "@prisma/client";
import { formatDateRo } from "@/lib/date";
import { contact, locations } from "@/lib/site";

type BookingWithDetails = Booking & { service: Service; children: BookingChild[] };

// Emails are disabled unless SMTP_HOST, SMTP_USER and SMTP_PASS are set.
function mailer() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(SMTP_PORT) || 465;
  return {
    from: SMTP_USER,
    transport: nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    }),
  };
}

// Emails the admin about every new booking; also needs NOTIFY_EMAIL.
export async function notifyNewBooking(booking: BookingWithDetails): Promise<void> {
  const mail = mailer();
  const { NOTIFY_EMAIL } = process.env;
  if (!mail || !NOTIFY_EMAIL) return;

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

  try {
    await mail.transport.sendMail({
      from: `"Programări padel" <${mail.from}>`,
      to: NOTIFY_EMAIL,
      replyTo: booking.clientEmail ?? undefined,
      subject: `Programare nouă: ${booking.clientName} – ${date}, ${booking.startTime}`,
      text: lines.join("\n"),
    });
  } catch (err) {
    console.error("Booking notification email failed:", err);
  }
}

// Emails to the player, sent only when they left an email address:
// received = right after booking, confirmed = when the admin confirms,
// reminder = at 10:00 on the day of the session.
export type ClientEmailKind = "received" | "confirmed" | "reminder";

const CLIENT_EMAILS: Record<ClientEmailKind, { subject: string; intro: string; outro: string }> = {
  received: {
    subject: "Am primit cererea ta de programare",
    intro: "Mulțumim! Am primit cererea ta de programare la antrenamentul de padel:",
    outro: "Dani te va contacta în curând pentru confirmare.",
  },
  confirmed: {
    subject: "Programarea ta este confirmată",
    intro: "Programarea ta la antrenamentul de padel este confirmată:",
    outro: "Te așteptăm pe teren!",
  },
  reminder: {
    subject: "Azi ai antrenament de padel",
    intro: "Îți reamintim că azi ai antrenament de padel:",
    outro: "Ne vedem pe teren!",
  },
};

// Returns whether the email was sent (false when it isn't needed or failed).
export async function emailClient(
  booking: Booking & { service: Service },
  kind: ClientEmailKind,
): Promise<boolean> {
  const mail = mailer();
  if (!mail || !booking.clientEmail) return false;

  const { subject, intro, outro } = CLIENT_EMAILS[kind];
  const mapsUrl = locations.find((l) => l.name === booking.location)?.mapsUrl;
  const lines = [
    `Bună, ${booking.clientName}!`,
    "",
    intro,
    "",
    `Curs: ${booking.service.name}`,
    `Data: ${formatDateRo(booking.date)}, ${booking.startTime}–${booking.endTime}`,
    `Locație: ${booking.location}${mapsUrl ? ` (${mapsUrl})` : ""}`,
    `Jucători: ${booking.participants}`,
    "",
    outro,
    `Dacă nu mai poți ajunge sau vrei să schimbi ceva, sună sau scrie-i lui Dani: ${contact.phoneDisplay} / WhatsApp https://wa.me/${contact.whatsappNumber}`,
    "",
    "Dani – Act!ve Padel Academy",
  ];

  try {
    await mail.transport.sendMail({
      from: `"Dani – antrenor padel" <${mail.from}>`,
      to: booking.clientEmail,
      subject: `${subject} – ${formatDateRo(booking.date)}, ${booking.startTime}`,
      text: lines.join("\n"),
    });
    return true;
  } catch (err) {
    console.error(`Client ${kind} email failed:`, err);
    return false;
  }
}
