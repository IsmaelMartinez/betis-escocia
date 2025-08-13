## Relevant Files

-   `src/components/ClassificationWidget.tsx` - The component for which stories will be created.
-   `src/components/ClassificationWidget.stories.tsx` - New file for Storybook stories for `ClassificationWidget`.
-   `src/components/MatchCard.tsx` - The component for which stories will be created.
-   `src/components/MatchCard.stories.tsx` - New file for Storybook stories for `MatchCard`.
-   `src/components/RSVPForm.tsx` - The component for which stories will be created.
-   `src/components/RSVPForm.stories.tsx` - New file for Storybook stories for `RSVPForm`.
-   `src/components/ErrorMessage.tsx` - The component for which stories will be created.
-   `src/components/ErrorMessage.stories.tsx` - New file for Storybook stories for `ErrorMessage`.
-   `src/components/CollectionPointsGuide.tsx` - The component for which stories will be created.
-   `src/components/CollectionPointsGuide.stories.tsx` - New file for Storybook stories for `CollectionPointsGuide`.
-   `src/components/CommunityStats.tsx` - The component for which stories will be created.
-   `src/components/CommunityStats.stories.tsx` - New file for Storybook stories for `CommunityStats`.
-   `src/components/Hero.tsx` - The component for which stories will be created.
-   `src/components/Hero.stories.tsx` - New file for Storybook stories for `Hero`.
-   `src/components/MerchandiseCard.tsx` - The component for which stories will be created.
-   `src/components/MerchandiseCard.stories.tsx` - New file for Storybook stories for `MerchandiseCard`.
-   `src/components/TriviaScoreDisplay.tsx` - The component for which stories will be created.
-   `src/components/TriviaScoreDisplay.stories.tsx` - New file for Storybook stories for `TriviaScoreDisplay`.
-   `src/lib/supabase.ts` - May need to reference types or mock data structures from here.
-   `src/lib/featureFlags.ts` - For understanding feature flag usage in components.
-   `src/lib/flagsmith/types.ts` - For understanding feature flag types.
-   `docs/storybook-guide.md` - Existing documentation to ensure adherence to conventions.
-   `src/lib/clerk/__mocks__/index.tsx` - Clerk mocks for Storybook.
-   `.storybook/vite.config.ts` - Vite configuration for Storybook.
-   `.storybook/main.ts` - Storybook main configuration.
-   `.storybook/preview.ts` - Storybook preview configuration.

### Notes

