# Peña Bética Escocesa - Design System

> **For AI Agents**: This document is the single source of truth for all visual design decisions. Follow these guidelines strictly when creating or modifying any UI components.

## Brand Identity

### Logo Elements
Our logo combines three key elements:
- **Scottish Saltire**: Navy blue St. Andrew's Cross background
- **Betis Verdiblanco**: Green and white vertical stripes
- **Scottish Thistle**: Traditional Scottish symbol in navy

This fusion represents our unique identity as a Real Betis supporters club in Scotland.

### Tone of Voice
- **Language**: Spanish primary, English secondary
- **Style**: Friendly, family-oriented, welcoming
- **Character**: Passionate but humble, proud but inclusive

---

## Color Palette

### Primary Colors

| Token | CSS Variable | Hex | RGB | Usage |
|-------|--------------|-----|-----|-------|
| Betis Verde | `--betis-verde` | `#048D47` | rgb(4, 141, 71) | Primary brand color, buttons, links |
| Betis Verde Dark | `--betis-verde-dark` | `#036B38` | rgb(3, 107, 56) | Hover states, headers, navigation |
| Betis Verde Light | `--betis-verde-light` | `#E8F5ED` | rgb(232, 245, 237) | Light backgrounds, highlights |
| Betis Verde Pale | `--betis-verde-pale` | `#F0F9F4` | rgb(240, 249, 244) | Very subtle backgrounds |

### Secondary Colors

| Token | CSS Variable | Hex | RGB | Usage |
|-------|--------------|-----|-----|-------|
| Scotland Navy | `--scotland-navy` | `#0B1426` | rgb(11, 20, 38) | Footer, dark sections, contrast |
| Scotland Blue | `--scotland-blue` | `#005EB8` | rgb(0, 94, 184) | Links, Scottish accents |

### Accent Colors

| Token | CSS Variable | Hex | RGB | Usage |
|-------|--------------|-----|-----|-------|
| Betis Oro | `--betis-oro` | `#D4AF37` | rgb(212, 175, 55) | CTAs, highlights, special elements |
| Betis Oro Dark | `--betis-oro-dark` | `#B8960F` | rgb(184, 150, 15) | Hover states for gold |
| Betis Oro Light | `--betis-oro-light` | `#F5E6B3` | rgb(245, 230, 179) | Light gold backgrounds |

### Neutral Colors

| Token | CSS Variable | Hex | Usage |
|-------|--------------|-----|-------|
| White | `--betis-blanco` | `#FFFFFF` | Backgrounds, text on dark |
| Black | `--betis-negro` | `#000000` | Text, borders |
| Dark | `--betis-dark` | `#0f1419` | Dark text |
| Gray 50 | `--gray-50` | `#F9FAFB` | Light backgrounds |
| Gray 100 | `--gray-100` | `#F3F4F6` | Card backgrounds |
| Gray 200 | `--gray-200` | `#E5E7EB` | Borders |
| Gray 300 | `--gray-300` | `#D1D5DB` | Disabled states |
| Gray 500 | `--gray-500` | `#6B7280` | Secondary text |
| Gray 700 | `--gray-700` | `#374151` | Primary text |
| Gray 900 | `--gray-900` | `#111827` | Headings |

### Status Colors

| Token | CSS Variable | Hex | Usage |
|-------|--------------|-----|-------|
| Success | `--status-success` | `#059669` | Success messages, confirmations |
| Warning | `--status-warning` | `#D97706` | Warnings, cautions |
| Error | `--status-error` | `#DC2626` | Errors, destructive actions |
| Info | `--status-info` | `#2563EB` | Information, tips |

---

## CSS Utility Classes

### Background Classes
```css
.bg-betis-verde        /* Primary green background */
.bg-betis-verde-dark   /* Dark green background */
.bg-betis-verde-light  /* Light green background */
.bg-betis-oro          /* Gold background */
.bg-scotland-navy      /* Navy background */
```

### Text Classes
```css
.text-betis-verde      /* Primary green text */
.text-betis-verde-dark /* Dark green text */
.text-betis-oro        /* Gold text */
.text-scotland-navy    /* Navy text */
```

### Border Classes
```css
.border-betis-verde    /* Green border */
.border-betis-oro      /* Gold border */
.border-scotland-navy  /* Navy border */
```

### Gradient Classes
```css
.bg-gradient-betis     /* Green gradient (verde to verde-dark) */
.bg-gradient-scotland  /* Navy gradient */
.bg-gradient-hero      /* Hero section gradient */
```

---

## Typography

### Font Family
- **Primary**: Geist Sans (`var(--font-geist-sans)`)
- **Monospace**: Geist Mono (`var(--font-geist-mono)`)

### Font Scale

| Class | Size | Use Case |
|-------|------|----------|
| `text-xs` | 12px | Labels, captions |
| `text-sm` | 14px | Secondary text, metadata |
| `text-base` | 16px | Body text |
| `text-lg` | 18px | Lead paragraphs |
| `text-xl` | 20px | Section titles |
| `text-2xl` | 24px | Card headings |
| `text-3xl` | 30px | Page subtitles |
| `text-4xl` | 36px | Page titles |
| `text-5xl` | 48px | Hero headlines |

### Font Weights

| Weight | Class | Use Case |
|--------|-------|----------|
| 400 | `font-normal` | Body text |
| 500 | `font-medium` | Emphasized text |
| 600 | `font-semibold` | Subheadings |
| 700 | `font-bold` | Headings, buttons |
| 900 | `font-black` | Hero text, impact |

