import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Play,
  Mic,
  Smartphone,
  Trophy,
  Heart,
  Star,
  Video,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

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
  titleKey: string;
  descriptionKey: string;
  videoSearchQuery: string;
  year: string;
}

const CATEGORY_CONFIG: Record<
  MomentCategory,
  { labelKey: string; color: string; textColor?: string }
> = {
  instagram: {
    labelKey: "categoryInstagram",
    color: "bg-betis-verde",
  },
  tv: { labelKey: "categoryTv", color: "bg-betis-verde-dark" },
  vestuario: { labelKey: "categoryVestuario", color: "bg-betis-verde" },
  prensa: { labelKey: "categoryPrensa", color: "bg-scotland-navy" },
  copa: {
    labelKey: "categoryCopa",
    color: "bg-betis-oro",
    textColor: "text-scotland-navy",
  },
  despedida: {
    labelKey: "categoryDespedida",
    color: "bg-betis-verde-dark",
  },
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
    titleKey: "moment1Title",
    descriptionKey: "moment1Description",
    videoSearchQuery: "joaquin+sanchez+instagram+directo+confinamiento+2020",
    year: "2020",
  },
  {
    id: 2,
    category: "tv",
    titleKey: "moment2Title",
    descriptionKey: "moment2Description",
    videoSearchQuery: "joaquin+sanchez+betis+hormiguero+pablo+motos",
    year: "2019",
  },
  {
    id: 3,
    category: "vestuario",
    titleKey: "moment3Title",
    descriptionKey: "moment3Description",
    videoSearchQuery: "joaquin+betis+vestuario+cumpleaños+tarta",
    year: "2018",
  },
  {
    id: 4,
    category: "prensa",
    titleKey: "moment4Title",
    descriptionKey: "moment4Description",
    videoSearchQuery: "joaquin+sanchez+rueda+prensa+betis+chistes",
    year: "2017",
  },
  {
    id: 5,
    category: "copa",
    titleKey: "moment5Title",
    descriptionKey: "moment5Description",
    videoSearchQuery: "joaquin+betis+copa+del+rey+2022+celebracion",
    year: "2022",
  },
  {
    id: 6,
    category: "despedida",
    titleKey: "moment6Title",
    descriptionKey: "moment6Description",
    videoSearchQuery: "joaquin+sanchez+despedida+betis+villamarin+2023",
    year: "2023",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Joaquin" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

function JokeCard({ moment }: { moment: JoaquinMoment }) {
  const t = useTranslations("Joaquin");
  const config = CATEGORY_CONFIG[moment.category];
  const textColor = config.textColor ?? "text-white";

  return (
    <div className="group bg-white rounded-2xl shadow-xl border border-gray-100 hover:border-betis-verde transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 right-0 w-24 h-24 pattern-verdiblanco-diagonal-subtle opacity-15" />

      <div className="h-1.5 bg-gradient-to-r from-betis-verde via-betis-oro to-betis-verde" />

      <div className="relative p-6 sm:p-8 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${config.color} ${textColor} text-xs font-heading font-bold uppercase tracking-wide`}
          >
            <CategoryIcon category={moment.category} />
            {t(config.labelKey)}
          </span>
          <span className="text-betis-oro font-display font-black text-lg">
            {moment.year}
          </span>
        </div>

        <h3 className="font-display text-xl sm:text-2xl font-black text-scotland-navy mb-4 uppercase tracking-tight group-hover:text-betis-verde-dark transition-colors">
          {t(moment.titleKey)}
        </h3>

        <p className="font-body text-gray-700 text-sm sm:text-base leading-relaxed mb-6 flex-1">
          {t(moment.descriptionKey)}
        </p>

        <a
          href={`https://www.youtube.com/results?search_query=${moment.videoSearchQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-betis-verde hover:bg-betis-verde-dark text-white px-5 py-3 rounded-xl font-heading font-bold text-sm uppercase tracking-wide transition-all duration-300 group-hover:shadow-lg self-start"
        >
          <Play className="h-4 w-4" />
          {t("videoLink")}
        </a>
      </div>
    </div>
  );
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function JoaquinPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <JoaquinContent />;
}

export function JoaquinContent() {
  const t = useTranslations("Joaquin");

  return (
    <div className="min-h-screen">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-fusion" />
        <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
        <div className="absolute left-0 top-0 bottom-0 w-8 pattern-verdiblanco-subtle opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <span className="text-white font-heading font-medium text-sm tracking-wide">
              {t("heroBadge")}
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
            {t("heroTitle")}
          </h1>

          <p className="font-accent text-2xl sm:text-3xl text-oro-bright mb-8 text-shadow-lg italic">
            {t("heroSubtitle")}
          </p>

          <p className="font-body text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            {t("heroDescription")}
          </p>
        </div>
      </section>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-canvas-warm" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-black text-scotland-navy uppercase tracking-tight mb-4">
              {t("momentsHeading")}
            </h2>
            <p className="font-body text-gray-600 text-lg max-w-2xl mx-auto">
              {t("momentsDescription")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOMENTS.map((moment) => (
              <JokeCard key={moment.id} moment={moment} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-fusion" />
        <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-black/15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-black mb-6 text-white drop-shadow-xl uppercase tracking-tight">
            {t("ctaHeading")}
          </h2>
          <p className="font-body text-xl mb-8 text-white/95 leading-relaxed drop-shadow-lg">
            {t("ctaDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.youtube.com/results?search_query=joaquin+sanchez+betis+mejores+momentos+humor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-oro-bright hover:bg-oro-antique text-scotland-navy px-10 py-5 rounded-2xl font-display font-black text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] uppercase tracking-wide"
            >
              <Play className="h-6 w-6" />
              {t("ctaYoutube")}
            </a>
            <Link
              href="/nosotros"
              className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-2 border-white/30 px-10 py-5 rounded-2xl font-heading font-bold text-lg transition-all duration-300 transform hover:scale-105 uppercase tracking-wide"
            >
              <Heart className="h-6 w-6" />
              {t("ctaAbout")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
