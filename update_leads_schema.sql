-- ========================================================
-- VENTEPULSE: LEADS TABLE SCHEMA UPDATE
-- ========================================================

-- 1. Add next_followup_date column if it doesn't exist
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS next_followup_date TIMESTAMPTZ;

-- 2. Drop company column if present or keep optional
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS lead_source TEXT DEFAULT 'Direct';

-- 3. Ensure stage constraint
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
