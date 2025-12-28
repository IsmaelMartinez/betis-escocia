# ADR-015: AI Rumor Scoring System (Soylenti)

## Status
Accepted

## Decision
**Google Gemini 2.5 Flash** for automated analysis and probability scoring of Real Betis transfer rumors ("Fran Mode"). The AI evaluates news items in two steps: (1) determine if it's a transfer rumor, (2) assign a credibility probability (0-100%).

## Context
The Soylenti feature aggregates Real Betis news from RSS feeds and needs intelligent filtering to distinguish transfer rumors from regular news, plus credibility scoring to help users gauge rumor reliability.

## Architecture

```
RSS Feeds → Deduplication → Gemini AI Analysis → Supabase Storage
                                    ↓
                           isTransferRumor: boolean
                           probability: 0-100
                           reasoning: string
                           confidence: low|medium|high
```

## Implementation

### AI Service (`src/services/geminiService.ts`)
```typescript
export async function analyzeRumorCredibility(
  title: string,
  description: string,
  source: string,
): Promise<RumorAnalysis>
```

### Probability Scoring (Fran Mode)
| Range | Label | Visual | Criteria |
|-------|-------|--------|----------|
| 0-25% | Muy Improbable | 🔴 | Tabloid source, no corroboration |
| 26-50% | Poco Probable | 🟠 | Single source, unverified |
| 51-75% | Posible | 🟡 | Multiple sources, some evidence |
| 76-100% | Muy Probable | 🟢 | Tier 1 sources, strong signals |

### Database Schema
- `ai_probability`: Numeric (0-100), nullable for unanalyzed items
- `ai_analysis`: AI reasoning in Spanish
- `ai_analyzed_at`: Timestamp of analysis

### Error Handling
- 3 retry attempts with 1-second backoff
- Quota errors (429) store items with `null` probability for later analysis
- Graceful degradation: news stored even if AI fails

## Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| **Gemini 2.5 Flash** ✅ | Free tier, fast, excellent quality | Google dependency |
| OpenAI GPT-4 | High quality | Paid, expensive for volume |
| Claude | Great reasoning | No free tier for API |
| Rule-based | No external dependency | Poor accuracy, rigid |

## Cost Analysis
- ~4 runs/day × 30-50 items = ~14,000 tokens/day
- Monthly: ~420,000 tokens (well within free tier)
- GitHub Actions: ~200 min/month (free)

## References
- [Soylenti Research Doc](../research/2025-12-soylenti-rumors-research.md)
- [Database Migration](../../sql/0002_add_rumors_table.sql)
- [ADR-003: Supabase Database](./003-supabase-database.md)

