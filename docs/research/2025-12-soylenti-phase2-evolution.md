# Soylenti Phase 2: Advanced Rumor Analytics System

Research Date: December 28, 2025
Last Updated: December 29, 2025

## Implementation Status

| Phase | Description                              | Status     | Completed  |
| ----- | ---------------------------------------- | ---------- | ---------- |
| 2A    | Player Name Extraction (NER)             | ✅ DONE    | 2025-12-28 |
| 2B    | Trend Analysis (Player Momentum)         | ✅ DONE    | 2025-12-29 |
| 2C    | Source Credibility Tracking              | 🔜 NEXT    | -          |
| 2D    | Rumor Lifecycle Tracking                 | ⏳ Planned | -          |
| 2E    | Insights Dashboard                       | ⏳ Planned | -          |
| 3.0   | External API Integration (Transfermarkt) | 🔮 Future  | -          |

### Phase 2A Completion Summary (December 28, 2025)

Implemented features:

- Enhanced Gemini prompt with player extraction (confidence-gated)
- `players` and `news_players` tables with RLS policies (migration `0004`)
- `playerNormalizationService.ts` for name normalization and deduplication
- `rumorSyncService.ts` integration with player processing
- `RumorCard.tsx` displays players with role-based styling (target/departing/mentioned)
- Pagination implemented for historical access (PR #209)
- News filtering: items older than 6 months excluded

Key files:

- `src/services/geminiService.ts` - Enhanced prompt with player extraction
- `src/services/playerNormalizationService.ts` - Name normalization logic
- `src/services/rumorSyncService.ts` - Pipeline integration
- `sql/0004_add_players_tables.sql` - Database schema
- `src/components/RumorCard.tsx` - Player display UI

### Phase 2B Completion Summary (December 29, 2025)

Implemented features:

- Trending players API endpoint (`/api/soylenti/trending`)
- `TrendingPlayers` component with active/cooling status indicators
- Click-to-filter functionality in SoylentiClient
- Sidebar layout for trending players on desktop
- Player filter chip with clear button

Key files:

- `src/app/api/soylenti/trending/route.ts` - Trending API endpoint
- `src/components/TrendingPlayers.tsx` - Trending players UI component
- `src/app/soylenti/SoylentiClient.tsx` - Player filter integration
- `src/lib/supabase.ts` - TrendingPlayer type definition

## Executive Summary

This research document proposes enhancements to transform the Soylenti rumor tracking system from a simple news aggregator into an intelligent transfer market analytics platform. The current system successfully ingests news from three RSS sources, classifies transfer rumors via Gemini AI, and displays them with credibility scores. Phase 2 adds player name extraction, position classification, source credibility tracking, trend analysis, and aggregated insights to help the community understand what positions Betis might be targeting and which rumors are gaining traction.

## Current System Analysis

### Architecture Overview

The existing Soylenti implementation consists of five core services working together in a scheduled pipeline:

The RSS fetcher service (`src/services/rssFetcherService.ts`) fetches from three sources concurrently: Google News with a fichajes (transfers) query yielding around 60-70% transfer-focused content, Google News with a general Betis query for comprehensive coverage, and BetisWeb which is a dedicated fan site with typically higher credibility.

The deduplication service (`src/services/deduplicationService.ts`) uses a two-tier approach: first checking for exact SHA256 hash matches of the normalized title+description, then applying fuzzy matching via the Fuzzball library with an 85% similarity threshold.

The Gemini service (`src/services/geminiService.ts`) performs two-step analysis: determining whether content is a transfer rumor at all, then assigning a credibility probability (0-100) with reasoning in Spanish. The service includes a 3-retry mechanism with 1-second backoff, and gracefully handles quota errors by storing items with null probability.

The sync service (`src/services/rumorSyncService.ts`) orchestrates the pipeline, running every 2 hours via GitHub Actions. The system is append-only, meaning news items are never deleted during sync.

### Database Schema (Current)

```sql
CREATE TABLE betis_news (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    link TEXT NOT NULL,
    pub_date TIMESTAMPTZ NOT NULL,
    source VARCHAR(100) NOT NULL,
    description TEXT,
    ai_probability NUMERIC(5, 2),      -- NULL=unanalyzed, 0=not transfer, 1-100=transfer credibility
    ai_analysis TEXT,
    ai_analyzed_at TIMESTAMPTZ,
    content_hash VARCHAR(64) NOT NULL,
    is_duplicate BOOLEAN DEFAULT false,
    duplicate_of_id BIGINT REFERENCES betis_news(id),
    similarity_score NUMERIC(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Current Limitations

- ~~No player name extraction from rumors~~ (DONE - Phase 2A)
- No source credibility tracking over time
- No rumor evolution/lifecycle tracking
- No trend analysis for emerging transfer targets
- ~~50-item query limit without pagination for historical access~~ (DONE - PR #209)
- Unanalyzed items (ai_probability = null) have no re-analysis mechanism

## Gemini API Free Tier Constraints (December 2025)

Recent changes significantly impact architecture decisions:

- 15 RPM (requests per minute) for Flash models
- Daily limits reduced (reports of ~20 requests/day in some cases)
- 1 million token context window remains available
- Rate limiting enforced at project level
- HTTP 429 returned immediately when limits exceeded

With 12 syncs per day and 30-50 new items per sync, we could consume 360-600 AI requests daily, exceeding free tier. The current system handles this gracefully by storing items with null probability.

## Proposed Enhancements

### Phase 2A: Player Name Extraction (NER)

Enhance the existing Gemini prompt to extract player names in a single call:

```typescript
const enhancedPrompt = `Analiza esta noticia del Real Betis:

Título: ${title}
Descripción: ${description || "Sin descripción"}
Fuente: ${source}

Responde SOLO en este formato JSON:
{
  "isTransferRumor": <true|false>,
  "probability": <0-100>,
  "reasoning": "<explicación en español>",
  "confidence": "<low|medium|high>",
  "players": [
    {"name": "<nombre completo>", "role": "<target|departing|mentioned>"}
  ]
}`;
```

Database schema extension:

```sql
CREATE TABLE players (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    normalized_name VARCHAR(200) NOT NULL,
    known_club VARCHAR(200),
    known_position VARCHAR(50),
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    rumor_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_players_normalized_name ON players(normalized_name);

CREATE TABLE news_players (
    id BIGSERIAL PRIMARY KEY,
    news_id BIGINT REFERENCES betis_news(id) ON DELETE CASCADE,
    player_id BIGINT REFERENCES players(id) ON DELETE CASCADE,
    mentioned_as VARCHAR(200),
    role VARCHAR(20), -- target, departing, mentioned
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 2B: Trend Analysis (Player Momentum)

Surface which players are gaining traction using existing data (`rumor_count`, `last_seen_at`):

```sql
-- Trending players query (no new schema needed)
SELECT name, rumor_count, first_seen_at, last_seen_at,
       (last_seen_at > NOW() - INTERVAL '7 days') as is_active
FROM players
WHERE rumor_count >= 1
ORDER BY last_seen_at DESC, rumor_count DESC
LIMIT 10;
```

API endpoint: `GET /api/soylenti/trending` returns top players by recent activity.

### Phase 2C: Source Credibility Tracking

Build historical accuracy metrics for each news source:

```sql
CREATE TABLE source_credibility (
    id BIGSERIAL PRIMARY KEY,
    source_name VARCHAR(100) NOT NULL UNIQUE,
    total_rumors INTEGER DEFAULT 0,
    verified_correct INTEGER DEFAULT 0,
    verified_incorrect INTEGER DEFAULT 0,
    pending_verification INTEGER DEFAULT 0,
    credibility_score NUMERIC(5, 2),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE betis_news ADD COLUMN outcome VARCHAR(20);
ALTER TABLE betis_news ADD COLUMN outcome_verified_at TIMESTAMPTZ;
```

Verification workflow: admins mark rumors as "confirmed", "denied", or "pending". Credibility score recalculated: `(verified_correct / (verified_correct + verified_incorrect)) * 100`.

### Phase 2D: Rumor Lifecycle Tracking

Monitor how rumors evolve from first mention to resolution:

```sql
CREATE TABLE rumor_threads (
    id BIGSERIAL PRIMARY KEY,
    player_id BIGINT REFERENCES players(id),
    target_position VARCHAR(10),
    status VARCHAR(20) DEFAULT 'active', -- emerging, active, heating, cooling, resolved
    first_news_id BIGINT REFERENCES betis_news(id),
    latest_news_id BIGINT REFERENCES betis_news(id),
    news_count INTEGER DEFAULT 1,
    peak_probability NUMERIC(5, 2),
    current_probability NUMERIC(5, 2),
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolution VARCHAR(20) -- confirmed, denied, expired
);
```

Lifecycle states: "emerging" (1-2 mentions), "active" (3+ mentions), "heating" (5+ in 7 days), "cooling" (no mentions in 14 days), "resolved".

### Phase 2E: Insights Dashboard

Dashboard components:

- Trending Players: top 10 by activity with rumor counts
- Source Reliability Matrix: credibility scores over time
- Transfer Window Timeline: rumor intensity across season
- Rumor Threads Panel: active sagas with probability evolution

API endpoints:

```
GET /api/soylenti/insights/trending
GET /api/soylenti/insights/sources
GET /api/soylenti/insights/threads
GET /api/soylenti/insights/timeline
```

## Real Betis Transfer Analysis

### Positions Betis Might Target (2024-25 Season)

Based on typical La Liga mid-table club needs and Betis's financial reality:

**Defensive Reinforcements**: Central defenders to address past vulnerabilities, experienced full-backs for stability. Betis has historically struggled with defensive consistency.

**Versatile Midfielders**: Players adapting to defensive and attacking roles. A "sixth defender" type midfielder bolsters Copa del Rey competitiveness where Betis has found recent success.

**Young Talent**: Affordable high-potential players (22-25 years old) fitting Betis's development philosophy. Historical success with players like Fabián Ruiz.

**Loan Deals**: Given financial constraints, short-term loans for key positions (e.g., striker depth for second half of season) prioritized over expensive permanent transfers.

### Player Profile Fit for Betis

**Age Range**: 22-25 years preferred (young, trainable, cost-effective). Occasional experienced veterans (30+) for leadership.

**Market Value**: 10-30M range typical. Avoid overpriced stars, target undervalued gems.

**Contract Type**: Favor loans for short-term fixes, permanent deals for long-term projects.

**Nationality**: Preference for Spanish players (La Liga integration), openness to Portuguese and Latin American prospects.

**Historical Patterns**: Investment in defensive solidity and midfield creativity. Recent willingness to pursue top-tier internationals when budget allows.

## AI Usage Optimization Strategies

Given free tier constraints:

**Batch Processing**: Schedule sync during low-traffic hours (4 AM) when quota resets favorably. Shift to 3-4 hour cadence during non-transfer windows.

**Smart Skipping**: Don't analyze items clearly not transfer-related via keyword heuristics ("partido", "lesión", "entrenamiento" without player names). Could reduce API calls by 40-50%.

**Re-analysis Queue**: Track items with null probability separately. Process during quota availability windows.

**Prompt Efficiency**: Keep combined prompt under 500 tokens to maximize throughput.

**Local Fallback**: Use regex patterns for common Spanish transfer phrases before invoking API, reserving AI for ambiguous cases.

## Implementation Phases

### Phase 2A (Sprint 1-2): Foundation

- Extend Gemini prompt for player extraction
- Create players and news_players tables
- Implement player normalization service
- Add basic player list to UI

### Phase 2B (Sprint 2-3): Trend Analysis

- Create trending players API endpoint
- Add "Jugadores en Tendencia" UI component
- Implement player click-to-filter functionality
- Show active/cooling status indicators

### Phase 2C (Sprint 3-4): Source Tracking

- Create source_credibility table
- Add admin verification workflow
- Implement credibility calculation job
- Display source reliability in RumorCard

### Phase 2D (Sprint 4-5): Lifecycle Management

- Create rumor_threads table
- Implement thread detection logic
- Add thread visualization UI
- Create resolution workflow

### Phase 2E (Sprint 5-6): Dashboard Polish

- Build insights dashboard page
- Implement transfer window timeline chart
- Add source reliability matrix
- Add export functionality

## Historical Data Retention Strategy

**Query Optimization**: Implement cursor-based pagination using created_at. Support "load more" pattern. Existing indexes on pub_date and created_at support this.

**Archival**: After 24 months, consider moving to archive table or summarizing into aggregates. Current volume (~300-600 items/month) makes full retention feasible.

**Time-based Filtering**: UI filtering by transfer windows: summer (June-August), winter (January), full season.

## Success Metrics

**Quantitative**:

- Player extraction accuracy: target 90%+ on known players
- Source credibility correlation with outcomes: meaningful positive correlation
- Trend detection lead time: identifying players before mainstream peak

**Qualitative**:

- User engagement with insights features
- Admin feedback on verification workflow
- Community sentiment about prediction accuracy

## Critical Files for Implementation

| File                                  | Purpose                                                  |
| ------------------------------------- | -------------------------------------------------------- |
| `src/services/geminiService.ts`       | AI prompt enhancement for player extraction              |
| `src/services/rumorSyncService.ts`    | Pipeline integration for player extraction and lifecycle |
| `sql/0002_add_betis_news_table.sql`   | Schema reference for new migrations                      |
| `src/app/soylenti/SoylentiClient.tsx` | Frontend expansion for insights dashboard                |
| `src/lib/supabase.ts`                 | Type definitions for new entities                        |

## Appendix: Local Brain Analysis

Analysis from local Ollama model on Betis transfer strategy:

The Soylenti system could prioritize filtering rumors about Spanish players or young talents in target positions, highlighting source credibility for rumors involving loan targets, and flagging longstanding rumors about defensive midfielders or strikers as high-priority. This would help Soylenti evolve into a predictive tool combining real-time rumor tracking with strategic football intelligence.

Betis's historical transfer patterns suggest focusing on:

- Defensive reinforcements (CB, full-backs)
- Versatile midfielders who can contribute defensively
- Young talents in the 22-25 age range
- Market values of 10-30M
- Mix of loans and permanent deals based on position criticality

## Next Steps: Phase 2B Trend Analysis (Player Momentum)

### Overview

Phase 2B surfaces which players are "heating up" in rumor activity. Using the existing `players` table data (`rumor_count`, `first_seen_at`, `last_seen_at`), we can identify trending transfer targets without additional AI calls.

### Incremental Implementation Tasks

#### Step 1: Trending Players Query

Create a simple query leveraging existing data:

```sql
-- Players with most recent activity and high mention counts
SELECT
  p.name,
  p.rumor_count,
  p.first_seen_at,
  p.last_seen_at,
  (p.last_seen_at > NOW() - INTERVAL '7 days') as is_active
FROM players p
WHERE p.rumor_count >= 2
ORDER BY p.last_seen_at DESC, p.rumor_count DESC
LIMIT 10;
```

#### Step 2: API Endpoint

Create `/api/soylenti/trending`:

```typescript
// GET /api/soylenti/trending
interface TrendingPlayer {
  name: string;
  rumorCount: number;
  firstSeen: string;
  lastSeen: string;
  isActive: boolean; // mentioned in last 7 days
}
```

#### Step 3: Trending Players UI Component

Add a "Jugadores en Tendencia" section to Soylenti page:

- List top 10 players by recent activity
- Show rumor count badge
- Indicate "active" vs "cooling" status
- Link to filter rumors by that player

#### Step 4: Player Filter

Allow clicking a player name to filter rumors mentioning them:

- Add `?player=normalized_name` URL param
- Filter `news_players` junction to show related news

### Estimated Effort

- Step 1-2: Low complexity, uses existing data
- Step 3-4: Medium complexity, UI work

### Success Criteria

- Trending players displayed on Soylenti page
- Click-to-filter works for player names
- Active/cooling status visible

---

## Future: Version 3.0 External API Integration

For a future major version, integrating with external APIs would enrich player data:

- **Transfermarkt API**: Player valuations, contract info, transfer history
- **Football-Data.org**: Team rosters, player stats
- **SofaScore/FotMob**: Performance metrics

This would enable:

- Automatic player profile enrichment (position, age, value)
- Transfer fee estimations
- Historical transfer success correlation

Deferred to v3.0 due to API cost/complexity considerations.
