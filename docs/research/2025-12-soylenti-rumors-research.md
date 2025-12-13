# Soylenti (Rumors Page) - AI Agent Research

> **Date**: December 2025  
> **Status**: Research  
> **Goal**: Implement an automated AI-powered rumors page that aggregates and analyzes Real Betis transfer news

## Executive Summary

This document analyzes the implementation of **Soylenti**, an automated rumors page for Real Betis transfer news. The system uses:

1. **External news sources** (RSS feeds, news APIs) for raw content
2. **Google Gemini AI** to analyze, extract, and score rumors
3. **Vercel Cron Jobs** to run the agent on a schedule
4. **Supabase** for storage and the public-facing page

**Key Feature**: "Fran Mode" - AI-assigned probability percentages (0-100%) indicating the likelihood of each rumor being true.

---

## 1. System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SOYLENTI AI AGENT SYSTEM                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │ News Sources │───▶│  AI Agent    │───▶│   Supabase Database  │  │
│  │              │    │  (Gemini)    │    │                      │  │
│  │ • Estadio    │    │              │    │  • rumors table      │  │
│  │ • ABC Sevilla│    │ • Extract    │    │  • source metadata   │  │
│  │ • Marca      │    │ • Analyze    │    │  • probability       │  │
│  │ • AS         │    │ • Score      │    │                      │  │
│  │ • BetisWeb   │    │              │    │                      │  │
│  └──────────────┘    └──────────────┘    └──────────────────────┘  │
│         │                   │                       │               │
│         │                   │                       │               │
│         ▼                   ▼                       ▼               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Vercel Cron Job                            │  │
│  │                 (Runs every 6-12 hours)                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        PUBLIC WEBSITE                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    /soylenti page                             │  │
│  │    Displays processed rumors with AI-assigned probabilities   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Cron Job Trigger**: Vercel triggers `/api/cron/soylenti-agent` every 6 hours
2. **News Fetching**: Agent fetches headlines from multiple RSS feeds
3. **AI Analysis**: Gemini analyzes content, extracts Betis-related rumors
4. **Probability Scoring**: AI assigns 0-100% probability based on source credibility
5. **Deduplication**: Check against existing rumors to avoid duplicates
6. **Storage**: New rumors stored in Supabase with metadata
7. **Display**: Public page shows processed rumors with "Fran Mode" percentages

---

## 2. External News Sources

### Available Free Sources

| Source | Method | Quality | Reliability | Notes |
|--------|--------|---------|-------------|-------|
| **Google News RSS** | RSS Feed | High | Very High | Aggregates multiple sources |
| **Marca RSS** | RSS Feed | High | High | Major Spanish sports outlet |
| **AS RSS** | RSS Feed | High | High | Major Spanish sports outlet |
| **Estadio Deportivo** | Web Scraping | Very High | High | Betis-focused local paper |
| **ABC Sevilla** | RSS/Scraping | High | High | Local Seville newspaper |
| **BetisWeb Forum** | RSS/API | Community | Medium | Fan discussions |
| **Twitter/X API** | API | Mixed | Low | Free tier very limited |
| **Reddit r/RealBetis** | API | Community | Medium | Fan discussions |
| **Transfermarkt** | Scraping | Very High | High | Transfer-focused data |

### Recommended Initial Sources

For MVP, use RSS feeds (simplest implementation):

```typescript
const RSS_FEEDS = [
  {
    name: 'Google News - Real Betis',
    url: 'https://news.google.com/rss/search?q=Real+Betis+fichaje&hl=es&gl=ES&ceid=ES:es',
    reliability: 0.7,
  },
  {
    name: 'Marca - Betis',
    url: 'https://e00-marca.uecdn.es/rss/futbol/betis.xml',
    reliability: 0.65,
  },
  {
    name: 'AS - Betis',
    url: 'https://as.com/rss/tags/topics/real_betis.xml',
    reliability: 0.65,
  },
];
```

---

## 3. AI Agent Design

### Gemini Model Selection

| Model | Cost | Speed | Quality | Recommendation |
|-------|------|-------|---------|----------------|
| Gemini 1.5 Flash | Free tier | Fast | Good | ✅ **Recommended** |
| Gemini 1.5 Pro | Paid | Medium | Excellent | For complex analysis |
| Gemini 2.0 Flash | Free tier | Very Fast | Good | Alternative |

### System Prompt (Fran Mode)

```typescript
const SOYLENTI_AGENT_PROMPT = `Eres un agente de inteligencia de fichajes del Real Betis Balompié. 
Tu trabajo es analizar noticias y rumores sobre el equipo.

