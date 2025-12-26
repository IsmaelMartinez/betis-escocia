# Soylenti Feature - Technical Spike Results

> **Date**: December 14, 2025
> **Status**: Spikes Complete
> **Conclusion**: Plan requires adaptation - see recommendations below

---

## Executive Summary

After conducting 5 technical spikes, the Soylenti feature plan needs several adaptations:

| Area          | Original Plan               | Spike Finding                     | Action Required                          |
| ------------- | --------------------------- | --------------------------------- | ---------------------------------------- |
| RSS Feeds     | 3 feeds (Google, Marca, AS) | Better Betis-specific feeds found | **Use 3 optimized feeds**                |
| AI SDK        | Fresh integration           | No existing patterns              | **Straightforward - proceed as planned** |
| Deduplication | Fuzzy matching              | Use Fuzzball library              | **Add npm dependency**                   |
| Feature Flag  | `show-soylenti`             | Compatible with existing system   | **Add to FeatureName type**              |
| Database      | New `rumors` table          | Follows existing patterns         | **Proceed as planned**                   |

---

## Spike 1: RSS Feed Reliability

### Tested Feeds - Round 1 (Generic Sources)

| Feed                    | URL                                               | Status     | Items | Notes                                    |
| ----------------------- | ------------------------------------------------- | ---------- | ----- | ---------------------------------------- |
| Google News (transfers) | `news.google.com/rss/search?q=Real+Betis+fichaje` | ✅ Working | 50    | Transfer-focused (fichaje = signing)     |
| Marca RSS               | `e00-marca.uecdn.es/rss/futbol/betis.xml`         | ✅ Working | 50    | General Betis news                       |
| AS RSS                  | `as.com/rss/tags/topics/real_betis.xml`           | ❌ Blocked | -     | Not accessible                           |
| Football Espana         | `football-espana.net/feed`                        | ⚠️ Works   | 10    | General La Liga only, not Betis-specific |
| FootballCritic          | `footballcritic.com/rss/news/betis`               | ❌ 403     | -     | Access denied                            |
| Estadio Deportivo       | `estadiodeportivo.com/rss`                        | ❌ Blocked | -     | Not accessible                           |

### Tested Feeds - Round 2 (Betis-Specific Sources)

| Feed                              | URL                                                        | Status     | Items | Notes                                                                  |
| --------------------------------- | ---------------------------------------------------------- | ---------- | ----- | ---------------------------------------------------------------------- |
| **BetisWeb**                      | `betisweb.com/feed/`                                       | ✅ Working | 5     | 100% Betis-focused, covers B team & women's                            |
| **Google News (transfer rumors)** | `news.google.com/rss/search?q=Real+Betis+fichajes+rumores` | ✅ Working | 50    | **60-70% transfer/rumor focused** (fichajes rumores = transfer rumors) |
| **Google News (Real Betis)**      | `news.google.com/rss/search?q=Real+Betis`                  | ✅ Working | 50    | Comprehensive coverage                                                 |
| ElDesmarque                       | `eldesmarque.com/futbol/real-betis/feed/`                  | ❌ 404     | -     | No RSS available                                                       |
| MuchoDeporte                      | `muchodeporte.com/rss/real-betis`                          | ❌ 404     | -     | No RSS available                                                       |
| Official Betis                    | `realbetisbalompie.es/rss/`                                | ❌ 404     | -     | No RSS available                                                       |
| La Liga                           | `laliga.com/rss/real-betis`                                | ❌ 404     | -     | No RSS available                                                       |

### Tested Feeds - Round 3 (Specialized Transfer Sources)

**Key Finding**: The best transfer rumor sources do NOT have public RSS feeds. They require RSS generation tools.

| Source            | Web URL                                                    | RSS Status | Solution                |
| ----------------- | ---------------------------------------------------------- | ---------- | ----------------------- |
| **TransferFeed**  | `transferfeed.com/es/clubes/real-betis/403`                | ❌ No RSS  | Use RSS.app to generate |
| **Fichajes.net**  | `fichajes.net/equipos/real-betis-balompie`                 | ❌ 404     | Use RSS.app to generate |
| **Fichajes.com**  | `fichajes.com/equipo/real-betis-balompie`                  | ❌ 404     | Use RSS.app to generate |
| **Transfermarkt** | `transfermarkt.es/real-betis-sevilla/geruechte/verein/150` | ❌ Blocked | Use RSS.app to generate |
| **NewsNow**       | `newsnow.co.uk/h/Sport/Football/La+Liga/Real+Betis`        | ❌ 404     | Aggregator page only    |

**RSS Generation Tools**:

- [RSS.app](https://rss.app) - Convert any webpage to RSS
- [Feed43](https://feed43.com) - Free RSS generator
- [FetchRSS](https://fetchrss.com) - Web to RSS converter

### Recommended Approach: Hybrid Strategy

**Option A: Native RSS Only (Simpler)**

- Use Google News + Marca + BetisWeb
- Heavy AI filtering to remove stale/confirmed content
- Lower accuracy but simpler implementation

**Option B: RSS Generation (Better Quality)**

- Generate RSS feeds from TransferFeed/Fichajes using RSS.app
- Higher quality rumor-focused content
- Requires RSS.app subscription or self-hosted solution

**Option C: Web Scraping (Most Control)**

- Direct scraping of TransferFeed, Fichajes pages
- Most accurate and current data
- More complex implementation, maintenance required

### Key Finding: Google News Aggregation

The Google News transfer-focused feed (using Spanish query `fichajes rumores` = "transfer rumors") provides excellent coverage because it **aggregates content from multiple Spanish sources** including:

- Marca, AS (when available)
- Estadio Deportivo articles
- ABC Sevilla content
- Local Seville newspapers
- National sports media

**Content breakdown from Google News (transfer rumors query):**

- 60-70% transfer rumors and signings
- 20% match reports and results
- 10% club administration/other news

### Recommendation: 3 Optimized RSS Feeds

```typescript
const RSS_FEEDS = [
  {
    name: "Google News - Betis Transfers",
    url: "https://news.google.com/rss/search?q=Real+Betis+fichajes+rumores&hl=es&gl=ES&ceid=ES:es",
    reliability: 0.75,
    language: "es",
    itemsPerFetch: 50,
    focus: "transfers", // Primary source for Soylenti rumors
  },
  {
    name: "Google News - Real Betis",
    url: "https://news.google.com/rss/search?q=Real+Betis&hl=es&gl=ES&ceid=ES:es",
    reliability: 0.7,
    language: "es",
    itemsPerFetch: 50,
    focus: "general", // Comprehensive coverage, catches non-transfer rumors
  },
  {
    name: "BetisWeb",
    url: "https://betisweb.com/feed/",
    reliability: 0.85, // Higher reliability - dedicated Betis source
    language: "es",
    itemsPerFetch: 5,
    focus: "club", // Official club news, B team, women's team
  },
];
```

### Why This Combination Works

| Feed                        | Purpose         | Strength                                                           |
| --------------------------- | --------------- | ------------------------------------------------------------------ |
| **Google News (transfers)** | Transfer rumors | Aggregates multiple sources, high volume, transfer-focused queries |
| **Google News (general)**   | Comprehensive   | Catches contract/injury/management news missed by transfer query   |
| **BetisWeb**                | Club insider    | Dedicated Betis source, covers all team sections, high credibility |

**Total daily items**: ~105 (50 + 50 + 5), with significant overlap filtered by deduplication

### Important: AI Must Filter Confirmed vs Active Rumors

The RSS feeds contain a mix of:

- **Active rumors** - Speculation about future transfers (e.g., Ceballos)
- **Confirmed transfers** - Already completed (e.g., Valentín Gómez joined Dec 2025, Antony signed)
- **Stale articles** - Old news still appearing in feed results

**AI Agent requirement**: The Gemini prompt must instruct the AI to:

1. Only extract **unconfirmed rumors/speculation**
2. Skip news about transfers that have already been completed
3. Check article dates and ignore content older than 7 days
4. Look for Spanish keywords indicating speculation:
   - "podría" (could), "interesa" (interested in), "objetivo" (target), "en la órbita" (in the orbit/on the radar)
5. Exclude Spanish keywords indicating completion:
   - "oficial" (official), "fichaje cerrado" (deal closed), "ya es jugador" (already a player)

---

## Spike 2: AI Integration Patterns

### Current State

- **No existing AI SDK** in the codebase
- **No existing AI integrations** to follow

### Existing Patterns to Follow

1. **API Handler Pattern** (`createApiHandler`):

```typescript
export const POST = createApiHandler({
  auth: "admin", // or 'none' for public endpoint
  schema: rumorProcessSchema,
  handler: async (data, context) => {
    // Agent logic here
  },
});
```

2. **Zod Schema Pattern**:

```typescript
import { z } from "zod";

export const rumorSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  playerName: z.string().optional(),
  category: z.enum([
    "transfer_in",
    "transfer_out",
    "contract",
    "injury",
    "management",
    "general",
  ]),
  probability: z.number().min(0).max(100),
  aiReasoning: z.string(),
});
```

### Recommendation

**Proceed as planned** - Add dependencies:

```json
{
  "dependencies": {
    "rss-parser": "^3.13.0",
    "@ai-sdk/google": "^1.0.0",
    "ai": "^4.0.0"
  }
}
```

---

## Spike 3: Deduplication Strategy

### Current Codebase Pattern

Matches table uses `external_id + external_source` unique constraint:

```sql
ALTER TABLE matches ADD CONSTRAINT unique_external_match
UNIQUE (external_id, external_source);
```

### Recommended Multi-Layer Approach for Rumors

1. **Layer 1: Source URL (Database)**
   - Unique constraint on `source_url` - prevents exact duplicates

2. **Layer 2: Fuzzy Title Matching (Application)**
   - Use [Fuzzball](https://www.npmjs.com/package/fuzzball) npm package
   - Has built-in `fuzzy_dedupe` function
   - Threshold: 85% similarity = duplicate

3. **Layer 3: Player + Category + Time Window (Application)**
   - Same `player_name` + `category` within 48 hours = update existing rumor
   - Increment `recurrence_count` instead of creating new

4. **Layer 4: Content Hash (Database - Optional)**
   - MD5 hash of normalized content for exact match detection

### Implementation Example

```typescript
import fuzz from "fuzzball";

/**
 * Check if a date is within the last 48 hours
 */
function isWithin48Hours(date: Date | string): boolean {
  const timestamp =
    typeof date === "string" ? new Date(date).getTime() : date.getTime();
  const now = Date.now();
  const hours48 = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
  return now - timestamp <= hours48;
}

async function isDuplicateRumor(
  newRumor: Rumor,
  existingRumors: Rumor[],
): Promise<{
  isDuplicate: boolean;
  existingRumorId?: string;
  reason?: string;
}> {
  // Check source URL first (exact match)
  const urlMatch = existingRumors.find(
    (r) => r.source_url === newRumor.source_url,
  );
  if (urlMatch) {
    return {
      isDuplicate: true,
      existingRumorId: urlMatch.id,
      reason: "exact_url",
    };
  }

  // Check fuzzy title match
  for (const existing of existingRumors) {
    const similarity = fuzz.ratio(
      newRumor.title.toLowerCase(),
      existing.title.toLowerCase(),
    );
    if (similarity >= 85) {
      return {
        isDuplicate: true,
        existingRumorId: existing.id,
        reason: "similar_title",
      };
    }
  }

  // Check player + category in recent window
  if (newRumor.player_name) {
    const playerMatch = existingRumors.find(
      (r) =>
        r.player_name === newRumor.player_name &&
        r.category === newRumor.category &&
        isWithin48Hours(r.created_at),
    );
    if (playerMatch) {
      return {
        isDuplicate: true,
        existingRumorId: playerMatch.id,
        reason: "recurring_rumor",
      };
    }
  }

  return { isDuplicate: false };
}
```

### Recommendation

**Add `fuzzball` dependency**:

```json
{
  "dependencies": {
    "fuzzball": "^2.1.0"
  }
}
```

---

## Spike 4: Database Schema Validation

### Migration Naming

Next migration should be: `sql/0002_rumors_schema.sql`

### Schema Adaptation

The proposed schema is **compatible** with existing patterns. Key alignments:

| Pattern        | Existing                    | Rumors Table           |
| -------------- | --------------------------- | ---------------------- |
| Primary Key    | UUID (`uuid_generate_v4()`) | ✅ UUID                |
| Timestamps     | `created_at`, `updated_at`  | ✅ Present             |
| User Reference | `user_id TEXT` (Clerk ID)   | ✅ `submitted_by TEXT` |
| RLS            | Enabled with policies       | ✅ Will enable         |
| Indexes        | On frequent query columns   | ✅ Defined             |

### RLS Policy Recommendation

```sql
-- Rumors should be publicly readable, admin-only write
CREATE POLICY "Allow public read on rumors" ON rumors FOR SELECT USING (true);
-- Only allow users with 'role' claim set to 'admin' in their JWT to write
CREATE POLICY "Allow admin insert on rumors" ON rumors
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin update on rumors" ON rumors
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin delete on rumors" ON rumors
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');
```

### Recommendation

**Proceed with schema as designed** - fully compatible with existing patterns.

---

## Spike 5: Feature Flag Integration

### Current System

Environment variable-based flags in `src/lib/featureFlags.ts`:

```typescript
export type FeatureName =
  | "show-clasificacion"
  | "show-galeria"
  // ... existing flags
  | "show-contacto";
```

### Required Changes

1. **Add to `FeatureName` type**:

```typescript
export type FeatureName =
  // ... existing
  "show-soylenti";
```

2. **Add to `DEFAULT_FEATURES`**:

```typescript
const DEFAULT_FEATURES: Record<FeatureName, boolean> = {
  // ... existing
  "show-soylenti": false, // Disabled by default until ready
};
```

3. **Add to `ENV_VAR_MAP`**:

```typescript
const ENV_VAR_MAP: Record<FeatureName, string> = {
  // ... existing
  "show-soylenti": "NEXT_PUBLIC_FEATURE_SOYLENTI",
};
```

4. **Add navigation item** (optional):

```typescript
{ name: 'Soylenti', href: '/soylenti', nameEn: 'Rumors', feature: 'show-soylenti' },
```

### Recommendation

**Straightforward integration** - follow existing pattern exactly.

---

## Revised Implementation Plan

### Phase 1: Foundation (2-3 hours) ✏️ Adapted

- [x] ~~Test RSS feeds~~ - Done in spike
- [ ] Create `sql/0002_rumors_schema.sql`
- [ ] Add `'show-soylenti'` feature flag
- [ ] Add environment variables to `.env.example`
- [ ] Install dependencies:
  ```bash
  npm install rss-parser @ai-sdk/google ai fuzzball
  ```

### Phase 2: AI Agent (4-5 hours) - Unchanged

- [ ] Implement `src/lib/soylenti/newsFetcher.ts`
- [ ] Create `src/lib/soylenti/geminiAgent.ts`
- [ ] Build `/api/soylenti/process` endpoint
- [ ] Add deduplication logic with Fuzzball

### Phase 3: Scheduler (1 hour) - Unchanged

- [ ] Create `.github/workflows/soylenti-agent.yml`
- [ ] Add `CRON_SECRET` to GitHub secrets
- [ ] Test manual trigger

### Phase 4: Frontend (3-4 hours) - Unchanged, Fran Mode deferred

- [ ] Create `/soylenti` page (basic version)
- [ ] Build `RumorCard.tsx` component
- [ ] Add category filters
- [ ] ~~Build `ProbabilityMeter.tsx`~~ → **Deferred to Fran Mode phase**

### Phase 5: Testing (2-3 hours) - Unchanged

- [ ] Unit tests for agent logic
- [ ] Integration tests for deduplication
- [ ] E2E tests for page
- [ ] Monitor initial runs

### Deferred: Fran Mode Phase (Later)

- [ ] `ProbabilityMeter.tsx` - Visual gauge component
- [ ] Probability coloring (red/orange/yellow/green)
- [ ] AI reasoning display
- [ ] Resolution tracking UI
- [ ] Source accuracy stats view

---

## Risks & Mitigations (Updated)

| Risk                  | Original | Updated Status                                   |
| --------------------- | -------- | ------------------------------------------------ |
| RSS feeds break       | Medium   | **Lower** - 3 feeds with Google News aggregation |
| Gemini rate limits    | Low      | Unchanged                                        |
| Poor AI accuracy      | Medium   | Unchanged                                        |
| Duplicate rumors      | Medium   | **Lower** - Multi-layer strategy                 |
| GitHub Actions outage | Low      | Unchanged                                        |

### Risk Mitigation: Source Redundancy

With 3 RSS feeds (2 Google News queries + BetisWeb):

- Google News aggregates multiple Spanish sources (Marca, AS, Estadio Deportivo, etc.)
- BetisWeb provides dedicated Betis coverage as backup
- If one feed fails, others provide sufficient coverage

**Additional mitigations**:

- Add health check in agent
- Alert admin if all fetches fail
- Implement fallback to cached content

---

## Dependencies Summary

### New NPM Packages

```json
{
  "dependencies": {
    "rss-parser": "^3.13.0",
    "@ai-sdk/google": "^1.0.0",
    "ai": "^4.0.0",
    "fuzzball": "^2.1.0"
  }
}
```

### Environment Variables

```env
# Soylenti AI Agent
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
CRON_SECRET=your_random_secret_here
NEXT_PUBLIC_FEATURE_SOYLENTI=false
```

### GitHub Secrets

- `SITE_URL` - Production URL
- `CRON_SECRET` - Agent authentication
- `GOOGLE_GEMINI_API_KEY` - AI provider key

---

## Conclusion

The Soylenti feature plan is **viable with optimized RSS strategy**:

1. ✅ **RSS feeds** - 3 optimized sources:
   - Google News (transfer rumors query) - Transfer-focused, 60-70% relevant
   - Google News (Real Betis) - Comprehensive coverage
   - BetisWeb - Dedicated Betis source, high credibility
2. ✅ **AI integration** - Straightforward, no conflicts
3. ✅ **Deduplication** - Multi-layer approach with Fuzzball
4. ✅ **Database** - Compatible with existing patterns
5. ✅ **Feature flags** - Simple addition to existing system
6. ⏸️ **Fran Mode** - Deferred to later phase as requested

**Estimated total time**: 12-16 hours (slightly reduced due to Fran Mode deferral)

---

## References

- [Fuse.js](https://www.fusejs.io/) - Fuzzy search library
- [Fuzzball](https://www.npmjs.com/package/fuzzball) - Fuzzy matching with dedupe
- [string-similarity-js](https://www.npmjs.com/package/string-similarity-js) - Alternative
- [Google Gemini API](https://ai.google.dev/docs) - AI provider
- [Vercel AI SDK](https://sdk.vercel.ai/docs) - AI integration
