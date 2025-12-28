"use client";

import { ReactNode } from "react";

/**
 * Pattern types available in the design system
 */
export type PatternType =
  | "verdiblanco"
  | "verdiblanco-subtle"
  | "verdiblanco-whisper"
  | "verdiblanco-diagonal"
  | "tartan-subtle"
  | "tartan-medium"
  | "tartan-navy"
  | "celtic-grid"
  | "edinburgh-mist"
  | "stadium-atmosphere"
  | "oro-glow"
  | "navy-depth"
  | "hero-fusion"
  | "warm-canvas"
  | "hero-layered"
  | "card-cultural"
  | "none";

/**
 * Mapping of pattern types to CSS classes
 */
const patternClasses: Record<PatternType, string> = {
  verdiblanco: "pattern-verdiblanco",
  "verdiblanco-subtle": "pattern-verdiblanco-subtle",
  "verdiblanco-whisper": "pattern-verdiblanco-whisper",
  "verdiblanco-diagonal": "pattern-verdiblanco-diagonal-subtle",
  "tartan-subtle": "pattern-tartan-subtle",
  "tartan-medium": "pattern-tartan-medium",
  "tartan-navy": "pattern-tartan-navy",
  "celtic-grid": "pattern-celtic-grid",
  "edinburgh-mist": "bg-edinburgh-mist",
  "stadium-atmosphere": "bg-stadium-atmosphere",
  "oro-glow": "bg-oro-glow",
  "navy-depth": "bg-navy-depth",
  "hero-fusion": "bg-hero-fusion",
  "warm-canvas": "bg-warm-canvas",
  "hero-layered": "pattern-hero-layered",
  "card-cultural": "pattern-card-cultural",
  none: "",
};

export interface PatternBackgroundProps {
  /** The pattern to apply */
  readonly pattern?: PatternType;
  /** Additional patterns to layer (applied as additional classes) */
  readonly overlayPatterns?: PatternType[];
  /** Children to render inside the patterned container */
  readonly children?: ReactNode;
  /** Additional CSS classes */
  readonly className?: string;
  /** Whether the pattern should be absolute positioned as an overlay */
  readonly asOverlay?: boolean;
  /** HTML tag to use */
  readonly as?: "div" | "section" | "article" | "aside" | "header" | "footer";
}

/**
 * PatternBackground - A reusable component for applying cultural patterns
 *
 * The Peña Bética Escocesa design system includes patterns that represent
 * both Real Betis (verdiblanco stripes) and Scottish (tartan) heritage.
 *
 * @example
 * // Simple pattern background
 * <PatternBackground pattern="verdiblanco-subtle">
 *   <h1>Welcome</h1>
 * </PatternBackground>
 *
 * @example
 * // Layered patterns
 * <PatternBackground
 *   pattern="edinburgh-mist"
 *   overlayPatterns={['tartan-subtle', 'verdiblanco-whisper']}
 * >
 *   <HeroContent />
 * </PatternBackground>
 *
 * @example
 * // As an overlay
 * <div className="relative">
 *   <img src="..." />
 *   <PatternBackground pattern="tartan-subtle" asOverlay />
 * </div>
 */
export default function PatternBackground({
  pattern = "none",
  overlayPatterns = [],
  children,
  className = "",
  asOverlay = false,
  as: Component = "div",
}: PatternBackgroundProps) {
  const patternClass = patternClasses[pattern];
  const overlayClasses = overlayPatterns
    .map((p) => patternClasses[p])
    .filter(Boolean)
    .join(" ");

  if (asOverlay) {
    return (
      <div
        className={`absolute inset-0 pointer-events-none ${patternClass} ${overlayClasses} ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <Component className={`${patternClass} ${overlayClasses} ${className}`}>
      {children}
    </Component>
  );
}

/**
 * VerdiblancoBorder - Adds a verdiblanco stripe border to the left of content
 */
export function VerdiblancoBorder({
  children,
  className = "",
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <div className={`pattern-verdiblanco-edge-left ${className}`}>
      {children}
    </div>
  );
}

/**
 * TicketEdge - Adds a perforated ticket-style edge to content
 */
export function TicketEdge({
  children,
  className = "",
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return <div className={`pattern-ticket-edge ${className}`}>{children}</div>;
}

/**
 * HeroBackground - Pre-configured pattern background for hero sections
 */
export function HeroBackground({
  children,
  className = "",
  variant = "fusion",
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly variant?: "fusion" | "mist" | "stadium";
}) {
  const variantClasses = {
    fusion: "bg-hero-fusion pattern-tartan-subtle",
    mist: "bg-edinburgh-mist pattern-verdiblanco-whisper",
    stadium: "bg-stadium-atmosphere pattern-tartan-subtle",
  };

  return (
    <section
      className={`relative overflow-hidden ${variantClasses[variant]} ${className}`}
    >
      {/* Gold accent glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-oro-glow rounded-full blur-3xl pointer-events-none" />
      <div className="relative">{children}</div>
    </section>
  );
}

/**
 * CulturalCard - A card with subtle cultural pattern background
 */
export function CulturalCard({
  children,
  className = "",
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <div
      className={`pattern-card-cultural rounded-2xl border border-gray-200 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}
