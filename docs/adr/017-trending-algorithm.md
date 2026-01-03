# ADR-017: Half-Life Decay Trending Algorithm

## Status

Accepted

## Context

The Soylenti feature displays trending players based on transfer rumor mentions. The original algorithm used a simple percentage-change approach:

```
momentum = (mentions_last_3_days - mentions_days_4_to_7) / mentions_days_4_to_7
```

This approach had several problems:

1. **Single-day gaps penalized heavily**: If a player had mentions on days 1, 3, 5 but not 2, 4, the algorithm saw this as unstable
2. **No aggregate value**: A player mentioned 10 times over a week ranked the same as one mentioned twice in the last 3 days
3. **Hard dormant cutoff**: 7 days without mentions = instant dormant classification, ignoring prior activity
4. **Binary thresholds**: Players jumped between "hot" and "stable" with small changes

Research into industry-standard algorithms revealed better approaches:

- **Reddit's Hot Algorithm**: Uses logarithmic vote weighting with time decay
- **Hacker News Algorithm**: `Score = (P-1) / (T+2)^G` with gravity parameter
- **Academic research**: Power-law decay (α = 0.56) outperforms exponential in attention modeling

## Decision

Implement a **half-life decay scoring algorithm** that:

1. **Weights mentions by recency** using exponential decay
2. **Aggregates all mentions** so volume matters
3. **Applies recency bonus** for very recent activity
4. **Uses smooth decay** instead of hard cutoffs

### Formula

```
trendScore = Σ(e^(-age_days × ln(2) / half_life) × recency_bonus)
```

With configurable parameters:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `HALF_LIFE_DAYS` | 3 | Days until mention weight = 50% |
| `RECENCY_BONUS_DAYS` | 3 | Window for recency bonus |
| `RECENCY_BONUS_MULTIPLIER` | 1.5 | Bonus for recent mentions |

### Decay Weights

With half-life = 3 days:

| Age | Weight |
|-----|--------|
| Today | 100% |
| 1 day | 79% |
| 3 days | 50% |
| 7 days | 22% |
| 14 days | 5% |

## Implementation

### Files

- `src/lib/soylenti/trendingAlgorithm.ts` - Core algorithm functions
- `src/lib/soylenti/constants.ts` - Configurable thresholds
- `src/lib/data/players.ts` - Integration with player fetching

### Key Functions

```typescript
// Calculate decay weight for a mention at given age
calculateDecayWeight(ageDays: number, halfLifeDays?: number): number

// Calculate total trend score from timeline
calculateTrendScore(timeline: DailyMention[]): number

// Calculate velocity (rate of change)
calculateVelocity(filledTimeline: number[]): number

// Determine momentum phase (hot, rising, stable, cooling, dormant)
determineMomentumPhase(trendScore: number, velocity: number, daysSinceLastMention: number): MomentumPhase
```

### Algorithm Selection

The algorithm can be switched via constant:

```typescript
// In src/lib/soylenti/constants.ts
export const TRENDING_ALGORITHM: TrendingAlgorithm = "decay"; // or "legacy"
```

### Phase Classification

| Phase | Criteria |
|-------|----------|
| Hot | High score (≥3.0) + high velocity (≥30%) + recent activity (≤3 days) |
| Rising | Positive velocity (≥15%) + decent score (≥0.5) |
| Stable | Moderate activity, no significant change |
| Cooling | Negative velocity (≤-20%) or low activity |
| Dormant | No mentions in 10+ days AND score below 0.2 |

## Consequences

### Positive

- **Gaps handled gracefully**: Missing a day barely impacts score
- **Aggregate value**: Players with sustained coverage rank higher
- **Smooth transitions**: No jarring jumps between phases
- **Configurable**: All thresholds adjustable without code changes
- **Backward compatible**: Legacy algorithm preserved as option

### Negative

- **More complex**: Decay math vs simple percentage
- **Sorting changes**: Rankings now based on trend score, not raw count

## References

- [Reddit Ranking Algorithm](https://saturncloud.io/blog/how-are-reddit-and-hacker-news-ranking-algorithms-used/)
- [Hacker News Algorithm Analysis](https://sangaline.com/post/reverse-engineering-the-hacker-news-ranking-algorithm/)
- [ADR-016: Soylenti Frontend Architecture](./016-soylenti-frontend-architecture.md)
- [ADR-015: AI Rumor Scoring](./015-ai-rumor-scoring.md)
