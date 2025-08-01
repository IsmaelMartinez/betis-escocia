#!/usr/bin/env tsx

/**
 * Script to update trivia questions and answers
 * Removes all existing trivia data and populates with new questions
 * 
 * Usage:
 * npm run update-trivia
 * or
 * npx tsx scripts/update-trivia-questions.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface TriviaQuestion {
  questionText: string;
  category: 'betis' | 'scotland';
  difficulty: 'easy' | 'medium' | 'hard';
  answers: {
    text: string;
    isCorrect: boolean;
  }[];
}

// Load trivia questions from JSON file
function loadTriviaQuestions(): TriviaQuestion[] {
  try {
    const dataPath = join(__dirname, '..', 'data', 'trivia-questions.json');
    const fileContent = readFileSync(dataPath, 'utf-8');
    const questions = JSON.parse(fileContent) as TriviaQuestion[];
    
    // Validate the structure
    if (!Array.isArray(questions)) {
      throw new Error('Invalid questions format: expected array');
    }
    
    questions.forEach((q, index) => {
      if (!q.questionText || !q.category || !q.difficulty || !Array.isArray(q.answers)) {
        throw new Error(`Invalid question format at index ${index}`);
      }
      
      if (q.answers.length !== 4) {
        throw new Error(`Question at index ${index} must have exactly 4 answers`);
      }
      
      const correctAnswers = q.answers.filter(a => a.isCorrect);
      if (correctAnswers.length !== 1) {
        throw new Error(`Question at index ${index} must have exactly 1 correct answer`);
      }
    });
    
    return questions;
  } catch (error) {
    console.error('❌ Error loading trivia questions from JSON file:', error);
    throw error;
  }
}

const triviaQuestions: TriviaQuestion[] = loadTriviaQuestions();

async function updateTriviaQuestions() {
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL');
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.error('\nPlease check your .env.local file.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔄 Starting trivia questions update...');
  console.log(`📝 Processing ${triviaQuestions.length} questions`);

  try {
    // Step 1: Delete all existing trivia data
    console.log('\n🗑️  Clearing existing trivia data...');
    
    // Delete answers first (due to foreign key constraint)
    const { error: answersError } = await supabase
      .from('trivia_answers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (answersError) {
      console.error('❌ Error deleting existing answers:', answersError);
      process.exit(1);
    }

    // Delete questions
    const { error: questionsError } = await supabase
      .from('trivia_questions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (questionsError) {
      console.error('❌ Error deleting existing questions:', questionsError);
      process.exit(1);
    }

    console.log('✅ Existing trivia data cleared successfully');

    // Step 2: Insert new questions and answers
    console.log('\n📝 Inserting new trivia questions...');
    
    let insertedCount = 0;
    let betisCount = 0;
    let scotlandCount = 0;

    for (const question of triviaQuestions) {
      // Insert question
      const { data: questionData, error: questionError } = await supabase
        .from('trivia_questions')
        .insert({
          question_text: question.questionText,
          category: question.category,
          difficulty: question.difficulty
        })
        .select()
        .single();

      if (questionError) {
        console.error(`❌ Error inserting question: "${question.questionText.substring(0, 50)}..."`, questionError);
        continue;
      }

      // Insert answers for this question
      const answersToInsert = question.answers.map(answer => ({
        question_id: questionData.id,
        answer_text: answer.text,
        is_correct: answer.isCorrect
      }));

      const { error: answersInsertError } = await supabase
        .from('trivia_answers')
        .insert(answersToInsert);

      if (answersInsertError) {
        console.error(`❌ Error inserting answers for question: "${question.questionText.substring(0, 50)}..."`, answersInsertError);
        continue;
      }

      insertedCount++;
      if (question.category === 'betis') betisCount++;
      else scotlandCount++;

      // Progress indicator
      process.stdout.write(`\r   📊 Progress: ${insertedCount}/${triviaQuestions.length} questions inserted`);
    }

    console.log('\n\n✅ Trivia questions update completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total questions: ${insertedCount}`);
    console.log(`   Betis questions: ${betisCount}`);
    console.log(`   Scotland questions: ${scotlandCount}`);
    console.log(`   Total answers: ${insertedCount * 4}`);

    // Step 3: Verify the data
    console.log('\n🔍 Verifying inserted data...');
    
    const { data: verifyQuestions, error: verifyError } = await supabase
      .from('trivia_questions')
      .select('id, category')
      .order('created_at');

    if (verifyError) {
      console.error('❌ Error verifying data:', verifyError);
    } else {
      const verifyBetis = verifyQuestions.filter(q => q.category === 'betis').length;
      const verifyScotland = verifyQuestions.filter(q => q.category === 'scotland').length;
      
      console.log(`✅ Verification successful:`);
      console.log(`   Questions in database: ${verifyQuestions.length}`);
      console.log(`   Betis: ${verifyBetis}, Scotland: ${verifyScotland}`);
    }

    console.log('\n🎉 All done! The trivia questions have been successfully updated.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  updateTriviaQuestions().catch(console.error);
}

export { updateTriviaQuestions };
