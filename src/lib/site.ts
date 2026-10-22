// All editable site content lives here.

export const contact = {
  phoneDisplay: "0752 588 841",
  phoneHref: "tel:+40752588841",
  whatsappNumber: "40752588841",
  instagram: "https://www.instagram.com/dneamtiu/",
  facebook: "https://www.facebook.com/neamtiu.daniel",
};

// The Act!ve Timișoara community the academy belongs to.
export const community = {
  instagram: "https://www.instagram.com/activetimisoara/",
  padelSite: "https://padel.activetimisoara.ro/",
  website: "https://activetimisoara.ro/ro/",
};

export const navLinks = [
  { href: "#despre", label: "Despre Mine" },
  { href: "#preturi", label: "Tarife" },
  { href: "#locatii", label: "Locații" },
  { href: "#evenimente", label: "Evenimente" },
];

// Course slugs match the Service rows seeded in prisma/seed.ts.
export type CourseSlug = "adulti" | "copii";

export const locations = [
  {
    name: "Active Arena",
    area: "Strada Nucului 37, Chișoda, jud. Timiș",
    // Replace with the place's "Share" link from Google Maps for an exact pin.
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Active+Arena+Timi%C8%99oara",
    // White logo, shown on the dark card header.
    logo: "/logos/active-arena.svg",
  },
  {
    name: "X3 Padel",
    area: "Strada Ovidiu Cotruș 1-3, Timișoara (Freidorf)",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=X3+Padel+Timi%C8%99oara",
    logo: "/logos/x3-padel.svg",
  },
];

export const venueNames = ["Active Arena", "X3 Padel"] as const;

export const levelChoices = ["Începător", "Intermediar", "Avansat"] as const;
// Players on one padel court.
export const MAX_PRIVATE_PARTICIPANTS = 4;