TAREAS:
1. Analiza el siguiente contenido de noticias
2. Extrae SOLO rumores relacionados con Real Betis (fichajes, salidas, renovaciones, lesiones)
3. Para cada rumor, proporciona:
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    player_name VARCHAR(100),
    
    -- Classification
    category VARCHAR(50) CHECK (category IN (
      'transfer_in', 'transfer_out', 'contract', 
      'injury', 'management', 'general'
    )),
    
    -- Source tracking
    source_url TEXT,
    source_name VARCHAR(100),
    
    -- AI Analysis (Fran Mode)
    probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
    ai_reasoning TEXT,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'approved' CHECK (status IN (
      'pending', 'approved', 'rejected', 'confirmed', 'denied'
    )),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Attribution
    submitted_by TEXT DEFAULT 'ai-agent',
    approved_by TEXT,
    
    -- Engagement (optional future feature)
    votes_up INTEGER DEFAULT 0,
    votes_down INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_rumors_created_at ON rumors(created_at DESC);
CREATE INDEX idx_rumors_category ON rumors(category);
CREATE INDEX idx_rumors_status ON rumors(status);
CREATE INDEX idx_rumors_probability ON rumors(probability DESC);

-- Automatically update updated_at on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rumors_updated_at
BEFORE UPDATE ON rumors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## 5. Vercel Cron Configuration

### `vercel.json` Addition

```json
{
  "crons": [
    {
      "path": "/api/cron/soylenti-agent",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Schedule**: Runs at minute 0 every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)

### Security

The cron endpoint must verify requests using `CRON_SECRET`:

```typescript
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... agent logic
}
```

---

## 6. File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── cron/
│   │   │   └── soylenti-agent/
│   │   │       └── route.ts          # Cron job handler
│   │   └── rumors/
│   │       └── route.ts              # Public API (GET rumors)
│   └── soylenti/
│       └── page.tsx                  # Public rumors page
├── components/
│   ├── ProbabilityMeter.tsx          # Fran Mode visual gauge
│   ├── RumorCard.tsx                 # Individual rumor display
│   └── RumorFilters.tsx              # Category filters
└── lib/
    └── soylenti/
        ├── newsFetcher.ts            # RSS/news aggregation
        ├── prompts.ts                # Gemini system prompts
        ├── geminiAgent.ts            # AI agent logic
        └── types.ts                  # TypeScript types

sql/
└── 0002_rumors_schema.sql            # Database migration
```

---

## 7. Cost Analysis

### Gemini Free Tier Usage

| Metric | Value |
|--------|-------|
| Cron runs per day | 4 (every 6 hours) |
| News items per run | ~30-50 headlines |
| Input tokens per run | ~2,000 |
| Output tokens per run | ~1,500 |
| **Daily tokens** | ~14,000 |
| **Monthly tokens** | ~420,000 |
| **Free tier limit** | 1,500 requests/day, 1M+ tokens |
| **Status** | ✅ **Comfortably within free tier** |

### Vercel Cron Pricing

| Plan | Cron Jobs | Invocations/month | Our Usage |
|------|-----------|-------------------|-----------|
| Hobby (Free) | 2 | 60 | ❌ Not enough |
| Pro ($20/mo) | 40 | Unlimited | ✅ Sufficient |

**Note**: The Pro plan may be required for cron jobs, or use an alternative scheduler.

---

## 8. Technical Spikes Required

### Spike 1: RSS Feed Reliability (Priority: High)
**Duration**: 2-4 hours

**Objective**: Verify that the identified RSS feeds are reliable and accessible.

**Tasks**:
- [ ] Test each RSS feed URL for availability
- [ ] Verify content structure and parsing
- [ ] Measure response times and rate limits
- [ ] Identify backup sources if primary fails
- [ ] Document any authentication requirements

**Success Criteria**: At least 3 reliable RSS feeds providing Betis-related news.

---

### Spike 2: Gemini Structured Output (Priority: High)
**Duration**: 3-4 hours

**Objective**: Validate Gemini's ability to extract rumors with consistent JSON output.

**Tasks**:
- [ ] Test `generateObject` with Zod schema validation
- [ ] Evaluate output quality with sample news data
- [ ] Tune system prompt for accurate probability scoring
- [ ] Test edge cases (no rumors, non-Betis news)
- [ ] Measure token usage per request

**Success Criteria**: Gemini consistently returns valid JSON with reasonable probabilities.

---

### Spike 3: Vercel Cron Jobs Setup (Priority: Medium)
**Duration**: 2-3 hours

**Objective**: Confirm Vercel cron job configuration and limitations.

