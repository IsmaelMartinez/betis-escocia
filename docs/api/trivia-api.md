# Trivia API Documentation

## Overview

The Trivia API provides a consolidated endpoint for Real Betis & Scotland trivia game functionality. This endpoint replaces the previous multiple separate endpoints with a single unified endpoint that uses query parameters for routing.

**Base URL:** `/api/trivia`  
**Architecture:** Consolidated single endpoint with query parameter routing  
**Authentication:** Optional (supports both authenticated and anonymous users)

## Performance Improvements

- **60% API endpoint reduction**: 3 separate endpoints → 1 consolidated endpoint
- **Database optimization**: Reduced question fetching from 100 to 15 questions 
- **SQL aggregation**: Server-side total score calculation instead of client-side
- **Comprehensive error handling**: Structured error responses with performance tracking

## Endpoints

### GET `/api/trivia`

Retrieves trivia questions, user scores, or total scores based on the `action` query parameter.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `action` | string | `questions` | Action to perform: `questions`, `score`, or `total` |

#### Actions

##### 1. Get Questions (`?action=questions`)

Returns trivia questions for gameplay. Supports both authenticated and anonymous users.

**Authentication:** Optional  
**Cache:** Questions are shuffled per request for variety  
**Rate Limiting:** Client-side "once per day" for authenticated users

**Request:**
```http
GET /api/trivia?action=questions
```

**Response (New Game):**
```json
[
  {
    "id": "uuid",
    "question_text": "In which year was Real Betis founded?",
    "category": "Real Betis History",
    "difficulty": "medium",
    "trivia_answers": [
      {
        "id": "uuid",
        "answer_text": "1907",
        "is_correct": true
      },
      {
        "id": "uuid", 
        "answer_text": "1909",
        "is_correct": false
      },
      {
        "id": "uuid",
        "answer_text": "1905",
        "is_correct": false
      },
      {
        "id": "uuid",
        "answer_text": "1912",
        "is_correct": false
      }
    ]
  }
]
```

**Response (Already Played Today):**
```json
{
  "message": "You have already played today.",
  "score": 67
}
```

##### 2. Get Daily Score (`?action=score`)

Returns the user's daily trivia score.

**Authentication:** Required  
**User Context:** Current authenticated user

**Request:**
```http
GET /api/trivia?action=score
Authorization: Bearer <clerk_token>
```

**Response:**
```json
{
  "score": 67
}
```

##### 3. Get Total Score (`?action=total`)

Returns the user's total accumulated score across all games.

**Authentication:** Required  
**Performance:** Uses SQL aggregation for optimal performance  
**Fallback:** Client-side calculation if SQL aggregation fails

**Request:**
```http
GET /api/trivia?action=total
Authorization: Bearer <clerk_token>
```

**Response:**
```json
{
  "totalScore": 245
}
```

### POST `/api/trivia`

Submits trivia scores with comprehensive validation.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `action` | string | `submit` | Action to perform: `submit` |

#### Actions

##### 1. Submit Score (`?action=submit`)

Submits a user's trivia game score.

**Authentication:** Required  
**Validation:** Score must be 0-100, user cannot submit twice per day  
**Business Logic:** Prevents duplicate daily submissions

**Request:**
```http
POST /api/trivia?action=submit
Content-Type: application/json
Authorization: Bearer <clerk_token>

{
  "score": 67
}
```

**Response (Success):**
```json
{
  "message": "Score saved successfully!"
}
```

## Question Randomization System

The trivia API uses an advanced database-level randomization system to ensure optimal question variety and performance.

### Randomization Method
- **Primary Method**: PostgreSQL `ORDER BY RANDOM()` with `LIMIT 5`
- **Selection Source**: Full database of all available questions
- **Duplicate Prevention**: Database guarantees no duplicates within single query
- **Answer Shuffling**: Client-side randomization of answer order within each question

### Performance Optimizations
- **Composite Indexes**: Optimized indexes for efficient random query execution
- **Table Statistics**: Regularly updated statistics help PostgreSQL query planner
- **Exact Fetching**: No over-fetching - retrieve exactly 5 questions needed
- **Future-Proofing**: Supports optimized sampling for large datasets (1000+ questions)

### Quality Guarantees
- **Equal Probability**: All questions have equal chance of selection
- **No Duplicates**: Zero duplicate questions within single game session
- **Statistical Distribution**: Coefficient of variation <0.5 for uniform distribution
- **Question Variety**: Full database variety vs. limited 15-question pool

### Before vs. After Comparison
```
BEFORE (Limited Pool Approach):
├── Fetch 15 questions from database
├── Client-side shuffle of 15 questions  
├── Select 5 questions from shuffled pool
└── Result: Limited variety from 15-question pool

AFTER (Database Randomization):
├── Database-level ORDER BY RANDOM() LIMIT 5
├── Client-side answer shuffling only
└── Result: Full variety from entire question database
```

### Performance Impact
- **Data Transfer**: 67% reduction (15→5 questions)
- **Database Load**: Reduced through exact fetching
- **Response Time**: Improved through optimized queries
- **Question Variety**: Significantly improved through full database access

## Authentication

The API supports three authentication modes:

### 1. Anonymous Access
- **Supported Actions:** `GET ?action=questions`
- **Functionality:** Can retrieve questions and play games
- **Limitations:** Cannot save scores or view personal statistics

### 2. Optional Authentication  
- **Supported Actions:** `GET ?action=questions`
- **Enhanced Functionality:** Daily play checking, personalized experience
- **Graceful Degradation:** Falls back to anonymous behavior if auth fails

