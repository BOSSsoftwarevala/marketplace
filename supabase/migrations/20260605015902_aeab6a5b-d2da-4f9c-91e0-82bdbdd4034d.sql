
-- =========================================================
-- PHASE 1: module_routes + can_access_route
-- =========================================================
CREATE TABLE IF NOT EXISTS public.module_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text NOT NULL,
  module_key text NOT NULL,
  route_path text NOT NULL,
  can_view boolean NOT NULL DEFAULT true,
  can_edit boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_name, route_path)
);

GRANT SELECT ON public.module_routes TO authenticated;
GRANT ALL ON public.module_routes TO service_role;
ALTER TABLE public.module_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "module_routes_read_auth" ON public.module_routes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "module_routes_admin_write" ON public.module_routes
  FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.has_role(auth.uid(), 'boss_owner'::app_role))
  WITH CHECK (public.is_super_admin() OR public.has_role(auth.uid(), 'boss_owner'::app_role));

-- Seed: Boss owner & CEO get full-wildcard
INSERT INTO public.module_routes (role_name, module_key, route_path, can_view, can_edit, can_delete) VALUES
  ('boss_owner','*','*',true,true,true),
  ('ceo','*','*',true,true,false)
ON CONFLICT (role_name, route_path) DO NOTHING;

-- Seed: Super admin's module set (matches RoleSwitchDashboard ROLE_VIEW_ACCESS)
INSERT INTO public.module_routes (role_name, module_key, route_path, can_view, can_edit, can_delete) VALUES
  ('super_admin','dashboard','/',true,true,false),
  ('super_admin','role_switch','/super-admin/role-switch',true,true,false),
  ('super_admin','continent_super_admin','/super-admin/role-switch?role=continent_super_admin',true,true,false),
  ('super_admin','country_head','/super-admin/role-switch?role=country_head',true,true,false),
  ('super_admin','franchise_manager','/super-admin/role-switch?role=franchise_manager',true,true,false),
  ('super_admin','sales_support_manager','/super-admin/role-switch?role=sales_support_manager',true,true,false),
  ('super_admin','reseller_manager','/super-admin/role-switch?role=reseller_manager',true,true,false),
  ('super_admin','lead_manager','/super-admin/role-switch?role=lead_manager',true,true,false),
  ('super_admin','command_center','/super-admin',true,true,false),
  ('super_admin','audit','/super-admin/audit',true,false,false),
  ('super_admin','roles','/super-admin/roles',true,true,true)
ON CONFLICT (role_name, route_path) DO NOTHING;

-- Per-role narrow grants
INSERT INTO public.module_routes (role_name, module_key, route_path, can_view, can_edit) VALUES
  ('continent_super_admin','continent','/continent-super-admin',true,true),
  ('country_head','country','/country-head',true,true),
  ('server_manager','server','/server-manager',true,true),
  ('finance_manager','finance','/finance-manager',true,true),
  ('lead_manager','lead','/lead-manager',true,true),
  ('legal_compliance','legal','/legal-manager',true,true),
  ('marketing_manager','marketing','/marketing-manager',true,true),
  ('hr_manager','hr','/hr-manager',true,true),
  ('demo_manager','demo','/product-demo-manager',true,true),
  ('franchise','franchise','/franchise',true,true),
  ('reseller','reseller','/reseller',true,true),
  ('developer','developer','/developer',true,true)
ON CONFLICT (role_name, route_path) DO NOTHING;

