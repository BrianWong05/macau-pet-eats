-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Add status column to restaurants if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'status') THEN
        ALTER TABLE public.restaurants ADD COLUMN status TEXT DEFAULT 'approved';
    END IF;
END $$;

-- Update Restaurants RLS

-- 1. Everyone can view approved restaurants
DROP POLICY IF EXISTS "Anyone can view restaurants" ON public.restaurants;
CREATE POLICY "Anyone can view approved restaurants"
  ON public.restaurants FOR SELECT
  USING (status = 'approved' OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- 2. Authenticated users can submit (insert) restaurants with default status (which is 'approved' in schema but we should probably set default to 'pending' for new ones, or handle in app. 
-- Let's change column default to 'pending' for new inserts if we want validation, BUT the prompt implies we might want 'pending'. 
-- Let's update the default to 'pending' for future safety, but keep existing as approved.
ALTER TABLE public.restaurants ALTER COLUMN status SET DEFAULT 'pending';

DROP POLICY IF EXISTS "Authenticated users can insert restaurants" ON public.restaurants;
CREATE POLICY "Authenticated users can insert restaurants"
  ON public.restaurants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 3. Only admins can update/delete restaurants
-- (We need to re-create these if they existed, or create new ones)

CREATE POLICY "Admins can update restaurants"
  ON public.restaurants FOR UPDATE
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can delete restaurants"
  ON public.restaurants FOR DELETE
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (new.id, new.email, FALSE);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger setup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill profiles for existing users
INSERT INTO public.profiles (id, email, is_admin)
SELECT id, email, FALSE
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
