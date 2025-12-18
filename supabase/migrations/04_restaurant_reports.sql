-- Restaurant Reports Table
-- Allows users to submit updates/corrections to restaurant information

CREATE TABLE IF NOT EXISTS restaurant_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  field_name TEXT NOT NULL,
  suggested_value TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE restaurant_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit reports
CREATE POLICY "Anyone can submit reports"
  ON restaurant_reports FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON restaurant_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can view all reports
CREATE POLICY "Admins can view all reports"
  ON restaurant_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admins can update reports (approve/reject)
CREATE POLICY "Admins can update reports"
  ON restaurant_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admins can delete reports
CREATE POLICY "Admins can delete reports"
  ON restaurant_reports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create index for faster queries
CREATE INDEX idx_restaurant_reports_status ON restaurant_reports(status);
CREATE INDEX idx_restaurant_reports_restaurant_id ON restaurant_reports(restaurant_id);
