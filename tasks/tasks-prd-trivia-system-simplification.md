## Relevant Files

- `src/app/api/trivia/route.ts` - Main API route that needs consolidation from 3 endpoints to 1 with query parameters
- `src/app/api/trivia/total-score/route.ts` - **REMOVED** - Backward compatibility adapter eliminated in Phase 1 cleanup
- `src/app/api/trivia/total-score-dashboard/route.ts` - **REMOVED** - Backward compatibility adapter eliminated in Phase 1 cleanup
- `src/app/trivia/page.tsx` - Main trivia component with 10+ state variables to be simplified to 3 core states
- `src/components/GameTimer.tsx` - Complex timer component to be replaced with simple setTimeout implementation
- `src/components/TriviaScoreDisplay.tsx` - Specialized component to be removed and functionality inlined
- `src/lib/trivia/utils.ts` - Shared utility functions for trivia logic including daily play checks, score validation, question shuffling, and business event logging
- `tests/unit/app/trivia/page.test.tsx` - Unit tests for main trivia component
- `tests/unit/components/GameTimer.test.tsx` - Tests for timer component (to be updated for simplified approach)
- `tests/unit/components/TriviaScoreDisplay.test.tsx` - Tests to be removed when component is eliminated
- `tests/integration/api/trivia/route.test.ts` - API integration tests for consolidated endpoint
- `tests/unit/lib/trivia/utils.test.ts` - Unit tests for new utility functions
- `sql/trivia_optimization.sql` - Database optimization queries including indexes, views, and performance improvements for trivia system
- `scripts/trivia-performance-test.js` - Comprehensive performance testing script for API benchmarking and load testing
- `docs/trivia-performance-report.md` - Performance analysis report documenting improvements and benchmarks

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `page.tsx` and `page.test.tsx` in the same directory).
- Use `npx vitest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Vitest configuration.

## Tasks

- [ ] 1.0 Backend API Consolidation and Optimization
  - [x] 1.1 Create consolidated `/api/trivia` endpoint with query parameter routing (`?action=questions|submit|score`)
  - [x] 1.2 Implement backward compatibility adapter for existing frontend during Phase 1
  - [x] 1.3 Migrate question retrieval logic from original endpoint to consolidated route
  - [x] 1.4 Migrate score submission logic from POST endpoint to consolidated route
  - [x] 1.5 Migrate total score retrieval logic from separate endpoints to consolidated route
  - [x] 1.6 Create shared utility functions for daily play checks and score calculations
  - [x] 1.7 Optimize database queries to eliminate redundant operations
  - [x] 1.8 Add comprehensive error handling and logging for consolidated endpoint
  - [x] 1.9 Remove original separate API endpoints after validation
  - [x] 1.10 Performance test consolidated API vs original implementation

- [ ] 2.0 Frontend State Management Simplification
  - [ ] 2.1 Implement new 3-variable state system: `gameState`, `currentData`, `error`
  - [ ] 2.2 Replace current 10+ state variables with simplified state machine pattern
  - [ ] 2.3 Create state transition logic: `idle → playing → completed`
  - [ ] 2.4 Migrate question navigation logic to use simplified state
  - [ ] 2.5 Migrate timer functionality to use simplified state management
  - [ ] 2.6 Migrate score tracking and calculation to simplified approach
  - [ ] 2.7 Remove complex conditional rendering logic and replace with declarative patterns
  - [ ] 2.8 Update API integration to work with simplified state structure
  - [ ] 2.9 Implement error handling within simplified state system
  - [ ] 2.10 Test state transitions and ensure no functionality regression

- [ ] 3.0 Component Architecture Streamlining
  - [ ] 3.1 Remove `GameTimer` component and replace with simple `setTimeout` implementation
  - [ ] 3.2 Remove `TriviaScoreDisplay` component and inline score display in main component
  - [ ] 3.3 Consolidate timer logic directly into main trivia page component
  - [ ] 3.4 Implement simple countdown timer without complex visual progress components
  - [ ] 3.5 Inline score display functionality with simplified state management
  - [ ] 3.6 Remove component interdependencies and complex prop passing
  - [ ] 3.7 Simplify visual feedback system while maintaining user experience
  - [ ] 3.8 Update component imports and remove unused component references
  - [ ] 3.9 Optimize component re-rendering through simplified state structure
  - [ ] 3.10 Validate mobile responsiveness with simplified component architecture

- [ ] 4.0 Testing and Quality Assurance Updates
  - [ ] 4.1 Update existing unit tests for simplified trivia page component
  - [ ] 4.2 Remove tests for eliminated components (`GameTimer`, `TriviaScoreDisplay`)
  - [ ] 4.3 Create new integration tests for consolidated API endpoint
  - [ ] 4.4 Add tests for new utility functions and shared logic
  - [ ] 4.5 Update E2E tests to work with simplified game flow
  - [ ] 4.6 Implement performance regression tests for load time improvements
  - [ ] 4.7 Add tests for backward compatibility during Phase 1 transition
  - [ ] 4.8 Create tests for error handling in simplified system
  - [ ] 4.9 Validate test coverage maintains 80%+ threshold after simplification
  - [ ] 4.10 Run comprehensive test suite and fix any failures from simplification

- [ ] 5.0 Documentation and Migration Safety
  - [ ] 5.1 Update API documentation for consolidated endpoint structure
  - [ ] 5.2 Document new state management patterns for future development
  - [ ] 5.3 Create migration guide for understanding simplified architecture
  - [ ] 5.4 Update component documentation to reflect simplified structure
  - [ ] 5.5 Implement feature flag strategy for safe Phase 1 deployment
  - [ ] 5.6 Create rollback procedures for each phase of simplification
  - [ ] 5.7 Add monitoring and logging for tracking simplification success metrics
  - [ ] 5.8 Update trivia system documentation in CLAUDE.md
  - [ ] 5.9 Document performance improvements and code reduction achievements
  - [ ] 5.10 Create post-simplification maintenance guide for future developers

- [ ] 6.0 Randomness Optimization Fix
  - [ ] 6.1 Implement database-level randomization using PostgreSQL ORDER BY RANDOM() 
  - [ ] 6.2 Update trivia API to select exactly 5 questions directly from database
  - [ ] 6.3 Remove client-side question shuffling logic (now redundant)
  - [ ] 6.4 Add database indexing optimizations for random query performance
  - [ ] 6.5 Test randomization quality with statistical analysis over multiple requests
  - [ ] 6.6 Update performance benchmarks to reflect new randomization approach
  - [ ] 6.7 Verify no duplicate questions appear in single game session
  - [ ] 6.8 Document improved randomization approach in API documentation
  - [ ] 6.9 Update trivia utility functions to remove now-unnecessary shuffling code
  - [ ] 6.10 Validate that question variety increases compared to limited pool approach