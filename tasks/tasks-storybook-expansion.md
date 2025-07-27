# Task List: Expanding Storybook Coverage

This document outlines the detailed tasks for expanding the Storybook component library as per the "Expanding Storybook Coverage" PRD.

## Parent Task: Implement Storybook Stories for Key UI Components

**Goal:** Increase Storybook coverage for critical UI components to improve reusability, development efficiency, and visual documentation.

### Sub-tasks:

#### 1. Create Stories for `ClassificationWidget.tsx`

*   **File:** `src/components/ClassificationWidget.tsx`
*   **New Story File:** `src/components/ClassificationWidget.stories.tsx`
*   **Tasks:**
    *   Create `ClassificationWidget.stories.tsx` alongside `ClassificationWidget.tsx`.
    *   Define `Meta` for `ClassificationWidget`, including `title`, `component`, `parameters`, and `tags: ['autodocs']`.
    *   Create a default story with sample classification data.
    *   Create a story for the loading state.
    *   Create a story for the empty state (no data available).
    *   Create a story for the error state.
    *   Ensure all stories use `args` and `argTypes` for interactive controls where applicable.
    *   Mock any necessary data dependencies for the component.

#### 2. Create Stories for `MatchCard.tsx`

*   **File:** `src/components/MatchCard.tsx`
*   **New Story File:** `src/components/MatchCard.stories.tsx`
*   **Tasks:**
    *   Create `MatchCard.stories.tsx` alongside `MatchCard.tsx`.
    *   Define `Meta` for `MatchCard`, including `title`, `component`, `parameters`, and `tags: ['autodocs']`.
    *   Create a default story with typical match data.
    *   Create a story for an upcoming match.
    *   Create a story for a completed match (with scores).
    *   Create stories for specific match statuses (e.g., postponed, cancelled).
    *   Ensure all stories use `args` and `argTypes` for interactive controls where applicable.
    *   Mock any necessary data dependencies for the component.

#### 3. Create Stories for `RSVPForm.tsx`

*   **File:** `src/components/RSVPForm.tsx`
*   **New Story File:** `src/components/RSVPForm.stories.tsx`
*   **Tasks:**
    *   Create `RSVPForm.stories.tsx` alongside `RSVPForm.tsx`.
    *   Define `Meta` for `RSVPForm`, including `title`, `component`, `parameters`, and `tags: ['autodocs']`.
    *   Create a default story for the initial form state.
    *   Create a story for the form with pre-filled data.
    *   Create a story demonstrating validation errors.
    *   Create a story for the submitting state.
    *   Create a story for the success state after submission.
    *   Ensure all stories use `args` and `argTypes` for interactive controls where applicable.
    *   Mock any necessary form submission logic or external dependencies.

#### 4. Create Stories for `ErrorMessage.tsx`

*   **File:** `src/components/ErrorMessage.tsx`
*   **New Story File:** `src/components/ErrorMessage.stories.tsx`
*   **Tasks:**
    *   Create `ErrorMessage.stories.tsx` alongside `ErrorMessage.tsx`.
    *   Define `Meta` for `ErrorMessage`, including `title`, `component`, `parameters`, and `tags: ['autodocs']`.
    *   Create a default story with a simple error message.
    *   Create a story with a custom title and description.
    *   Create a story with an action button.
    *   Ensure all stories use `args` and `argTypes` for interactive controls where applicable.

---

**Verification Steps (after completing all tasks):**

1.  Run `npm run storybook` and verify that all new stories are visible and interactive in the Storybook UI.
2.  Check the "Docs" tab for each component to ensure automatic documentation is generated correctly.
3.  Manually test each story to ensure components render as expected in their various states.
4.  Run `npm run build-storybook` to ensure the static build completes without errors.
