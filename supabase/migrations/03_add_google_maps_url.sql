-- Add google_maps_url column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
