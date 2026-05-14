-- 1. Create Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add Organization ID to Existing Tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('admin', 'analyst', 'viewer')) DEFAULT 'analyst';

ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 3. Enhance Audit Logs
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 4. Enable Row Level Security (RLS) for Multi-Tenancy
-- Note: Requires `auth.uid()` to map to an organization via the profiles table.
-- For production, we define functions to get the current user's organization_id.

CREATE OR REPLACE FUNCTION auth.user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Apply RLS Policies (Examples for incidents)
-- Drop existing open policies if necessary
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.incidents;

CREATE POLICY "Users can view incidents in their organization"
    ON public.incidents FOR SELECT
    USING (organization_id = auth.user_organization_id());

CREATE POLICY "Admins and analysts can insert incidents in their organization"
    ON public.incidents FOR INSERT
    WITH CHECK (organization_id = auth.user_organization_id() AND auth.user_role() IN ('admin', 'analyst'));

CREATE POLICY "Admins and analysts can update incidents in their organization"
    ON public.incidents FOR UPDATE
    USING (organization_id = auth.user_organization_id() AND auth.user_role() IN ('admin', 'analyst'));

-- Apply similar policies to alerts, evidence, audit_logs
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.alerts;
CREATE POLICY "Users can view alerts in their organization" ON public.alerts FOR SELECT USING (organization_id = auth.user_organization_id());
CREATE POLICY "Admins and analysts can manage alerts" ON public.alerts FOR ALL USING (organization_id = auth.user_organization_id() AND auth.user_role() IN ('admin', 'analyst'));

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.evidence;
CREATE POLICY "Users can view evidence in their organization" ON public.evidence FOR SELECT USING (organization_id = auth.user_organization_id());
CREATE POLICY "Admins and analysts can manage evidence" ON public.evidence FOR ALL USING (organization_id = auth.user_organization_id() AND auth.user_role() IN ('admin', 'analyst'));

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.audit_logs;
CREATE POLICY "Users can view audit_logs in their organization" ON public.audit_logs FOR SELECT USING (organization_id = auth.user_organization_id());
CREATE POLICY "Admins and analysts can insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (organization_id = auth.user_organization_id() AND auth.user_role() IN ('admin', 'analyst'));
