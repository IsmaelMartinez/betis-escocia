# Peña Bética Escocesa Website

🟢⚪ Official website for the Real Betis supporters association in Edinburgh, Scotland.

## 🏟️ About

This website serves as the digital home for **Peña Bética Escocesa**, the Real Betis supporters club in Edinburgh. We meet at **Polwarth Tavern** to watch every Betis match and welcome all visiting Betis fans to join us.

## ✨ Features

- **Mobile-first responsive design** optimized for smartphones
- **Community RSVP System** - "¿Vienes al Polwarth?" attendance confirmation
- **Merchandise Showcase** - Official peña gear: bufandas, llaveros, parches, camisetas
- **Photo Gallery** - Share match day photos with your peña merch
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
│   ├── rsvp/           # RSVP attendance confirmation
│   ├── tienda/         # Merchandise showcase
│   └── galeria/        # Photo gallery
├── components/         # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Hero.tsx        # Homepage hero section
│   ├── RSVPForm.tsx    # RSVP confirmation component
│   └── MerchandiseCard.tsx # Merch display component
├── lib/               # Utilities and types
│   ├── types.ts       # TypeScript definitions
│   └── utils.ts       # Helper functions
└── globals.css        # Global styles with Betis branding

data/
├── rsvp.json          # RSVP attendance data
├── merch.json         # Merchandise catalog
└── content.json       # General content
```

## 🎪 Community Features

### 🎪 RSVP System - "¿Vienes al Polwarth?"

Confirm your attendance for match viewing parties at Polwarth Tavern:
- Quick RSVP form for each match
- See who else is coming
- Automatic reminders and updates
- Help us plan seating and atmosphere

### �️ Merchandise Showcase

Official Peña Bética Escocesa gear to show your colors:
- **Bufandas** (Scarves): Show your support with our custom scarves
- **Llaveros** (Keychains): Perfect for your keys or bag
- **Parches** (Patches): Customize your jacket or backpack
- **Camisetas** (T-shirts): Limited edition peña designs

### 📸 Social Media Gallery

Connect and share your match day experiences:
- Follow us on Instagram and Facebook for live updates
- Tag @penabetiscaescocesa in your posts wearing peña merchandise
- Use our hashtags to be featured in our gallery
- Join our vibrant social media community

## ⚽ Match Information

While we focus on community features, basic match information is maintained for reference.

### 📊 Data Sources

- **La Liga & Copa del Rey**: Available via API integration
- **UEFA Conference League**: Manually maintained
- **Friendlies**: Manually maintained

The project maintains technical infrastructure for match data but prioritizes community engagement features.

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
