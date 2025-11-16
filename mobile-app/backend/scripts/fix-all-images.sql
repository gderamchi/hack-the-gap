-- Fix all influencer images to use UI Avatars (free, reliable, always works)
-- UI Avatars generates nice avatars from names with random colors

UPDATE Influencer 
SET imageUrl = 'https://ui-avatars.com/api/?name=' || 
               REPLACE(name, ' ', '+') || 
               '&size=400&background=random&color=fff&bold=true&format=png&rounded=true';

-- Verify changes
SELECT 'Updated image URLs:';
SELECT name, imageUrl FROM Influencer LIMIT 10;
