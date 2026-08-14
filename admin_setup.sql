-- ========================================================
-- VENTEPULSE: SHARED ADMINISTRATOR ACCOUNT & NON-RECURSIVE RLS POLICIES
-- ========================================================

-- 1. Ensure is_admin column exists on public.profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Mark master admin email as Admin
UPDATE public.profiles 
SET is_admin = true 
WHERE LOWER(email) = 'ventepulse@gmail.com';

-- 3. Security Definer Helper Function to avoid RLS infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND (is_admin = true OR LOWER(email) = 'ventepulse@gmail.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, anon;

-- 4. Automatic Profile Creation Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    (LOWER(NEW.email) = 'ventepulse@gmail.com')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    is_admin = (LOWER(EXCLUDED.email) = 'ventepulse@gmail.com');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Non-Recursive RLS Policies for Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (
    auth.uid() = id OR 
    public.is_admin(auth.uid())
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
    public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" 
  ON public.profiles FOR DELETE 
  USING (
    auth.uid() = id OR 
    public.is_admin(auth.uid())
  );

-- 6. Non-Recursive RLS Policies for Businesses
DROP POLICY IF EXISTS "Users can view own business" ON public.businesses;
DROP POLICY IF EXISTS "Admins can view all businesses" ON public.businesses;
CREATE POLICY "Admins can view all businesses" 
  ON public.businesses FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own business" ON public.businesses;
CREATE POLICY "Users can insert own business" 
  ON public.businesses FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update own business" ON public.businesses;
CREATE POLICY "Users can update own business" 
  ON public.businesses FOR UPDATE 
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete businesses" ON public.businesses;
CREATE POLICY "Admins can delete businesses" 
  ON public.businesses FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    public.is_admin(auth.uid())
  );

-- 7. Non-Recursive RLS Policies for Leads
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
CREATE POLICY "Admins can view all leads" 
  ON public.leads FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own leads" ON public.leads;
CREATE POLICY "Users can insert own leads" 
  ON public.leads FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
CREATE POLICY "Users can update own leads" 
  ON public.leads FOR UPDATE 
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
CREATE POLICY "Admins can delete leads" 
  ON public.leads FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    public.is_admin(auth.uid())
  );

-- 8. Enable Supabase Realtime Publication for profiles, businesses, and leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
