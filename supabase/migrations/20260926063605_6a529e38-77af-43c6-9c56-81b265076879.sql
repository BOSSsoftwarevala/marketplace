CREATE OR REPLACE FUNCTION public.auto_approve_privileged_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.role IN ('master', 'super_admin', 'prime', 'client') THEN
    NEW.approval_status := 'approved';
    NEW.approved_at := COALESCE(NEW.approved_at, NOW());
  ELSE
    NEW.approval_status := COALESCE(NEW.approval_status, 'pending');
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_auto_approve_roles ON public.user_roles;