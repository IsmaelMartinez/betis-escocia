# Task List: Partidos Section Implementation

**Based on PRD:** `tasks/prd-partidos.md`

## Overview
Implement a static partidos section where users can see league games for the current season. The data will be stored in a database, and admin interface allows creating and updating matches.

---

## 1. Database Setup and Data Models
- [x] 1.1 Create database table for storing match data
  - [x] 1.1.1 Design schema with fields: id, date_time, opponent, competition, home_away, notes, created_at, updated_at
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
  - [x] 3.1.2 Add validation for date/time, opponent, competition
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
- [x] 6.3 Football-Data.org API Integration
  - [x] 6.3.1 Create script to sync LaLiga matches from API to database
  - [x] 6.3.2 Implement automatic data synchronization
  - [x] 6.3.3 Handle data conflicts and duplicates

## 7. Testing and Validation
- [x] 7.1 Test database operations
  - [x] 7.1.1 Test CRUD operations on matches table (✅ friendly matches inserted)
  - [x] 7.1.2 Test relationship with RSVP system
  - [x] 7.1.3 Validate data integrity and constraints
- [x] 7.2 Test UI components
  - [x] 7.2.1 Test MatchCard component with database data
  - [x] 7.2.2 Test responsive design
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

## 9. RSVP System Enhancements
- [x] 9.1 Smart match selection for RSVP
  - [x] 9.1.1 Show next upcoming game by default when no match_id is passed
  - [x] 9.1.2 Allow users to select different games for RSVP
  - [x] 9.1.3 Add dropdown/selector for available upcoming matches
- [x] 9.2 Improve RSVP visibility
  - [x] 9.2.1 Show attendee count next to "Confirmar Asistencia" button (e.g., "Confirmar Asistencia (5)")
  - [x] 9.2.2 Update MatchCard component to display current RSVP counts
  - [x] 9.2.3 Real-time update of counts when RSVPs are submitted

## 10. Homepage Layout Improvements
- [x] 10.1 Enhanced main page layout
  - [x] 10.1.1 Show next 2 games side by side instead of stacked
  - [x] 10.1.2 Add classification widget to main page
  - [x] 10.1.3 Optimize layout for desktop and mobile responsiveness
- [x] 10.2 Widget improvements
  - [x] 10.2.1 Update UpcomingMatchesWidget to display 2 matches horizontally
  - [x] 10.2.2 Integrate classification widget alongside matches
  - [x] 10.2.3 Ensure proper spacing and visual hierarchy

## 11. LaLiga Data Integration
- [x] 11.1 Football-Data.org API integration
  - [x] 11.1.1 Create script to fetch LaLiga matches for current season
  - [x] 11.1.2 Import Real Betis matches automatically to database
  - [x] 11.1.3 Handle data mapping and transformation
- [x] 11.2 Data synchronization
  - [x] 11.2.1 Implement manual sync mechanism (automatic sync deferred)
  - [x] 11.2.2 Handle duplicate detection and updates
  - [x] 11.2.3 Add manual sync trigger for admin users
    - ✅ Added `/api/admin/sync-matches` endpoint for manual sync
    - ✅ Added sync button to admin dashboard and matches view
    - ✅ Includes success/error message feedback and loading states
    - ✅ Refreshes match data after successful sync

## 12. Admin Panel Enhancements
- [x] 12.1 Complete admin page functionality
  - [x] 12.1.1 Add tabbed interface for Dashboard and Partidos
  - [x] 12.1.2 Integrate MatchForm and MatchesList components
  - [x] 12.1.3 Implement full CRUD operations for matches
  - [x] 12.1.4 Add match statistics to dashboard
- [x] 12.2 Fix homepage layout and classification widget
  - [x] 12.2.1 Adjust homepage layout to 3/4 for matches, 1/4 for classification
  - [x] 12.2.2 Fix ClassificationWidget API token issue
  - [x] 12.2.3 Create API route for standings data

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

