-- Add Threat Intelligence Fields to Alerts Table
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS ip_reputation_score NUMERIC DEFAULT NULL;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS domain_reputation TEXT DEFAULT NULL;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS hash_reputation TEXT DEFAULT NULL;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS threat_source TEXT DEFAULT NULL;
