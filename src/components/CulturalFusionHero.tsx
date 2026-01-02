import { ReactNode } from "react";

interface CulturalFusionHeroProps {
  children: ReactNode;
  containerClassName?: string;
}

export default function CulturalFusionHero({
  children,
  containerClassName = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center",
}: CulturalFusionHeroProps) {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Layered background with cultural fusion design */}
      <div className="absolute inset-0 bg-hero-fusion" />
      <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
      <div className="absolute left-0 top-0 bottom-0 w-8 pattern-verdiblanco-subtle opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />

      {/* Content container */}
      <div className={`relative ${containerClassName}`}>{children}</div>
    </section>
  );
}