## 9. Competition Type Filters (NEW)
- [x] 9.1 Add competition type filters to partidos page
  - [x] 9.1.1 Add filter buttons for different competition types (Amistoso Pretemporada, LaLiga, Copa del Rey, etc.)
  - [x] 9.1.2 Show only competitions that have matches in the database
  - [x] 9.1.3 Combine competition filters with existing time-based filters (Todos/Próximos/Pasados)
  - [x] 9.1.4 Update filter counts to reflect competition-specific matches

## 10. Admin Panel and RSVP System Fixes (NEW)
- [x] 10.1 Fix admin panel CRUD operations
  - [x] 10.1.1 Fix edit match "JSON object requested, multiple rows returned" error
  - [x] 10.1.2 Fix create match "new row violates row-level security policy" error
  - [x] 10.1.3 Fix delete match functionality
  - [x] 10.1.4 Add SQL policies to allow anonymous CRUD operations on matches table
- [x] 10.2 Fix RSVP system match association
  - [x] 10.2.1 Ensure RSVP submissions include match_id in database
  - [x] 10.2.2 Update RSVP API to handle match_id parameter
  - [x] 10.2.3 Fix RSVP form to pass selectedMatchId to backend

## 11. Enhanced RSVP Integration (NEW)
- [x] 11.1 Add RSVP buttons to all match cards
  - [x] 11.1.1 Update MatchCard component to include RSVP button
  - [x] 11.1.2 Link RSVP button to specific match ID
  - [x] 11.1.3 Display current RSVP count on each match card
  - [x] 11.1.4 Show RSVP counts in match selection dropdown

## 12. LaLiga Match Import Execution (NEW)
- [x] 12.1 Database preparation for import
  - [x] 12.1.1 Apply SQL migration to add external_id and external_source columns
  - [x] 12.1.2 Create unique constraints to prevent duplicate imports
- [x] 12.2 Execute LaLiga match import
  - [x] 12.2.1 Run import script to populate database with historical matches (2023-24, 2024-25)
  - [x] 12.2.2 Import upcoming season matches (2025-26 season: 38 matches)
  - [x] 12.2.3 Verify imported matches display correctly in UI
  - [x] 12.2.4 Test RSVP functionality with imported matches

## 13. Match Data Enhancements (NEW)
- [x] 13.1 Remove friendly match limits
  - [x] 13.1.1 Show all upcoming friendly matches instead of limiting to 2
  - [x] 13.1.2 Remove "próximos 2" limitation from UI
- [x] 13.2 Add match results and scores
  - [x] 13.2.1 Add result, score, and status fields to database
  - [x] 13.2.2 Update import script to pull match results from API
  - [x] 13.2.3 Update MatchCard component to display scores for finished matches
- [x] 13.3 Update stadium information
  - [x] 13.3.1 Change Betis home venue from "Benito Villamarín" to "La Cartuja"
  - [x] 13.3.2 Update all existing match records with correct venue

## 14. UI Improvements and Pagination (NEW)
- [x] 14.1 Add pagination to partidos page
  - [x] 14.1.1 Implement pagination component with page controls
  - [x] 14.1.2 Add matches per page limit (default: 20 matches)
  - [x] 14.1.3 Add pagination info (showing X of Y matches)
- [x] 14.2 Improve default filter behavior
  - [x] 14.2.1 Change default filter from 'todos' to 'proximos' (upcoming matches)
  - [ ] 14.2.2 Update URL routing to support filter state
- [x] 14.3 Complete remaining import verification tasks
  - [x] 14.3.1 Verify imported matches display correctly in UI
  - [x] 14.3.2 Test RSVP functionality with imported matches
  - [x] 14.3.3 Verify match results and scores display properly

## Success Criteria
- [x] Next 2-3 Betis matches are displayed in card format using existing MatchCard component
- [x] Admin can manually create, edit, and delete matches
- [x] Matches are linked to RSVP system
- [x] Feature flag controls visibility
- [x] Navigation works from clasificacion page
- [x] Responsive design works on all devices
- [x] Database integration works correctly with proper sorting and limits
