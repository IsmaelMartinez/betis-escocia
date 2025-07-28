# Peña Bética Escocesa Website

🟢⚪ Official website for the Real Betis supporters association in Edinburgh, Scotland.

## 🏟️ About

This website serves as the digital home for **Peña Bética Escocesa**, the Real Betis supporters club in Edinburgh. We meet at **Polwarth Tavern** to watch every Betis match and welcome all visiting Betis fans to join us.

## ✨ Features

- **Mobile-first responsive design** optimized for smartphones
- **Community RSVP System** - "¿Vienes al Polwarth?" attendance confirmation
- **Interactive Trivia Game** - Test your knowledge of Real Betis and Scotland with a new pointing system
- **Merchandise Showcase** - Official peña gear: bufandas, llaveros, parches, camisetas
- **Photo Gallery** - Share match day photos with your peña merch
- **Real Betis branding** with official colors
- **Social media integration** (Facebook & Instagram)
- **Bilingual content** (Spanish/English)
- **Serverless architecture** for optimal performance
- **Secure by default** feature flag system

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS 4, Storybook
- **Backend**: Next.js API Routes + Supabase (PostgreSQL)
- **Database**: Supabase (GDPR-compliant with auto-cleanup)
- **Authentication**: Clerk.com for user management and authentication
- **External APIs**: Football-Data.org for match data
- **Feature Flags**: Flagsmith for feature management
- **Performance Monitoring**: Vercel Speed Insights and Analytics

### CI/CD & Automation

- **CI/CD**: GitHub Actions (enhanced workflow for quality checks, build, and start)
- **Dependency Management**: Dependabot for automated dependency updates
- **Security Scanning**: GitHub Security Advisories and Dependabot
- **Quality Gates**: ESLint, TypeScript, Storybook Build, Jest Tests, Playwright E2E, Lighthouse Accessibility

- **Deployment**: Vercel with GitHub Actions

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

### Troubleshooting

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

### 🧠 Betis & Scotland Trivia Challenge

Test your knowledge with our interactive trivia game:

- **Dual-themed questions**: Real Betis history and Scottish culture
- **Timed gameplay**: 15 seconds per question for added excitement
- **Real-time scoring**: Track your progress as you play
- **Mobile-optimized**: Perfect for quick games at the pub
- **Feature-flagged**: Controlled rollout via Flagsmith
- **Custom question bank**: Curated content specific to our community

**Key Features:**
- Multiple choice questions with immediate feedback
- Visual answer highlighting (correct/incorrect)
- Question categories: Betis history, Scottish culture, general football
- Randomized question and answer order for replayability
- Clean, responsive design matching site aesthetics

**Access**: Available at `/trivia` when enabled via the `show-trivia-game` feature flag.

## ⚽ Match Information

While we focus on community features, basic match information is maintained for reference.

### 📊 Data Sources

- **La Liga & Copa del Rey**: Available via API integration
- **UEFA**: Manually maintained
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
- `npm run test:e2e` - Run Playwright end-to-end tests in headless mode
- `npm run test:e2e:headed` - Run Playwright end-to-end tests in headed mode (for debugging)
- `npm run update-trivia` - Update trivia questions with curated content

### Database Management

#### Trivia Questions Management

The project includes a comprehensive script for managing trivia questions:

```bash
npm run update-trivia
```

**Features:**
- Completely replaces all existing trivia data
- 55 bilingual questions (30 Real Betis + 25 Scotland)
- Automatic UUID handling and progress tracking
- Data verification and safety checks

**Requirements:** Environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be configured.

See `scripts/README.md` for detailed documentation.

### Running Playwright Tests Locally

1.  **Ensure your development server is running:**
    ```bash
    npm run dev
    ```
2.  **Run the tests:**
    ```bash
    npm run test:e2e
    ```
    To see the browser UI during tests (for debugging):
    ```bash
    npm run test:e2e:headed
    ```
3.  **View Test Reports:** After the tests complete, an HTML report is generated. Open it with:
    ```bash
    npx playwright show-report
    ```

### Environment Variables for Playwright

*   `PLAYWRIGHT_BASE_URL`: (Optional) Override the base URL for tests. Defaults to `http://localhost:3000`.

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
- [Storybook Developer Guide](docs/storybook-guide.md)

### Architecture Decisions
- [ADR-001: Clerk Authentication](docs/adr/001-clerk-authentication.md)
- [ADR-002: Football-Data.org API](docs/adr/002-football-api.md)
- [ADR-003: Supabase Database](docs/adr/003-supabase-database.md)
- [ADR-004: Flagsmith Feature Flags](docs/adr/004-flagsmith-feature-flags.md)

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