**Tasks**:
- [ ] Test cron job creation in Vercel dashboard
- [ ] Verify `CRON_SECRET` authentication
- [ ] Measure execution time limits (10s on Hobby, 60s on Pro)
- [ ] Test error handling and retry behavior
- [ ] Evaluate alternatives (GitHub Actions, Supabase Edge Functions)

**Success Criteria**: Working cron job that executes reliably every 6 hours.

---

### Spike 4: Deduplication Algorithm (Priority: Medium)
**Duration**: 2-3 hours

**Objective**: Design an effective deduplication strategy to avoid duplicate rumors.

**Tasks**:
- [ ] Test title similarity matching (fuzzy matching)
- [ ] Evaluate time-window based deduplication
- [ ] Consider player + category combination matching
- [ ] Test with real-world data samples
- [ ] Measure false positive/negative rates

**Success Criteria**: <5% duplicate rumors in production.

---

### Spike 5: Alternative Schedulers (Priority: Low)
**Duration**: 2 hours

**Objective**: Identify alternatives to Vercel cron if cost or limitations are prohibitive.

**Options to evaluate**:
- [ ] GitHub Actions scheduled workflows (free)
- [ ] Supabase Edge Functions with pg_cron
- [ ] Cloudflare Workers with Cron Triggers
- [ ] External cron services (cron-job.org, EasyCron)

**Success Criteria**: Documented backup scheduling option.

---

## 9. Implementation Phases

### Phase 1: Foundation (3-4 hours)
- [ ] Create database migration for rumors table
- [ ] Add feature flag `show-soylenti`
- [ ] Set up environment variables
- [ ] Install dependencies (`rss-parser`, `@ai-sdk/google`)

### Phase 2: AI Agent (4-5 hours)
- [ ] Implement news fetcher with RSS parsing
- [ ] Create Gemini agent with structured output
- [ ] Build cron job endpoint with authentication
- [ ] Add deduplication logic

### Phase 3: Frontend (3-4 hours)
- [ ] Create `/soylenti` page
- [ ] Build `ProbabilityMeter` component (Fran Mode)
- [ ] Build `RumorCard` component
- [ ] Add category filters

### Phase 4: Testing & Polish (2-3 hours)
- [ ] Write unit tests for agent logic
- [ ] Add E2E tests for page
- [ ] Monitor first few cron runs
- [ ] Tune prompt based on results

**Total Estimated Time**: 12-16 hours (2-3 days)

---

## 10. Environment Variables

```env
# Required for Soylenti AI Agent
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Vercel Cron secret (generate random string)
CRON_SECRET=your_random_secret_here

# Feature flag (disabled by default)
FEATURE_SOYLENTI=false
```

---

## 11. Dependencies

### New NPM Packages

```json
{
  "dependencies": {
    "rss-parser": "^3.13.0",
    "@ai-sdk/google": "^0.0.x",
    "ai": "^3.x.x"
  }
}
```

### Existing Packages (Already Installed)
- `zod` - Schema validation
- `@supabase/supabase-js` - Database client

---

## 12. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| RSS feeds change/break | High | Medium | Monitor feeds, have backup sources |
| Gemini rate limits | Medium | Low | Batch requests, implement caching |
| Poor AI accuracy | Medium | Medium | Tune prompt, add human review option |
| Vercel cron costs | Low | Medium | Use GitHub Actions as free alternative |
| Duplicate rumors | Low | Medium | Implement fuzzy matching deduplication |

---

## 13. Future Enhancements

### Phase 2 Features (Not in MVP)
- User voting on rumors (community input to probability)
- Manual admin rumor submission
- Push notifications for high-probability rumors
- Rumor resolution tracking (confirmed/denied)
- Historical accuracy statistics per source

### Phase 3 Features
- Web scraping for non-RSS sources
- Twitter/X integration for real-time mentions
- Multi-language support (English translations)
- Rumor comparison with official announcements

---

## 14. Decision

**Recommended approach:**

1. **News Sources**: Start with 3 RSS feeds (Google News, Marca, AS)
2. **AI Provider**: Google Gemini 1.5 Flash (free tier)
3. **Scheduler**: Vercel Cron (or GitHub Actions if cost prohibitive)
4. **Update Frequency**: Every 6 hours (4 times daily)
5. **Probability System**: AI-assigned with transparency (show reasoning)

**Next Steps:**
1. Complete Spike 1 (RSS Feed Reliability) - 2-4 hours
2. Complete Spike 2 (Gemini Structured Output) - 3-4 hours
3. Begin Phase 1 implementation

---

## References

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [rss-parser NPM Package](https://www.npmjs.com/package/rss-parser)
- [Existing AI Assistant Research](./2025-12-ai-assistant-research.md)
- [Feature Flags Documentation](../adr/004-flagsmith-feature-flags.md)

