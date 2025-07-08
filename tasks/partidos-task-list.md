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
- [ ] 1.2 Extend Supabase configuration
  - [ ] 1.2.1 Add Match interface to supabase.ts
  - [ ] 1.2.2 Create helper functions for CRUD operations on matches
- [ ] 1.3 Link matches to RSVP system
  - [ ] 1.3.1 Update RSVP table to include match_id foreign key
  - [ ] 1.3.2 Create relationship between matches and RSVPs

## 2. Feature Flag Implementation
- [ ] 2.1 Add showPartidos feature flag
  - [ ] 2.1.1 Update FeatureFlags interface in featureFlags.ts
  - [ ] 2.1.2 Add showPartidos to defaultFlags (set to false - hidden by default)
  - [ ] 2.1.3 Add environment variable support for NEXT_PUBLIC_FEATURE_PARTIDOS
- [ ] 2.2 Update navigation system
  - [ ] 2.2.1 Add Partidos to getEnabledNavigationItems function
  - [ ] 2.2.2 Ensure partidos page is protected by feature flag

## 3. Admin Interface Components
- [ ] 3.1 Create match CRUD form
  - [ ] 3.1.1 Design form for creating/editing matches with all required fields
  - [ ] 3.1.2 Add validation for date/time, opponent, venue, competition
  - [ ] 3.1.3 Add submit/cancel/delete functionality
- [ ] 3.2 Create admin matches list component
  - [ ] 3.2.1 Display all matches in admin-friendly table/list format
  - [ ] 3.2.2 Add edit/delete actions for each match
  - [ ] 3.2.3 Add pagination and filtering capabilities
- [ ] 3.3 Protect admin components with feature flags
  - [ ] 3.3.1 Wrap admin components with FeatureWrapper for showAdmin flag

## 4. Match Display Components
- [ ] 4.1 Enhance existing MatchCard component (reuse from partidos page)
  - [ ] 4.1.1 Ensure it supports our database match schema
  - [ ] 4.1.2 Add RSVP integration if not already present
  - [ ] 4.1.3 Verify responsive design for mobile/desktop
- [ ] 4.2 Create UpcomingMatches component
  - [ ] 4.2.1 Fetch and display next 3 matches from database
  - [ ] 4.2.2 Reuse MatchCard component for display
  - [ ] 4.2.3 Handle loading and error states
  - [ ] 4.2.4 Add empty state when no matches available
- [ ] 4.3 Add RSVP integration to match cards
  - [ ] 4.3.1 Add RSVP button/link to each match card
  - [ ] 4.3.2 Link to RSVP form with pre-filled match information
  - [ ] 4.3.3 Show RSVP count if available

## 5. Page Integration and Navigation
- [ ] 5.1 Update main partidos page
  - [ ] 5.1.1 Add UpcomingMatches component to existing page
  - [ ] 5.1.2 Integrate admin controls (protected by feature flags)
  - [ ] 5.1.3 Ensure page works with existing FilteredMatches component
- [ ] 5.2 Add widget for main page
  - [ ] 5.2.1 Create compact UpcomingMatchesWidget component using MatchCard
  - [ ] 5.2.2 Add to main page with FeatureWrapper protection
  - [ ] 5.2.3 Add "Ver todos los partidos" link to full page
- [ ] 5.3 Link from clasificacion page
  - [ ] 5.3.1 Add navigation link from clasificacion to partidos
  - [ ] 5.3.2 Ensure link respects feature flag visibility

## 6. Testing and Validation
- [ ] 6.1 Test database operations
  - [ ] 6.1.1 Test CRUD operations on matches table
  - [ ] 6.1.2 Test relationship with RSVP system
  - [ ] 6.1.3 Validate data integrity and constraints
- [ ] 6.2 Test UI components
  - [ ] 6.2.1 Test MatchCard component with database data
  - [ ] 6.2.2 Test responsive design
  - [ ] 6.2.3 Test admin interface functionality
- [ ] 6.3 Integration testing
  - [ ] 6.3.1 Test complete flow: database → UI display
  - [ ] 6.3.2 Test RSVP integration
  - [ ] 6.3.3 Test feature flag toggling

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

## Success Criteria
- [ ] Next 3 Betis matches are displayed in card format using existing MatchCard component
- [ ] Admin can manually create, edit, and delete matches
- [ ] Matches are linked to RSVP system
- [ ] Feature flag controls visibility
- [ ] Navigation works from clasificacion page
- [ ] Responsive design works on all devices
- [ ] All tests pass