CREATE OR REPLACE FUNCTION public.can_access_route(_user_id uuid, _route text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  IF _user_id IS NULL OR _route IS NULL THEN
    RETURN false;
  END IF;

  -- Boss owner & CEO always allowed
  IF public.has_role(_user_id, 'boss_owner'::app_role)
     OR public.has_role(_user_id, 'ceo'::app_role) THEN
    RETURN true;
  END IF;

  -- Any role assignment of this user that has a matching route (exact, prefix, or wildcard)
  IF EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.module_routes mr
      ON mr.role_name = ur.role::text
    WHERE ur.user_id = _user_id
      AND COALESCE(ur.approval_status, 'approved') = 'approved'
      AND mr.can_view = true
      AND (
        mr.route_path = '*'
        OR mr.route_path = _route
        OR _route LIKE (mr.route_path || '%')
      )
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.can_access_route(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.can_access_route(uuid, text) TO authenticated, service_role;

-- =========================================================
-- PHASE 2: i18n tables
-- =========================================================
CREATE TABLE IF NOT EXISTS public.languages (
  code text PRIMARY KEY,
  name text NOT NULL,
  native_name text NOT NULL,
  rtl boolean NOT NULL DEFAULT false,
  enabled boolean NOT NULL DEFAULT false,
  coverage_pct numeric(5,2) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.languages TO anon, authenticated;
GRANT ALL ON public.languages TO service_role;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "languages_read_all" ON public.languages FOR SELECT USING (true);
CREATE POLICY "languages_admin_write" ON public.languages FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.has_role(auth.uid(), 'boss_owner'::app_role))
  WITH CHECK (public.is_super_admin() OR public.has_role(auth.uid(), 'boss_owner'::app_role));

CREATE TABLE IF NOT EXISTS public.translation_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace text NOT NULL DEFAULT 'common',
  key text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (namespace, key)
);
GRANT SELECT ON public.translation_keys TO authenticated;
GRANT ALL ON public.translation_keys TO service_role;
ALTER TABLE public.translation_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tkeys_read_auth" ON public.translation_keys FOR SELECT TO authenticated USING (true);
CREATE POLICY "tkeys_admin_write" ON public.translation_keys FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.has_role(auth.uid(), 'boss_owner'::app_role))
  WITH CHECK (public.is_super_admin() OR public.has_role(auth.uid(), 'boss_owner'::app_role));

CREATE TABLE IF NOT EXISTS public.translation_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id uuid NOT NULL REFERENCES public.translation_keys(id) ON DELETE CASCADE,
  language_code text NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  value text NOT NULL,
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('approved','pending','rejected')),
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (key_id, language_code)
);
GRANT SELECT ON public.translation_values TO authenticated;
GRANT ALL ON public.translation_values TO service_role;
ALTER TABLE public.translation_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tvals_read_auth" ON public.translation_values FOR SELECT TO authenticated USING (true);
CREATE POLICY "tvals_admin_write" ON public.translation_values FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.has_role(auth.uid(), 'boss_owner'::app_role))
  WITH CHECK (public.is_super_admin() OR public.has_role(auth.uid(), 'boss_owner'::app_role));

CREATE TABLE IF NOT EXISTS public.translation_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id uuid,
  language_code text,
  old_value text,
  new_value text,
  actor uuid,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.translation_audit_logs TO authenticated;
GRANT ALL ON public.translation_audit_logs TO service_role;
ALTER TABLE public.translation_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "talog_read_admin" ON public.translation_audit_logs FOR SELECT TO authenticated
  USING (public.is_super_admin() OR public.has_role(auth.uid(), 'boss_owner'::app_role));
CREATE POLICY "talog_insert_auth" ON public.translation_audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Audit trigger
CREATE OR REPLACE FUNCTION public.trg_translation_values_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.translation_audit_logs(key_id, language_code, old_value, new_value, actor, action)
  VALUES (
    COALESCE(NEW.key_id, OLD.key_id),
    COALESCE(NEW.language_code, OLD.language_code),
    OLD.value,
    NEW.value,
    auth.uid(),
    TG_OP
  );
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_tvals_audit ON public.translation_values;
CREATE TRIGGER trg_tvals_audit AFTER INSERT OR UPDATE OR DELETE ON public.translation_values
  FOR EACH ROW EXECUTE FUNCTION public.trg_translation_values_audit();

-- Coverage view + refresher
CREATE OR REPLACE VIEW public.translation_coverage AS
SELECT l.code AS language_code,
       (SELECT COUNT(*) FROM public.translation_keys) AS total_keys,
       (SELECT COUNT(*) FROM public.translation_values v
         WHERE v.language_code = l.code AND v.status = 'approved') AS translated_keys,
       CASE WHEN (SELECT COUNT(*) FROM public.translation_keys) = 0 THEN 0
            ELSE ROUND(100.0 * (SELECT COUNT(*) FROM public.translation_values v
                                 WHERE v.language_code = l.code AND v.status = 'approved')::numeric
                       / (SELECT COUNT(*) FROM public.translation_keys), 2)
       END AS coverage_pct
