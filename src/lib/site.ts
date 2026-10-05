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
  { href: "#cursuri", label: "Cursuri" },
  { href: "#locatii", label: "Locații" },
  { href: "#program", label: "Program" },
  { href: "#galerie", label: "Galerie" },
];

// Course slugs match the Service rows seeded in prisma/seed.ts.
export type CourseSlug = "adulti" | "copii" | "privat";

export const locations = [
  {
    name: "Active Arena",
    badge: "Baza Principală",
    area: "Timișoara, Zona Ronaț / Calea Torontalului",
    description:
      "Complex sportiv modern echipat cu terenuri panoramice indoor/outdoor, iluminat LED nocturn și facilități vestiar de top.",
    image:
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "X3 Padel",
    badge: "Baza Parteneră",
    area: "Timișoara, Zona Girocului / Freidorf",
    description:
      "Bază dedicată pasionaților de padel cu mochetă profesională, acces facil și zonă de relaxare după meciuri.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
  },
];

export const locationChoices = ["Active Arena", "X3 Padel", "Oricare"] as const;

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

export const gallery = [
  {
    src: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80",
    alt: "Antrenament Padel",
    caption: "Lovituri de smash & tehnică",
  },
  {
    src: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80",
    alt: "Antrenament Copii Padel",
    caption: "Grupa de Copii Act!ve",
  },
  {
    src: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80",
    alt: "Teren Padel Timișoara",
    caption: "Baza Active Arena",
  },
];
