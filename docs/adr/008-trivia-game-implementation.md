# 008-trivia-game-implementation

## Title
Trivia Game Implementation

## Status
Superseded

**Superseded by**: [ADR 021 - Trivia System Architectural Simplification](021-trivia-system-simplification.md)

*Note: The trivia system described in this ADR has been identified as over-engineered and is being simplified through a comprehensive architectural refactoring documented in ADR 017. While the original implementation successfully delivered all planned functionality, the complexity has grown beyond what is needed for a daily quiz feature, necessitating significant simplification for better maintainability and performance.*

## Context
To enhance user engagement and provide an interactive experience, a trivia game feature has been implemented for the Peña Bética Escocesa website. This game tests users' knowledge of Real Betis and Scottish culture/history, reinforcing the unique blend of Betis fandom and Scottish heritage that defines our community.

## Decision
The trivia game has been implemented as a new feature within the existing Next.js application with the following architectural decisions:

### Database Design
- **Supabase tables**: `trivia_questions`, `trivia_answers`, and `user_trivia_scores` for relational data storage
- **Question categorization**: Support for 'betis' and 'scotland' categories
- **Difficulty levels**: 'easy', 'medium', 'hard' for future expansion
- **Flexible answer structure**: Multiple choice with boolean `is_correct` flag
- **User Score Tracking**: `user_trivia_scores` table to store daily scores linked to authenticated users, including a pointing system for correct answers.

### Feature Flag Integration
- **Flag name**: `show-trivia-game` (following project naming conventions)
- **Default state**: Disabled (`false`) for controlled rollout
- **Legacy support**: `showTriviaGame` for backward compatibility
- **Navigation integration**: Conditional rendering based on flag status

### Frontend Implementation
- **Daily gameplay**: Limited to once per day to encourage return visits
- **3-question format**: Concise gameplay optimized for mobile engagement
- **Timed gameplay**: 15-second countdown per question
- **Results page**: Dedicated completion screen with score tracking message and display of daily/accumulated points.
- **Visual feedback**: Color-coded answer highlighting (green/red)
- **Responsive design**: Mobile-first approach matching site aesthetics
- **Error handling**: Graceful fallbacks for disabled feature or API failures
- **Loading states**: Spinner and error components for better UX

### API Design
- **Endpoint**: `/api/trivia` for question retrieval and score submission
- **Randomization**: Questions and answers shuffled on each request
- **Data format**: Includes nested answers with question data
- **Error handling**: Proper HTTP status codes and error messages
- **Score Submission**: `POST` requests to `/api/trivia` to submit daily scores, calculate points for correct answers, and store them for authenticated users.
- **Daily Play Check**: `GET` requests to `/api/trivia` now check if an authenticated user has already played today.
- **Total Score Retrieval**: New endpoint (`/api/trivia/total-score-dashboard`) to retrieve a user's total accumulated trivia score for display on the dashboard.

## Implementation Details

### Technical Components
1. **Database Schema** (`sql/create_trivia_tables.sql`, `sql/create_user_trivia_scores_table.sql`, `sql/user_trivia_scores_rls.sql`)
   - Primary key UUID fields
   - Foreign key relationships
   - Timestamp tracking for auditing
   - Row Level Security (RLS) for user scores.

2. **API Route** (`src/app/api/trivia/route.ts`)
   - Server-side randomization
   - Supabase integration
   - Error handling and logging
   - Handles score submission, daily play checks, and point calculation.

3. **Frontend Game** (`src/app/trivia/page.tsx`)
   - React hooks for state management
   - Timer component integration
   - Feature flag checking
   - Displays running total of points during gameplay and final daily/accumulated scores on results page.

4. **Timer Component** (`src/components/GameTimer.tsx`)
   - Reusable countdown timer
   - Reset capability via trigger prop
   - Visual progress indication

5. **Trivia Score Display Component** (`src/components/TriviaScoreDisplay.tsx`)
   - Dedicated component for displaying user's total accumulated trivia score on the dashboard.

