import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  pathnames: {
    "/": "/",
    "/partidos": { es: "/partidos", en: "/matches" },
    "/clasificacion": { es: "/clasificacion", en: "/standings" },
    "/nosotros": { es: "/nosotros", en: "/about" },
    "/unete": { es: "/unete", en: "/join" },
    "/contacto": { es: "/contacto", en: "/contact" },
    "/jugadores-historicos": {
      es: "/jugadores-historicos",
      en: "/legends",
    },
    "/joaquin": "/joaquin",
    "/rsvp": "/rsvp",
    "/gdpr": "/gdpr",
    "/trivia": "/trivia",
    "/sign-in": "/sign-in",
    "/sign-up": "/sign-up",
    "/dashboard": "/dashboard",
    "/admin": "/admin",
  },
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];
