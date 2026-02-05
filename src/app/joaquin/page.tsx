import type { Metadata } from "next";
import Link from "next/link";
import {
  Play,
  Mic,
  Smartphone,
  Trophy,
  Heart,
  Star,
  Video,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Chistes de Joaquín",
  description:
    "Los mejores momentos y chistes de Joaquín Sánchez, leyenda del Real Betis. El hombre que convirtió cada rueda de prensa en un show de comedia.",
};

type MomentCategory =
  | "instagram"
  | "tv"
  | "vestuario"
  | "prensa"
  | "copa"
  | "despedida";

interface JoaquinMoment {
  id: number;
  category: MomentCategory;
  title: string;
  description: string;
  videoSearchQuery: string;
  year: string;
}

const CATEGORY_CONFIG: Record<
  MomentCategory,
  { label: string; color: string }
> = {
  instagram: { label: "Instagram Live", color: "bg-betis-verde" },
  tv: { label: "Televisión", color: "bg-betis-verde-dark" },
  vestuario: { label: "Vestuario", color: "bg-betis-verde" },
  prensa: { label: "Rueda de Prensa", color: "bg-scotland-navy" },
  copa: { label: "Copa del Rey", color: "bg-betis-oro" },
  despedida: { label: "Despedida", color: "bg-betis-verde-dark" },
};

function CategoryIcon({ category }: { category: MomentCategory }) {
  const iconClass = "h-4 w-4";
  switch (category) {
    case "instagram":
      return <Smartphone className={iconClass} />;
    case "tv":
      return <Video className={iconClass} />;
    case "vestuario":
      return <Star className={iconClass} />;
    case "prensa":
      return <Mic className={iconClass} />;
    case "copa":
      return <Trophy className={iconClass} />;
    case "despedida":
      return <Heart className={iconClass} />;
  }
}

const MOMENTS: JoaquinMoment[] = [
  {
    id: 1,
    category: "instagram",
    title: "El Rey del Confinamiento",
    description:
      "Durante el confinamiento de 2020, Joaquín se convirtió en el showman de España con sus directos de Instagram. Cientos de miles de personas conectaban cada noche para escuchar sus historias del vestuario, imitaciones de compañeros y chistes sobre la vida en cuarentena. Batió todos los récords de audiencia en España.",
    videoSearchQuery: "joaquin+sanchez+instagram+directo+confinamiento+2020",
    year: "2020",
  },
  {
    id: 2,
    category: "tv",
    title: "El Hormiguero",
    description:
      "Cada visita de Joaquín a El Hormiguero era un espectáculo. Pablo Motos no podía parar de reír. Desde imitaciones de compañeros hasta anécdotas del vestuario del Betis, Joaquín convertía cada entrevista en un monólogo de comedia que se hacía viral al instante.",
    videoSearchQuery: "joaquin+sanchez+betis+hormiguero+pablo+motos",
    year: "2019",
  },
  {
    id: 3,
    category: "vestuario",
    title: "Los Cumpleaños del Vestuario",
    description:
      "Ningún compañero se libraba de las celebraciones de cumpleaños made in Joaquín. Armado con una tarta y ganas de jaleo, sus emboscadas en el vestuario se compartían miles de veces en redes sociales. El equipo de comunicación del Betis lo sabía: Joaquín + cumpleaños = contenido viral garantizado.",
    videoSearchQuery: "joaquin+betis+vestuario+cumpleaños+tarta",
    year: "2018",
  },
  {
    id: 4,
    category: "prensa",
    title: "Ruedas de Prensa Memorables",
    description:
      "Los periodistas contaban los días para poder entrevistar a Joaquín. Sus ruedas de prensa eran más entretenidas que muchos shows de comedia. Lo que empezaba como análisis táctico terminaba siempre en carcajadas generales, con los reporteros luchando por mantener la compostura.",
    videoSearchQuery: "joaquin+sanchez+rueda+prensa+betis+chistes",
    year: "2017",
  },
  {
    id: 5,
    category: "copa",
    title: "Campeón con Cachondeo",
    description:
      "Cuando el Betis levantó la Copa del Rey en 2022 tras ganar al Valencia en los penaltis, Joaquín estaba en el centro de la fiesta. Con 40 años, bailando en el bus descapotable por Sevilla, micrófono en mano, liderando a medio millón de béticos en cantos y cánticos. Demostró que se puede levantar un título y hacer stand-up al mismo tiempo.",
    videoSearchQuery: "joaquin+betis+copa+del+rey+2022+celebracion",
    year: "2022",
  },
  {
    id: 6,
    category: "despedida",
    title: "La Despedida del Leyenda",
    description:
      "Su ceremonia de despedida en el Villamarín en junio de 2023 fue puro Joaquín. 60.000 personas vinieron a decir adiós, y ni en su momento más emotivo pudo evitar hacer reír a todo el estadio. Una carrera que terminó exactamente como debía: entre lágrimas de emoción y carcajadas.",
    videoSearchQuery: "joaquin+sanchez+despedida+betis+villamarin+2023",
    year: "2023",
  },
];

