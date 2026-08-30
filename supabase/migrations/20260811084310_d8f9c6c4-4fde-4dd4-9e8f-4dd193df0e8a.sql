-- 1. Notifications INSERT: restrict to self, admin, or connected mentor/buddy/trainee
DROP POLICY IF EXISTS insert_notifications ON public.notifications;
CREATE POLICY insert_notifications ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (
  member_id = public.my_member_id()
  OR public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.trainees t
    WHERE (t.member_id = public.my_member_id()
            AND (notifications.member_id = t.mentor_member_id OR notifications.member_id = t.buddy_member_id))
       OR ((t.mentor_member_id = public.my_member_id() OR t.buddy_member_id = public.my_member_id())
            AND notifications.member_id = t.member_id)
  )
);

-- 2. Notifications UPDATE: WITH CHECK mirrors USING
DROP POLICY IF EXISTS update_own_notifications ON public.notifications;
CREATE POLICY update_own_notifications ON public.notifications
FOR UPDATE TO authenticated
USING (member_id = public.my_member_id() OR public.is_admin())
WITH CHECK (member_id = public.my_member_id() OR public.is_admin());

-- 3. Storage: uploads must land in the uploader's own member folder
DROP POLICY IF EXISTS resources_bucket_insert ON storage.objects;
CREATE POLICY resources_bucket_insert ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'resources'
  AND public.my_member_id() IS NOT NULL
  AND (storage.foldername(name))[1] = public.my_member_id()::text
);

-- 4. SECURITY DEFINER functions: not callable by anonymous visitors
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.my_member_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.my_trainee_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.supports_trainee(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_view_trainee(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_demo_seat(public.app_role, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.my_member_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.my_trainee_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.supports_trainee(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_view_trainee(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_demo_seat(public.app_role, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.touch_updated_at() TO service_role;