-- ===============================================================================
-- Peña Bética Escocesa - Seed Data (Migration 0002)
-- ===============================================================================
-- This script populates the database with initial sample data
-- Run this after 0001_setup.sql to set up sample content for development
--
-- Last Updated: 2026-01-06
-- Source: Extracted from legacy migration 0001_seed_data.sql
-- ===============================================================================

-- ===============================================================================
-- TRIVIA QUESTIONS AND ANSWERS
-- ===============================================================================

-- Insert trivia questions
INSERT INTO trivia_questions (question_text, category, difficulty) VALUES
-- Real Betis questions
('¿En qué año fue fundado el Real Betis Balompié?', 'betis', 'easy'),
('¿Cuál es el nombre del estadio del Real Betis?', 'betis', 'easy'),
('¿De qué colores es la camiseta tradicional del Real Betis?', 'betis', 'easy'),
('¿Cuántas veces ha ganado el Real Betis la Liga española?', 'betis', 'medium'),
('¿En qué año ganó el Real Betis su única Liga española?', 'betis', 'medium'),
('¿Cuál es el apodo tradicional del Real Betis?', 'betis', 'easy'),
('¿Quién es considerado el máximo goleador histórico del Real Betis?', 'betis', 'hard'),
('¿En qué año se inauguró el Estadio Benito Villamarín?', 'betis', 'medium'),
('¿Cuál es el himno tradicional del Real Betis?', 'betis', 'medium'),
('¿Contra qué equipo tiene el Real Betis su mayor rivalidad?', 'betis', 'easy'),

-- Scotland questions
('¿Cuál es la capital de Escocia?', 'scotland', 'easy'),
('¿Cómo se llama la falda tradicional escocesa?', 'scotland', 'easy'),
('¿Cuál es el instrumento musical más famoso de Escocia?', 'scotland', 'easy'),
('¿En qué año se celebró el referéndum de independencia de Escocia?', 'scotland', 'medium'),
('¿Cuál es la montaña más alta de Escocia?', 'scotland', 'medium'),
('¿Cómo se llama el lago más famoso de Escocia?', 'scotland', 'easy'),
('¿Cuál es la flor nacional de Escocia?', 'scotland', 'medium'),
('¿En qué ciudad escocesa se encuentra la Universidad de St. Andrews?', 'scotland', 'hard'),
('¿Cuál es el nombre del parlamento escocés?', 'scotland', 'medium'),
('¿Qué escritor escocés escribió "El extraño caso del Dr. Jekyll y Mr. Hyde"?', 'scotland', 'hard'),

-- Whisky questions
('¿Cuál es la región escocesa más famosa por el whisky?', 'whisky', 'medium'),
('¿Cuántos años debe envejecer un whisky para ser considerado "aged"?', 'whisky', 'hard'),
('¿Cuál es la diferencia principal entre whisky y whiskey?', 'whisky', 'hard')

ON CONFLICT DO NOTHING;

-- Insert answers for Real Betis questions
INSERT INTO trivia_answers (question_id, answer_text, is_correct)
SELECT q.id, a.answer_text, a.is_correct
FROM trivia_questions q
CROSS JOIN (
    VALUES
    ('¿En qué año fue fundado el Real Betis Balompié?', '1907', true),
    ('¿En qué año fue fundado el Real Betis Balompié?', '1912', false),
    ('¿En qué año fue fundado el Real Betis Balompié?', '1915', false),
    ('¿En qué año fue fundado el Real Betis Balompié?', '1909', false),

    ('¿Cuál es el nombre del estadio del Real Betis?', 'Benito Villamarín', true),
    ('¿Cuál es el nombre del estadio del Real Betis?', 'Ramón Sánchez-Pizjuán', false),
    ('¿Cuál es el nombre del estadio del Real Betis?', 'La Cartuja', false),
    ('¿Cuál es el nombre del estadio del Real Betis?', 'Nuevo Los Cármenes', false),

    ('¿De qué colores es la camiseta tradicional del Real Betis?', 'Verde y blanco', true),
    ('¿De qué colores es la camiseta tradicional del Real Betis?', 'Azul y blanco', false),
    ('¿De qué colores es la camiseta tradicional del Real Betis?', 'Rojo y blanco', false),
    ('¿De qué colores es la camiseta tradicional del Real Betis?', 'Amarillo y azul', false),

    ('¿Cuántas veces ha ganado el Real Betis la Liga española?', '1', true),
    ('¿Cuántas veces ha ganado el Real Betis la Liga española?', '2', false),
    ('¿Cuántas veces ha ganado el Real Betis la Liga española?', '3', false),
    ('¿Cuántas veces ha ganado el Real Betis la Liga española?', '0', false),

    ('¿En qué año ganó el Real Betis su única Liga española?', '1935', true),
    ('¿En qué año ganó el Real Betis su única Liga española?', '1934', false),
    ('¿En qué año ganó el Real Betis su única Liga española?', '1936', false),
    ('¿En qué año ganó el Real Betis su única Liga española?', '1933', false),

    ('¿Cuál es el apodo tradicional del Real Betis?', 'Los Verdiblancos', true),
    ('¿Cuál es el apodo tradicional del Real Betis?', 'Los Rojiblancos', false),
    ('¿Cuál es el apodo tradicional del Real Betis?', 'Los Azulgranas', false),
    ('¿Cuál es el apodo tradicional del Real Betis?', 'Los Merengues', false),

    ('¿Contra qué equipo tiene el Real Betis su mayor rivalidad?', 'Sevilla FC', true),
    ('¿Contra qué equipo tiene el Real Betis su mayor rivalidad?', 'Real Madrid', false),
    ('¿Contra qué equipo tiene el Real Betis su mayor rivalidad?', 'Barcelona', false),
    ('¿Contra qué equipo tiene el Real Betis su mayor rivalidad?', 'Atlético Madrid', false)
) AS a(question_text, answer_text, is_correct)
WHERE q.question_text = a.question_text
ON CONFLICT DO NOTHING;

