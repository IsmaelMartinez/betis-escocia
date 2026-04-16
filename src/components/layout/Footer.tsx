import { MapPin, MessageCircle, Camera, Hash, Video } from "lucide-react";
import BetisLogo from "@/components/BetisLogo";

const EXTERNAL_LINKS = [
  {
    href: "https://www.betisweb.com/foro/principal/betis-fan-s-of-the-universe/6621126-pena-betica-escocesa-no-busques-mas-que-no-hay",
    label: "BetisWeb Forum",
  },
  {
    href: "https://beticosenescocia.blogspot.com/",
    label: "Béticos en Escocia",
  },
  {
    href: "https://www.laliga.com/noticias/conoce-a-la-pena-betica-de-escocia-no-busques-mas-que-no-hay",
    label: "LaLiga",
  },
];

const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/groups/beticosenescocia/",
    icon: MessageCircle,
    label: "Facebook",
  },
  {
    href: "https://www.instagram.com/rbetisescocia/",
    icon: Camera,
    label: "Instagram",
  },
  {
    href: "https://x.com/rbetisescocia",
    icon: Hash,
    label: "X",
  },
  {
    href: "https://www.youtube.com/beticosenescocia",
    icon: Video,
    label: "YouTube",
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy-depth relative overflow-hidden">
      {/* Pattern overlay */}
      <div className="absolute inset-0 pattern-tartan-navy opacity-30 pointer-events-none" />

      {/* Verdiblanco top edge */}
      <div className="h-1 bg-gradient-to-r from-betis-verde via-betis-oro to-betis-verde" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <BetisLogo
                width={32}
                height={32}
                className="bg-white rounded-full p-0.5"
              />
              <h3 className="font-display text-xl font-black text-betis-oro">
                No busques más
              </h3>
            </div>
            <p className="font-accent text-betis-oro italic mb-3">que no hay</p>
            <p className="font-body text-gray-300 text-sm leading-relaxed">
              La peña del Real Betis en Edimburgo. Más de 15 años compartiendo
              la pasión bética en Escocia.
            </p>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4 text-betis-oro uppercase tracking-wide">
              Dónde estamos
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <MapPin
                  size={16}
                  className="text-betis-oro mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="font-heading font-semibold text-white">
                    The Polwarth Tavern
                  </p>
                  <p>35 Polwarth Cres</p>
                  <p>Edinburgh EH11 1HR</p>
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4 text-betis-oro uppercase tracking-wide">
              Enlaces
            </h3>
            <div className="space-y-2 text-sm">
              {EXTERNAL_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-betis-verde transition-colors font-body"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4 text-betis-oro uppercase tracking-wide">
              Síguenos
            </h3>
            <div className="flex flex-wrap gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/5 hover:bg-betis-verde/20 text-gray-300 hover:text-betis-verde rounded-lg transition-all"
                  title={social.label}
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <p className="text-gray-400 text-sm font-body text-center">
              © 2025 Peña Bética Escocesa.{" "}
              <span className="text-betis-oro">
                ¡Viva er Betis manque pierda!
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
