-- Fix influencer names to use their most well-known public names
-- Run this with: sqlite3 prisma/dev.db < scripts/fix-influencer-names.sql

-- Science/Space
UPDATE Influencer SET name = 'Thomas Pesquet' WHERE name = 'Thom Astro';

-- Gaming
-- Squeezie is already correct

-- Add more corrections as needed
-- Format: UPDATE Influencer SET name = 'Real Name' WHERE name = 'Current Wrong Name';

-- Verify changes
SELECT 'Updated influencer names:';
SELECT name, niche, trustScore FROM Influencer WHERE name IN ('Thomas Pesquet', 'Squeezie') ORDER BY trustScore DESC;
