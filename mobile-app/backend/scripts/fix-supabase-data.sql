-- Fix influencer names and images in Supabase PostgreSQL

-- Fix Thomas Pesquet name
UPDATE "Influencer" SET name = 'Thomas Pesquet' WHERE name = 'Thom Astro';

-- Update all images to use UI Avatars
UPDATE "Influencer" 
SET "imageUrl" = 'https://ui-avatars.com/api/?name=' || 
                 REPLACE(name, ' ', '+') || 
                 '&size=400&background=random&color=fff&bold=true&format=png&rounded=true';
