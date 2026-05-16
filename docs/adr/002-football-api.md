# ADR-002: Football-Data.org API

## Status

Accepted

## Decision

**Football-Data.org** provides match data for Real Betis.

## Why Football-Data.org

- **Free tier**: 14,400 requests/day (plenty for our needs)
- **Data quality**: Live scores, standings, match results
- **Simple integration**: Straightforward REST API
- **Reliability**: Well-established service with long-term support

## Limitations

- No detailed player statistics
- Rate limiting on some filters

## Important: Season Parameter

The API `season` parameter expects the **start year** of the season (e.g., `2025` for the 2025-2026 season). In January-July, use the previous year since we're still in last year's season.

## Implementation

- API integrated for match display and standings
- Real Betis filtered by team ID (90, exported from `src/lib/constants/team.ts`)
- Error handling and rate limiting handled by `axios-rate-limit` in `src/services/footballDataService.ts`
- Results cached server-side with Next.js `unstable_cache` (30 min for matches, 24 h for standings)

## References

- [Football-Data.org API](https://www.football-data.org/)
- `docs/api/football-data-api-implementation.md`
