-- Delete duplicate Thomas Pesquet entries, keep the best one
DELETE FROM "Influencer" 
WHERE name LIKE '%Thomas%Pesquet%' 
  AND name != 'Thom Astro' 
  AND "trustScore" < 90;

-- Now rename Thom Astro to Thomas Pesquet
UPDATE "Influencer" SET name = 'Thomas Pesquet' WHERE name = 'Thom Astro';

-- Update all images to use UI Avatars
UPDATE "Influencer" 
SET "imageUrl" = 'https://ui-avatars.com/api/?name=' || 
                 REPLACE(name, ' ', '+') || 
                 '&size=400&background=random&color=fff&bold=true&format=png&rounded=true';