-- Insert answers for Scotland questions
INSERT INTO trivia_answers (question_id, answer_text, is_correct)
SELECT q.id, a.answer_text, a.is_correct
FROM trivia_questions q
CROSS JOIN (
    VALUES
    ('¿Cuál es la capital de Escocia?', 'Edimburgo', true),
    ('¿Cuál es la capital de Escocia?', 'Glasgow', false),
    ('¿Cuál es la capital de Escocia?', 'Aberdeen', false),
    ('¿Cuál es la capital de Escocia?', 'Dundee', false),

    ('¿Cómo se llama la falda tradicional escocesa?', 'Kilt', true),
    ('¿Cómo se llama la falda tradicional escocesa?', 'Tartan', false),
    ('¿Cómo se llama la falda tradicional escocesa?', 'Plaid', false),
    ('¿Cómo se llama la falda tradicional escocesa?', 'Highland', false),

    ('¿Cuál es el instrumento musical más famoso de Escocia?', 'Gaita', true),
    ('¿Cuál es el instrumento musical más famoso de Escocia?', 'Violín', false),
    ('¿Cuál es el instrumento musical más famoso de Escocia?', 'Piano', false),
    ('¿Cuál es el instrumento musical más famoso de Escocia?', 'Tambor', false),

    ('¿En qué año se celebró el referéndum de independencia de Escocia?', '2014', true),
    ('¿En qué año se celebró el referéndum de independencia de Escocia?', '2016', false),
    ('¿En qué año se celebró el referéndum de independencia de Escocia?', '2012', false),
    ('¿En qué año se celebró el referéndum de independencia de Escocia?', '2018', false),

    ('¿Cómo se llama el lago más famoso de Escocia?', 'Loch Ness', true),
    ('¿Cómo se llama el lago más famoso de Escocia?', 'Loch Lomond', false),
    ('¿Cómo se llama el lago más famoso de Escocia?', 'Loch Katrine', false),
    ('¿Cómo se llama el lago más famoso de Escocia?', 'Loch Tay', false)
) AS a(question_text, answer_text, is_correct)
WHERE q.question_text = a.question_text
ON CONFLICT DO NOTHING;

-- Insert answers for Whisky questions
INSERT INTO trivia_answers (question_id, answer_text, is_correct)
SELECT q.id, a.answer_text, a.is_correct
FROM trivia_questions q
CROSS JOIN (
    VALUES
    ('¿Cuál es la región escocesa más famosa por el whisky?', 'Speyside', true),
    ('¿Cuál es la región escocesa más famosa por el whisky?', 'Highlands', false),
    ('¿Cuál es la región escocesa más famosa por el whisky?', 'Islay', false),
    ('¿Cuál es la región escocesa más famosa por el whisky?', 'Lowlands', false)
) AS a(question_text, answer_text, is_correct)
WHERE q.question_text = a.question_text
ON CONFLICT DO NOTHING;

-- ===============================================================================
-- SAMPLE MATCHES
-- ===============================================================================

-- Insert sample upcoming matches
INSERT INTO matches (date_time, opponent, competition, home_away, status, notes, external_id, external_source) VALUES
(NOW() + INTERVAL '7 days', 'Sevilla FC', 'LaLiga EA Sports', 'home', 'SCHEDULED', 'Derbi sevillano en el Villamarín', 1001, 'seed_data'),
(NOW() + INTERVAL '14 days', 'Athletic Club', 'LaLiga EA Sports', 'away', 'SCHEDULED', 'Partido en San Mamés', 1002, 'seed_data'),
(NOW() + INTERVAL '21 days', 'Real Madrid', 'LaLiga EA Sports', 'home', 'SCHEDULED', 'Partido contra los merengues', 1003, 'seed_data'),
(NOW() + INTERVAL '28 days', 'Valencia CF', 'LaLiga EA Sports', 'away', 'SCHEDULED', 'Visita a Mestalla', 1004, 'seed_data')
ON CONFLICT (external_id, external_source) DO NOTHING;