function JokeCard({ moment }: { moment: JoaquinMoment }) {
  const config = CATEGORY_CONFIG[moment.category];
  const textColor = config.textColor ?? "text-white";

  return (
    <div className="group bg-white rounded-2xl shadow-xl border border-gray-100 hover:border-betis-verde transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden flex flex-col">
      {/* Pattern overlay */}
      <div className="absolute top-0 right-0 w-24 h-24 pattern-verdiblanco-diagonal-subtle opacity-15" />

      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-betis-verde via-betis-oro to-betis-verde" />

      <div className="relative p-6 sm:p-8 flex flex-col flex-1">
        {/* Category + Year badges */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${config.color} ${textColor} text-xs font-heading font-bold uppercase tracking-wide`}
          >
            <CategoryIcon category={moment.category} />
            {config.label}
          </span>
          <span className="text-betis-oro font-display font-black text-lg">
            {moment.year}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display text-xl sm:text-2xl font-black text-scotland-navy mb-4 uppercase tracking-tight group-hover:text-betis-verde-dark transition-colors">
          {moment.title}
        </h2>

        {/* Description */}
        <p className="font-body text-gray-700 text-sm sm:text-base leading-relaxed mb-6 flex-1">
          {moment.description}
        </p>

        {/* Video link */}
        <a
          href={`https://www.youtube.com/results?search_query=${moment.videoSearchQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-betis-verde hover:bg-betis-verde-dark text-white px-5 py-3 rounded-xl font-heading font-bold text-sm uppercase tracking-wide transition-all duration-300 group-hover:shadow-lg self-start"
        >
          <Play className="h-4 w-4" />
          Ver Vídeos
        </a>
      </div>
    </div>
  );
}

export default function JoaquinPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-fusion" />
        <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
        <div className="absolute left-0 top-0 bottom-0 w-8 pattern-verdiblanco-subtle opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <span className="text-white font-heading font-medium text-sm tracking-wide">
              El humor de una leyenda
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
            Los Chistes de Joaquín
          </h1>

          <p className="font-accent text-2xl sm:text-3xl text-oro-bright mb-8 text-shadow-lg italic">
            El hombre que convirtió el fútbol en comedia
          </p>

          <p className="font-body text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            Joaquín Sánchez no solo fue uno de los mejores jugadores de la
            historia del Real Betis — fue el alma de la fiesta. Durante más de
            20 años, convirtió cada vestuario, cada rueda de prensa y cada
            entrevista en un espectáculo de humor único en el mundo del fútbol.
          </p>
        </div>
      </section>

      {/* Moments Grid */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-canvas-warm" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-black text-scotland-navy uppercase tracking-tight mb-4">
              Momentos Memorables
            </h2>
            <p className="font-body text-gray-600 text-lg max-w-2xl mx-auto">
              Un repaso a los momentos más divertidos de la leyenda del Betis.
              Cada uno con enlace a vídeo para que lo vivas de primera mano.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOMENTS.map((moment) => (
              <JokeCard key={moment.id} moment={moment} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-fusion" />
        <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-black/15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-black mb-6 text-white drop-shadow-xl uppercase tracking-tight">
            ¡Viva er Betis manque pierda!
          </h2>
          <p className="font-body text-xl mb-8 text-white/95 leading-relaxed drop-shadow-lg">
            Joaquín nos enseñó que ser del Betis es mucho más que fútbol. Es
            reírse, llorar, celebrar y siempre, siempre, volver.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.youtube.com/results?search_query=joaquin+sanchez+betis+mejores+momentos+humor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-oro-bright hover:bg-oro-antique text-scotland-navy px-10 py-5 rounded-2xl font-display font-black text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] uppercase tracking-wide"
            >
              <Play className="h-6 w-6" />
              Más Vídeos en YouTube
            </a>
            <Link
              href="/nosotros"
              className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-2 border-white/30 px-10 py-5 rounded-2xl font-heading font-bold text-lg transition-all duration-300 transform hover:scale-105 uppercase tracking-wide"
            >
              <Heart className="h-6 w-6" />
              Nuestra Historia
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
