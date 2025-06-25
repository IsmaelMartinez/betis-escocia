# Task List: LaLiga Match Integration

Generated from: `prd-laliga-match-integration.md`  
Created: December 2024  
**Updated: June 2025**  
**Status: T1, T2, T3, T4, T5, T6, T7 COMPLETED - Error Handling & Pagination ✅**

## 🎯 **TWO-PHASE STRATEGY**

### ✅ **Version 1: Football-Data.org Implementation** (Current Focus)
- **Current Data**: Real-time 2024-2025 season ✅
- **Free Forever**: 14,400 requests/day, no seasonal restrictions ✅
- **Reliable**: Maintained since 2014, stable API ✅
- **Scope**: Basic match data (fixtures, results, standings) ⚠️

## 📝 **VERSION 1 FEATURE SCOPE** (Football-Data.org)

### ✅ **FEATURES AVAILABLE**
- ✅ Recent Real Betis match results with scores
- ✅ Upcoming fixtures with dates and opponents  
- ✅ League standings and Real Betis position
- ✅ Competition information (La Liga, Copa del Rey, etc.)
- ✅ Basic match details (venue, referee, date/time)
- ✅ Team information and logos
- ✅ Competition badges and branding

## VERSION 1: Core Integration (Football-Data.org) 🚀

> **Goal**: Deliver a fully functional match system with current season data using Football-Data.org

### T1: API Setup and Configuration ✅ COMPLETED

- [x] T1.1: Register for Football-Data.org API account
- [x] T1.2: Create `.env.local` file with API key storage
- [x] T1.3: Add environment variable types to TypeScript config
- [x] T1.4: Test API connectivity and Real Betis team ID (90)
- [x] T1.5: Verify current season data availability

### T2: API Service Layer Development ✅ COMPLETED

- [x] T2.1: Create `src/services/footballDataService.ts` ✅
- [x] T2.2: Complete all service methods (getBetisMatches, getUpcomingMatches, etc.) ✅
- [x] T2.3: Create TypeScript interfaces for Football-Data.org response types ✅
- [x] T2.4: Add comprehensive error handling and retry logic ✅
- [x] T2.5: Implement rate limiting and request optimization ✅
- [x] T2.6: Add response caching strategy ✅

### T3: Next.js API Routes Setup ✅ COMPLETED

- [x] T3.1: Create `src/app/api/matches/route.ts` endpoint ✅
- [x] T3.2: Implement GET handler for fetching match data ✅
- [x] T3.3: Add ISR caching configuration (30 minutes for fixtures, 5 minutes for live) ✅
- [x] T3.4: Implement error responses and status codes ✅
- [x] T3.5: Add request validation and sanitization ✅

### T4: Match Data Types and Interfaces ✅ COMPLETED

- [x] T4.1: Create `src/types/match.ts` with Football-Data.org specific interfaces ✅
- [x] T4.2: Define Team, Competition, and Score interfaces ✅
- [x] T4.3: Add MatchStatus enum (SCHEDULED, LIVE, FINISHED, POSTPONED) ✅
- [x] T4.4: Create API response wrapper types with error handling ✅

### T5: Enhanced MatchCard Component ✅ COMPLETED

- [x] T5.1: Update `src/components/MatchCard.tsx` for real Football-Data.org data ✅
- [x] T5.2: Add conditional rendering for match status and competition ✅
- [x] T5.3: Implement team logo display with fallbacks ✅
- [x] T5.4: Add competition badge/indicator (La Liga, Copa del Rey, etc.) ✅
- [x] T5.5: Format date and time display (Spanish locale) ✅
- [x] T5.6: Add loading skeleton and error states ✅
- [x] T5.7: Ensure mobile responsiveness ✅

### T6: Update Partidos Page ✅ COMPLETED

