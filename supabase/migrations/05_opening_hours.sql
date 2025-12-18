-- Add opening_hours column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS opening_hours JSONB;

-- Example data format:
-- {
--   "monday": { "open": "09:00", "close": "22:00" },
--   "tuesday": { "open": "09:00", "close": "22:00" },
--   "wednesday": null,
--   "thursday": { "open": "09:00", "close": "22:00" },
--   "friday": { "open": "09:00", "close": "23:00" },
--   "saturday": { "open": "10:00", "close": "23:00" },
--   "sunday": { "open": "10:00", "close": "21:00" }
-- }
