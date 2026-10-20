// All editable site content lives here.

export const contact = {
  phoneDisplay: "0752 588 841",
  phoneHref: "tel:+40752588841",
  whatsappNumber: "40752588841",
  instagram: "https://www.instagram.com/dneamtiu/",
  facebook: "https://www.facebook.com/neamtiu.daniel",
};

export const navLinks = [
  { href: "#despre", label: "Despre Mine" },
  { href: "#preturi", label: "Prețuri" },
  { href: "#program", label: "Program" },
  { href: "#locatii", label: "Locații" },
];

// Course slugs match the Service rows seeded in prisma/seed.ts.
export type CourseSlug = "adulti" | "copii" | "privat";

export const locations = [
  {
    name: "Active Arena",
    area: "Timișoara, Zona Ronaț / Calea Torontalului",
    // Replace with the place's "Share" link from Google Maps for an exact pin.
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Active+Arena+Timi%C8%99oara",
    description:
      "Complex sportiv modern echipat cu terenuri panoramice indoor/outdoor, iluminat LED nocturn și facilități vestiar de top.",
    image:
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "X3 Padel",
    area: "Timișoara, Zona Girocului / Freidorf",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=X3+Padel+Timi%C8%99oara",
    description:
      "Bază dedicată pasionaților de padel cu mochetă profesională, acces facil și zonă de relaxare după meciuri.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
  },
];

export const venueNames = ["Active Arena", "X3 Padel"] as const;

export const levelChoices = ["Începător", "Intermediar", "Avansat"] as const;
// Players on one padel court.
export const MAX_PRIVATE_PARTICIPANTS = 4;
export const locationChoices = [...venueNames, "Oricare"] as const;

export type ScheduleDay = {
  id: string;
  label: string;
  sessions: {
    title: string;
    details: string;
    time: string;
  }[];
};

export const schedule: ScheduleDay[] = [
  {
    id: "luni",
    label: "Luni",
    sessions: [
      {
        title: "Antrenament Grupa Copii",
        details: "Active Arena • Inițiere & Tehnică",
        time: "17:00 - 18:30",
      },
      {
        title: "Antrenamente Adulți / Private",
        details: "Active Arena sau X3 Padel",
        time: "18:30 - 21:00",
      },
    ],
  },
  {
    id: "joi",
    label: "Joi",
    sessions: [
      {
        title: "Grupe Adulți Intermediari",
        details: "X3 Padel • Tactica de meci",
        time: "18:00 - 20:00",
      },
    ],
  },
  {
    id: "vineri",
    label: "Vineri",
    sessions: [
      {
        title: "Antrenament Copii",
        details: "Active Arena",
        time: "16:30 - 18:00",
      },
      {
        title: "Sesiuni Intensive 1-la-1",
        details: "Active Arena",
        time: "18:00 - 21:00",
      },
    ],
  },
  {
    id: "duminica",
    label: "Duminică",
    sessions: [
      {
        title: "Weekend Padel Clinic & Meciuri",
        details: "Active Arena / X3 Padel",
        time: "10:00 - 14:00",
      },
    ],
  },
];
