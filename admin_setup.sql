-- ========================================================
-- VENTEPULSE: SHARED ADMINISTRATOR ACCOUNT SETUP
-- ========================================================

-- 1. Ensure is_admin column exists on public.profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Mark ONLY followupassistant13@gmail.com as Admin
UPDATE public.profiles 
SET is_admin = true 
WHERE LOWER(email) = 'followupassistant13@gmail.com';

UPDATE public.profiles 
SET is_admin = false 
WHERE LOWER(email) != 'followupassistant13@gmail.com';

-- 3. Strict Admin RLS Policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND LOWER(email) = 'followupassistant13@gmail.com'
    )
  );

DROP POLICY IF EXISTS "Admins can view all businesses" ON public.businesses;
CREATE POLICY "Admins can view all businesses" 
  ON public.businesses FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND LOWER(email) = 'followupassistant13@gmail.com'
    )
  );

DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
CREATE POLICY "Admins can view all leads" 
  ON public.leads FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND LOWER(email) = 'followupassistant13@gmail.com'
    )
  );
