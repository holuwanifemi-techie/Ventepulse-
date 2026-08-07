-- ========================================================
-- FOLLOWUP ASSISTANT: SESSION 6 LEADS TABLE SCHEMA UPDATE
-- ========================================================

-- 1. Add company and lead_source columns if they don't exist
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS lead_source TEXT DEFAULT 'Direct';

-- 2. Drop existing stage constraint if present and update to Session 6 stages
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
