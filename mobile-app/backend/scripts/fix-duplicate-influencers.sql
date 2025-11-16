-- Fix duplicate influencer entries and use proper well-known names

-- First, let's see what we have
SELECT 'Current Thomas Pesquet entries:';
SELECT id, name, trustScore FROM Influencer WHERE name LIKE '%Thomas%' OR name LIKE '%Thom%' OR name LIKE '%Pesquet%';

-- Delete the duplicate/lower scored entries, keep the best one
-- Keep "Thom Astro" with score 99 but rename it to "Thomas Pesquet"
DELETE FROM Influencer WHERE id = 'bbdf1179-c48d-474d-b31f-502da0d04acb'; -- Thomas Pesquet (thom_astro) - 45
DELETE FROM Influencer WHERE id = 'dc4d8b98-b08b-46ca-b6fe-8d1b49d8d73c'; -- Thomas Pesquet - 24

-- Now rename "Thom Astro" to "Thomas Pesquet"
UPDATE Influencer SET name = 'Thomas Pesquet' WHERE id = '7d5b25f7-65f4-47d0-83c6-26690b6e3f60';

-- Verify
SELECT 'After fix:';
SELECT id, name, trustScore FROM Influencer WHERE name LIKE '%Thomas%' OR name LIKE '%Pesquet%';
