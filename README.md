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
- **Backend**: Next.js API Routes + Supabase (PostgreSQL)
- **Database**: Supabase (GDPR-compliant with auto-cleanup)
- **Authentication**: Clerk.com for user management and authentication
- **Deployment**: Vercel with GitHub Actions
- **Performance Monitoring**: Vercel Speed Insights (`@vercel/speed-insights`) for front-end performance metrics

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

3. Set up Supabase:

    - Create a [Supabase account](https://supabase.com)
    - Create a new project
    - Copy your project URL and anon key
    - Run the SQL setup scripts in your Supabase SQL Editor:
      - `sql/create_rsvp_table.sql`
      - `sql/add_missing_rsvp_columns.sql`

4. Set up Clerk Authentication:

    - Create a [Clerk account](https://clerk.com)
    - Create a new application
    - Copy your publishable key and secret key
    - Create `.env.local` file:

    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    
    # Feature flag to enable/disable authentication
    NEXT_PUBLIC_FEATURE_CLERK_AUTH=true
    ```

5. Run the development server:

    ```bash
    npm run dev
    ```

6. Open the local site:

    Open [http://localhost:3000](http://localhost:3000) in your browser.

    > For more on integrating the Speed Insights component, see the [Vercel Speed Insights Quickstart](https://vercel.com/docs/speed-insights/quickstart#add-the-speedinsights-component-to-your-app).

## 🔐 Authentication & User Management

### Setting Up Admin Roles in Clerk

1. **Access Clerk Dashboard**
   - Log into your Clerk dashboard at https://dashboard.clerk.com
   - Select your Peña Bética project

2. **User Management**
   - Navigate to "Users" section
   - Find the user you want to make an admin
   - Click on the user to view their profile

3. **Assign Admin Role**
   - In the user profile, go to "Metadata" tab
   - Add a new metadata field:
     - **Key**: `role`
     - **Value**: `admin`
   - Save the changes

4. **Verify Role Assignment**
   - The user will now have admin access on next login
   - Check the admin dashboard to confirm access

### User Types

- **Admin Users**: Full access to admin dashboard, user management, and all features
- **Regular Users**: Access to personal dashboard showing their RSVP/contact history
- **Anonymous Users**: Can submit RSVPs and contact forms without authentication

### Feature Flag Control

Authentication features are controlled by the `NEXT_PUBLIC_FEATURE_CLERK_AUTH` environment variable:
- `true`: Enable authentication features
- `false` or unset: Disable authentication features (anonymous-only mode)

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # Serverless API routes
│   │   ├── rsvp/       # RSVP system (Supabase-powered)
│   │   ├── contact/    # Contact forms (JSON-based)
│   │   └── merchandise/# Merchandise system (JSON-based)
│   ├── rsvp/           # RSVP attendance confirmation
│   ├── coleccionables/ # Merchandise showcase
│   └── galeria/        # Photo gallery
├── components/         # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Hero.tsx        # Homepage hero section
│   ├── RSVPForm.tsx    # RSVP confirmation component
│   └── MerchandiseCard.tsx # Merch display component
├── lib/               # Utilities and services
│   ├── supabase.ts    # Supabase client and types
│   └── config.ts      # Configuration utilities
└── globals.css        # Global styles with Betis branding

sql/                   # Database setup scripts
├── create_rsvp_table.sql        # Initial RSVP table
├── add_missing_rsvp_columns.sql # Schema updates
└── cleanup_old_rsvps.sql        # Data retention policies

data/                  # JSON data storage (non-critical features)
├── merchandise.json   # Merchandise catalog
├── orders.json        # Order submissions
└── contact.json       # Contact form submissions
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
