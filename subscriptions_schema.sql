-- ========================================================
-- VENTEPULSE: SUBSCRIPTIONS, PAYMENTS & SERVER-SIDE ENFORCEMENT
-- ========================================================

-- 1. SUBSCRIPTIONS TABLE (1:1 with public.profiles)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro_100', 'pro_500', 'admin', 'owner')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'canceled')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  current_period_end TIMESTAMPTZ,
  lead_limit INTEGER NOT NULL DEFAULT 10 CHECK (lead_limit >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriptions RLS Policies
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" 
  ON public.subscriptions FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert initial subscription" ON public.subscriptions;
CREATE POLICY "Users can insert initial subscription" 
  ON public.subscriptions FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR 
    public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admins and services can update subscription" ON public.subscriptions;
CREATE POLICY "Admins and services can update subscription" 
  ON public.subscriptions FOR UPDATE 
  USING (
    public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admins can delete subscription" ON public.subscriptions;
CREATE POLICY "Admins can delete subscription" 
  ON public.subscriptions FOR DELETE 
  USING (
    public.is_admin(auth.uid())
  );


-- 2. PAYMENTS TABLE (Audit & Transaction Log)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('pro_100', 'pro_500')),
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN' CHECK (currency IN ('NGN', 'USD')),
  provider TEXT NOT NULL DEFAULT 'bachs',
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'pending', 'failed')),
  raw_metadata JSONB DEFAULT '{}'::jsonb,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments RLS Policies
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" 
  ON public.payments FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admins and services can manage payments" ON public.payments;
CREATE POLICY "Admins and services can manage payments" 
  ON public.payments FOR ALL 
  USING (
    public.is_admin(auth.uid())
  );


