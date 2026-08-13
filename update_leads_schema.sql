-- ========================================================
-- VENTEPULSE: DATABASE SCHEMA & CONSTRAINT UPDATES
-- ========================================================

-- 1. Add custom_business_type column to businesses table
ALTER TABLE public.businesses 
  ADD COLUMN IF NOT EXISTS custom_business_type TEXT;

-- 2. Add next_followup_date column to leads table if it doesn't exist
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS next_followup_date TIMESTAMPTZ;

-- 3. Ensure lead_source column exists
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS lead_source TEXT DEFAULT 'Direct';

-- 4. Ensure stage constraint
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_stage_check;

ALTER TABLE public.leads 
  ADD CONSTRAINT leads_stage_check CHECK (
    stage IN (
      'New',
      'Contacted',
      'Interested',
      'Negotiating',
      'Closed Won',
      'Closed Lost'
    )
  );

-- Set default stage to 'New'
ALTER TABLE public.leads ALTER COLUMN stage SET DEFAULT 'New';

-- 5. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
