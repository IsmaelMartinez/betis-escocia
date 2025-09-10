## Relevant Files

- `src/components/RSVPWidget.tsx` - New reusable RSVP widget component (to create)
- `src/components/RSVPModal.tsx` - Modal version for overlay display (to create)  
- `src/app/rsvp/page.tsx` - Current RSVP page (may keep for confirmation/success states)
- `src/components/RSVPForm.tsx` - Existing form component (reference for functionality)
- `src/app/api/rsvp/route.ts` - Existing RSVP API endpoint
- `src/lib/supabase.ts` - RSVP database functions and types
- `src/app/page.tsx` - Main page where widget will be integrated
- `src/app/partidos/page.tsx` - Matches page for widget integration
- `src/components/Layout.tsx` - Navigation component (remove RSVP menu item)
- `stories/RSVPWidget.stories.tsx` - Storybook stories for component development
- `stories/RSVPModal.stories.tsx` - Storybook stories for modal component
- `tests/unit/components/RSVPWidget.test.tsx` - Unit tests for widget
- `tests/unit/components/RSVPModal.test.tsx` - Unit tests for modal
- `tests/integration/rsvp-widget-integration.test.ts` - Integration tests for widget functionality

### Notes

- Start development in Storybook before integrating into pages
- Use number input instead of 1-5+ dropdown for attendee count
- Keep confirmation page functionality but remove from main navigation
- Widget should support both inline and modal display modes
- Maintain existing RSVP database schema and API endpoints
- Support both authenticated and anonymous submissions
- Responsive design for mobile/tablet/desktop

## Tasks

- [ ] 1.0 Analysis and Design Planning
  - [ ] 1.1 Analyze current RSVP functionality and user flows
  - [ ] 1.2 Design widget component interface and props structure
  - [ ] 1.3 Plan modal component behavior and trigger mechanisms
  - [ ] 1.4 Define integration points for main page and matches page
  - [ ] 1.5 Document component API and usage patterns

- [ ] 2.0 Storybook Component Development
  - [ ] 2.1 Create RSVPWidget Storybook stories with various states
  - [ ] 2.2 Develop RSVPWidget component with inline display mode
  - [ ] 2.3 Create RSVPModal Storybook stories with modal behaviors
  - [ ] 2.4 Develop RSVPModal component with overlay functionality
  - [ ] 2.5 Implement number input for attendee count (replace dropdown)
  - [ ] 2.6 Add optional comment field with character limit
  - [ ] 2.7 Test all component states and interactions in Storybook

- [ ] 3.0 Core Widget Functionality
  - [ ] 3.1 Implement RSVP submission logic with API integration
  - [ ] 3.2 Add support for authenticated vs anonymous users
  - [ ] 3.3 Implement real-time attendee count display
  - [ ] 3.4 Add form validation for required fields
  - [ ] 3.5 Implement loading and error states
  - [ ] 3.6 Add success confirmation feedback
  - [ ] 3.7 Support RSVP status updates (change existing RSVP)

- [ ] 4.0 Modal Implementation
  - [ ] 4.1 Create modal overlay with proper z-index management
  - [ ] 4.2 Implement modal trigger mechanisms (buttons, links)
  - [ ] 4.3 Add keyboard navigation and accessibility features
  - [ ] 4.4 Implement click-outside-to-close functionality
  - [ ] 4.5 Add responsive modal sizing for different screen sizes
  - [ ] 4.6 Ensure proper focus management and tab ordering

- [ ] 5.0 Page Integration
  - [ ] 5.1 Integrate RSVPWidget into main page (homepage)
  - [ ] 5.2 Add RSVP widget/modal to matches page (partidos)
  - [ ] 5.3 Remove RSVP menu item from main navigation
  - [ ] 5.4 Keep confirmation page for success states and direct links
  - [ ] 5.5 Update routing to handle confirmation page without menu
  - [ ] 5.6 Test integration across all target pages

- [ ] 6.0 Enhanced Features
  - [ ] 6.1 Add event-specific RSVP support (match-specific RSVPs)
  - [ ] 6.2 Implement attendee count aggregation and display
  - [ ] 6.3 Add RSVP deadline handling (disable after match date)
  - [ ] 6.4 Implement user's current RSVP status display
  - [ ] 6.5 Add WhatsApp interest checkbox (maintain existing feature)
  - [ ] 6.6 Support multiple event types (matches, social events, etc.)

- [ ] 7.0 Testing and Quality Assurance
  - [ ] 7.1 Write comprehensive unit tests for RSVPWidget component
  - [ ] 7.2 Write comprehensive unit tests for RSVPModal component  
  - [ ] 7.3 Create integration tests for RSVP submission flows
  - [ ] 7.4 Test authenticated vs anonymous user scenarios
  - [ ] 7.5 Verify mobile responsiveness and touch interactions
  - [ ] 7.6 Test accessibility compliance (ARIA labels, keyboard nav)
  - [ ] 7.7 Performance testing for widget load times and API calls

- [ ] 8.0 Documentation and Migration
  - [ ] 8.1 Update component documentation for RSVPWidget and RSVPModal
  - [ ] 8.2 Create usage examples and integration guide
  - [ ] 8.3 Document breaking changes from menu removal
  - [ ] 8.4 Update README with new RSVP component features
  - [ ] 8.5 Create migration guide for existing RSVP integrations
  - [ ] 8.6 Update API documentation if any changes are needed