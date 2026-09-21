
-- 1. Widen admin visibility to boss_owner / ceo / admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role::text IN ('super_admin', 'master', 'boss_owner', 'ceo', 'admin')
  )
$function$;

CREATE OR REPLACE FUNCTION public.has_privileged_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('master', 'super_admin', 'boss_owner', 'ceo', 'admin')
  )
$function$;

-- 2. Signup handler: always create profile + role
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_role_text text;
  v_role public.app_role;
  v_status text;
BEGIN
  v_role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'client');

  BEGIN
    v_role := v_role_text::public.app_role;
  EXCEPTION WHEN others THEN
    v_role := 'client'::public.app_role;
  END;

  IF v_role::text IN ('client', 'prime') THEN
    v_status := 'approved';
  ELSE
    v_status := 'pending';
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role, approval_status)
  VALUES (NEW.id, v_role, v_status)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- 3. Backfill existing accounts
INSERT INTO public.profiles (user_id, email, full_name, display_name)
SELECT u.id, u.email,
       COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
       COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.id IS NULL;

INSERT INTO public.user_roles (user_id, role, approval_status)
SELECT u.id, 'client'::public.app_role, 'approved'
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE r.id IS NULL;
