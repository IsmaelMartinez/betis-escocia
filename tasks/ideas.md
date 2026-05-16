# Ideas for Peña Bética Escocesa Website

This document is a brainstorming space for future features. Current and in-progress work lives in [`docs/roadmap.md`](../docs/roadmap.md); this file is intentionally forward-looking only.

## 📋 **Quick Status Overview** (Last updated: 2026-05-17)

| Category           | Status         |
| ------------------ | -------------- |
| Games              | ❌ Idea only   |
| Community Profiles | ❌ Not started |
| La Porra           | ❌ Idea only   |
| E-commerce         | ❌ Idea only   |
| Voting System      | ❌ Idea only   |
| i18n               | ❌ Idea only   |

The RSVP, Contact, Dashboard, GDPR, OneSignal admin-notification, and Daily Trivia surfaces that previously appeared here were removed from the codebase during the 2026-05 static-site simplification. If any of them come back in the future, re-introduce them as fresh ideas below.

## 🎯 **Core Feature Ideas**

### ~~TV & Streaming Integration~~ ❌ **Not Implementing**

- **Decision**: Not implementing — all UK options are paid services (Premier Sports ~£15/month). Polwarth Tavern is where we watch together! 🍺

### La Porra Enhancement

- Make the porra private for Peña members only, to avoid UK gambling commission issues. Skill-based, not gambling. Suggested 50/50 split of the prize pool: 50% to the winner, 50% to the Peña (donation for the yearly celebration).

### AI Assistant

- Lightweight AI assistant to guide users around the site, help with the porra, and answer Real Betis questions.
- Preferred starting point: Google Gemini free tier with a topic-restricted system prompt.

### Rumors Page (Soylenti)

- Fun rumors page (Ceballos-is-coming-back energy) with % likelihood values à la "Fran mode".
- Suggested approach: automated AI agent using Gemini (free tier) that fetches/analyses news from RSS feeds on a schedule (every ~6 hours via GitHub Actions).
- Technical spikes needed: RSS feed reliability, Gemini structured output, deduplication algorithm.

### E-commerce Integration

- Peña merchandise sales directly from the website. Low priority.

### Voting System

- Let Peña members vote on collection items (e.g. t-shirts).

## 🌍 **Multi-language Support**

- Spanish/English toggle across the site, with full UI translation.

## 🏆 **Community Profiles**

- Member profiles with activity and participation history.
- Community recognition / points system.

## 🎮 **Games & Engagement**

### 🚧 Future Ideas

- **Daily Trivia Challenge** — 5-question daily quiz about Real Betis & Scotland. A version existed previously and was removed; would need a fresh take that fits the static-site model.
- **Guess the Lineup** — Interactive team selection for matches
- **Guess the Score** — Match prediction system
- **Crossword puzzles** — Real Betis history and players
- **Word Search** — Themed puzzles
- **3D Penalty Shootout** — Browser-based 3D football game
  - Technology options: Three.js + TypeScript (recommended) or Rust + WebAssembly
  - Features: Physics simulation, goalkeeper AI, multiple difficulty levels
  - Integration ideas: Daily challenges, leaderboards, Betis-themed stadium
  - Mobile: Touch controls with WebGL fallback

## ⚡ **Performance / Infra Ideas**

- Further image and static-asset optimisation
- Consider reintroducing user-facing push notifications (match reminders) once the feature scope and retention story are clear