-- Insert some historical matches
INSERT INTO matches (date_time, opponent, competition, home_away, status, result, home_score, away_score, notes, external_id, external_source) VALUES
(NOW() - INTERVAL '7 days', 'Barcelona', 'LaLiga EA Sports', 'away', 'FINISHED', 'AWAY_WIN', 1, 2, 'Victoria histórica en el Camp Nou', 1005, 'seed_data'),
(NOW() - INTERVAL '14 days', 'Getafe CF', 'LaLiga EA Sports', 'home', 'FINISHED', 'HOME_WIN', 3, 1, 'Buen partido en casa', 1006, 'seed_data'),
(NOW() - INTERVAL '21 days', 'Celta Vigo', 'LaLiga EA Sports', 'away', 'FINISHED', 'DRAW', 2, 2, 'Empate con sabor agridulce', 1007, 'seed_data')
ON CONFLICT (external_id, external_source) DO NOTHING;

-- ===============================================================================
-- SAMPLE RSVPS
-- ===============================================================================

-- Insert sample RSVPs for upcoming matches
INSERT INTO rsvps (name, email, attendees, whatsapp_interest, match_date, match_id, message)
SELECT
    names.name,
    names.email,
    (RANDOM() * 3 + 1)::INTEGER,
    RANDOM() > 0.5,
    m.date_time,
    m.id,
    CASE
        WHEN RANDOM() > 0.7 THEN 'Vamos Betis! 💚🤍'
        WHEN RANDOM() > 0.5 THEN '¡No me lo pierdo!'
        ELSE NULL
    END
FROM (
    VALUES
    ('Alejandro García', 'alejandro@example.com'),
    ('María González', 'maria@example.com'),
    ('Carlos Rodríguez', 'carlos@example.com'),
    ('Laura Martín', 'laura@example.com'),
    ('David López', 'david@example.com'),
    ('Ana Fernández', 'ana@example.com'),
    ('Miguel Sánchez', 'miguel@example.com'),
    ('Elena Díaz', 'elena@example.com'),
    ('Pablo Ruiz', 'pablo@example.com'),
    ('Isabel Torres', 'isabel@example.com')
) AS names(name, email)
CROSS JOIN (
    SELECT id, date_time
    FROM matches
    WHERE date_time > NOW()
    LIMIT 2
) AS m
WHERE RANDOM() > 0.3 -- Only some people RSVP to each match
ON CONFLICT DO NOTHING;

-- ===============================================================================
-- SAMPLE CONTACT SUBMISSIONS
-- ===============================================================================

-- Insert sample contact submissions
INSERT INTO contact_submissions (name, email, subject, type, message, status) VALUES
('Juan Pérez', 'juan@example.com', 'Información sobre membresía', 'general', 'Hola, me gustaría saber cómo puedo unirme a la peña.', 'resolved'),
('Sandra Williams', 'sandra@example.com', 'Fotos del último partido', 'photo', 'Tengo algunas fotos del derbi que me gustaría compartir.', 'in progress'),
('Roberto Johnson', 'roberto@example.com', 'Confirmación RSVP', 'rsvp', 'Quería confirmar mi asistencia al próximo partido.', 'resolved'),
('Cristina Brown', 'cristina@example.com', 'Sugerencia para la web', 'feedback', 'Me encanta la nueva web, pero sería genial tener una sección de historia.', 'new'),
('Mohammed Ali', 'mohammed@example.com', 'Grupo de WhatsApp', 'whatsapp', '¿Podríais añadirme al grupo de WhatsApp?', 'resolved')
ON CONFLICT DO NOTHING;

-- ===============================================================================
-- CLEANUP AND VERIFICATION
-- ===============================================================================

-- Verify the data was inserted correctly
SELECT 'Data seeding completed!' as status;

-- Show counts of inserted data
SELECT
    'trivia_questions' as table_name, COUNT(*) as count FROM trivia_questions
UNION ALL
SELECT
    'trivia_answers' as table_name, COUNT(*) as count FROM trivia_answers
UNION ALL
SELECT
    'matches' as table_name, COUNT(*) as count FROM matches
UNION ALL
SELECT
    'rsvps' as table_name, COUNT(*) as count FROM rsvps
UNION ALL
SELECT
    'contact_submissions' as table_name, COUNT(*) as count FROM contact_submissions
ORDER BY table_name;
