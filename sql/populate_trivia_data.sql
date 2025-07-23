
INSERT INTO trivia_questions (question_text, category, difficulty) VALUES
('Which year was Real Betis founded?', 'betis', 'easy'),
('What is the nickname of Real Betis?', 'betis', 'easy'),
('Which stadium is the home of Real Betis?', 'betis', 'medium'),
('Who is Real Betis''s all-time leading goalscorer?', 'betis', 'hard'),
('Which Scottish city is the capital?', 'scotland', 'easy'),
('What is the national animal of Scotland?', 'scotland', 'easy'),
('What is the highest mountain in Scotland?', 'scotland', 'medium'),
('Which famous loch in Scotland is rumored to contain a monster?', 'scotland', 'easy');

-- You will need to get the UUIDs of the inserted questions to link answers correctly.
-- For example, after inserting the questions, you can run:
-- SELECT id, question_text FROM trivia_questions;

-- Then, use the obtained UUIDs to insert answers. Replace <UUID_OF_QUESTION> with the actual UUID.

-- Example for 'Which year was Real Betis founded?'
-- Assuming its UUID is 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
INSERT INTO trivia_answers (question_id, answer_text, is_correct) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', '1907', TRUE),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', '1900', FALSE),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', '1910', FALSE),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', '1914', FALSE);

-- Example for 'What is the nickname of Real Betis?'
-- Assuming its UUID is 'b2c3d4e5-f6a7-8901-2345-67890abcdef0'
INSERT INTO trivia_answers (question_id, answer_text, is_correct) VALUES
('b2c3d4e5-f6a7-8901-2345-67890abcdef0', 'Los Verdiblancos', TRUE),
('b2c3d4e5-f6a7-8901-2345-67890abcdef0', 'Los Rojiblancos', FALSE),
('b2c3d4e5-f6a7-8901-2345-67890abcdef0', 'Los Blancos', FALSE),
('b2c3d4e5-f6a7-8901-2345-67890abcdef0', 'Los Azulgranas', FALSE);

-- Example for 'Which stadium is the home of Real Betis?'
-- Assuming its UUID is 'c3d4e5f6-a7b8-9012-3456-7890abcdef01'
INSERT INTO trivia_answers (question_id, answer_text, is_correct) VALUES
('c3d4e5f6-a7b8-9012-3456-7890abcdef01', 'Estadio Benito Villamarín', TRUE),
('c3d4e5f6-a7b8-9012-3456-7890abcdef01', 'Camp Nou', FALSE),
('c3d4e5f6-a7b8-9012-3456-7890abcdef01', 'Santiago Bernabéu', FALSE),
('c3d4e5f6-a7b8-9012-3456-7890abcdef01', 'Ramón Sánchez Pizjuán', FALSE);

-- Example for 'Who is Real Betis's all-time leading goalscorer?'
-- Assuming its UUID is 'd4e5f6a7-b8c9-0123-4567-890abcdef012'
INSERT INTO trivia_answers (question_id, answer_text, is_correct) VALUES
('d4e5f6a7-b8c9-0123-4567-890abcdef012', 'Rubén Castro', TRUE),
('d4e5f6a7-b8c9-0123-4567-890abcdef012', 'Joaquín Sánchez', FALSE),
('d4e5f6a7-b8c9-0123-4567-890abcdef012', 'Alfonso Pérez', FALSE),
('d4e5f6a7-b8c9-0123-4567-890abcdef012', 'Poli Rincón', FALSE);

-- Example for 'Which Scottish city is the capital?'
-- Assuming its UUID is 'e5f6a7b8-c9d0-1234-5678-90abcdef0123'
INSERT INTO trivia_answers (question_id, answer_text, is_correct) VALUES
('e5f6a7b8-c9d0-1234-5678-90abcdef0123', 'Edinburgh', TRUE),
('e5f6a7b8-c9d0-1234-5678-90abcdef0123', 'Glasgow', FALSE),
('e5f6a7b8-c9d0-1234-5678-90abcdef0123', 'Aberdeen', FALSE),
('e5f6a7b8-c9d0-1234-5678-90abcdef0123', 'Dundee', FALSE);

-- Example for 'What is the national animal of Scotland?'
-- Assuming its UUID is 'f6a7b8c9-d0e1-2345-6789-0abcdef01234'
INSERT INTO trivia_answers (question_id, answer_text, is_correct) VALUES
('f6a7b8c9-d0e1-2345-6789-0abcdef01234', 'Unicorn', TRUE),
('f6a7b8c9-d0e1-2345-6789-0abcdef01234', 'Lion', FALSE),
('f6a7b8c9-d0e1-2345-6789-0abcdef01234', 'Stag', FALSE),
('f6a7b8c9-d0e1-2345-6789-0abcdef01234', 'Eagle', FALSE);

-- Example for 'What is the highest mountain in Scotland?'
-- Assuming its UUID is 'a7b8c9d0-e1f2-3456-7890-abcdef012345'
INSERT INTO trivia_answers (question_id, answer_text, is_correct) VALUES
('a7b8c9d0-e1f2-3456-7890-abcdef012345', 'Ben Nevis', TRUE),
('a7b8c9d0-e1f2-3456-7890-abcdef012345', 'Mount Snowdon', FALSE),
('a7b8c9d0-e1f2-3456-7890-abcdef012345', 'Scafell Pike', FALSE),
('a7b8c9d0-e1f2-3456-7890-abcdef012345', 'Schiehallion', FALSE);

-- Example for 'Which famous loch in Scotland is rumored to contain a monster?'
-- Assuming its UUID is 'b8c9d0e1-f2a3-4567-8901-abcdef0123456'
INSERT INTO trivia_answers (question_id, answer_text, is_correct) VALUES
('b8c9d0e1-f2a3-4567-8901-abcdef0123456', 'Loch Ness', TRUE),
('b8c9d0e1-f2a3-4567-8901-abcdef0123456', 'Loch Lomond', FALSE),
('b8c9d0e1-f2a3-4567-8901-abcdef0123456', 'Loch Awe', FALSE),
('b8c9d0e1-f2a3-4567-8901-abcdef0123456', 'Loch Morar', FALSE);
