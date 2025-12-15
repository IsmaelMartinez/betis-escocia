# ADR-007: Trivia Game System

## Status
Accepted

## Decision
**Simplified trivia architecture** with consolidated API and minimal state management.

## Architecture
- **Single API endpoint**: `/api/trivia?action=questions|submit|score|total`
- **3 state variables**: `gameState`, `currentData`, `error`
- **Simple timer**: `setTimeout` (no separate component)
- **Database randomization**: `ORDER BY RANDOM() LIMIT 5`

## Game Flow
```
idle → loading → playing → feedback → completed
```

## API Usage
```typescript
GET /api/trivia?action=questions   // Get 5 random questions
POST /api/trivia?action=submit     // Submit daily score
GET /api/trivia?action=total       // Get accumulated score
```

## Database
- `trivia_questions`: Questions with categories (betis, scotland)
- `trivia_answers`: Multiple choice answers with `is_correct` flag
- `user_trivia_scores`: Daily scores linked to authenticated users

## Game Features
- 5-question format with 15-second timer
- Once-per-day play limit
- Percentage-based scoring with immediate feedback
- Betis-specific and Scottish culture content

## Performance
- 85% reduction in data transfer (5 questions vs 100)
- Average 172ms response time
- Direct database randomization for variety

