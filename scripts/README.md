# Trivia Questions Update Script

This directory contains scripts to manage trivia questions for the Betis Escocia website.

## Scripts

### `update-trivia-questions.ts`

A TypeScript script that completely replaces all trivia questions and answers in the database with a new curated set.

**Features:**
- ✅ Clears all existing trivia data safely
- ✅ Inserts new questions
- ✅ Handles UUIDs automatically
- ✅ Provides progress feedback
- ✅ Verifies data after insertion
- ✅ Spanish questions only

**Usage:**
```bash
# Run via npm script (recommended)
npm run update-trivia

# Or run directly with tsx
npx tsx scripts/update-trivia-questions.ts
```

**Requirements:**
- Environment variables configured in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database Schema

The script works with these Supabase tables:

```sql
-- Questions table
trivia_questions (
  id UUID PRIMARY KEY,
  question_text TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'betis' or 'scotland'
  difficulty VARCHAR(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Answers table
trivia_answers (
  id UUID PRIMARY KEY,
  question_id UUID REFERENCES trivia_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

## Safety Features

- **Transactional approach**: Clears old data before inserting new
- **Foreign key constraints**: Ensures data integrity
- **Error handling**: Stops on database errors
- **Verification**: Confirms data was inserted correctly
- **Progress tracking**: Shows real-time progress

## Backup

The SQL file `sql/update_trivia_questions.sql` provides backup commands if needed:

```sql
-- Create backup before running update
CREATE TABLE trivia_questions_backup AS SELECT * FROM trivia_questions;
CREATE TABLE trivia_answers_backup AS SELECT * FROM trivia_answers;
```

## Contributing

To add new questions:

1. Edit the `triviaQuestions` array in `update-trivia-questions.ts`
2. Follow the existing format with 4 answer options
3. Mark the correct answer with `isCorrect: true`
4. Include both Spanish and English text where appropriate
5. Run the script to update the database

## Example Question Format

```typescript
{
  questionText: "¿En qué estadio juega como local el Real Betis?",
  category: "betis",
  difficulty: "easy",
  answers: [
    { text: "Camp Nou", isCorrect: false },
    { text: "Santiago Bernabéu", isCorrect: false },
    { text: "Benito Villamarín", isCorrect: true },
    { text: "Mestalla", isCorrect: false }
  ]
}
```