### 3. Required Authentication
- **Supported Actions:** `GET ?action=score|total`, `POST ?action=submit`
- **Token:** Clerk JWT token with Supabase template
- **User Context:** Clerk user ID used for data association

## Data Schemas

### Trivia Score Schema (POST requests)

```typescript
{
  score: number; // Must be between 0 and 100 (inclusive)
}
```

### Trivia Question Schema (GET responses)

```typescript
{
  id: string;                    // UUID
  question_text: string;         // The question content
  category: string;              // Question category
  difficulty: string;            // Difficulty level
  trivia_answers: Array<{
    id: string;                  // UUID
    answer_text: string;         // Answer option text  
    is_correct: boolean;         // Whether this answer is correct
  }>;
}
```

## Error Handling

The API uses structured error responses with comprehensive context and performance tracking.

### Error Types

| Type | Status Code | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data or parameters |
| `AUTHENTICATION_ERROR` | 401 | Missing or invalid authentication |
| `BUSINESS_LOGIC_ERROR` | 409 | Business rule violation (e.g., already played today) |
| `DATABASE_ERROR` | 500 | Database operation failures |

### Error Response Format

```json
{
  "error": "User has already played trivia today",
  "details": {
    "type": "BUSINESS_LOGIC_ERROR",
    "context": {
      "userId": "user_123",
      "action": "submit",
      "existingScore": 67
    }
  }
}
```

### Common Error Scenarios

#### 1. Already Played Today (409)
```json
{
  "error": "User has already played trivia today", 
  "details": {
    "type": "BUSINESS_LOGIC_ERROR"
  }
}
```

#### 2. Invalid Score (400)
```json
{
  "error": "Score must be between 0 and 100",
  "details": {
    "type": "VALIDATION_ERROR"
  }
}
```

#### 3. Authentication Required (401)
```json
{
  "error": "Authentication required for score retrieval",
  "details": {
    "type": "AUTHENTICATION_ERROR" 
  }
}
```

#### 4. No Questions Available (503)
```json
{
  "error": "No trivia questions available",
  "details": {
    "type": "BUSINESS_LOGIC_ERROR"
  }
}
```

## Performance Features

### 1. Database Optimizations
- **Database-Level Randomization:** PostgreSQL `ORDER BY RANDOM() LIMIT 5` for optimal question variety
- **Exact Question Fetching:** Fetch exactly 5 questions (no over-fetching) 
- **SQL Aggregation:** Server-side total score calculation
- **Indexed Queries:** Optimized for user_id and date-based lookups
- **Random Query Optimization:** Composite indexes and table statistics for efficient randomization
- **Fallback Logic:** Client-side calculation if SQL aggregation fails

### 2. Performance Tracking
- **Request Timing:** End-to-end performance monitoring
- **Database Query Timing:** Individual operation profiling
- **Business Event Logging:** User interaction analytics
- **Error Context:** Comprehensive error tracking and debugging

### 3. Caching Strategy
- **Daily Play Check:** Cached to prevent duplicate database queries
- **Question Shuffling:** Randomized per request for variety
- **Score Validation:** Input validation before database operations

## Business Logic

### 1. Daily Play Enforcement
- Users can only play once per day (authenticated users)
- Anonymous users can play unlimited times but cannot save scores
- Existing score returned if user attempts second play

### 2. Score Validation
- Scores must be integers between 0-100 (inclusive)
- Percentage-based scoring system
- Input sanitization and validation

### 3. Question Management
- Questions shuffled per request for variety
- Answers randomized within each question
- Support for multiple categories and difficulty levels

## Migration from Legacy Endpoints

### Removed Endpoints (Backward Compatibility Eliminated)
- ❌ `/api/trivia/total-score` → Use `GET /api/trivia?action=total`
- ❌ `/api/trivia/total-score-dashboard` → Use `GET /api/trivia?action=total`

### Endpoint Consolidation
- ✅ `GET /api/trivia` → `GET /api/trivia?action=questions` (default)
- ✅ `POST /api/trivia` → `POST /api/trivia?action=submit` (default)  
- ✅ `GET /api/trivia/score` → `GET /api/trivia?action=score`
- ✅ `GET /api/trivia/total` → `GET /api/trivia?action=total`

## Implementation Details

### Technology Stack
- **Framework:** Next.js App Router with TypeScript
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Authentication:** Clerk with JWT tokens
- **Validation:** Zod schemas with custom business validation
- **Error Handling:** Structured error responses with context
- **Performance:** Request timing and database query profiling

### Code Architecture
- **Consolidated Endpoint:** Single route file with query parameter routing
- **Shared Utilities:** Common logic in `/lib/trivia/utils.ts`
- **Error Management:** Centralized error handling with context
- **Performance Tracking:** Built-in monitoring and profiling
- **Type Safety:** Full TypeScript support with proper typing

## Testing

The API includes comprehensive test coverage:

- **Unit Tests:** Individual function validation
- **Integration Tests:** End-to-end API behavior  
- **Performance Tests:** Load testing and benchmarking
- **Error Handling Tests:** Comprehensive error scenario coverage

**Test Location:** `tests/integration/api/trivia/route.test.ts`
**Test Command:** `npm run test -- trivia`

## Monitoring and Observability

### Logging
- **Business Events:** User interactions and score submissions
- **Performance Metrics:** Request timing and database query performance
- **Error Context:** Comprehensive error tracking with user context
- **Debug Information:** Detailed logging for troubleshooting

### Metrics
- **API Usage:** Request counts and patterns
- **Performance:** Response times and database query performance  
- **Error Rates:** Failure tracking and analysis
- **User Engagement:** Daily active users and game completion rates