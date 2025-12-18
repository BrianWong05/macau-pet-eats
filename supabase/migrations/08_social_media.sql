-- Add social_media column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS social_media JSONB;

-- Example data format:
-- {
--   "facebook": "https://facebook.com/restaurant",
--   "instagram": "https://instagram.com/restaurant",
--   "website": "https://restaurant.com"
-- }
