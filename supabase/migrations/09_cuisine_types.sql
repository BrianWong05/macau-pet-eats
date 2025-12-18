-- Create cuisine_types table for dynamic cuisine type management
CREATE TABLE IF NOT EXISTS cuisine_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_zh VARCHAR(100),
  name_pt VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cuisine_types ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view cuisine types"
ON cuisine_types FOR SELECT
USING (true);

-- Admin write access
CREATE POLICY "Admins can insert cuisine types"
ON cuisine_types FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can update cuisine types"
ON cuisine_types FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete cuisine types"
ON cuisine_types FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Insert default cuisine types
INSERT INTO cuisine_types (name, name_zh, name_pt, sort_order) VALUES
('portuguese', '葡國菜', 'Português', 1),
('macanese', '澳門菜', 'Macaense', 2),
('cantonese', '粵菜', 'Cantonês', 3),
('chinese', '中國菜', 'Chinês', 4),
('japanese', '日本菜', 'Japonês', 5),
('italian', '意大利菜', 'Italiano', 6),
('american', '美式料理', 'Americano', 7),
('fusion', '融合菜', 'Fusão', 8),
('seafood', '海鮮', 'Mariscos', 9),
('cafe', '咖啡店', 'Café', 10),
('bar', '酒吧', 'Bar', 11),
('dessert', '甜品店', 'Sobremesa', 12),
('other', '其他', 'Outro', 99);
