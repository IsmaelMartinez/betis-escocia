/**
 * Client-safe trivia question type.
 *
 * The API strips `is_correct` from individual answers and instead provides
 * `correct_answer_id` per question so the client can show feedback after
 * the user selects an answer.
 */
export interface ClientTriviaQuestion {
  id: string;
  question_text: string;
  category: string;
  difficulty: string;
  correct_answer_id: string | null;
  trivia_answers: Array<{
    id: string;
    answer_text: string;
  }>;
}