-   Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
-   Use `npm test [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

-   [x] 1.0 Create Stories for `ClassificationWidget.tsx`
    -   [x] 1.1 Create `src/components/ClassificationWidget.stories.tsx` file.
    -   [x] 1.2 Define `Meta` for `ClassificationWidget`, including `title`, `component`, `parameters`, and `tags: ['autodocs']`.
    -   [x] 1.3 Create a default story (`Default`) with sample classification data passed via `initialStandings` prop.
    -   [x] 1.4 Create a story for the loading state (`Loading`) by setting `simulateLoading: true`.
    -   [x] 1.5 Create a story for the empty state (`EmptyState`) by passing an empty array to `initialStandings`.
    -   [x] 1.6 Create a story for the error state (`ErrorState`) by passing `null` to `initialStandings` and ensuring the component's internal fetch fails (e.g., by not mocking the API for this specific story).
    -   [x] 1.7 Ensure all stories use `args` and `argTypes` for interactive controls where applicable.

-   [x] 2.0 Create Stories for `MatchCard.tsx`
    -   [x] 2.1 Create `src/components/MatchCard.stories.tsx` file.
    -   [x] 2.2 Define `Meta` for `MatchCard`, including `title`, `component`, `parameters`, and `tags: ['autodocs']`.
    -   [x] 2.3 Create a default story (`Default`) with typical match data (e.g., upcoming match).
    -   [x] 2.4 Create a story for a completed match with scores (`CompletedMatch`).
    -   [x] 2.5 Create a story for a match with a specific status (e.g., `PostponedMatch`, `LiveMatch`).
    -   [x] 2.6 Create a story demonstrating RSVP functionality (`MatchWithRSVP`).
    -   [x] 2.7 Ensure all stories use `args` and `argTypes` for interactive controls where applicable.
    -   [x] 2.8 Mock any necessary data dependencies for the component.

-   [x] 3.0 Create Stories for `RSVPForm.tsx`
    -   [x] 3.1 Create `src/components/RSVPForm.stories.tsx` file.
    -   [x] 3.2 Define `Meta` for `RSVPForm`, including `title`, `component`, `parameters`, and `tags: ['autodocs']`.
    -   [x] 3.3 Create a default story (`Default`) for the initial form state.
    -   [x] 3.4 Create a story for the form with pre-filled data (e.g., for an authenticated user) (`PreFilledForm`).
    -   [x] 3.5 Create a story demonstrating validation errors (`ValidationErrors`).
    -   [x] 3.6 Create a story for the submitting state (`SubmittingState`).
    -   [x] 3.7 Create a story for the success state after submission (`SuccessState`).
    -   [x] 3.8 Ensure all stories use `args` and `argTypes` for interactive controls where applicable.
    -   [x] 3.9 Mock any necessary form submission logic or external dependencies (e.g., `fetch('/api/rsvp')`, Clerk's `useUser`).

-   [x] 4.0 Create Stories for `ErrorMessage.tsx`
    -   [x] 4.1 Create `src/components/ErrorMessage.stories.tsx` file.
    -   [x] 4.2 Define `Meta` for `ErrorMessage`, including `title`, `component`, `parameters`, and `tags: ['autodocs']`.
    -   [x] 4.3 Create a default story (`Default`) with a simple error message.
    -   [x] 4.4 Create stories for different message types (`WarningMessage`, `InfoMessage`, `OfflineMessage`).
    -   [x] 4.5 Create a story with a custom title and message (`CustomTitleMessage`).
    -   [x] 4.6 Create a story with a retry button (`WithRetryButton`).
    -   [x] 4.7 Ensure all stories use `args` and `argTypes` for interactive controls where applicable.

-   [x] 5.0 Verify and Document Storybook Expansion
    -   [x] 5.1 Run `npm run storybook` and verify that all new stories are visible and interactive in the Storybook UI.
    -   [x] 5.2 Check the "Docs" tab for each new component to ensure automatic documentation is generated correctly.
    -   [x] 5.3 Manually test each story to ensure components render as expected in their various states.
    -   [x] 5.4 Run `npm run build-storybook` to ensure the static build completes without errors.
    -   [x] 5.5 Update `docs/storybook-guide.md` if any new patterns or significant configurations were introduced during story creation.
    -   [x] 5.6 **Verify `ClassificationWidget` stories**:
        -   [x] 5.6.1 Confirm `Default` story shows correct standings data.
        -   [x] 5.6.2 Confirm `Loading` story shows a loading spinner and no data.
        -   [x] 5.6.3 Confirm `EmptyState` story shows a message indicating no data.
        -   [x] 5.6.4 Confirm `ErrorState` story shows an error message.
    -   [x] 5.7 **Debug `ClassificationWidget` Loading Story**:
        -   [x] 5.7.1 Investigate why the `Loading` story is not rendering correctly.
        -   [x] 5.7.2 Implement a reliable way to simulate a loading state for `ClassificationWidget` in Storybook.
    -   **Note**: The `Expanded` story for `CollectionPointsGuide` is not expanding as expected in Storybook, but we will proceed with this known issue for now.
    -   **Note**: `TriviaScoreDisplay` component now correctly displays mocked data in Storybook.

-   [x] 6.0 Create Stories for `CollectionPointsGuide.tsx`
    -   [x] 6.1 Create `src/components/CollectionPointsGuide.stories.tsx` file.
    -   [x] 6.2 Define `Meta` for `CollectionPointsGuide`.
    -   [x] 6.3 Create a default story.
    -   [x] 6.4 Add stories for different states or variations if applicable.
    -   [x] 6.5 Ensure `args` and `argTypes` are used.

-   [x] 7.0 Create Stories for `CommunityStats.tsx`
    -   [x] 7.1 Create `src/components/CommunityStats.stories.tsx` file.
    -   [x] 7.2 Define `Meta` for `CommunityStats`.
    -   [x] 7.3 Create a default story with sample data.
    -   [x] 7.4 Add stories for different data states (e.g., empty, loading, error).
    -   [x] 7.5 Ensure `args` and `argTypes` are used.

-   [ ] 8.0 **Skipped** Stories for `Hero.tsx` (Component is highly static and lacks props for dynamic content, making Storybook integration impractical without refactoring).

-   [x] 9.0 Create Stories for `MerchandiseCard.tsx`
    -   [x] 9.1 Create `src/components/MerchandiseCard.stories.tsx` file.
    -   [x] 9.2 Define `Meta` for `MerchandiseCard`.
    -   [x] 9.3 Create a default story with sample merchandise data.
    -   [x] 9.4 Add stories for different states (e.g., out of stock, discounted).
    -   [x] 9.5 Ensure `args` and `argTypes` are used.

-   [x] 10.0 Create Stories for `TriviaScoreDisplay.tsx`
    -   [x] 10.1 Create `src/components/TriviaScoreDisplay.stories.tsx` file.
    -   [x] 10.2 Define `Meta` for `TriviaScoreDisplay`.
    -   [x] 10.3 Create a default story with sample score data.
    -   [x] 10.4 Add stories for different score values or states.
    -   [x] 10.5 Ensure `args` and `argTypes` are used.