- [x] T6.1: Remove mock data from `src/app/partidos/page.tsx` ✅
- [x] T6.2: Implement data fetching from Football-Data.org API route ✅
- [x] T6.3: Add loading states and comprehensive error handling ✅
- [x] T6.4: Implement responsive grid layout for match cards ✅
- [x] T6.5: Add manual refresh functionality ✅
- [x] T6.6: Implement pagination for historical matches ✅

### T7: Basic Error Handling and Loading States ✅ COMPLETED

- [x] T7.1: Create `src/components/LoadingSpinner.tsx` component ✅
- [x] T7.2: Create `src/components/ErrorMessage.tsx` component ✅  
- [x] T7.3: Implement skeleton loading for match cards ✅
- [x] T7.4: Add error boundaries for API failures ✅
- [x] T7.5: Create user-friendly error messages in Spanish ✅
- [x] T7.6: Add offline detection and messaging ✅

### T8: Basic Match Details and Navigation ✅ COMPLETED

- [x] T8.1: Create `src/app/partidos/[matchId]/page.tsx` dynamic route ✅
- [x] T8.2: Implement match detail view with available Football-Data.org data ✅
- [x] T8.3: Show extended match information (referee, venue, weather if available) ✅
- [x] T8.4: Add team information and competition details ✅
- [x] T8.5: Implement breadcrumb navigation and mobile optimization ✅
- [x] T8.6: Add sharing functionality for match results ✅
- [x] T8.7: Link match cards to detail pages with proper team display (local left, visitor right) ✅

### T9: Competition and Standings Integration

- [x] T9.1: Add La Liga standings display ✅
- [x] T9.2: Create competition filter functionality ✅

### T10: Performance and Caching Optimization

- [ ] T10.1: Implement ISR with appropriate cache durations
- [ ] T10.2: Add client-side caching for frequently accessed data
- [ ] T10.3: Optimize bundle size and loading performance
- [ ] T10.4: Add image optimization for team logos and badges
- [ ] T10.5: Implement background data refresh
- [ ] T10.6: Add service worker for offline functionality (optional)
- [ ] T10.7: Monitor API request usage and optimize calls

### T11: Testing and Quality Assurance

- [ ] T11.1: Write unit tests for Football-Data.org service layer
- [ ] T11.2: Add integration tests for API routes
- [ ] T11.3: Component testing for MatchCard and match detail pages
- [ ] T11.4: End-to-end testing for user workflows
- [ ] T11.5: Error scenario testing and API failure handling
- [ ] T11.6: Performance testing and accessibility audit

### T12: Production Deployment

- [ ] T12.1: Set up production environment variables
- [ ] T12.2: Configure monitoring and error tracking
- [ ] T12.3: Set up deployment pipeline with environment promotion
- [ ] T12.4: Add performance monitoring and alerting
- [ ] T12.5: Create deployment checklist and rollback procedures
- [ ] T12.6: Document API usage and troubleshooting guide
- [x] T12.7: Clean up codebase and remove unused files/folders ✅

### T13: Product Documentation, User Guides and Support

- [ ] T13.1: Create user guide for how to contribute to the Peña Bética Escocesa website
- [ ] T13.2: Document the architecture and design decisions
- [ ] T13.3: Add transparent user tracking using umami or similar, always transparent and not intrusive (getting anonimised aggregated data)
- [ ] T13.4: Create a support page with contact information and FAQs
- [ ] T13.5: Create a contribution guide for developers
- [ ] T13.6: Feedback form/issue template for users to suggest improvements/problems. Use github issues for this.
- [ ] T13.7: Integrate the template with the website, so that users can easily access it.

### T14: Fixed & Upcoming Matches Data

