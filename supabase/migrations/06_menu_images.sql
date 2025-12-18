-- Add menu_images column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS menu_images TEXT[];
