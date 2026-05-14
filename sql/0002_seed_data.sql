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
    'matches' as table_name, COUNT(*) as count FROM matches
UNION ALL
SELECT
    'rsvps' as table_name, COUNT(*) as count FROM rsvps
UNION ALL
SELECT
    'contact_submissions' as table_name, COUNT(*) as count FROM contact_submissions
ORDER BY table_name;
