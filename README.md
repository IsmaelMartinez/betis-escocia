# Peña Bética Escocesa Website

🟢⚪ Official website for the Real Betis supporters association in Edinburgh, Scotland.

## 🏟️ About

This website serves as the digital home for **Peña Bética Escocesa**, the Real Betis supporters club in Edinburgh. We meet at **Polwarth Tavern** to watch every Betis match and welcome all visiting Betis fans to join us.

## ✨ Features

- **Mobile-first responsive design** optimized for smartphones
- **La Porra de Fran (WIP)** - Interactive betting system for matches
- **Match calendar** with watch party information
- **El Jueves de la Peña** - Our online store for merchandise
- **Real Betis branding** with official colors
- **Social media integration** (Facebook & Instagram)
- **Bilingual content** (Spanish/English)
- **Serverless architecture** for optimal performance

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: JSON file storage (easily upgradeable)
- **Deployment**: Vercel with GitHub Actions
- **Styling**: Custom Real Betis color scheme

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pena-betica-escocesa.git
cd pena-betica-escocesa
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # Serverless API routes
│   ├── porra/          # La Porra de Fran page
│   └── partidos/       # Matches page
├── components/         # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Hero.tsx        # Homepage hero section
│   ├── PorraCard.tsx   # Porra betting component
│   └── MatchCard.tsx   # Match display component
├── lib/               # Utilities and types
│   ├── types.ts       # TypeScript definitions
│   └── utils.ts       # Helper functions
└── globals.css        # Global styles with Betis branding

data/
├── porra.json         # Porra data storage
├── matches.json       # Match fixtures (upcoming, recent, Conference League, friendlies)
└── content.json       # General content
```

## ⚽ Match Data Management

The website displays four types of matches:

### 📊 Data Sources
- **La Liga & Copa del Rey**: Fetched from Football-Data.org API in real-time
- **UEFA Conference League**: Manually maintained in `data/matches.json`
- **Friendlies**: Manually maintained in `data/matches.json`

### 🔧 Manual Data Maintenance

To add new Conference League or friendly matches:

1. **Open** `data/matches.json`
2. **Add matches** to the appropriate array (`conferenceLeague` or `friendlies`)
3. **Follow the data structure**:

```json
{
  "id": "unique-match-id",
  "utcDate": "2024-07-26T23:30:00Z",
  "status": "SCHEDULED",
  "homeTeam": {
    "id": 90,
    "name": "Real Betis Balompié",
    "shortName": "Real Betis",
    "tla": "BET",
    "crest": ""
  },
  "awayTeam": {
    "id": 64,
    "name": "Liverpool FC",
    "shortName": "Liverpool",
    "tla": "LIV",
    "crest": ""
  },
  "competition": {
    "id": 9999,
    "name": "Friendly",
    "code": "FR",
    "type": "FRIENDLY",
    "emblem": ""
  },
  "venue": "Stadium Name"
}
```

4. **Deploy** changes to see them live on the website

### 🚀 Future Database Migration

The project is designed to migrate from JSON files to a database (Supabase) for better data management. See the task list for migration plans.

## 🎲 La Porra de Fran (Work in Progress)

Our signature feature - a betting system where members predict:
- Exact match result
- First Betis goalscorer
- Entry fee: €5
- 50% goes to the peña, 50% to prizes
- Depends on Fran's availability

## 🛍️ El Jueves de la Peña

Inspired by Seville's famous "El Jueves" market, this is our online store where you can find Peña Bética Escocesa merchandise. All proceeds go towards supporting the peña's activities.

- **T-shirts & Scarves**: Show your support with our custom gear.
- **Stickers & Badges**: Perfect for decorating your laptop or jacket.
- **Limited Edition Items**: Special releases for big matches and events.

## 🏠 Polwarth Tavern

**Our home in Edinburgh:**
- Address: 15 Polwarth Pl, Edinburgh EH11 1NH
- Phone: +44 131 229 3402
- We watch every Betis match here!

## 🌐 Deployment

### Vercel Setup

1. Create a [Vercel account](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables (if needed)
4. Deploy automatically on every push to `main`

### GitHub Actions

The project includes automatic deployment via GitHub Actions. Set up these secrets in your repository:

- `VERCEL_TOKEN` - Your Vercel token
- `VERCEL_ORG_ID` - Your Vercel organization ID  
- `VERCEL_PROJECT_ID` - Your Vercel project ID

## 📱 Social Media

- **Facebook**: [Beticos en Escocia](https://www.facebook.com/groups/beticosenescocia/)
- **Instagram**: [@rbetisescocia](https://www.instagram.com/rbetisescocia/)
- **YouTube**: [Beticos en Escocia](https://www.youtube.com/beticosenescocia)

## 🎨 Brand Colors

- **Betis Green**: #00A651
- **Betis Gold**: #FFD700
- **Scotland Blue**: #005EB8

## 🚀 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create components in `src/components/`
2. Add pages in `src/app/`
3. Use TypeScript for type safety
4. Follow mobile-first design principles
5. Maintain Real Betis branding

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for the Peña Bética Escocesa community.

---

**¡Viva er Betis manque pierda!** 🟢⚪