### Testing Strategy
- **Unit tests**: GameTimer component functionality, new utility functions for point calculation.
- **Integration tests**: API endpoint behavior for question retrieval, score submission, and total score retrieval.
- **E2E tests**: Complete game flow validation, including display of points and daily play enforcement.
- **Vitest Configuration**: The project has transitioned from Jest to Vitest for testing, leveraging its speed and modern features. The configuration includes support for React and TypeScript, ensuring compatibility with the existing codebase. Key configuration files:
   - `vitest.config.ts`: Defines path aliases, environment variables, and test coverage settings.
   - `tests/setup.ts`: Sets up the testing environment, including DOM testing utilities and global mocks.
   - `playwright/global.setup.ts`: Handles E2E test setup, including authentication state with Clerk.
- **Migration Notes**: All Jest-specific configurations and tests have been updated to work with Vitest. Refer to `docs/testing-migration.md` for detailed migration steps and troubleshooting tips.
- **Playwright E2E Testing with Clerk**: Implemented dedicated test user setup and session saving for robust E2E testing of authenticated flows.

## Consequences

### Positive
- ✅ Increased user engagement and daily return visits through once-per-day gameplay.
- ✅ Provides an entertaining and educational activity optimized for mobile.
- ✅ Reinforces the unique blend of Betis fandom and Scottish heritage.
- ✅ Utilizes existing technology stack (Next.js, Supabase, Flagsmith).
- ✅ Mobile-optimized experience perfect for pub gaming.
- ✅ Controlled rollout capability via feature flags.
- ✅ Comprehensive test coverage (all tests passing, including new pointing system tests).
- ✅ Concise 3-question format prevents user fatigue.
- ✅ **Full trivia pointing system implemented**, incentivizing daily play and providing immediate feedback on performance.

### Negative
- ⚠️ Requires manual population of trivia questions for Betis-specific content.
- ⚠️ Adds complexity to the application's data model and frontend logic.

### Neutral
- 🔄 Game accessible via direct URL `/trivia` when feature flag enabled.
- 🔄 Navigation menu integration based on feature flag status.
- 🔄 External trivia APIs considered but not implemented (insufficient Betis content).
- 🔄 Results page replaces popup for better user experience.

## Alternatives Considered

### External Trivia APIs
- **Evaluated**: Multiple free trivia APIs
- **Decision**: Rejected due to lack of Real Betis-specific content
- **Future consideration**: May supplement general knowledge questions

### Database Solutions
- **Evaluated**: Alternative database structures
- **Decision**: Supabase chosen for consistency with existing infrastructure
- **Benefits**: Unified authentication, real-time capabilities, SQL familiarity

### Feature Flag Approaches
- **Evaluated**: Environment variables vs. Flagsmith
- **Decision**: Flagsmith chosen for dynamic control without deployments
- **Implementation**: Dual fallback support (Flagsmith + environment variables)

## Future Considerations

### Planned Enhancements
- **Leaderboards**: User-specific score tracking and rankings with daily/weekly/monthly views.
- **Question management**: Admin interface for easier content management.
- **Enhanced categories**: More granular question categorization.
- **Multimedia questions**: Image-based and audio questions.
- **Social features**: Share scores, challenge friends, community achievements.

### Technical Improvements
- **Caching strategy**: Question pre-loading for better performance.
- **Analytics integration**: Track engagement metrics and popular questions.
- **Progressive Web App**: Offline gameplay capability.
- **Accessibility**: Enhanced screen reader support and keyboard navigation.

### Content Strategy
- **Community contributions**: User-submitted questions with moderation.
- **Seasonal content**: Match-day specials and tournament-themed questions.
- **Difficulty balancing**: Analytics-driven question difficulty adjustment.
- **Localization**: Support for both Spanish and English questions.

## Monitoring and Success Metrics

### Technical Metrics
- **Performance**: Page load times and API response times.
- **Error rates**: Failed requests and client-side errors.
- **Feature flag usage**: Adoption rates and user engagement.

### Business Metrics
- **User engagement**: Time spent on trivia page.
- **Completion rates**: Percentage of users finishing games.
- **Return usage**: Frequency of repeat gameplay.

## Documentation Links

- **API Documentation**: See inline comments in `src/app/api/trivia/route.ts`
- **Database Schema**: `sql/create_trivia_tables.sql` and `sql/populate_trivia_data.sql`