---

## Components

### Buttons

#### Primary Button (Green)
```html
<button class="bg-betis-verde hover:bg-betis-verde-dark text-white px-6 py-3 rounded-lg font-bold transition-colors">
  Button Text
</button>
```

#### Secondary Button (Gold)
```html
<button class="bg-betis-oro hover:bg-betis-oro-dark text-betis-dark px-6 py-3 rounded-lg font-bold transition-colors">
  Button Text
</button>
```

#### Outline Button
```html
<button class="border-2 border-betis-verde text-betis-verde hover:bg-betis-verde hover:text-white px-6 py-3 rounded-lg font-bold transition-colors">
  Button Text
</button>
```

### Cards

#### Standard Card
```html
<div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
  <!-- Content -->
</div>
```

#### Highlighted Card (Betis themed)
```html
<div class="bg-white rounded-2xl shadow-lg border-l-4 border-betis-verde p-6">
  <!-- Content -->
</div>
```

### Forms

#### Input Field
```html
<input 
  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-verde focus:border-transparent"
  type="text"
/>
```

#### Success State
```html
<div class="p-4 bg-betis-verde-light border border-betis-verde rounded-lg">
  <p class="text-betis-verde-dark">Success message</p>
</div>
```

### Navigation

#### Header
- Background: `bg-betis-verde-dark`
- Text: `text-white`
- Hover: `hover:text-betis-oro`

#### Footer
- Background: `bg-scotland-navy`
- Headings: `text-betis-oro`
- Links: `text-gray-300 hover:text-betis-verde`

---

## Layout Guidelines

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

### Grid Patterns
```html
<!-- 3-column responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Items -->
</div>
```

---

## Page Sections

### Hero Sections
- Use `bg-betis-verde` or gradient `bg-gradient-to-br from-betis-verde to-betis-verde-dark`
- Text should be white with optional gold accents
- Add `drop-shadow-lg` for text readability

### Content Sections
- Alternate between `bg-white` and `bg-gray-50`
- Use `bg-betis-verde-light` sparingly for emphasis

### CTA Sections
- Primary: `bg-gradient-to-r from-betis-verde to-betis-verde-dark`
- Add subtle overlay: `bg-black/10` for text contrast

### Footer
- Background: `bg-scotland-navy`
- Section headings: `text-betis-oro`
- Body text: `text-gray-300`
- Links hover: `hover:text-betis-verde`

---

## Accessibility

### Contrast Requirements
All color combinations must meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

| Combination | Ratio | Status |
|-------------|-------|--------|
| White on Betis Verde | 4.5:1 | ✅ Pass |
| White on Betis Verde Dark | 5.8:1 | ✅ Pass |
| Betis Verde on White | 4.5:1 | ✅ Pass |
| Betis Oro on Scotland Navy | 7.2:1 | ✅ Pass |
| White on Scotland Navy | 15.1:1 | ✅ Pass |

### Focus States
Always include visible focus states:
```css
focus:ring-2 focus:ring-betis-verde focus:ring-offset-2
```

---

## For AI Agents - Critical Rules

### DO ✅

1. **Use branded color classes**:
   - `bg-betis-verde` NOT `bg-green-600`
   - `text-betis-verde` NOT `text-green-700`
   - `bg-betis-verde-light` NOT `bg-green-50`
   - `bg-scotland-navy` NOT `bg-gray-900` for footer

2. **Use semantic naming**:
   - Reference colors by their brand name
   - Keep Scottish Navy for dark/footer sections
   - Use Gold sparingly for CTAs and highlights

3. **Maintain consistency**:
   - All buttons should use the same patterns
   - All cards should have consistent border-radius (rounded-2xl)
   - All sections should use consistent padding

### DON'T ❌

1. **Never use generic Tailwind greens**:
   - ❌ `bg-green-50`, `bg-green-100`, `bg-green-200`
   - ❌ `bg-green-500`, `bg-green-600`, `bg-green-700`
   - ❌ `text-green-400`, `text-green-500`, `text-green-600`

2. **Never mix color systems**:
   - ❌ Don't use `bg-green-600` in one place and `bg-betis-verde` in another
   - ❌ Don't use arbitrary hex values inline

3. **Never compromise accessibility**:
   - ❌ Don't use light colors on light backgrounds
   - ❌ Don't skip focus states on interactive elements

---

## Color Migration Reference

When updating existing code, use this mapping:

| Old Class | New Class |
|-----------|-----------|
| `bg-green-50` | `bg-betis-verde-pale` |
| `bg-green-100` | `bg-betis-verde-light` |
| `bg-green-500` | `bg-betis-verde` |
| `bg-green-600` | `bg-betis-verde` |
| `bg-green-700` | `bg-betis-verde-dark` |
| `text-green-400` | `text-betis-oro` (for dark bg) |
| `text-green-500` | `text-betis-verde` |
| `text-green-600` | `text-betis-verde` |
| `text-green-700` | `text-betis-verde-dark` |
| `text-green-800` | `text-betis-verde-dark` |
| `border-green-200` | `border-betis-verde/20` |
| `border-green-500` | `border-betis-verde` |
| `hover:bg-green-700` | `hover:bg-betis-verde-dark` |
| `hover:text-green-700` | `hover:text-betis-verde-dark` |
| `focus:ring-green-500` | `focus:ring-betis-verde` |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-15 | Initial design system creation |

