# ADR-002: Football-Data.org API Choice

## Status
- **Status**: Accepted
- **Date**: 2025-06-25
- **Authors**: Development Team
- **Decision Maker**: Technical Lead

## Context
The Peña Bética Escocesa website required an API to fetch live football match data for Real Betis. The requirements included:
- Free tier availability for essential data
- Real-time or recent match information
- Reliable and widely adopted API service
- Simplicity in integration with existing Next.js application
- Robustness in uptime and data accuracy

## Decision
**Football-Data.org** was selected for integration as the API to fetch match data.

## Consequences
### Positive
- **Generous free tier**: Allows up to 14,400 requests per day, covering our needs
- **Current data**: Provides live scores, match results, and standings
- **Easy integration**: Straightforward API, easy to implement with existing stack
- **Stable service**: Well-known for reliability with long-term support

### Negative
- **Limited detail**: Lacks player statistics and detailed match events
- **Rate limiting**: Some filters cause rate limiting issues

### Neutral
- **Scope**: Focused on key competitions like La Liga and Champions League

## Alternatives Considered
### Option 1: API-Football (RapidAPI)
- **Pros**: Comprehensive data, player stats, detailed events
- **Cons**: Free tier limited to outdated seasons, expensive paid tiers
- **Reason for rejection**: Outdated data not suitable for current website

### Option 2: SportDataAPI
- **Pros**: Good data quality, supports multiple sports
- **Cons**: Higher costs, complex pricing
- **Reason for rejection**: Budget constraints

## Implementation Notes
- API integrated into match display features using REST endpoints
- Real Betis team data filtered by ID
- Error handling and rate limiting managed carefully

## References
- [Football-Data.org API Implementation Guide](../api/football-data-api-implementation.md) - Comprehensive implementation details and evaluation results

## Review
- **Next review date**: 2025-12-25 (6-month review)
- **Review criteria**: Data coverage changes, API outages, user needs