FROM public.languages l;

GRANT SELECT ON public.translation_coverage TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.refresh_language_coverage(_code text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.languages l
     SET coverage_pct = c.coverage_pct, updated_at = now()
    FROM public.translation_coverage c
   WHERE c.language_code = l.code
     AND (_code IS NULL OR l.code = _code);
END;
$$;
GRANT EXECUTE ON FUNCTION public.refresh_language_coverage(text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.trg_refresh_coverage()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.refresh_language_coverage(COALESCE(NEW.language_code, OLD.language_code));
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_tvals_coverage ON public.translation_values;
CREATE TRIGGER trg_tvals_coverage AFTER INSERT OR UPDATE OR DELETE ON public.translation_values
  FOR EACH ROW EXECUTE FUNCTION public.trg_refresh_coverage();

-- Seed 125 languages
INSERT INTO public.languages (code, name, native_name, rtl, enabled, coverage_pct) VALUES
('en','English','English',false,true,100),
('hi','Hindi','हिन्दी',false,false,0),
('es','Spanish','Español',false,false,0),
('fr','French','Français',false,false,0),
('de','German','Deutsch',false,false,0),
('pt','Portuguese','Português',false,false,0),
('it','Italian','Italiano',false,false,0),
('nl','Dutch','Nederlands',false,false,0),
('ru','Russian','Русский',false,false,0),
('zh','Chinese (Simplified)','简体中文',false,false,0),
('zh-TW','Chinese (Traditional)','繁體中文',false,false,0),
('ja','Japanese','日本語',false,false,0),
('ko','Korean','한국어',false,false,0),
('ar','Arabic','العربية',true,false,0),
('he','Hebrew','עברית',true,false,0),
('ur','Urdu','اردو',true,false,0),
('fa','Persian','فارسی',true,false,0),
('ps','Pashto','پښتو',true,false,0),
('tr','Turkish','Türkçe',false,false,0),
('pl','Polish','Polski',false,false,0),
('uk','Ukrainian','Українська',false,false,0),
('cs','Czech','Čeština',false,false,0),
('sk','Slovak','Slovenčina',false,false,0),
('hu','Hungarian','Magyar',false,false,0),
('ro','Romanian','Română',false,false,0),
('bg','Bulgarian','Български',false,false,0),
('el','Greek','Ελληνικά',false,false,0),
('sv','Swedish','Svenska',false,false,0),
('no','Norwegian','Norsk',false,false,0),
('da','Danish','Dansk',false,false,0),
('fi','Finnish','Suomi',false,false,0),
('is','Icelandic','Íslenska',false,false,0),
('lt','Lithuanian','Lietuvių',false,false,0),
('lv','Latvian','Latviešu',false,false,0),
('et','Estonian','Eesti',false,false,0),
('sl','Slovenian','Slovenščina',false,false,0),
('hr','Croatian','Hrvatski',false,false,0),
('sr','Serbian','Српски',false,false,0),
('bs','Bosnian','Bosanski',false,false,0),
('mk','Macedonian','Македонски',false,false,0),
('sq','Albanian','Shqip',false,false,0),
('mt','Maltese','Malti',false,false,0),
('ga','Irish','Gaeilge',false,false,0),
('cy','Welsh','Cymraeg',false,false,0),
('eu','Basque','Euskara',false,false,0),
('ca','Catalan','Català',false,false,0),
('gl','Galician','Galego',false,false,0),
('af','Afrikaans','Afrikaans',false,false,0),
('sw','Swahili','Kiswahili',false,false,0),
('am','Amharic','አማርኛ',false,false,0),
('ha','Hausa','Hausa',false,false,0),
('yo','Yoruba','Yorùbá',false,false,0),
('ig','Igbo','Igbo',false,false,0),
('zu','Zulu','isiZulu',false,false,0),
('xh','Xhosa','isiXhosa',false,false,0),
('so','Somali','Soomaali',false,false,0),
('mg','Malagasy','Malagasy',false,false,0),
('rw','Kinyarwanda','Kinyarwanda',false,false,0),
('ny','Chichewa','Chichewa',false,false,0),
('st','Sesotho','Sesotho',false,false,0),
('tn','Tswana','Setswana',false,false,0),
('sn','Shona','chiShona',false,false,0),
('th','Thai','ไทย',false,false,0),
('vi','Vietnamese','Tiếng Việt',false,false,0),
('id','Indonesian','Bahasa Indonesia',false,false,0),
('ms','Malay','Bahasa Melayu',false,false,0),
('tl','Filipino','Filipino',false,false,0),
('km','Khmer','ខ្មែរ',false,false,0),
('lo','Lao','ລາວ',false,false,0),
('my','Burmese','မြန်မာ',false,false,0),
('mn','Mongolian','Монгол',false,false,0),
('ne','Nepali','नेपाली',false,false,0),
('si','Sinhala','සිංහල',false,false,0),
('bn','Bengali','বাংলা',false,false,0),
('ta','Tamil','தமிழ்',false,false,0),
('te','Telugu','తెలుగు',false,false,0),
('ml','Malayalam','മലയാളം',false,false,0),
('kn','Kannada','ಕನ್ನಡ',false,false,0),
('gu','Gujarati','ગુજરાતી',false,false,0),
('mr','Marathi','मराठी',false,false,0),
('pa','Punjabi','ਪੰਜਾਬੀ',false,false,0),
('or','Odia','ଓଡ଼ିଆ',false,false,0),
('as','Assamese','অসমীয়া',false,false,0),
('sd','Sindhi','سنڌي',true,false,0),
('ks','Kashmiri','کٲشُر',true,false,0),
('sa','Sanskrit','संस्कृतम्',false,false,0),
('mai','Maithili','मैथिली',false,false,0),
('bho','Bhojpuri','भोजपुरी',false,false,0),
('kok','Konkani','कोंकणी',false,false,0),
('mni','Manipuri','মৈতৈলোন্',false,false,0),
('dv','Dhivehi','ދިވެހި',true,false,0),
('bo','Tibetan','བོད་ཡིག',false,false,0),
('dz','Dzongkha','རྫོང་ཁ',false,false,0),
('ka','Georgian','ქართული',false,false,0),
('hy','Armenian','Հայերեն',false,false,0),
('az','Azerbaijani','Azərbaycanca',false,false,0),
('kk','Kazakh','Қазақша',false,false,0),
('ky','Kyrgyz','Кыргызча',false,false,0),
('uz','Uzbek','Oʻzbekcha',false,false,0),
('tg','Tajik','Тоҷикӣ',false,false,0),
('tk','Turkmen','Türkmençe',false,false,0),
('be','Belarusian','Беларуская',false,false,0),
('mo','Moldovan','Moldovenească',false,false,0),
('lb','Luxembourgish','Lëtzebuergesch',false,false,0),
('fo','Faroese','Føroyskt',false,false,0),
('gd','Scottish Gaelic','Gàidhlig',false,false,0),
('br','Breton','Brezhoneg',false,false,0),
('co','Corsican','Corsu',false,false,0),
('eo','Esperanto','Esperanto',false,false,0),
('la','Latin','Latina',false,false,0),
('yi','Yiddish','ייִדיש',true,false,0),
('haw','Hawaiian','ʻŌlelo Hawaiʻi',false,false,0),
('mi','Maori','Māori',false,false,0),
('sm','Samoan','Samoa',false,false,0),
('to','Tongan','Tonga',false,false,0),
('fj','Fijian','Vosa Vakaviti',false,false,0),
('ht','Haitian Creole','Kreyòl',false,false,0),
('qu','Quechua','Runa Simi',false,false,0),
('ay','Aymara','Aymar aru',false,false,0),
('gn','Guarani','Avañeʼẽ',false,false,0),
('nah','Nahuatl','Nāhuatl',false,false,0),
('iu','Inuktitut','ᐃᓄᒃᑎᑐᑦ',false,false,0),
('chr','Cherokee','ᏣᎳᎩ',false,false,0),
('nv','Navajo','Diné bizaad',false,false,0),
('su','Sundanese','Basa Sunda',false,false,0),
('jv','Javanese','Basa Jawa',false,false,0),
('ceb','Cebuano','Cebuano',false,false,0),
('hmn','Hmong','Hmoob',false,false,0),
('ug','Uyghur','ئۇيغۇرچە',true,false,0),
('ti','Tigrinya','ትግርኛ',false,false,0)
ON CONFLICT (code) DO NOTHING;
