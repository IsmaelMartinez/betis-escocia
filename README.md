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
- **Secure by default** feature flag system

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes + Supabase (PostgreSQL)
- **Database**: Supabase (GDPR-compliant with auto-cleanup)
- **Authentication**: Clerk.com for user management and authentication
- **External APIs**: Football-Data.org for match data
- **Feature Flags**: Flagsmith for feature management
- **Deployment**: Vercel with GitHub Actions
- **Performance Monitoring**: Vercel Speed Insights and Analytics

## 🚀 Getting Started

### Prerequisites

- Node.js 22+ 
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
      - `sql/initial_setup.sql`

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

## 🚩 Feature Flags with Flagsmith

The project uses Flagsmith for feature flag management, providing dynamic feature control without code deployments.

### Setting Up Flagsmith

1. **Create a Flagsmith Account**
   - Sign up at [https://flagsmith.com](https://flagsmith.com)
   - Create a new project
   - Create environments (Development, Production)

2. **Get Your Environment ID**
   - Go to your Flagsmith dashboard
   - Select your project and environment
   - Copy the Environment ID from the settings

3. **Configure Environment Variables**
   
   Add to your `.env.local` file:
   ```bash
   # Required: Flagsmith Environment ID
   NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID=your_environment_id_here
   
   # Optional: Flagsmith API Configuration
   NEXT_PUBLIC_FLAGSMITH_API_URL=https://edge.api.flagsmith.com/api/v1/
   NEXT_PUBLIC_FLAGSMITH_TIMEOUT=2000
   NEXT_PUBLIC_FLAGSMITH_CACHE_TTL=60000
   
   # Optional: Debug and Performance
   NEXT_PUBLIC_FLAGSMITH_DEBUG=true
   NEXT_PUBLIC_FLAGSMITH_METRICS=true
   NEXT_PUBLIC_FLAGSMITH_OFFLINE=false
   
   # Debug Mode (shows feature flag status)
   NEXT_PUBLIC_DEBUG_MODE=true
   ```

### Using Feature Flags in Code

```typescript
import { hasFeature, getValue, getMultipleValues } from '@/lib/flagsmith';

// Check if a feature is enabled
const isEnabled = await hasFeature('show-clasificacion');

// Get a feature value with default
const showGallery = await getValue('show-galeria', false);

// Get multiple features at once
const features = await getMultipleValues([
  'show-clasificacion',
  'show-partidos',
  'show-galeria'
]);
```

### Available Feature Flags

| Flag Name | Description | Default |
|-----------|-------------|----------|
| `show-clasificacion` | Show league standings | `true` |
| `show-coleccionables` | Show merchandise section | `true` |
| `show-galeria` | Show photo gallery | `true` |
| `show-rsvp` | Show RSVP system | `true` |
| `show-partidos` | Show match information | `true` |
| `show-social-media` | Show social media integration | `true` |
| `show-history` | Show club history section | `true` |
| `show-nosotros` | Show about us section | `true` |
| `show-unete` | Show join us section | `true` |
| `show-contacto` | Show contact section | `true` |
| `show-admin` | Show admin dashboard | `false` |
| `show-clerk-auth` | Enable Clerk authentication | `false` |
| `show-debug-info` | Show debug information | `false` |
| `show-beta-features` | Enable beta features | `false` |

### Debugging Feature Flags

#### 1. Enable Debug Mode
```bash
# In .env.local
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_FLAGSMITH_DEBUG=true
```

#### 2. Check Configuration Status
```typescript
import { getConfigStatus } from '@/lib/flagsmith/config';

const status = getConfigStatus();
console.log('Flagsmith Status:', status);
```

#### 3. Check System Status
```typescript
import { getSystemStatus } from '@/lib/flagsmith';

const systemStatus = await getSystemStatus();
console.log('System Status:', systemStatus);
```

#### 4. View Performance Metrics
```typescript
import { getFlagsmithManager } from '@/lib/flagsmith';

const manager = getFlagsmithManager();
const metrics = manager.getPerformanceMetrics();
console.log('Performance Metrics:', metrics);
```

### Fallback Mechanisms

The system includes multiple fallback layers:

1. **Last Known Values**: Cached values from successful API calls
2. **Configured Fallbacks**: Default values in `DEFAULT_FLAG_VALUES`
3. **Environment Variables**: Legacy environment variable support
4. **System Defaults**: Hard-coded safe defaults

### Troubleshooting

#### Common Issues

1. **"Environment ID required" Error**
   - Ensure `NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID` is set
   - Check that the environment ID is valid (starts with appropriate prefix)

2. **Features Not Updating**
   - Clear browser cache and localStorage
   - Check if cache TTL is too high
   - Verify feature flags are published in Flagsmith dashboard

3. **API Timeout Issues**
   - Increase timeout: `NEXT_PUBLIC_FLAGSMITH_TIMEOUT=5000`
   - Enable offline mode: `NEXT_PUBLIC_FLAGSMITH_OFFLINE=true`

#### Debug Commands

```bash
# Check environment variables
echo $NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID

# Test configuration
npm run dev
# Then check browser console for Flagsmith logs
```

### Production Considerations

- Use separate Flagsmith environments for development and production
- Production environment IDs typically start with `ser_`
- Set appropriate cache TTL values for production (60+ seconds)
- Monitor error rates and fallback usage
- Consider using Flagsmith's edge API for better performance

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
├── initial_setup.sql        # Initial database schema
├── cleanup_old_rsvps.sql        # Data retention policies

data/                  # JSON data storage (non-critical features)
├── merchandise.json   # Merchandise catalog
├── orders.json        # Order submissions
└── contact.json       # Contact form submissions
```

## 🗄️ Database Setup

### Initial Setup

To set up the database schema, run the `initial_setup.sql` script in your Supabase SQL Editor. This script creates all necessary tables, indexes, and policies for the application.

```sql
-- Run this in the Supabase SQL Editor
\i sql/initial_setup.sql
```

### Cleanup Function

The `cleanup_old_rsvps.sql` script defines a function to delete RSVPs older than one month. You can run this function manually or schedule it using the `pg_cron` extension in Supabase.

#### Manual Execution

```sql
-- Run this to clean up old RSVPs
SELECT cleanup_old_rsvps();
```

#### Scheduled Execution (Optional)

To schedule automatic cleanup, enable the `pg_cron` extension in your Supabase project and use the following command:

```sql
-- Schedule the cleanup function to run daily at 2 AM
SELECT cron.schedule('cleanup-old-rsvps', '0 2 * * *', 'SELECT cleanup_old_rsvps();');
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

- **Our home in Edinburgh:**
-
- Address: 35 Polwarth Cres, Edinburgh EH11 1HR
- Phone: +44 131 221 9906
- We watch every Betis match here!
-

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

## 📚 Documentation

### Developer Resources
- [Developer Onboarding Guide](docs/development/onboarding.md)
- [Implementation Guide](docs/development/IMPLEMENTATION.md)
- [Feature Flags Documentation](docs/feature-flags.md)

### Architecture Decisions
- [ADR-001: Clerk Authentication](docs/adr/001-clerk-authentication.md)
- [ADR-002: Football-Data.org API](docs/adr/002-football-api.md)
- [ADR-003: Supabase Database](docs/adr/003-supabase-database.md)

### Technical Documentation
- [API Documentation](docs/api/)
- [Security Implementation](docs/security/SECURITY.md)
- [Database Documentation](docs/database-comparison.md)

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

For detailed contribution guidelines, see [Developer Onboarding Guide](docs/development/onboarding.md).

## 📄 License

This project is for the Peña Bética Escocesa community.

---

**¡Viva er Betis manque pierda!** 🟢⚪
