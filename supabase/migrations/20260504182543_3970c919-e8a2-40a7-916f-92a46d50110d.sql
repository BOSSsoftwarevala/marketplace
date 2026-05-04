
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS discount_price numeric(12,2),
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preview_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS video_thumbnail_url text,
  ADD COLUMN IF NOT EXISTS main_file_url text,
  ADD COLUMN IF NOT EXISTS additional_files jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS version text DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS changelog text,
  ADD COLUMN IF NOT EXISTS demo_type text DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS demo_url text,
  ADD COLUMN IF NOT EXISTS demo_embed text,
  ADD COLUMN IF NOT EXISTS demo_video_url text,
  ADD COLUMN IF NOT EXISTS demo_credentials jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS documentation_url text,
  ADD COLUMN IF NOT EXISTS support_url text,
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS keywords text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS og_title text,
  ADD COLUMN IF NOT EXISTS og_description text,
  ADD COLUMN IF NOT EXISTS og_image text,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_free boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS license_type text DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS license_tier text DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS compatibility text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS difficulty_level text DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS industry_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tech_stack_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS use_case_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS trending boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS popular_score numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured_rank integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS manual_rank integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS search_keywords text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS synonyms text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS view_count bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS demo_click_count bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conversion_count bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS feature_list text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS requirements text,
  ADD COLUMN IF NOT EXISTS installation_guide text,
  ADD COLUMN IF NOT EXISTS sections_json jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS release_notes text,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_flagged boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS abuse_reported boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_author boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS support_response_time text,
  ADD COLUMN IF NOT EXISTS coupon_code text,
  ADD COLUMN IF NOT EXISTS dynamic_pricing jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_subscription boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS blog_url text;

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_deleted ON public.products(deleted_at);

CREATE TABLE IF NOT EXISTS public.product_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.product_faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "view_faqs" ON public.product_faqs;
CREATE POLICY "view_faqs" ON public.product_faqs FOR SELECT USING (true);
DROP POLICY IF EXISTS "manage_faqs" ON public.product_faqs;
CREATE POLICY "manage_faqs" ON public.product_faqs FOR ALL
  USING (has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'boss_owner'::app_role))
  WITH CHECK (has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'boss_owner'::app_role));

CREATE TABLE IF NOT EXISTS public.product_blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.product_blogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "view_blogs" ON public.product_blogs;
CREATE POLICY "view_blogs" ON public.product_blogs FOR SELECT USING (true);
DROP POLICY IF EXISTS "manage_blogs" ON public.product_blogs;
CREATE POLICY "manage_blogs" ON public.product_blogs FOR ALL
  USING (has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'boss_owner'::app_role))
  WITH CHECK (has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'boss_owner'::app_role));

INSERT INTO storage.buckets (id, name, public) VALUES ('product-images','product-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-files','product-files', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "product_images_read" ON storage.objects;
CREATE POLICY "product_images_read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "product_images_write" ON storage.objects;
CREATE POLICY "product_images_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
CREATE POLICY "product_images_update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
CREATE POLICY "product_images_delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "product_files_read" ON storage.objects;
CREATE POLICY "product_files_read" ON storage.objects FOR SELECT USING (bucket_id = 'product-files');
DROP POLICY IF EXISTS "product_files_write" ON storage.objects;
CREATE POLICY "product_files_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-files' AND auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "product_files_update" ON storage.objects;
CREATE POLICY "product_files_update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-files' AND auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "product_files_delete" ON storage.objects;
CREATE POLICY "product_files_delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-files' AND auth.uid() IS NOT NULL);

INSERT INTO public.business_categories (name, description, icon, display_order, is_active) VALUES
  ('Software & SaaS','Cloud and on-premise software products','Package',1,true),
  ('Mobile Apps','iOS and Android applications','Smartphone',2,true),
  ('Web Templates','HTML, React and CMS templates','LayoutTemplate',3,true),
  ('Plugins & Extensions','WordPress, Shopify and browser plugins','Puzzle',4,true),
  ('AI & Automation','AI tools, bots and automation','Brain',5,true),
  ('Design & Graphics','UI kits, icons and design assets','Palette',6,true),
  ('Marketing & SEO','Marketing tools and SEO services','TrendingUp',7,true),
  ('Business & POS','Accounting, HRM, POS and ERP systems','Briefcase',8,true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.business_subcategories (category_id, name, display_order, is_active)
SELECT c.id, s.name, s.ord, true FROM public.business_categories c
JOIN (VALUES
  ('Software & SaaS','CRM',1),('Software & SaaS','HRM',2),('Software & SaaS','Accounting',3),('Software & SaaS','Project Management',4),
  ('Mobile Apps','E-Commerce App',1),('Mobile Apps','Social App',2),('Mobile Apps','Utility App',3),
  ('Web Templates','React Template',1),('Web Templates','HTML Template',2),('Web Templates','Admin Dashboard',3),
  ('Plugins & Extensions','WordPress Plugin',1),('Plugins & Extensions','Shopify App',2),('Plugins & Extensions','Chrome Extension',3),
  ('AI & Automation','AI Chatbot',1),('AI & Automation','Workflow Automation',2),('AI & Automation','AI Content',3),
  ('Design & Graphics','UI Kit',1),('Design & Graphics','Icon Pack',2),('Design & Graphics','Logo Pack',3),
  ('Marketing & SEO','SEO Tool',1),('Marketing & SEO','Email Marketing',2),('Marketing & SEO','Analytics',3),
  ('Business & POS','Restaurant POS',1),('Business & POS','Retail POS',2),('Business & POS','ERP',3)
) AS s(category_name, name, ord) ON s.category_name = c.name
ON CONFLICT (category_id, name) DO NOTHING;
