# ADR-013: Choosing Sonner for Toast Notifications

## Status
- **Status**: Proposed
- **Date**: 2025-08-01
- **Authors**: Gemini CLI
- **Decision Maker**: User

## Context
Toast notifications are required to provide immediate, non-intrusive feedback to users for actions like profile updates, form submissions, and error handling. The current implementation in `UserProfileEditForm.tsx` attempts to use `toast` from `sonner`, but the library is not yet installed or formally adopted.

## Decision
To adopt **Sonner** as the primary toast notification library for the application.

## Consequences
### Positive
- **Simple API & Excellent DX**: Sonner offers a straightforward API (`<Toaster />` component and `toast()` function) that is easy to integrate and use from any part of the application without complex hooks or context providers.
- **Elegant Design & Smooth Animations**: Provides a clean, modern aesthetic with smooth animations, enhancing the overall user experience.
- **Performance & Bundle Size**: Designed to be lightweight and performant, minimizing impact on application bundle size and rendering performance.
- **Rich Customization**: Supports various toast types (success, error, loading, promise), flexible positioning, and custom JSX content, allowing for tailored notifications.
- **Accessibility**: Built with accessibility in mind, including keyboard navigation and ARIA attributes.
- **Next.js Compatibility**: Works well with React Server Components, making it suitable for a Next.js application.

### Negative
- **New Dependency**: Introduces a new third-party dependency to the project.
- **Learning Curve**: While simple, developers new to Sonner will need to familiarize themselves with its API.

### Neutral
- Replaces potential custom toast implementations, centralizing notification logic.

## Alternatives Considered

### Option 1: React Toastify
- **Pros**: Highly popular, extensive features, and customization.
- **Cons**: Can be more verbose in setup compared to Sonner's simple API. May have a larger bundle size due to its comprehensive feature set.
- **Reason for rejection**: Sonner's simpler API and focus on performance are preferred for this project's needs.

### Option 2: React Hot Toast
- **Pros**: Lightweight, easy to use, good promise API integration.
- **Cons**: While good, Sonner's aesthetic and developer experience are often cited as superior for modern React applications.
- **Reason for rejection**: Sonner offers a slightly more polished feel and a more intuitive API for common use cases.

### Option 3: Shadcn UI Toast
- **Pros**: Integrates seamlessly with Shadcn UI components if already in use, highly customizable.
- **Cons**: Requires the full Shadcn UI setup, which might be overkill if only a toast component is needed. Less opinionated on design, requiring more manual styling.
- **Reason for rejection**: The project does not currently use Shadcn UI, and Sonner provides a more out-of-the-box elegant solution without requiring a larger UI library.

## Implementation Notes
- Install `sonner` via npm.
- Add the `<Toaster />` component to the root layout or a top-level component.
- Use the `toast()` function to trigger notifications from any component.

## References
- Sonner GitHub: [https://github.com/emilkowalski/sonner](https://github.com/emilkowalski/sonner)
- Sonner Documentation: [https://sonner.emilkowal.ski/](https://sonner.emilkowal.ski/)

## Review
- **Next review date**: 2026-02-01
- **Review criteria**: User feedback on toast notifications, performance metrics, and any emerging requirements for more complex notification patterns.
