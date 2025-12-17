-- Migration: Add multilingual support to existing restaurants table
-- Run this in Supabase SQL Editor if you already have the tables created

-- Add Chinese (中文) columns
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS name_zh TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS description_zh TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS address_zh TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS cuisine_type_zh TEXT;

-- Add Portuguese (Português) columns
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS name_pt TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS description_pt TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS address_pt TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS cuisine_type_pt TEXT;

-- Update existing sample data with translations
UPDATE restaurants SET
  name_zh = '美景咖啡廳',
  name_pt = 'Café Bela Vista',
  description_zh = '迷人的葡式咖啡廳，設有適合寵物的美麗花園露台。以蛋撻和加侖咖啡聞名。',
  description_pt = 'Um encantador café português com um belo terraço de jardim perfeito para animais de estimação.',
  address_zh = '澳門議事亭前地12號',
  address_pt = 'Largo do Senado 12, Macau',
  cuisine_type_zh = '葡國菜',
  cuisine_type_pt = 'Português'
WHERE name = 'Café Bela Vista';

UPDATE restaurants SET
  name_zh = '花園小館',
  name_pt = 'Bistrô do Jardim',
  description_zh = '現代融合餐廳，設有室內寵物友善區。採用新鮮時令食材，結合亞歐風味。',
  description_pt = 'Restaurante de fusão moderno com uma secção interior amiga dos animais.',
  address_zh = '澳門大三巴街45號',
  address_pt = 'Rua de São Paulo 45, Macau',
  cuisine_type_zh = '融合菜',
  cuisine_type_pt = 'Fusão'
WHERE name = 'Garden Bistro';

UPDATE restaurants SET
  name_zh = '爪印與盤子',
  name_pt = 'Patas & Pratos',
  description_zh = '終極寵物友善用餐體驗！提供特別寵物菜單。歡迎所有乖巧的寵物。',
  description_pt = 'A experiência gastronómica perfeita para animais de estimação!',
  address_zh = '澳門南灣大馬路789號',
  address_pt = 'Avenida da Praia Grande 789, Macau',
  cuisine_type_zh = '國際美食',
  cuisine_type_pt = 'Internacional'
WHERE name = 'Paws & Plates';

UPDATE restaurants SET
  name_zh = '點心園',
  name_pt = 'Jardim Dim Sum',
  description_zh = '傳統粵式點心餐廳，設有戶外庭院。露台允許攜帶小型寵物。',
  description_pt = 'Restaurante tradicional de dim sum cantonês com pátio ao ar livre.',
  address_zh = '澳門海軍上將街23號',
  address_pt = 'Rua do Almirante Sérgio 23, Macau',
  cuisine_type_zh = '粵菜',
  cuisine_type_pt = 'Cantonês'
WHERE name = 'Dim Sum Garden';

UPDATE restaurants SET
  name_zh = '汪汪早午餐',
  name_pt = 'O Brunch Ladrador',
  description_zh = '專為愛狗人士打造的週末早午餐餐廳。提供狗零食和水碗。',
  description_pt = 'Local de brunch de fim de semana dedicado aos amantes de cães.',
  address_zh = '澳門主教巷8號',
  address_pt = 'Travessa do Bispo 8, Macau',
  cuisine_type_zh = '早午餐',
  cuisine_type_pt = 'Brunch'
WHERE name = 'The Barking Brunch';

UPDATE restaurants SET
  name_zh = '海鮮港灣',
  name_pt = 'Porto dos Mariscos',
  description_zh = '新鮮海鮮餐廳，可欣賞海港景色。寬敞的戶外甲板歡迎寵物。',
  description_pt = 'Restaurante de marisco fresco com vista para o porto.',
  address_zh = '澳門亞美打利庇盧大馬路156號',
  address_pt = 'Avenida de Almeida Ribeiro 156, Macau',
  cuisine_type_zh = '海鮮',
  cuisine_type_pt = 'Mariscos'
WHERE name = 'Seafood Harbour';

-- Verify the migration
SELECT name, name_zh, name_pt FROM restaurants;
