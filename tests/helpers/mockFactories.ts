// Centralized test data factories for integration and unit tests
// Lightweight and dependency-free (no faker). Deterministic defaults with overridable fields.

import type {
  Match,
  MatchInsert,
  RSVP,
  RSVPInsert,
  ContactSubmission,
  ContactSubmissionInsert,
  TriviaQuestion,
  TriviaQuestionInsert,
  TriviaAnswer,
  TriviaAnswerInsert,
  UserTriviaScore,
  UserTriviaScoreInsert,
} from '@/lib/supabase';

// Generic helper to merge defaults with overrides
export function withOverrides<T>(defaults: T, overrides?: Partial<T>): T {
  return { ...defaults, ...(overrides ?? {}) } as T;
}

// Simple sequential ID generator for deterministic test data
function createIdSeq(prefix: string) {
  let i = 1;
  return () => `${prefix}_${i++}`;
}

const idQ = createIdSeq('q');
const idA = createIdSeq('a');
const idU = createIdSeq('user');
let idMatch = 1;
let idRSVP = 1;

// Date helpers
function nowIso() {
  return new Date().toISOString();
}
function hoursFromNowIso(hours: number) {
  return new Date(Date.now() + hours * 3600_000).toISOString();
}

// Match factories
export function makeMatchInsert(overrides?: Partial<MatchInsert>): MatchInsert {
  const defaults: MatchInsert = {
    date_time: hoursFromNowIso(24),
    opponent: 'Sevilla',
    competition: 'La Liga',
    home_away: 'home',
    notes: 'Bring scarf',
    external_id: 1000,
    external_source: 'external_api',
    result: undefined,
    home_score: undefined,
    away_score: undefined,
    status: 'scheduled',
    matchday: 1,
  };
  return withOverrides(defaults, overrides);
}

export function makeMatch(overrides?: Partial<Match>): Match {
  const id = overrides?.id ?? idMatch++;
  const baseInsert = makeMatchInsert(overrides as Partial<MatchInsert>);
  const defaults: Match = {
    id,
    created_at: nowIso(),
    updated_at: nowIso(),
    ...baseInsert,
  } as Match;
  return withOverrides(defaults, overrides);
}

// RSVP factories
export function makeRSVPInsert(overrides?: Partial<RSVPInsert>): RSVPInsert {
  const defaults: RSVPInsert = {
    name: 'Juan Perez',
    email: 'juan.perez@example.com',
    attendees: 2,
    message: 'Vamos Betis!',
    whatsapp_interest: true,
    match_date: hoursFromNowIso(24),
    match_id: 1,
    user_id: idU(),
  };
  return withOverrides(defaults, overrides);
}

export function makeRSVP(overrides?: Partial<RSVP>): RSVP {
  const id = overrides?.id ?? idRSVP++;
  const baseInsert = makeRSVPInsert(overrides as Partial<RSVPInsert>);
  const defaults: RSVP = {
    id,
    created_at: nowIso(),
    ...baseInsert,
  } as RSVP;
  return withOverrides(defaults, overrides);
}

// Contact Submission factories
export function makeContactSubmissionInsert(
  overrides?: Partial<ContactSubmissionInsert>
): ContactSubmissionInsert {
  const defaults: ContactSubmissionInsert = {
    name: 'Maria Lopez',
    email: 'maria.lopez@example.com',
    phone: '+44 7000 000000',
    type: 'general',
    subject: 'Información',
    message: 'Quiero unirme a la peña.',
    status: 'new',
    user_id: idU(),
    updated_by: undefined,
  };
  return withOverrides(defaults, overrides);
}

export function makeContactSubmission(overrides?: Partial<ContactSubmission>): ContactSubmission {
  const defaults: ContactSubmission = {
    id: Math.floor(Math.random() * 1_000_000),
    created_at: nowIso(),
    updated_at: nowIso(),
    updated_by: undefined,
    ...makeContactSubmissionInsert(overrides as Partial<ContactSubmissionInsert>),
  } as ContactSubmission;
  return withOverrides(defaults, overrides);
}

// Trivia Answer factories
export function makeTriviaAnswerInsert(
  overrides?: Partial<TriviaAnswerInsert> & { question_id?: string }
): TriviaAnswerInsert {
  const defaults: TriviaAnswerInsert = {
    question_id: overrides?.question_id ?? idQ(),
    answer_text: 'Default answer',
    is_correct: false,
  };
  return withOverrides(defaults, overrides);
}

export function makeTriviaAnswer(overrides?: Partial<TriviaAnswer>): TriviaAnswer {
  const defaults: TriviaAnswer = {
    id: idA(),
    question_id: overrides?.question_id ?? idQ(),
    answer_text: 'Answer',
    is_correct: false,
    created_at: nowIso(),
  };
  return withOverrides(defaults, overrides);
}

// Trivia Question factories
export function makeTriviaQuestionInsert(
  overrides?: Partial<TriviaQuestionInsert>
): TriviaQuestionInsert {
  const defaults: TriviaQuestionInsert = {
    question_text: 'Who is the Real Betis mascot?',
    category: 'betis',
    difficulty: 'easy',
  };
  return withOverrides(defaults, overrides);
}

export function makeTriviaQuestion(overrides?: Partial<TriviaQuestion>): TriviaQuestion {
  const qId = overrides?.id ?? idQ();
  const answers: TriviaAnswer[] = [
    makeTriviaAnswer({ id: idA(), question_id: qId, answer_text: 'Palmerín', is_correct: true }),
    makeTriviaAnswer({ id: idA(), question_id: qId, answer_text: 'Verdolín' }),
    makeTriviaAnswer({ id: idA(), question_id: qId, answer_text: 'Pepón' }),
    makeTriviaAnswer({ id: idA(), question_id: qId, answer_text: 'Betico' }),
  ];
  const defaults: TriviaQuestion = {
    id: qId,
    question_text: 'Who is the Real Betis mascot?',
    category: 'betis',
    difficulty: 'easy',
    created_at: nowIso(),
    trivia_answers: answers,
  };
  return withOverrides(defaults, overrides);
}

// User Trivia Score factories
export function makeUserTriviaScoreInsert(
  overrides?: Partial<UserTriviaScoreInsert>
): UserTriviaScoreInsert {
  const defaults: UserTriviaScoreInsert = {
    user_id: idU(),
    daily_score: 3,
  };
  return withOverrides(defaults, overrides);
}

export function makeUserTriviaScore(overrides?: Partial<UserTriviaScore>): UserTriviaScore {
  const defaults: UserTriviaScore = {
    id: `score_${Math.random().toString(36).slice(2, 10)}`,
    user_id: idU(),
    daily_score: 0,
    timestamp: nowIso(),
  };
  return withOverrides(defaults, overrides);
}

// Convenience composite builders
export function makeTriviaSet(count = 3): TriviaQuestion[] {
  return Array.from({ length: count }).map(() => makeTriviaQuestion());
}

export function resetFactorySequences() {
  // For tests that rely on deterministic IDs across cases
  idMatch = 1;
  idRSVP = 1;
  // Note: string id sequences continue monotonically to avoid accidental collisions across tests
}
