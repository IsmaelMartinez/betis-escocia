import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Heart, Users, Calendar } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { FeatureWrapper } from "@/lib/features/featureProtection";
import InfoCard from "@/components/InfoCard";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Nosotros({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <NosotrosContent />;
}

export function NosotrosContent() {
  const t = useTranslations("Nosotros");

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
              💚 {t("heroBadge")}
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
            {t("heroTitle")}
          </h1>

          <p className="font-accent text-2xl sm:text-3xl text-oro-bright mb-8 text-shadow-lg italic">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-canvas-warm" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InfoCard
              icon={<Heart className="h-8 w-8 text-white" />}
              title={t("origenesTitle")}
              hoverColor="betis-verde"
            >
              <p className="text-sm">
                <strong className="text-betis-verde-dark">
                  {t("origenesDate")}
                </strong>{" "}
                {t("origenesPara1Rest")}
              </p>
              <p className="text-sm">{t("origenesPara2")}</p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm italic text-betis-verde-dark">
                  {t("origenesQuote")}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {t("origenesQuoteAttribution")}
                </p>
              </div>
            </InfoCard>

            <InfoCard
              icon={<Users className="h-8 w-8 text-white" />}
              title={t("familiaTitle")}
              hoverColor="betis-verde"
              patternClass="pattern-tartan-subtle"
            >
              <p className="text-sm">
                {t("familiaPara1Pre")}
                <strong className="text-betis-verde-dark">
                  {t("familiaPara1Highlight")}
                </strong>
                {t("familiaPara1Post")}
              </p>
              <p className="text-sm">{t("familiaPara2")}</p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-semibold text-betis-verde-dark">
                  {t("familiaFooter")}
                </p>
              </div>
            </InfoCard>

            <InfoCard
              icon={<Calendar className="h-8 w-8 text-white" />}
              title={t("legadoTitle")}
              hoverColor="betis-oro"
              iconBgColor="bg-betis-oro"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="inline-block bg-betis-verde text-white px-2 py-1 rounded-full font-bold text-xs mt-0.5">
                    2010
                  </span>
                  <p className="text-sm flex-1">{t("legado2010")}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-block bg-betis-verde text-white px-2 py-1 rounded-full font-bold text-xs mt-0.5">
                    2015
                  </span>
                  <p className="text-sm flex-1">{t("legado2015")}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-block bg-betis-verde text-white px-2 py-1 rounded-full font-bold text-xs mt-0.5">
                    2018
                  </span>
                  <p className="text-sm flex-1">{t("legado2018")}</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm italic text-betis-verde-dark">
                    {t("legadoFooter")}
                  </p>
                </div>
              </div>
            </InfoCard>
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
            {t("ctaTitle")}
          </h2>
          <p className="font-body text-xl mb-8 text-white/95 leading-relaxed drop-shadow-lg">
            {t("ctaDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/unete"
              className="inline-flex items-center gap-3 bg-oro-bright hover:bg-oro-antique text-scotland-navy px-10 py-5 rounded-2xl font-display font-black text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] uppercase tracking-wide"
            >
              <Heart className="h-6 w-6" />
              {t("ctaJoin")}
            </Link>
            <FeatureWrapper feature="show-partidos">
              <Link
                href="/partidos"
                className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-2 border-white/30 px-10 py-5 rounded-2xl font-heading font-bold text-lg transition-all duration-300 transform hover:scale-105 uppercase tracking-wide"
              >
                <Calendar className="h-6 w-6" />
                {t("ctaMatches")}
              </Link>
            </FeatureWrapper>
          </div>
        </div>
      </section>
    </div>
  );
}
