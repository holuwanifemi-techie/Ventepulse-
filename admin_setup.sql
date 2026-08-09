-- ========================================================
-- VENTEPULSE: SHARED ADMINISTRATOR ACCOUNT & RLS POLICIES
-- ========================================================

-- 1. Ensure is_admin column exists on public.profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Mark ONLY ventepulse@gmail.com as Admin
UPDATE public.profiles 
SET is_admin = true 
WHERE LOWER(email) = 'ventepulse@gmail.com';

UPDATE public.profiles 
SET is_admin = false 
WHERE LOWER(email) != 'ventepulse@gmail.com';

-- 3. Automatic Profile Creation Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RLS Policies for Profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (
    auth.uid() = id OR 
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'ventepulse@gmail.com' OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (LOWER(email) = 'ventepulse@gmail.com' OR is_admin = true)
    )
  );

DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert profiles" 
  ON public.profiles FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (
    auth.uid() = id OR 
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'ventepulse@gmail.com'
  );

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" 
  ON public.profiles FOR DELETE 
  USING (
    auth.uid() = id OR 
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'ventepulse@gmail.com' OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (LOWER(email) = 'ventepulse@gmail.com' OR is_admin = true)
    )
  );

-- 5. RLS Policies for Businesses
DROP POLICY IF EXISTS "Admins can view all businesses" ON public.businesses;
CREATE POLICY "Admins can view all businesses" 
  ON public.businesses FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'ventepulse@gmail.com' OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (LOWER(email) = 'ventepulse@gmail.com' OR is_admin = true)
    )
  );

DROP POLICY IF EXISTS "Admins can delete businesses" ON public.businesses;
CREATE POLICY "Admins can delete businesses" 
  ON public.businesses FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'ventepulse@gmail.com' OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (LOWER(email) = 'ventepulse@gmail.com' OR is_admin = true)
    )
  );

-- 6. RLS Policies for Leads
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
CREATE POLICY "Admins can view all leads" 
  ON public.leads FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'ventepulse@gmail.com' OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (LOWER(email) = 'ventepulse@gmail.com' OR is_admin = true)
    )
  );

DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
CREATE POLICY "Admins can delete leads" 
  ON public.leads FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'ventepulse@gmail.com' OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (LOWER(email) = 'ventepulse@gmail.com' OR is_admin = true)
    )
  );

-- 7. Enable Supabase Realtime Publication for profiles, businesses, and leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
