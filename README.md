# Peña Bética Escocesa Website

🟢⚪ Official website for the Real Betis supporters association in Edinburgh, Scotland.

## 🏟️ About

This website serves as the digital home for **Peña Bética Escocesa**, the Real Betis supporters club in Edinburgh. We meet at **Polwarth Tavern** to watch every Betis match and welcome all visiting Betis fans to join us.

## ✨ Features

- **Mobile-first responsive design** optimized for smartphones
- **Community RSVP System** - "¿Vienes al Polwarth?" attendance confirmation
- **Interactive Trivia Game** - Test your knowledge of Real Betis and Scotland
- **Merchandise Showcase** - Official peña gear
- **Photo Gallery** - Share match day photos with your peña merch
- **Admin Dashboard** - User management with push notifications
- **Real Betis branding** with official colors
- **Bilingual content** (Spanish/English)
- **Secure by default** architecture

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS 4
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Clerk.com with role-based permissions
- **Feature Flags**: Environment variables for simple feature control
- **Testing**: Vitest + Playwright + Storybook
- **Deployment**: Vercel with GitHub Actions

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/pena-betica-escocesa.git
   cd pena-betica-escocesa
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the required values:
   ```bash
   # Database
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   
   # Feature Flags (optional - only for experimental features)
   # NEXT_PUBLIC_FEATURE_GALERIA=true
   # NEXT_PUBLIC_FEATURE_COLECCIONABLES=true
   ```

3. **Initialize database:**
   - Run `sql/initial_setup.sql` in your Supabase SQL Editor

4. **Start development:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Core Technologies
- **Next.js 15** with App Router and TypeScript
- **Supabase** for database with Row Level Security
- **Clerk** for authentication with role-based permissions
- **Tailwind CSS 4** with Betis branding

### Key Patterns
- **Feature flags control all functionality** - disabled by default
- **Dual authentication mode** - anonymous + authenticated users
- **Mobile-first responsive design** with Betis colors
- **Admin role management** via Clerk metadata
- **Push notifications** for real-time admin alerts

### Admin Setup
1. Access Clerk dashboard at dashboard.clerk.com
2. Navigate to Users → select user → Metadata tab
3. Add metadata: `role: admin`
4. User gains admin access on next login

## 🚩 Feature Flags

The project uses **environment variables** for simple feature control:

```typescript
import { hasFeature } from '@/lib/featureFlags';

// Check if a feature is enabled (synchronous)
const isEnabled = hasFeature('show-galeria');
if (!isEnabled) return null;
```

### Key Flags
- `show-galeria` - Photo gallery (default: disabled)
- `show-coleccionables` - Merchandise collection (default: disabled)
- `show-debug-info` - Debug information (default: disabled)

### Always-On Features
- `rsvp` - RSVP functionality (always available)
- `unete` - Join functionality (always available) 
- `contacto` - Contact functionality (always available)

### Setup
Set environment variables only for experimental features:
```bash
NEXT_PUBLIC_FEATURE_GALERIA=true
NEXT_PUBLIC_FEATURE_COLECCIONABLES=true
```

## 🧪 Development

### Available Scripts
```bash
npm run dev              # Start dev server
npm run build           # Production build
npm test                # Run Vitest tests
npm run test:e2e        # Playwright E2E tests
npm run lint            # ESLint checking
npm run type-check      # TypeScript validation
npm run update-trivia   # Update trivia questions
```

## 🏠 Polwarth Tavern

**Our home in Edinburgh:**
- Address: 35 Polwarth Cres, Edinburgh EH11 1HR
- Phone: +44 131 221 9906
- We watch every Betis match here!

## 📱 Social Media

- **Facebook**: [Beticos en Escocia](https://www.facebook.com/groups/beticosenescocia/)
- **Instagram**: [@rbetisescocia](https://www.instagram.com/rbetisescocia/)
- **YouTube**: [Beticos en Escocia](https://www.youtube.com/beticosenescocia)

## 📚 Documentation

### Developer Resources
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Complete development guide
- [Testing Guide](docs/TESTING_GUIDE.md) - Testing strategies and patterns
- [Architecture Decisions](docs/adr/) - Technical decisions and rationale
- [Security Documentation](docs/security/)

## 📝 Contributing

1. Fork the repository
2. Create a feature branch  
3. Test thoroughly (`npm test`, `npm run test:e2e`)
4. Submit a pull request

---

**¡Viva er Betis manque pierda!** 🟢⚪
