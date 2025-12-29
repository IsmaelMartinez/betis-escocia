# ADR-015: AI Rumor Scoring System (Soylenti)

## Status

Accepted (Updated December 29, 2025 - Phase 2A Complete)

## Decision

**Google Gemini 3.0 Flash** for automated analysis and probability scoring of Real Betis transfer rumors ("Fran Mode"). The AI evaluates news items and extracts structured data:
1. Determine if it's a transfer rumor
2. Assign a credibility probability (0-100%)
3. Classify transfer direction (in/out)
4. Extract player names with roles (Phase 2A)

## Context

The Soylenti feature aggregates Real Betis news from RSS feeds and needs intelligent filtering to distinguish transfer rumors from regular news, plus credibility scoring to help users gauge rumor reliability.

## Architecture

```
RSS Feeds → Deduplication → Article Fetch → Gemini AI Analysis → Supabase Storage
                                                    ↓
                                           isTransferRumor: boolean
                                           probability: 0-100
                                           reasoning: string
                                           confidence: low|medium|high
                                           transferDirection: in|out|unknown
                                           players: [{name, role}]  ← Phase 2A
                                                    ↓
                                           Player Normalization → players table
                                                    ↓
                                           News-Player Linking → news_players table
```

## Implementation

### AI Service (`src/services/geminiService.ts`)

```typescript
interface ExtractedPlayer {
  name: string;
  role: "target" | "departing" | "mentioned";
}

interface RumorAnalysis {
  isTransferRumor: boolean | null;
  probability: number | null;
  reasoning: string;
  confidence: "low" | "medium" | "high";
  transferDirection: "in" | "out" | "unknown" | null;
  players: ExtractedPlayer[];  // Phase 2A
}

export async function analyzeRumorCredibility(
  title: string,
  description: string,
  source: string,
  articleContent?: string | null,  // Full article for better analysis
): Promise<RumorAnalysis>;
```

### Player Normalization (`src/services/playerNormalizationService.ts`)

Phase 2A introduces player tracking with deduplication:
- Names normalized (lowercase, no diacritics, trimmed)
- `players` table stores unique players with rumor counts
- `news_players` junction links news to players with roles

### Probability Scoring (Fran Mode)

| Range   | Label          | Visual | Criteria                         |
| ------- | -------------- | ------ | -------------------------------- |
| 0-25%   | Muy Improbable | 🔴     | Tabloid source, no corroboration |
| 26-50%  | Poco Probable  | 🟠     | Single source, unverified        |
| 51-75%  | Posible        | 🟡     | Multiple sources, some evidence  |
| 76-100% | Muy Probable   | 🟢     | Tier 1 sources, strong signals   |

### Database Schema

**betis_news table:**
- `ai_probability`: Numeric (0-100), nullable for unanalyzed items
- `ai_analysis`: AI reasoning in Spanish
- `ai_analyzed_at`: Timestamp of analysis
- `transfer_direction`: "in", "out", "unknown", or null

**players table (Phase 2A):**
- `name`: Original player name
- `normalized_name`: Deduplicated key (unique index)
- `rumor_count`: Number of mentions
- `first_seen_at`, `last_seen_at`: Tracking timeline

**news_players junction (Phase 2A):**
- `news_id`: FK to betis_news
- `player_id`: FK to players
- `role`: "target", "departing", or "mentioned"

### Error Handling

- 3 retry attempts with 1-second backoff
- Quota errors (429) store items with `null` probability for later analysis
- Graceful degradation: news stored even if AI fails

### Deduplication Strategy

Multi-layer approach to prevent duplicate rumors:

1. SHA256 hash of source URL (database constraint)
2. Fuzzy title matching via Fuzzball library (85% threshold)
3. Player + category within 48-hour window (recurring rumor detection)

### RSS Feed Sources

Three optimized feeds provide rumor content:

- Google News (transfer query): `Real+Betis+fichajes+rumores` - 60-70% transfer-focused
- Google News (general): `Real+Betis` - comprehensive coverage
- BetisWeb: `betisweb.com/feed/` - dedicated Betis source, high credibility

## Alternatives Considered

| Option                  | Pros                               | Cons                       |
| ----------------------- | ---------------------------------- | -------------------------- |
| **Gemini 3.0 Flash** ✅ | Free tier, fast, excellent quality | Google dependency          |
| OpenAI GPT-4            | High quality                       | Paid, expensive for volume |
| Claude                  | Great reasoning                    | No free tier for API       |
| Rule-based              | No external dependency             | Poor accuracy, rigid       |

## Cost Analysis

- ~4 runs/day × 30-50 items = ~14,000 tokens/day
- Monthly: ~420,000 tokens (well within free tier)
- GitHub Actions: ~200 min/month (free)

## References

- [betis_news Migration](../../sql/0002_add_betis_news_table.sql)
- [players Migration (Phase 2A)](../../sql/0004_add_players_tables.sql)
- [Research: Phase 2 Evolution](../research/2025-12-soylenti-phase2-evolution.md)
- [ADR-003: Supabase Database](./003-supabase-database.md)
