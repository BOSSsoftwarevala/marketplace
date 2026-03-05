-- Migration: Deployment pipeline tables
-- Adds products lock/approval columns, deployments, product_scans, and order-deployment linking

-- ── products table updates ──────────────────────────────────────────────────

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS lock_status       TEXT NOT NULL DEFAULT 'unlocked'
                                               CHECK (lock_status IN ('locked','unlocked')),
  ADD COLUMN IF NOT EXISTS deployment_approval TEXT NOT NULL DEFAULT 'pending'
                                               CHECK (deployment_approval IN ('pending','approved','rejected')),
  ADD COLUMN IF NOT EXISTS rejection_reason  TEXT;

-- ── product_scans table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.product_scans (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      TEXT        NOT NULL,
  framework       TEXT,
  database_type   TEXT,
  dependencies    TEXT[]      DEFAULT '{}',
  api_endpoints   TEXT[]      DEFAULT '{}',
  scan_report     JSONB,
  scanned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_scans_product_id ON public.product_scans (product_id);

-- ── deployments table ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.deployments (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          TEXT,
  product_id        TEXT,
  environment       TEXT,
  environment_type  TEXT        NOT NULL DEFAULT 'production'
                                  CHECK (environment_type IN ('production','staging','development')),
  domain            TEXT,
  hosting_region    TEXT,
  resources         JSONB,
  status            TEXT        NOT NULL DEFAULT 'pending'
                                  CHECK (status IN (
                                    'pending','creating_environment','assigning_resources',
                                    'attaching_domain','deploying','deployed','failed','rolled_back'
                                  )),
  status_message    TEXT,
  logs              TEXT[]      DEFAULT '{}',
  deployed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deployments_order_id   ON public.deployments (order_id);
CREATE INDEX IF NOT EXISTS idx_deployments_product_id ON public.deployments (product_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status     ON public.deployments (status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_deployments_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_deployments_updated_at ON public.deployments;
CREATE TRIGGER trg_deployments_updated_at
  BEFORE UPDATE ON public.deployments
  FOR EACH ROW EXECUTE FUNCTION public.set_deployments_updated_at();

-- ── orders table: link to deployment ────────────────────────────────────────

ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS deployment_id UUID REFERENCES public.deployments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS order_status  TEXT NOT NULL DEFAULT 'pending'
                                           CHECK (order_status IN (
                                             'pending','confirmed','scanning','awaiting_approval',
                                             'deploying','deployed','rejected'
                                           ));

CREATE INDEX IF NOT EXISTS idx_orders_deployment_id ON public.orders (deployment_id);

-- ── RLS Policies ─────────────────────────────────────────────────────────────

ALTER TABLE public.product_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments   ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY IF NOT EXISTS "product_scans_read"
  ON public.product_scans FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "deployments_read"
  ON public.deployments FOR SELECT TO authenticated USING (true);

-- Allow service role full access (Edge Functions, migrations)
CREATE POLICY IF NOT EXISTS "product_scans_service_write"
  ON public.product_scans FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "deployments_service_write"
  ON public.deployments FOR ALL TO service_role USING (true) WITH CHECK (true);
