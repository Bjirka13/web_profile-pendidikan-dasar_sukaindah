-- ============================================================
-- 1. EXTEND school_admins FOR LOGIN
-- ============================================================
ALTER TABLE public.school_admins
  ADD COLUMN IF NOT EXISTS password_hash text;

ALTER TABLE public.school_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school_admins_backend_read" ON public.school_admins;

CREATE POLICY "school_admins_backend_read" ON public.school_admins
  FOR SELECT
  USING (true);

-- ============================================================
-- 2. SEED SCHOOL ADMINS (sesuaikan dengan data sekolah)
-- ============================================================
-- ops1@admin.com -> school_id 1 (SDN Sukaindah 01)
INSERT INTO public.school_admins (admin_email, password_hash, school_id, sdn_folder)
VALUES (
  'ops1@admin.com',
  'cG9ydGFsLXBlbmRpZGlrYW4tYWRtaW4tdjE6b3BzMUBhZG1pbi5jb206cGFzc3dvcmQ=',
  1,
  'SDN_01'
)
ON CONFLICT (admin_email) DO UPDATE
SET
  password_hash = excluded.password_hash,
  school_id = excluded.school_id,
  sdn_folder = excluded.sdn_folder;

-- ops2@admin.com -> school_id 2 (SDN Sukaindah 02)
INSERT INTO public.school_admins (admin_email, password_hash, school_id, sdn_folder)
VALUES (
  'ops2@admin.com',
  'cG9ydGFsLXBlbmRpZGlrYW4tYWRtaW4tdjE6b3BzMkBhZG1pbi5jb206cGFzc3dvcmQ=',
  2,
  'SDN_02'
)
ON CONFLICT (admin_email) DO UPDATE
SET
  password_hash = excluded.password_hash,
  school_id = excluded.school_id,
  sdn_folder = excluded.sdn_folder;

-- ops3@admin.com -> school_id 4 (SDN Sukaindah 03)
INSERT INTO public.school_admins (admin_email, password_hash, school_id, sdn_folder)
VALUES (
  'ops3@admin.com',
  'cG9ydGFsLXBlbmRpZGlrYW4tYWRtaW4tdjE6b3BzM0BhZG1pbi5jb206cGFzc3dvcmQ=',
  4,
  'SDN_03'
)
ON CONFLICT (admin_email) DO UPDATE
SET
  password_hash = excluded.password_hash,
  school_id = excluded.school_id,
  sdn_folder = excluded.sdn_folder;

-- ops4@admin.com -> school_id 3 (SDN Sukaindah 04)
INSERT INTO public.school_admins (admin_email, password_hash, school_id, sdn_folder)
VALUES (
  'ops4@admin.com',
  'cG9ydGFsLXBlbmRpZGlrYW4tYWRtaW4tdjE6b3BzNEBhZG1pbi5jb206cGFzc3dvcmQ=',
  3,
  'SDN_04'
)
ON CONFLICT (admin_email) DO UPDATE
SET
  password_hash = excluded.password_hash,
  school_id = excluded.school_id,
  sdn_folder = excluded.sdn_folder;

-- ============================================================
-- 3. ADD PUBLIC READ POLICIES (untuk unauthenticated users)
-- ============================================================

-- Public read for schools
DROP POLICY IF EXISTS "schools_public_read" ON public.schools;
CREATE POLICY "schools_public_read" ON public.schools
  FOR SELECT
  USING (true);

-- Public read for school_principals
DROP POLICY IF EXISTS "school_principals_public_read" ON public.school_principals;
CREATE POLICY "school_principals_public_read" ON public.school_principals
  FOR SELECT
  USING (true);

-- Public read for school_staff
DROP POLICY IF EXISTS "school_staff_public_read" ON public.school_staff;
CREATE POLICY "school_staff_public_read" ON public.school_staff
  FOR SELECT
  USING (true);

-- Public read for school_teachers
DROP POLICY IF EXISTS "school_teachers_public_read" ON public.school_teachers;
CREATE POLICY "school_teachers_public_read" ON public.school_teachers
  FOR SELECT
  USING (true);

-- Public read for school_facilities_ui
DROP POLICY IF EXISTS "school_facilities_ui_public_read" ON public.school_facilities_ui;
CREATE POLICY "school_facilities_ui_public_read" ON public.school_facilities_ui
  FOR SELECT
  USING (true);

-- Public read for school_news
DROP POLICY IF EXISTS "school_news_public_read" ON public.school_news;
CREATE POLICY "school_news_public_read" ON public.school_news
  FOR SELECT
  USING (true);

-- Public read for school_gallery
DROP POLICY IF EXISTS "school_gallery_public_read" ON public.school_gallery;
CREATE POLICY "school_gallery_public_read" ON public.school_gallery
  FOR SELECT
  USING (true);

-- Public read for school_achievements
DROP POLICY IF EXISTS "school_achievements_public_read" ON public.school_achievements;
CREATE POLICY "school_achievements_public_read" ON public.school_achievements
  FOR SELECT
  USING (true);

-- Public read for school_role_stats
DROP POLICY IF EXISTS "school_role_stats_public_read" ON public.school_role_stats;
CREATE POLICY "school_role_stats_public_read" ON public.school_role_stats
  FOR SELECT
  USING (true);

-- ============================================================
-- Verify setup
-- ============================================================
SELECT 'school_admins configured' as status, COUNT(*) as admin_count FROM public.school_admins;
SELECT 'Public read policies added' as status;
