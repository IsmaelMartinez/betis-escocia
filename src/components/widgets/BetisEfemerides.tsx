"use client";

import { useState, useEffect } from "react";
import {
  getEfemeridesForDate,
  getCategoryEmoji,
  getCategoryLabel,
  type Efemeride,
} from "@/data/efemerides";

function formatDateSpanish(date: Date): string {
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  return `${date.getDate()} de ${months[date.getMonth()]}`;
}

function EfemerideCard({ efemeride }: { efemeride: Efemeride }) {
  const emoji = getCategoryEmoji(efemeride.category);
  const label = getCategoryLabel(efemeride.category);

  return (
    <div className="relative">
      {/* Category badge */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-betis-verde/10 border border-betis-verde/20 text-sm font-heading font-semibold text-betis-verde-dark"
          role="note"
        >
          <span aria-hidden="true">{emoji}</span>
          {label}
        </span>
        {efemeride.year > 0 && (
          <span className="text-sm font-heading font-bold text-betis-oro">
            {efemeride.year}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display text-xl sm:text-2xl font-black text-scotland-navy mb-3 uppercase tracking-tight leading-tight">
        {efemeride.title}
      </h3>

      {/* Description - the chanante part */}
      <p className="font-body text-base text-gray-700 leading-relaxed">
        {efemeride.description}
      </p>
    </div>
  );
}

export default function BetisEfemerides() {
  const [efemerides, setEfemerides] = useState<Efemeride[]>([]);
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const today = new Date();
    setEfemerides(getEfemeridesForDate(today));
    setDateStr(formatDateSpanish(today));
  }, []);

  if (efemerides.length === 0) {
    return null;
  }

  return (
    <div
      className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      role="region"
      aria-label="Tal día como hoy en la historia del Betis"
    >
      {/* Decorative pattern corner */}
      <div className="absolute top-0 right-0 w-24 h-24 pattern-verdiblanco-diagonal-subtle opacity-20" />
      <div className="absolute bottom-0 left-0 w-16 h-16 pattern-verdiblanco-diagonal-subtle opacity-10" />

      {/* Header bar */}
      <div className="bg-gradient-to-r from-betis-verde to-betis-verde-dark px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-accent text-xs sm:text-sm text-white/80 uppercase tracking-widest">
              Tal día como hoy
            </p>
            <p className="font-display text-lg sm:text-xl font-black text-white uppercase tracking-tight">
              {dateStr}
            </p>
          </div>
          <div className="text-3xl sm:text-4xl" aria-hidden="true">
            📜
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative px-6 py-5">
        <div className="space-y-6">
          {efemerides.map((efemeride, index) => (
            <EfemerideCard key={index} efemeride={efemeride} />
          ))}
        </div>

        {/* Footer tagline */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="font-body text-xs text-gray-400 italic text-center">
            Historia del Real Betis Balompie &middot; Manque pierda
          </p>
        </div>
      </div>
    </div>
  );
}
