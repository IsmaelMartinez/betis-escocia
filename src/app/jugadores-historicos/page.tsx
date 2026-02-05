"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Trophy, Heart, Play, Quote, BarChart3 } from "lucide-react";
import {
  LEYENDAS,
  ERA_CONFIG,
  ERA_ORDER,
  type PlayerEra,
  type Player,
} from "@/data/leyendas";

const ALL_FILTER = "todos" as const;
type EraFilter = PlayerEra | typeof ALL_FILTER;

const FILTER_OPTIONS: { value: EraFilter; label: string }[] = [
  { value: ALL_FILTER, label: "Todos" },
  ...ERA_ORDER.map((era) => ({ value: era, label: ERA_CONFIG[era].title })),
];

function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="group bg-white rounded-2xl shadow-xl border border-gray-100 hover:border-betis-verde transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 right-0 w-20 h-20 pattern-verdiblanco-diagonal-subtle opacity-20" />

      <div className="h-1 bg-gradient-to-r from-betis-verde via-betis-oro to-betis-verde" />

      <div className="relative p-6 sm:p-8 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display text-xl font-black text-scotland-navy uppercase tracking-tight">
              {player.name}
            </h3>
            <p className="font-heading text-sm text-betis-verde font-semibold">
              {player.position}
            </p>
          </div>
          <span className="inline-block bg-betis-verde text-white px-3 py-1 rounded-full font-heading font-bold text-xs whitespace-nowrap">
            {player.years}
          </span>
        </div>

        {/* Description */}
        <p className="font-body text-gray-700 text-sm leading-relaxed mb-4 flex-1">
          {player.description}
        </p>

        {/* Quote */}
        {player.quote && (
          <div className="mb-4 bg-betis-verde-pale rounded-xl px-4 py-3 flex items-start gap-2">
            <Quote className="h-4 w-4 text-betis-verde mt-0.5 flex-shrink-0" />
            <p className="font-accent text-sm italic text-betis-verde-dark">
              &ldquo;{player.quote}&rdquo;
            </p>
          </div>
        )}

        {/* Highlight */}
        <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-betis-oro flex-shrink-0" />
          <p className="font-heading text-sm font-semibold text-betis-verde-dark">
            {player.highlight}
          </p>
        </div>

        {/* Stats */}
        {player.stats && (
          <div className="mt-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <p className="font-heading text-xs text-gray-500">
              {player.stats}
            </p>
          </div>
        )}

        {/* Video Link */}
        <a
          href={`https://www.youtube.com/results?search_query=${player.videoSearchQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 bg-betis-verde hover:bg-betis-verde-dark text-white px-4 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wide transition-all duration-300 self-start"
        >
          <Play className="h-3.5 w-3.5" />
          Ver Vídeos
        </a>
      </div>
    </div>
  );
}

function EraHeader({
  title,
  subtitle,
  years,
}: {
  title: string;
  subtitle: string;
  years: string;
}) {
  return (
    <div className="text-center mb-10">
      <span className="inline-block bg-betis-oro/20 text-betis-verde-dark px-4 py-1 rounded-full font-heading font-bold text-xs uppercase tracking-widest mb-3">
        {years}
      </span>
      <h2 className="font-display text-3xl sm:text-4xl font-black text-scotland-navy uppercase tracking-tight mb-2">
        {title}
      </h2>
      <p className="font-body text-gray-600 text-lg max-w-2xl mx-auto">
        {subtitle}
      </p>
    </div>
  );
}

export default function JugadoresHistoricos() {
  const [activeEra, setActiveEra] = useState<EraFilter>(ALL_FILTER);

  const groups = ERA_ORDER.filter(
    (era) => activeEra === ALL_FILTER || era === activeEra
  )
    .map((era) => ({
      era,
      config: ERA_CONFIG[era],
      players: LEYENDAS.filter((p) => p.era === era),
    }))
    .filter((g) => g.players.length > 0);

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
              <Star className="inline h-4 w-4 text-betis-oro mr-1" />
              Jugadores Legendarios
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
            Leyendas Béticas
          </h1>

          <p className="font-accent text-2xl sm:text-3xl text-oro-bright mb-8 text-shadow-lg italic">
            Los jugadores que hicieron historia en el Villamarín
          </p>

          <p className="font-body text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            De los clásicos del 78 a los campeones de Copa del 2022. Un viaje
            por las leyendas que forjaron la historia del Real Betis Balompié.
          </p>
        </div>
      </section>

      {/* Era Filter Pills */}
      <section className="relative py-6 overflow-hidden">
        <div className="absolute inset-0 bg-canvas-warm" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActiveEra(opt.value)}
                className={`px-4 py-2 rounded-full font-heading font-bold text-sm transition-all duration-200 ${
                  activeEra === opt.value
                    ? "bg-betis-verde text-white shadow-lg"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-betis-verde hover:text-betis-verde"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grouped Players */}
      {groups.map(({ era, config, players }) => (
        <section key={era} className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-canvas-warm" />
          <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <EraHeader
              title={config.title}
              subtitle={config.subtitle}
              years={config.years}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {players.map((player) => (
                <PlayerCard key={player.name} player={player} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-fusion" />
        <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-black/15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-black mb-6 text-white drop-shadow-xl uppercase tracking-tight">
            Comparte la pasión bética con nosotros
          </h2>
          <p className="font-body text-xl mb-8 text-white/95 leading-relaxed drop-shadow-lg">
            Vive cada partido rodeado de béticos en Edimburgo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/unete"
              className="inline-flex items-center gap-3 bg-oro-bright hover:bg-oro-antique text-scotland-navy px-10 py-5 rounded-2xl font-display font-black text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] uppercase tracking-wide"
            >
              <Heart className="h-6 w-6" />
              Únete a Nosotros
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