- [x] T14.1: Research and gather all Real Betis 2024–25 UEFA Conference League fixtures (group stage, knockouts, final) ✅
- [x] T14.2: Research upcoming friendly matches and collect date, opponent, and venue details ✅
- [x] T14.3: Add a top-level `conferenceLeague` array to `data/matches.json` with all UEFA Conference League matches ✅
- [x] T14.4: Add a top-level `friendlies` array to `data/matches.json` with all upcoming friendlies ✅
- [x] T14.5: Update `src/app/partidos/page.tsx` to load and display `conferenceLeague` matches alongside existing fixtures ✅
- [x] T14.6: Update UI to load and display `friendlies` under a distinct section or badge ✅
- [x] T14.7: Document the match data maintenance process in `README.md` ✅

### T15: Database Migration & Persistence

- [ ] T15.1: Evaluate free-tier database providers (e.g., Supabase, Vercel??) and select one for match storage
- [ ] T15.2: Configure database connection using environment variables (`.env.local` and `.env.example`)
- [ ] T15.3: Design and create a `matches` table schema to store fixtures and friendlies
- [ ] T15.4: Implement a service layer (`src/services/databaseService.ts`) for CRUD operations against the database
- [ ] T15.5: Update data loading in `src/app/partidos/page.tsx` to fetch matches from the database instead of JSON
- [ ] T15.6: Create a seed script (`scripts/seed-matches.ts`) to import existing `conferenceLeague` and `friendlies` JSON data into the database
- [ ] T15.7: Document database setup, seeding, and maintenance instructions in `README.md`

## 📁 **RELEVANT FILES**

### ✅ **Completed Files**

- `prd-laliga-match-integration.md` - Product Requirements Document
- `.env.local` - Environment configuration with Football-Data.org API key
- `.env.example` - Example environment configuration  
- `src/types/env.d.ts` - TypeScript environment variable declarations
- `src/lib/config.ts` - Environment configuration utilities
- `scripts/test-api.ts` - Football-Data.org connectivity test script
- `src/services/footballDataService.ts` - Complete Football-Data.org service layer ✅
- `src/app/api/matches/route.ts` - API endpoint implementation ✅
- `src/app/partidos/page.tsx` - Updated matches page with real data ✅
- `src/types/match.ts` - Complete TypeScript interfaces for Football-Data.org ✅
- `src/components/MatchCard.tsx` - Enhanced match card with logos, status, scores ✅
- `src/components/LoadingSpinner.tsx` - Loading states and skeletons ✅
- `src/components/ErrorMessage.tsx` - Error handling components ✅
- `src/components/ErrorBoundary.tsx` - Error boundaries with fallback UI ✅
- `src/components/OfflineDetector.tsx` - Offline detection and messaging ✅
- `src/components/PaginatedMatches.tsx` - Pagination component for historical matches ✅
- `package.json` - Updated with test scripts
- `API_FREE_TIER_SOLUTION.md` - Documentation of 403 error fix ✅

### 🔄 **Files to Modify**

- `src/types/match.ts` - TypeScript interfaces (to be created)
- `src/components/MatchCard.tsx` - Enhanced match card component  
- `src/app/partidos/page.tsx` - Main matches page
- `src/app/api/matches/route.ts` - API endpoint (to be created)

### 🆕 **Files to Create**

- `scripts/seed-matches.ts` - Seed JSON match data into database

---

## 📝 **NOTES & CONSTRAINTS**

### Football-Data.org API (Version 1)

- **Rate Limit**: 10 requests/minute, 14,400/day
- **Real Betis Team ID**: 90 (verified)
- **Team Name**: "Real Betis Balompié" (official API name)
- **Competitions**: La Liga (ID: 2014), Copa del Rey (ID: 2018)
- **Data Available**: Fixtures, results, standings, basic team info
- **Cache Strategy**: 30 minutes for fixtures, 5 minutes for live matches

### Development Priorities

1. **Version 1 First**: Complete functional system with Football-Data.org
2. **Mobile First**: All components must work well on mobile devices  
3. **Progressive Enhancement**: Ensure basic functionality without JavaScript
4. **Spanish Localization**: Error messages and dates in Spanish
5. **Error Resilience**: Graceful degradation when API is unavailable
