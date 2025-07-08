SELECT DISTINCT competition, COUNT(*) as match_count
FROM matches 
GROUP BY competition 
ORDER BY match_count DESC;
