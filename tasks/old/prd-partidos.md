# Partidos Section for Upcoming Betis Games

## Introduction/Overview
The "partidos" section aims to provide Betis community members with easy access to upcoming match information. The goal is to centralize match scheduling information and allow community members to plan their activities around these events.

## Goals
1. Display a list of the next 3 Betis matches with relevant details.
2. Allow updates via both automatic API fetching and manual input for non-League matches.
3. Integrate match data with the existing RSVP feature to enable attendance planning.

## User Stories
1. As a Betis fan, I want to see upcoming matches so that I can plan my attendance.
2. As an admin, I want to update match schedules automatically and manually to keep information current.
3. As a community member, I want to RSVP to matches directly from the schedule page for better coordination.

## Functional Requirements
1. **Display Requirements:**
   - The section must show the date/time, opponent, venue, and competition type for each match.
   - Matches should be displayed in a card-based layout for readability.

2. **Data Management:**
   - Fetch upcoming matches from Football-Data.org API.
   - Allow manual entry for Europa League and friendly games.

3. **Admin Controls:**
   - Include an admin button to update data from Football-Data.org.
   - Provide a manual entry form for additional match details.

4. **Integration:**
   - Link matches to the RSVP system for community member engagement.

## Non-Goals (Out of Scope)
- Detailed match statistics (e.g., player stats, match odds).
- Historical match data beyond the last 3 matches.
- Automated notifications or calendar integration.

## Design Considerations
- Cards should have consistent styling with current site aesthetics.
- Incorporate a feature flag (`showPartidos`) to enable or disable the section.

## Technical Considerations
- Utilize reusable components for match cards.
- API integration for automatic updates.

## Success Metrics
- User engagement through increased RSVP submissions.
- Positive feedback from community members on accessibility.
- Effective management of match data by admins.

## Open Questions
- None identified at this moment.
