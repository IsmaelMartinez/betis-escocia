# Product Requirements Document: Trivia Pointing System

## 1. Introduction/Overview
This document outlines the requirements for implementing a pointing system for the existing daily trivia game. The goal is to enhance user engagement and introduce a competitive element by awarding points for correct answers and game completion. This system will lay the groundwork for potential future features like leaderboards, but these are explicitly out of scope for this initial implementation.

## 2. Goals
*   To incentivize daily play and completion of the trivia game.
*   To create a basic competitive element among users by tracking their daily scores.
*   To provide immediate feedback on performance through point accumulation.

## 3. User Stories
*   **As a trivia player**, I want to earn points for correct answers so that I can see my performance.
*   **As a trivia player**, I want to earn bonus points for completing the daily quiz so that I am encouraged to finish the game.
*   **As a trivia player**, I want to see my daily score and total accumulated score so that I can track my progress.

## 4. Functional Requirements
1.  The system must award points for each correct answer in the daily trivia quiz.
2.  The system must award bonus points upon successful completion of the daily trivia quiz.
3.  The system must calculate a user's total score for each daily game.
4.  The system must store the user's daily score.
5.  The system must store the user's total accumulated score across all games played.
6.  The system must display the user's daily score on the trivia results page after game completion.
7.  The system must display the user's total accumulated score on the trivia results page.
8.  The system must display the user's total accumulated score in a dedicated "My Points" or "Profile" section.
9.  The system must display a running total of points somewhere on the trivia page during gameplay.
10. The system must record the timestamp of when each daily score was achieved.

## 5. Non-Goals (Out of Scope)
*   Implementation of leaderboards (daily, weekly, or all-time).
*   Redeemable rewards or any form of prize system based on points.
*   Historical point tracking beyond the current day's score and the total accumulated score.
*   Integration with external systems for point synchronization or display.

## 6. Design Considerations (Optional)
*   The display of points should be consistent with the existing UI/UX of the trivia game and the overall application.
*   Consider visual cues (e.g., animations, sound effects) when points are awarded to enhance user experience.

## 7. Technical Considerations (Optional)
*   The pointing system should leverage the existing Supabase database for storing point data (e.g., new columns in `trivia_questions` or a new `user_scores` table).
*   Point calculation logic should reside on the server-side (e.g., within the `/api/trivia` endpoint or a new API route) to prevent client-side manipulation.
*   Ensure proper authentication (Clerk) is used to associate scores with the correct user IDs.

## 8. Success Metrics
*   Increase in daily trivia game completions.
*   Increase in user retention for the trivia game.
*   Positive user feedback regarding the new pointing system.
*   Successful tracking and display of daily and accumulated points for all users.

## 9. Open Questions
*   Each correct answer awards 1 point.
*   Points are awarded at the end of the game upon completion.