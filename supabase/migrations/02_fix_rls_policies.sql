-- Split "Anyone can view approved restaurants" into two efficient policies

DROP POLICY IF EXISTS "Anyone can view approved restaurants" ON public.restaurants;

-- 1. Public can ONLY view approved restaurants
-- This is much faster as it doesn't need to check profiles table/subquery
CREATE POLICY "Public view approved"
  ON public.restaurants FOR SELECT
  USING (status = 'approved');

-- 2. Admins can view ALL restaurants
CREATE POLICY "Admins view all"
  ON public.restaurants FOR SELECT
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));
