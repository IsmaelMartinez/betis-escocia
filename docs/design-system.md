# Peña Bética Escocesa - Design System v2.0

> **For AI Agents**: This document is the single source of truth for all visual design decisions. Follow these guidelines strictly when creating or modifying any UI components.

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Design Philosophy](#design-philosophy)
3. [Color Palette](#color-palette)
4. [Typography System](#typography-system)
5. [Pattern Library](#pattern-library)
6. [Components](#components)
7. [Layout Guidelines](#layout-guidelines)
8. [Accessibility](#accessibility)
9. [Critical Rules for AI Agents](#for-ai-agents---critical-rules)

---

## Brand Identity

### Logo Elements

Our logo combines three key elements:

- **Scottish Saltire**: Navy blue St. Andrew's Cross background
- **Betis Verdiblanco**: Green and white vertical stripes
- **Scottish Thistle**: Traditional Scottish symbol in navy

This fusion represents our unique identity as a Real Betis supporters club in Scotland.

### Design Principles (v2.0)

1. **Heritage as Texture, Not Decoration** - Cultural patterns appear as subtle background textures
2. **Functional Core, Emotional Surface** - Modern information architecture with warm visual treatment
3. **Progressive Enhancement** - Basic info always clear; cultural richness rewards exploration
4. **Mobile-First Reality** - Patterns scale down gracefully on smaller screens
5. **Consistent Token System** - Single source of truth cascading to all contexts

### Tone of Voice

- **Language**: Spanish primary, English secondary
- **Style**: Friendly, family-oriented, welcoming
- **Character**: Passionate but humble, proud but inclusive

---

## Design Philosophy

### "El Tercio Nuevo" Approach

Our design system v2.0 implements a hybrid approach called "El Tercio Nuevo" that combines:

| Element        | Approach             | Implementation                                       |
| -------------- | -------------------- | ---------------------------------------------------- |
| Layout         | Modern, mobile-first | Clean grids, clear navigation                        |
| Surface Design | Heritage patterns    | Verdiblanco stripes, tartan textures                 |
| Color Warmth   | Warm undertones      | Canvas colors instead of pure white                  |
| Typography     | Editorial hierarchy  | Display fonts for impact, body fonts for readability |
| Boldness       | Confident statements | Large headlines on heroes                            |

---

## Color Palette

### Tier 1: Core Brand Colors

| Token             | CSS Variable          | Hex       | RGB                | Usage                               |
| ----------------- | --------------------- | --------- | ------------------ | ----------------------------------- |
| Betis Verde       | `--betis-verde`       | `#048D47` | rgb(4, 141, 71)    | Primary brand color, buttons, links |
| Betis Verde Dark  | `--betis-verde-dark`  | `#036B38` | rgb(3, 107, 56)    | Hover states, headers               |
| Betis Verde Light | `--betis-verde-light` | `#E8F5ED` | rgb(232, 245, 237) | Light backgrounds                   |
| Betis Verde Pale  | `--betis-verde-pale`  | `#F0F9F4` | rgb(240, 249, 244) | Very subtle backgrounds             |
| Scotland Navy     | `--scotland-navy`     | `#0B1426` | rgb(11, 20, 38)    | Footer, dark sections               |
| Scotland Blue     | `--scotland-blue`     | `#005EB8` | rgb(0, 94, 184)    | Scottish accents                    |
| Betis Oro         | `--betis-oro`         | `#D4AF37` | rgb(212, 175, 55)  | CTAs, highlights                    |
| Betis Oro Dark    | `--betis-oro-dark`    | `#B8960F` | rgb(184, 150, 15)  | Hover states                        |
| Betis Oro Light   | `--betis-oro-light`   | `#F5E6B3` | rgb(245, 230, 179) | Light gold backgrounds              |

### Tier 2: Extended Palette (v2.0)

| Token              | CSS Variable           | Hex       | Usage                 |
| ------------------ | ---------------------- | --------- | --------------------- |
| Verdiblanco Stripe | `--verdiblanco-stripe` | `#048D47` | Pattern stripes       |
| Oro Bright         | `--oro-bright`         | `#FFD700` | High-impact gold      |
| Oro Antique        | `--oro-antique`        | `#C9A227` | Warm gold             |
| Scotland Slate     | `--scotland-slate`     | `#1E2A3A` | Dark UI elements      |
| Scotland Mist      | `--scotland-mist`      | `#E8ECF0` | Light atmospheric     |
| Scotland Stone     | `--scotland-stone`     | `#9CA3AF` | Neutral accent        |
| Canvas Warm        | `--canvas-warm`        | `#FDFBF7` | Warm white background |
| Canvas Cream       | `--canvas-cream`       | `#FAF8F5` | Cream background      |

### Tier 3: Semantic Colors

| Token           | CSS Variable        | Hex                  | Usage                |
| --------------- | ------------------- | -------------------- | -------------------- |
| Match Live      | `--match-live`      | `#EF4444`            | Live match indicator |
| Match Upcoming  | `--match-upcoming`  | `var(--betis-verde)` | Upcoming matches     |
| Match Finished  | `--match-finished`  | `#6B7280`            | Past matches         |
| Match Postponed | `--match-postponed` | `#F59E0B`            | Postponed matches    |
| Status Success  | `--status-success`  | `#059669`            | Success messages     |
| Status Warning  | `--status-warning`  | `#D97706`            | Warnings             |
| Status Error    | `--status-error`    | `#DC2626`            | Errors               |
| Status Info     | `--status-info`     | `#2563EB`            | Information          |

---

## Typography System

### Font Families (v2.0)

| Family  | CSS Variable     | Fonts                         | Usage                       |
| ------- | ---------------- | ----------------------------- | --------------------------- |
| Display | `--font-display` | Big Shoulders Display, Oswald | Heroes, impact headlines    |
| Heading | `--font-heading` | Source Sans 3                 | Section headers, navigation |
| Body    | `--font-body`    | Source Sans 3                 | Body text, paragraphs       |
| Mono    | `--font-mono`    | JetBrains Mono, Geist Mono    | Scores, data, code          |
| Accent  | `--font-accent`  | Cinzel                        | Taglines, special headers   |

### Typography Classes

```css
.font-display  /* Impact headlines, hero text */
.font-heading  /* Section titles, navigation */
.font-body     /* Body text, descriptions */
.font-accent   /* Taglines, ceremonial text */
```

### Font Scale

| Token | CSS Variable  | Size            | Usage            |
| ----- | ------------- | --------------- | ---------------- |
| xs    | `--text-xs`   | 0.75rem (12px)  | Labels, captions |
| sm    | `--text-sm`   | 0.875rem (14px) | Secondary text   |
| base  | `--text-base` | 1rem (16px)     | Body text        |
| lg    | `--text-lg`   | 1.125rem (18px) | Lead paragraphs  |
| xl    | `--text-xl`   | 1.25rem (20px)  | Section titles   |
| 2xl   | `--text-2xl`  | 1.5rem (24px)   | Card headings    |
| 3xl   | `--text-3xl`  | 1.875rem (30px) | Page subtitles   |
| 4xl   | `--text-4xl`  | 2.25rem (36px)  | Page titles      |
| 5xl   | `--text-5xl`  | 3rem (48px)     | Hero headlines   |
| 6xl   | `--text-6xl`  | 3.75rem (60px)  | Large heroes     |
| 7xl   | `--text-7xl`  | 4.5rem (72px)   | Maximum impact   |

### Typography Examples

```html
<!-- Hero headline -->
<h1 class="font-display text-6xl font-black text-scotland-navy">
  NO BUSQUES MÁS
</h1>

<!-- Tagline -->
<p class="font-accent text-betis-oro italic">que no hay</p>

<!-- Body text -->
<p class="font-body text-base text-gray-700">
  Más de 15 años compartiendo la pasión...
</p>

<!-- Navigation link -->
<a class="font-heading font-semibold uppercase tracking-wide"> Partidos </a>
```

---

## Pattern Library

### Verdiblanco Patterns (Betis Identity)

| Class                            | Description                | Usage               |
| -------------------------------- | -------------------------- | ------------------- |
| `.pattern-verdiblanco`           | Full stripe pattern (20px) | Decorative elements |
| `.pattern-verdiblanco-narrow`    | Narrow stripes (10px)      | Compact spaces      |
| `.pattern-verdiblanco-subtle`    | 8% opacity stripes         | Card backgrounds    |
| `.pattern-verdiblanco-whisper`   | 3% opacity stripes         | Large area textures |
| `.pattern-verdiblanco-diagonal`  | 45° diagonal               | Feature sections    |
| `.pattern-verdiblanco-edge-left` | Left edge accent           | Cards, containers   |

### Scottish Patterns (Cultural Bridge)

| Class                    | Description         | Usage               |
| ------------------------ | ------------------- | ------------------- |
| `.pattern-tartan-subtle` | Light crosshatch    | Section backgrounds |
| `.pattern-tartan-medium` | Medium crosshatch   | Feature areas       |
| `.pattern-tartan-navy`   | Light lines on dark | Dark sections       |
| `.pattern-celtic-grid`   | Grid lines          | Structural elements |

### Atmospheric Backgrounds

| Class                    | Description           | Usage                  |
| ------------------------ | --------------------- | ---------------------- |
| `.bg-edinburgh-mist`     | Mist to warm gradient | Hero sections          |
| `.bg-stadium-atmosphere` | Radial glow effect    | Match-related          |
| `.bg-oro-glow`           | Gold radial glow      | Accent overlays        |
| `.bg-navy-depth`         | Navy gradient         | Footer sections        |
| `.bg-hero-fusion`        | Verde to Navy         | Cultural fusion heroes |
| `.bg-warm-canvas`        | Warm to cream         | Content areas          |

### Combined Patterns

| Class                    | Description                | Usage              |
| ------------------------ | -------------------------- | ------------------ |
| `.pattern-hero-layered`  | Tartan + verdiblanco edges | Hero backgrounds   |
| `.pattern-card-cultural` | Subtle stripes + gradient  | Cards with culture |
| `.pattern-ticket-edge`   | Perforated edge effect     | Match tickets      |

### Pattern Usage Examples

```html
<!-- Hero with layered patterns -->
<section class="relative">
  <div class="absolute inset-0 bg-edinburgh-mist" />
  <div class="absolute inset-0 pattern-tartan-subtle" />
  <div class="absolute left-0 top-0 bottom-0 w-8 pattern-verdiblanco-subtle" />
  <div class="relative"><!-- Content --></div>
</section>

<!-- Card with cultural accent -->
<div class="pattern-card-cultural rounded-xl p-6">
  <!-- Content -->
</div>

<!-- Card with verdiblanco edge -->
<div class="pattern-verdiblanco-edge-left bg-white rounded-lg p-6">
  <!-- Content -->
</div>
```

---

## Components

### PatternBackground (React)

```tsx
import { PatternBackground, HeroBackground, CulturalCard } from '@/components/patterns';

// Simple pattern
<PatternBackground pattern="verdiblanco-subtle">
  <h1>Content</h1>
</PatternBackground>

// Layered patterns
<PatternBackground
  pattern="edinburgh-mist"
  overlayPatterns={['tartan-subtle', 'verdiblanco-whisper']}
>
  <HeroContent />
</PatternBackground>

// Pre-configured hero
<HeroBackground variant="fusion">
  <h1>Hero Content</h1>
</HeroBackground>

// Cultural card
<CulturalCard>
  <CardContent />
</CulturalCard>
```

### Buttons

#### Primary Button (Verde)

```html
<button
  class="bg-betis-verde hover:bg-betis-verde-dark text-white px-6 py-3 rounded-xl font-heading font-bold transition-colors"
>
  Button Text
</button>
```

#### Secondary Button (Oro)

```html
<button
  class="bg-betis-oro hover:bg-oro-antique text-scotland-navy px-6 py-3 rounded-xl font-heading font-bold transition-colors"
>
  Button Text
</button>
```

#### Outline Button

```html
<button
  class="border-2 border-betis-verde text-betis-verde hover:bg-betis-verde-pale px-6 py-3 rounded-xl font-heading font-bold transition-colors"
>
  Button Text
</button>
```

### MatchTicket Component

```tsx
import MatchTicket from "@/components/MatchTicket";

<MatchTicket
  id={1}
  opponent="Sevilla FC"
  date="2025-01-15T20:00:00"
  competition="Primera División"
  isHome={true}
  status="SCHEDULED"
  matchday={19}
  variant="upcoming"
  priority="derby" // 'normal' | 'featured' | 'derby'
  showRSVP={true}
  rsvpInfo={{ rsvpCount: 12, totalAttendees: 18 }}
/>;
```

### Cards

#### Standard Card

```html
<div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
  <!-- Content -->
</div>
```

#### Cultural Card

```html
<div class="pattern-card-cultural rounded-2xl border border-gray-100 p-6">
  <!-- Content -->
</div>
```

#### Highlighted Card

```html
<div
  class="pattern-verdiblanco-edge-left bg-canvas-warm rounded-xl p-6 shadow-lg"
>
  <!-- Content -->
</div>
```

---

## Layout Guidelines

### Navigation (Scoreboard-Inspired)

```html
<!-- Top ribbon -->
<div class="bg-betis-verde py-1.5">
  <div class="max-w-7xl mx-auto flex justify-between text-white text-sm">
    <span>📍 Polwarth Tavern, Edinburgh</span>
    <span>📅 Próximo partido disponible</span>
  </div>
</div>

<!-- Main nav -->
<nav class="bg-scotland-navy border-b-4 border-betis-oro">
  <!-- Navigation content -->
</nav>
```

### Hero Sections

```html
<section class="relative min-h-screen overflow-hidden">
  <!-- Layered background -->
  <div class="absolute inset-0 bg-edinburgh-mist" />
  <div class="absolute inset-0 pattern-tartan-subtle" />
  <div
    class="absolute left-0 top-0 bottom-0 w-16 pattern-verdiblanco-subtle opacity-50"
  />

  <!-- Gold glow -->
  <div
    class="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl bg-oro-glow"
  />

  <div class="relative max-w-7xl mx-auto px-4 py-20">
    <!-- Content -->
  </div>
</section>
```

### Footer

```html
<footer class="bg-navy-depth relative">
  <div class="absolute inset-0 pattern-tartan-navy opacity-30" />
  <div
    class="h-1 bg-gradient-to-r from-betis-verde via-betis-oro to-betis-verde"
  />
  <div class="relative max-w-7xl mx-auto px-4 py-12">
    <!-- Content -->
  </div>
</footer>
```

### Container

```html
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Content -->
</div>
```

### Section Spacing

```html
<section class="py-16 sm:py-20 lg:py-24">
  <!-- Content -->
</section>
```

---

## Accessibility

### Contrast Requirements

All color combinations meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

| Combination                  | Ratio  | Status  |
| ---------------------------- | ------ | ------- |
| White on Betis Verde         | 4.5:1  | ✅ Pass |
| White on Betis Verde Dark    | 5.8:1  | ✅ Pass |
| Betis Verde on White         | 4.5:1  | ✅ Pass |
| Betis Oro on Scotland Navy   | 7.2:1  | ✅ Pass |
| White on Scotland Navy       | 15.1:1 | ✅ Pass |
| Scotland Navy on Canvas Warm | 13.8:1 | ✅ Pass |

### Focus States

```css
.focus-ring-betis:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(4, 141, 71, 0.4);
}
```

### Pattern Accessibility

- Patterns never convey essential information
- All patterns include `pointer-events: none` when used as overlays
- Pattern elements use `aria-hidden="true"`

---

## For AI Agents - Critical Rules

### DO ✅

1. **Use branded color classes**:
   - `bg-betis-verde` NOT `bg-green-600`
   - `text-betis-verde` NOT `text-green-700`
   - `bg-canvas-warm` NOT `bg-white` for main backgrounds
   - `bg-scotland-navy` for footer/dark sections

2. **Use the typography system**:
   - `font-display` for hero headlines
   - `font-heading` for navigation and section titles
   - `font-body` for body text
   - `font-accent` for taglines

3. **Use patterns appropriately**:
   - Subtle patterns (`.pattern-*-subtle`) for large areas
   - Full patterns only for decorative elements
   - Layer patterns with gradients for depth

4. **Maintain consistency**:
   - All buttons use `rounded-xl`
   - All cards use `rounded-2xl`
   - All sections use consistent padding

### DON'T ❌

1. **Never use generic Tailwind greens**:
   - ❌ `bg-green-50`, `bg-green-100`, `bg-green-500`
   - ❌ `text-green-400`, `text-green-600`

2. **Never use pure white backgrounds for main content**:
   - ❌ `bg-white` for page backgrounds
   - ✅ `bg-canvas-warm` or `bg-canvas-cream`

3. **Never overuse patterns**:
   - ❌ Full verdiblanco stripes on large areas
   - ❌ Multiple competing patterns
   - ✅ Maximum 2 subtle patterns per section

4. **Never compromise accessibility**:
   - ❌ Skip focus states
   - ❌ Use light colors on light backgrounds
   - ❌ Make patterns convey information

---

## Color Migration Reference

| Old Class            | New Class (v2.0)            |
| -------------------- | --------------------------- |
| `bg-white` (main)    | `bg-canvas-warm`            |
| `bg-green-50`        | `bg-betis-verde-pale`       |
| `bg-green-100`       | `bg-betis-verde-light`      |
| `bg-green-600`       | `bg-betis-verde`            |
| `bg-green-700`       | `bg-betis-verde-dark`       |
| `text-green-600`     | `text-betis-verde`          |
| `border-green-500`   | `border-betis-verde`        |
| `hover:bg-green-700` | `hover:bg-betis-verde-dark` |

---

## Version History

| Version | Date       | Changes                                                        |
| ------- | ---------- | -------------------------------------------------------------- |
| 2.0.0   | 2025-12-27 | Design System Revolution: New typography, patterns, components |
| 1.0.0   | 2025-01-15 | Initial design system creation                                 |

---

## Related Documentation

- [Storybook: Design Tokens](storybook/design-tokens.mdx)
- [Storybook: Patterns](storybook/patterns.mdx)
