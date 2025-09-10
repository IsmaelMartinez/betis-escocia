## Relevant Files

- `src/components/RSVPWidget.tsx` - Main reusable RSVP widget component with inline display capability
- `src/components/RSVPWidget.test.tsx` - Unit tests for RSVPWidget component
- `src/components/RSVPModal.tsx` - Modal wrapper component for overlay RSVP display
- `src/components/RSVPModal.test.tsx` - Unit tests for RSVPModal component  
- `stories/RSVPWidget.stories.tsx` - Storybook stories for RSVPWidget development and testing
- `stories/RSVPModal.stories.tsx` - Storybook stories for RSVPModal development and testing
- `src/hooks/useRSVPData.ts` - Custom hook for RSVP data fetching and state management
- `src/hooks/useRSVPData.test.ts` - Unit tests for useRSVPData hook
- `src/app/page.tsx` - Main homepage requiring RSVPWidget integration
- `src/app/partidos/page.tsx` - Matches page requiring RSVPWidget integration
- `src/components/Layout.tsx` - Navigation component requiring RSVP menu item removal
- `src/app/api/rsvp/attendees/route.ts` - New API endpoint for fetching attendee counts
- `tests/integration/rsvp-widget.test.ts` - Integration tests for complete RSVP widget workflows

### Notes

- Start development in Storybook to build components in isolation before integration
- Replace dropdown attendee selection (1-5+) with number input field
- Remove RSVP menu item but preserve confirmation page functionality  
- Component must support both modal and inline display modes
- **SIMPLIFIED**: Component only handles confirmations - no "maybe" or "no" options, only "confirm attendance"
- Maintain existing RSVP database schema and API endpoints where possible

## Tasks

- [x] 1.0 Storybook Component Development
  - [x] 1.1 Create RSVPWidget Storybook stories with various states (loading, success, error, authenticated vs anonymous)
  - [x] 1.2 Build RSVPWidget component structure with proper TypeScript interfaces and props
  - [x] 1.3 Implement basic widget UI with event details display (date, time, location)
  - [x] 1.4 Add number input field for attendee count (replace current 1-5+ dropdown)
  - [x] 1.5 Create RSVPModal Storybook stories showcasing modal behavior and responsive design
  - [x] 1.6 Build RSVPModal component with overlay, backdrop, and close functionality
  - [x] 1.7 Test all component variations and edge cases in Storybook environment
  - [x] 1.8 **UPDATED**: Simplify to confirmation-only (remove yes/maybe/no options) per user request

- [ ] 2.0 Core Widget Implementation
  - [ ] 2.1 Implement RSVP status selection (Yes, No, Maybe) with clear visual feedback
  - [ ] 2.2 Add optional comment field with character limit and validation
  - [ ] 2.3 Create form validation for required fields (name, email for anonymous users)
  - [ ] 2.4 Implement loading states during form submission and data fetching
  - [ ] 2.5 Add error handling with user-friendly error messages
  - [ ] 2.6 Display current RSVP status for authenticated users who have previously responded
  - [ ] 2.7 Show real-time attendee count for the event
  - [ ] 2.8 Add WhatsApp interest checkbox to maintain existing functionality

- [ ] 3.0 Modal Functionality
  - [ ] 3.1 Implement modal trigger mechanisms (button clicks, programmatic opening)
  - [ ] 3.2 Add proper z-index management and backdrop overlay
  - [ ] 3.3 Implement click-outside-to-close and escape-key-to-close functionality
  - [ ] 3.4 Add keyboard navigation and focus management for accessibility
  - [ ] 3.5 Ensure responsive modal sizing for mobile, tablet, and desktop
  - [ ] 3.6 Implement smooth open/close animations
  - [ ] 3.7 Add proper ARIA labels and accessibility attributes

- [ ] 4.0 API Integration and Data Management
  - [ ] 4.1 Create useRSVPData custom hook for data fetching and state management
  - [ ] 4.2 Implement API calls to existing /api/rsvp endpoint for form submission
  - [ ] 4.3 Create new /api/rsvp/attendees endpoint for fetching attendee counts
  - [ ] 4.4 Add support for event-specific RSVP data (match-specific RSVPs)
  - [ ] 4.5 Implement authentication status detection for user experience differentiation
  - [ ] 4.6 Add caching strategy for attendee count data to improve performance
  - [ ] 4.7 Handle API error scenarios gracefully with retry mechanisms

- [ ] 5.0 Page Integration and Navigation Updates
  - [ ] 5.1 Integrate RSVPWidget into main homepage with appropriate event context
  - [ ] 5.2 Add RSVPWidget/RSVPModal to partidos (matches) page for match-specific RSVPs
  - [ ] 5.3 Remove RSVP menu item from main navigation (Layout.tsx)
  - [ ] 5.4 Preserve existing confirmation page (/rsvp) for success states and direct access
  - [ ] 5.5 Update routing to handle confirmation page without menu navigation
  - [ ] 5.6 Test widget functionality across all integrated pages
  - [ ] 5.7 Verify mobile responsiveness and touch interactions on all devices