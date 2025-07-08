# Task List: Partidos Section Implementation

**Based on PRD:** `tasks/prd-partidos.md`

## Overview
Implement a static partidos section where users can see league games for the current season. The data will be stored in a database, and admin interface allows creating and updating matches.

---

## 1. Database Setup and Data Models
- [x] 1.1 Create database table for storing match data
  - [x] 1.1.1 Design schema with fields: id, date_time, opponent, venue, competition, home_away, notes, created_at, updated_at
  - [x] 1.1.2 Create SQL migration file for matches table
  - [x] 1.1.3 Add TypeScript interfaces for Match data types
- [x] 1.2 Extend Supabase configuration
  - [x] 1.2.1 Add Match interface to supabase.ts
  - [x] 1.2.2 Create helper functions for CRUD operations on matches
- [x] 1.3 Link matches to RSVP system
  - [x] 1.3.1 Update RSVP table to include match_id foreign key
  - [x] 1.3.2 Create relationship between matches and RSVPs

## 2. Feature Flag Implementation
- [x] 2.1 Add showPartidos feature flag
  - [x] 2.1.1 Update FeatureFlags interface in featureFlags.ts
  - [x] 2.1.2 Add showPartidos to defaultFlags (set to false - hidden by default)
  - [x] 2.1.3 Add environment variable support for NEXT_PUBLIC_FEATURE_PARTIDOS
- [x] 2.2 Update navigation system
  - [x] 2.2.1 Add Partidos to getEnabledNavigationItems function
  - [x] 2.2.2 Ensure partidos page is protected by feature flag

## 3. Admin Interface Components
- [x] 3.1 Create match CRUD form
  - [x] 3.1.1 Design form for creating/editing matches with all required fields
  - [x] 3.1.2 Add validation for date/time, opponent, venue, competition
  - [x] 3.1.3 Add submit/cancel/delete functionality
- [x] 3.2 Create admin matches list component
  - [x] 3.2.1 Display all matches in admin-friendly table/list format
  - [x] 3.2.2 Add edit/delete actions for each match
  - [x] 3.2.3 Add pagination and filtering capabilities
- [x] 3.3 Protect admin components with feature flags
  - [x] 3.3.1 Wrap admin components with FeatureWrapper for showAdmin flag

## 4. Match Display Components
- [x] 4.1 Enhance existing MatchCard component (reuse from partidos page)
  - [x] 4.1.1 Ensure it supports our database match schema
  - [x] 4.1.2 Add RSVP integration if not already present
  - [x] 4.1.3 Verify responsive design for mobile/desktop
- [x] 4.2 Create UpcomingMatches component
  - [x] 4.2.1 Fetch and display next 3 matches from database
  - [x] 4.2.2 Reuse MatchCard component for display
  - [x] 4.2.3 Handle loading and error states
  - [x] 4.2.4 Add empty state when no matches available
- [x] 4.3 Add RSVP integration to match cards
  - [x] 4.3.1 Add RSVP button/link to each match card
  - [x] 4.3.2 Link to RSVP form with pre-filled match information
  - [x] 4.3.3 Show RSVP count if available

## 5. Page Integration and Navigation
- [x] 5.1 Update main partidos page
  - [x] 5.1.1 Add UpcomingMatches component to existing page
  - [x] 5.1.2 Integrate admin controls (protected by feature flags)
  - [x] 5.1.3 Ensure page works with existing FilteredMatches component
- [x] 5.2 Add widget for main page
  - [x] 5.2.1 Create compact UpcomingMatchesWidget component using MatchCard
  - [x] 5.2.2 Add to main page with FeatureWrapper protection
  - [x] 5.2.3 Add "Ver todos los partidos" link to full page
- [x] 5.3 Link from clasificacion page
  - [x] 5.3.1 Add navigation link from clasificacion to partidos
  - [x] 5.3.2 Ensure link respects feature flag visibility