-- 3. HELPER FUNCTION: GET EFFECTIVE USER PLAN & ACCESS
CREATE OR REPLACE FUNCTION public.get_effective_user_plan(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_is_admin BOOLEAN := false;
  v_user_email TEXT;
  v_sub RECORD;
  v_current_leads INTEGER := 0;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  -- 1. Check if user is Administrator or Master Owner via profile or helper
  SELECT email, (is_admin = true OR LOWER(email) = 'ventepulse@gmail.com')
  INTO v_user_email, v_is_admin
  FROM public.profiles
  WHERE id = target_user_id;

  SELECT COUNT(*) INTO v_current_leads FROM public.leads WHERE user_id = target_user_id;

  IF v_is_admin THEN
    RETURN jsonb_build_object(
      'role', 'admin',
      'plan', 'admin',
      'plan_name', 'Administrator Access',
      'status', 'active',
      'lead_limit', 999999,
      'current_leads', v_current_leads,
      'is_pro', true,
      'is_admin', true,
      'expires_at', null
    );
  END IF;

  -- 2. Lookup subscription
  SELECT plan, status, current_period_end, lead_limit
  INTO v_sub
  FROM public.subscriptions
  WHERE user_id = target_user_id;

  IF FOUND THEN
    -- Owner Plan
    IF v_sub.plan = 'owner' THEN
      RETURN jsonb_build_object(
        'role', 'owner',
        'plan', 'owner',
        'plan_name', 'Owner Access',
        'status', 'active',
        'lead_limit', 999999,
        'current_leads', v_current_leads,
        'is_pro', true,
        'is_admin', true,
        'expires_at', null
      );
    -- Admin Plan in Subscriptions
    ELSIF v_sub.plan = 'admin' THEN
      RETURN jsonb_build_object(
        'role', 'admin',
        'plan', 'admin',
        'plan_name', 'Administrator Access',
        'status', 'active',
        'lead_limit', 999999,
        'current_leads', v_current_leads,
        'is_pro', true,
        'is_admin', true,
        'expires_at', null
      );
    -- Check if Pro 500 is active and not expired
    ELSIF v_sub.plan = 'pro_500' AND v_sub.status = 'active' AND (v_sub.current_period_end IS NULL OR v_sub.current_period_end > v_now) THEN
      RETURN jsonb_build_object(
        'role', 'user',
        'plan', 'pro_500',
        'plan_name', 'VentePulse Pro 500',
        'status', 'active',
        'lead_limit', 500,
        'current_leads', v_current_leads,
        'is_pro', true,
        'is_admin', false,
        'expires_at', v_sub.current_period_end
      );
    -- Check if Pro 100 is active and not expired
    ELSIF v_sub.plan = 'pro_100' AND v_sub.status = 'active' AND (v_sub.current_period_end IS NULL OR v_sub.current_period_end > v_now) THEN
      RETURN jsonb_build_object(
        'role', 'user',
        'plan', 'pro_100',
        'plan_name', 'VentePulse Pro 100',
        'status', 'active',
        'lead_limit', 100,
        'current_leads', v_current_leads,
        'is_pro', true,
        'is_admin', false,
        'expires_at', v_sub.current_period_end
      );
    -- Subscription exists but is expired or canceled
    ELSIF v_sub.current_period_end IS NOT NULL AND v_sub.current_period_end <= v_now THEN
      RETURN jsonb_build_object(
        'role', 'user',
        'plan', 'free',
        'previous_plan', v_sub.plan,
        'plan_name', 'VentePulse Pro Expired',
        'status', 'expired',
        'lead_limit', 10,
        'current_leads', v_current_leads,
        'is_pro', false,
        'is_admin', false,
        'expires_at', v_sub.current_period_end
      );
    END IF;
  END IF;

  -- Default Free Plan
  RETURN jsonb_build_object(
    'role', 'user',
    'plan', 'free',
    'plan_name', 'Free',
    'status', 'active',
    'lead_limit', 10,
    'current_leads', v_current_leads,
    'is_pro', false,
    'is_admin', false,
    'expires_at', null
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.get_effective_user_plan(UUID) TO anon, authenticated, service_role;


-- 4. SERVER-SIDE LEAD LIMIT ENFORCEMENT (TRIGGER BEFORE INSERT ON public.leads)
CREATE OR REPLACE FUNCTION public.enforce_lead_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_is_admin BOOLEAN := false;
  v_sub RECORD;
  v_current_count INTEGER := 0;
  v_effective_limit INTEGER := 10;
  v_plan_name TEXT := 'Free';
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  -- 1. If Administrator / Owner, bypass limit completely (unlimited leads)
  SELECT (is_admin = true OR LOWER(email) = 'ventepulse@gmail.com')
  INTO v_is_admin
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF v_is_admin THEN
    RETURN NEW;
  END IF;

  -- 2. Lookup subscription
  SELECT plan, status, current_period_end, lead_limit
  INTO v_sub
  FROM public.subscriptions
  WHERE user_id = NEW.user_id;

  IF FOUND THEN
    IF v_sub.plan IN ('owner', 'admin') THEN
      RETURN NEW;
    ELSIF v_sub.plan = 'pro_500' AND v_sub.status = 'active' AND (v_sub.current_period_end IS NULL OR v_sub.current_period_end > v_now) THEN
      v_effective_limit := 500;
      v_plan_name := 'VentePulse Pro 500';
    ELSIF v_sub.plan = 'pro_100' AND v_sub.status = 'active' AND (v_sub.current_period_end IS NULL OR v_sub.current_period_end > v_now) THEN
      v_effective_limit := 100;
      v_plan_name := 'VentePulse Pro 100';
    ELSE
      -- Expired or Free
      v_effective_limit := 10;
      IF v_sub.current_period_end IS NOT NULL AND v_sub.current_period_end <= v_now THEN
        v_plan_name := 'Expired Pro';
      ELSE
        v_plan_name := 'Free';
      END IF;
    END IF;
  ELSE
    v_effective_limit := 10;
    v_plan_name := 'Free';
  END IF;

  -- 3. Check current lead count
  SELECT COUNT(*) INTO v_current_count
  FROM public.leads
  WHERE user_id = NEW.user_id;

  -- 4. Reject insertion if limit reached
  IF v_current_count >= v_effective_limit THEN
    RAISE EXCEPTION 'LEAD_LIMIT_EXCEEDED: You have reached your % plan limit of % leads. Upgrade to VentePulse Pro to manage more leads.', v_plan_name, v_effective_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to public.leads
DROP TRIGGER IF EXISTS trigger_enforce_lead_limit ON public.leads;
CREATE TRIGGER trigger_enforce_lead_limit
  BEFORE INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.enforce_lead_limit();


-- 5. SECURE FUNCTION: ACTIVATE OR RENEW SUBSCRIPTION
CREATE OR REPLACE FUNCTION public.activate_subscription(
  p_user_id UUID,
  p_plan TEXT,
  p_reference TEXT,
  p_amount NUMERIC,
  p_currency TEXT DEFAULT 'NGN',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
  v_lead_limit INTEGER;
  v_period_end TIMESTAMPTZ;
  v_sub_id UUID;
BEGIN
  IF p_plan = 'pro_500' THEN
    v_lead_limit := 500;
  ELSIF p_plan = 'pro_100' THEN
    v_lead_limit := 100;
  ELSE
    RAISE EXCEPTION 'Invalid subscription plan: %', p_plan;
  END IF;

  v_period_end := timezone('utc'::text, now()) + INTERVAL '1 month';

  -- 1. Insert or update subscription record
  INSERT INTO public.subscriptions (
    user_id, plan, status, current_period_start, current_period_end, lead_limit, updated_at
  )
  VALUES (
    p_user_id, p_plan, 'active', timezone('utc'::text, now()), v_period_end, v_lead_limit, timezone('utc'::text, now())
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan = EXCLUDED.plan,
    status = 'active',
    current_period_start = timezone('utc'::text, now()),
    current_period_end = v_period_end,
    lead_limit = v_lead_limit,
    updated_at = timezone('utc'::text, now())
  RETURNING id INTO v_sub_id;

  -- 2. Insert payment record (idempotent reference)
  INSERT INTO public.payments (
    user_id, plan, amount, currency, provider, reference, status, raw_metadata, paid_at
  )
  VALUES (
    p_user_id, p_plan, p_amount, COALESCE(p_currency, 'NGN'), 'bachs', p_reference, 'success', p_metadata, timezone('utc'::text, now())
  )
  ON CONFLICT (reference) DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'subscription_id', v_sub_id,
    'plan', p_plan,
    'lead_limit', v_lead_limit,
    'expires_at', v_period_end
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.activate_subscription(UUID, TEXT, TEXT, NUMERIC, TEXT, JSONB) TO authenticated, service_role;


-- 6. AUTOMATIC PROVISIONING: UPDATE USER SIGNUP TRIGGER & BACKFILL EXISTING PROFILES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.profiles
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

  -- Automatically initialize Free Subscription (10 leads)
  INSERT INTO public.subscriptions (user_id, plan, status, lead_limit)
  VALUES (NEW.id, 'free', 'active', 10)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill all existing users in public.profiles with Free Subscription if missing
INSERT INTO public.subscriptions (user_id, plan, status, lead_limit)
SELECT id, 'free', 'active', 10
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;


-- 7. ENABLE REALTIME PUBLICATION & RELOAD SCHEMA CACHE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'subscriptions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'payments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
