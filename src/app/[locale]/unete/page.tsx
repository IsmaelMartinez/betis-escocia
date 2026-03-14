import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MapPin, Clock, Users } from "lucide-react";
import { FeatureWrapper } from "@/lib/features/featureProtection";

export default async function Unete({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("join");

  return (
    <div className="min-h-screen">
      {/* Hero Section - Cultural Fusion Design */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-fusion" />
        <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
        <div className="absolute left-0 top-0 bottom-0 w-8 pattern-verdiblanco-subtle opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <span className="text-white font-heading font-medium text-sm tracking-wide">
              {t("badge")}
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
            {t("title")}
          </h1>

          <p className="font-accent text-2xl sm:text-3xl text-oro-bright mb-8 text-shadow-lg italic">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Main Content - 3 Simple Cards */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-canvas-warm" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Show Up */}
            <div className="group bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:border-betis-verde transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 pattern-verdiblanco-diagonal-subtle opacity-20" />
              <div className="relative">
                <div className="w-16 h-16 bg-betis-verde rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h2 className="font-display text-2xl font-black text-scotland-navy mb-4 uppercase tracking-tight">
                  {t("step1Title")}
                </h2>
                <div className="space-y-3 font-body text-gray-700">
                  <p className="font-bold text-betis-verde-dark">
                    {t("step1Venue")}
                  </p>
                  <p className="text-sm">
                    35 Polwarth Crescent
                    <br />
                    Edinburgh EH11 1HR
                  </p>
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-2 text-sm">
                      <Clock className="h-4 w-4 text-betis-verde mt-0.5 flex-shrink-0" />
                      <span>{t("step1Time")}</span>
                    </div>
                  </div>
                </div>
                <a
                  href="https://maps.google.com/maps?q=Polwarth+Tavern+Edinburgh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 bg-betis-verde hover:bg-betis-verde-dark text-white px-6 py-3 rounded-xl font-heading font-bold text-sm transition-all duration-300 transform hover:scale-105"
                >
                  <MapPin className="h-4 w-4" />
                  {t("step1Map")}
                </a>
              </div>
            </div>

            {/* Card 2: Connect Online */}
            <div className="group bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:border-betis-verde transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 pattern-tartan-subtle opacity-30" />
              <div className="relative">
                <div className="w-16 h-16 bg-betis-verde rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h2 className="font-display text-2xl font-black text-scotland-navy mb-4 uppercase tracking-tight">
                  {t("step2Title")}
                </h2>
                <p className="font-body text-gray-700 mb-6">
                  {t("step2Text")}
                </p>
                <div className="space-y-3">
                  <a
                    href="https://www.facebook.com/groups/beticosenescocia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-heading font-bold text-sm transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="text-xl">📘</span>
                    Facebook
                  </a>
                  <a
                    href="https://www.instagram.com/rbetisescocia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-heading font-bold text-sm transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="text-xl">📷</span>
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            {/* Card 3: That's It */}
            <div className="group bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:border-betis-oro transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 pattern-verdiblanco-diagonal-subtle opacity-20" />
              <div className="relative">
                <div className="w-16 h-16 bg-betis-oro rounded-full flex items-center justify-center mb-6 text-4xl group-hover:scale-110 transition-transform duration-300">
                  💚
                </div>
                <h2 className="font-display text-2xl font-black text-scotland-navy mb-4 uppercase tracking-tight">
                  {t("step3Title")}
                </h2>
                <div className="space-y-4 font-body text-gray-700">
                  <p className="font-semibold text-betis-verde-dark">
                    {t("step3Subtitle")}
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-betis-verde">✓</span>
                      <span>{t("step3Item1")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-betis-verde">✓</span>
                      <span>{t("step3Item2")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-betis-verde">✓</span>
                      <span>{t("step3Item3")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-betis-verde">✓</span>
                      <span>{t("step3Item4")}</span>
                    </li>
                  </ul>
                  <p className="text-sm italic pt-4 border-t border-gray-100">
                    {t("step3Closing")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-betis-verde-light" />
        <div className="absolute inset-0 pattern-verdiblanco-subtle opacity-30" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-xl font-bold text-betis-verde-dark mb-6 uppercase tracking-wide">
            {t("visitingTitle")}
          </h2>
          <p className="font-body text-lg text-gray-700 leading-relaxed">
            {t("visitingText")}
          </p>
        </div>
      </section>

      {/* Final CTA */}
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
            {t("ctaText")}
          </p>
          <FeatureWrapper feature="show-partidos">
            <Link
              href="/partidos"
              className="inline-flex items-center gap-3 bg-oro-bright hover:bg-oro-antique text-scotland-navy px-10 py-5 rounded-2xl font-display font-black text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] uppercase tracking-wide"
            >
              {t("ctaButton")}
            </Link>
          </FeatureWrapper>
        </div>
      </section>
    </div>
  );
}