## 6. Database Integration Fixes
- [x] 6.1 Fix partidos page data source priority
  - [x] 6.1.1 Make database the primary data source for partidos page
  - [x] 6.1.2 Move API data to expandable section for backup/comparison
  - [x] 6.1.3 Update page layout to prioritize UpcomingMatches component
- [x] 6.2 Complete database integration
  - [x] 6.2.1 Replace static JSON data with database queries
  - [x] 6.2.2 Update AllDatabaseMatches to display database data properly
  - [x] 6.2.3 Fix display logic to limit friendly games to 2 and correct ordering
- [ ] 6.3 Football-Data.org API Integration
  - [ ] 6.3.1 Create script to sync LaLiga matches from API to database
  - [ ] 6.3.2 Implement automatic data synchronization
  - [ ] 6.3.3 Handle data conflicts and duplicates

## 7. Testing and Validation
- [x] 7.1 Test database operations
  - [x] 7.1.1 Test CRUD operations on matches table (✅ friendly matches inserted)
  - [x] 7.1.2 Test relationship with RSVP system
  - [x] 7.1.3 Validate data integrity and constraints
- [x] 7.2 Test UI components
  - [x] 7.2.1 Test MatchCard component with database data
  - [x] 7.2.2 Test responsive design
- [ ] 7.2.3 Test admin interface functionality
- [x] 7.3 Integration testing
  - [x] 7.3.1 Test complete flow: database → UI display (✅ UpcomingMatches works)
  - [x] 7.3.2 Test RSVP integration (✅ working on homepage widget)
  - [x] 7.3.3 Test feature flag toggling

## 8. Bug Fixes and Maintenance
- [x] 8.1 Fix JSX parsing errors in MatchCard component
  - [x] 8.1.1 Fix Unicode-encoded JSX tags (\u003c, \u003e) to proper angle brackets
  - [x] 8.1.2 Fix TypeScript errors in component files
  - [x] 8.1.3 Clean up unused imports and linting issues
  - [x] 8.1.4 Restart development server after fixes

---

## Relevant Files
_Will be updated as implementation progresses_

### Database
- `sql/create_matches_table.sql` - Database schema for matches
- `src/lib/supabase.ts` - Enhanced with Match interfaces

### Components
- `src/components/MatchCard.tsx` - Individual match display component
- `src/components/UpcomingMatches.tsx` - List of upcoming matches
- `src/components/UpcomingMatchesWidget.tsx` - Compact widget for main page
- `src/components/AdminMatchControls.tsx` - Admin interface components

### Pages
- `src/app/partidos/page.tsx` - Enhanced with new functionality
- `src/app/page.tsx` - Main page with upcoming matches widget
- `src/app/admin/page.tsx` - Admin interface for match management

### Configuration
- `src/lib/featureFlags.ts` - Updated with showPartidos flag

---

## 8. Partidos Section Improvements (NEW)
- [x] 8.1 Fix filter counts and visibility
  - [x] 8.1.1 Filter by competitions that have upcoming matches
  - [x] 8.1.2 Show correct count numbers for todos/próximos/pasados filters
  - [x] 8.1.3 Hide competitions without upcoming matches (Europa League, La Liga, Copa)
- [x] 8.2 UI/UX improvements
  - [x] 8.2.1 Remove team logos that aren't displaying properly
  - [x] 8.2.2 Add "que no hay" subtitle in the "No busques más" section
- [x] 8.3 Dynamic RSVP integration
  - [x] 8.3.1 Make RSVP system dynamic to load match information automatically
  - [x] 8.3.2 Ensure proper match ID linking between partidos and RSVP pages

## Success Criteria
- [x] Next 2-3 Betis matches are displayed in card format using existing MatchCard component
- [x] Admin can manually create, edit, and delete matches
- [x] Matches are linked to RSVP system
- [x] Feature flag controls visibility
- [x] Navigation works from clasificacion page
- [x] Responsive design works on all devices
- [x] Database integration works correctly with proper sorting and limits
