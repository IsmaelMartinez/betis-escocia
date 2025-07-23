import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch a random set of trivia questions
    // For simplicity, let's fetch 10 random questions for now.
    // In a real scenario, you might want to implement more sophisticated random selection
    // or pagination.
    const { data: questions, error } = await supabase
      .from('trivia_questions')
      .select(`
        id,
        question_text,
        category,
        difficulty,
        trivia_answers(
          id,
          answer_text,
          is_correct
        )
      `)
      .limit(10); // Fetch 10 questions for now

    if (error) {
      console.error('Error fetching trivia questions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Shuffle questions and answers to ensure randomness
    const shuffledQuestions = [...questions].sort(() => 0.5 - Math.random());
    const formattedQuestions = shuffledQuestions.map(q => ({
      ...q,
      trivia_answers: [...q.trivia_answers].sort(() => 0.5 - Math.random())
    }));

    return NextResponse.json(formattedQuestions);
  } catch (error) {
    console.error('Unexpected error in trivia API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
