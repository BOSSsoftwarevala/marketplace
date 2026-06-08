
-- ============================================
-- AMS CATALOG TABLES
-- ============================================

CREATE TABLE public.ams_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  icon text,
  points integer NOT NULL DEFAULT 0,
  xp_reward integer NOT NULL DEFAULT 0,
  rarity text NOT NULL DEFAULT 'common',
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  role_scope text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ams_achievements TO anon, authenticated;
GRANT ALL ON public.ams_achievements TO service_role;
ALTER TABLE public.ams_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_achievements_read_all" ON public.ams_achievements FOR SELECT USING (true);
CREATE POLICY "ams_achievements_admin_write" ON public.ams_achievements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'))
  WITH CHECK (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));

CREATE TABLE public.ams_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  tier text NOT NULL DEFAULT 'bronze',
  icon text,
  color text DEFAULT '#3B82F6',
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ams_badges TO anon, authenticated;
GRANT ALL ON public.ams_badges TO service_role;
ALTER TABLE public.ams_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_badges_read_all" ON public.ams_badges FOR SELECT USING (true);
CREATE POLICY "ams_badges_admin_write" ON public.ams_badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'))
  WITH CHECK (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));

CREATE TABLE public.ams_trophies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  tier text NOT NULL DEFAULT 'gold',
  season text,
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ams_trophies TO anon, authenticated;
GRANT ALL ON public.ams_trophies TO service_role;
ALTER TABLE public.ams_trophies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_trophies_read_all" ON public.ams_trophies FOR SELECT USING (true);
CREATE POLICY "ams_trophies_admin_write" ON public.ams_trophies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'))
  WITH CHECK (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));

CREATE TABLE public.ams_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  reward_type text NOT NULL DEFAULT 'digital',
  value_amount numeric DEFAULT 0,
  cost_points integer NOT NULL DEFAULT 0,
  stock integer,
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ams_rewards TO anon, authenticated;
GRANT ALL ON public.ams_rewards TO service_role;
ALTER TABLE public.ams_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_rewards_read_all" ON public.ams_rewards FOR SELECT USING (true);
CREATE POLICY "ams_rewards_admin_write" ON public.ams_rewards FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'))
  WITH CHECK (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));

CREATE TABLE public.ams_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number integer NOT NULL UNIQUE,
  name text NOT NULL,
  xp_required integer NOT NULL,
  perks jsonb DEFAULT '[]'::jsonb,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ams_levels TO anon, authenticated;
GRANT ALL ON public.ams_levels TO service_role;
ALTER TABLE public.ams_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_levels_read_all" ON public.ams_levels FOR SELECT USING (true);
CREATE POLICY "ams_levels_admin_write" ON public.ams_levels FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'))
  WITH CHECK (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));

CREATE TABLE public.ams_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  metric text NOT NULL,
  target_value numeric NOT NULL,
  reward_points integer DEFAULT 0,
  reward_id uuid REFERENCES public.ams_rewards(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ams_milestones TO anon, authenticated;
GRANT ALL ON public.ams_milestones TO service_role;
ALTER TABLE public.ams_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_milestones_read_all" ON public.ams_milestones FOR SELECT USING (true);
CREATE POLICY "ams_milestones_admin_write" ON public.ams_milestones FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'))
  WITH CHECK (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));

CREATE TABLE public.ams_leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  metric text NOT NULL DEFAULT 'xp',
  scope text NOT NULL DEFAULT 'global',
  period text NOT NULL DEFAULT 'all_time',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ams_leaderboards TO anon, authenticated;
GRANT ALL ON public.ams_leaderboards TO service_role;
ALTER TABLE public.ams_leaderboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_leaderboards_read_all" ON public.ams_leaderboards FOR SELECT USING (true);
CREATE POLICY "ams_leaderboards_admin_write" ON public.ams_leaderboards FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'))
  WITH CHECK (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));

-- ============================================
-- AMS USER STATE TABLES
-- ============================================

CREATE TABLE public.ams_user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  total_xp integer NOT NULL DEFAULT 0,
  total_points integer NOT NULL DEFAULT 0,
  current_level integer NOT NULL DEFAULT 1,
  achievements_count integer NOT NULL DEFAULT 0,
  badges_count integer NOT NULL DEFAULT 0,
  trophies_count integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.ams_user_progress TO authenticated;
GRANT ALL ON public.ams_user_progress TO service_role;
ALTER TABLE public.ams_user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_progress_select_own_or_admin" ON public.ams_user_progress FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));
CREATE POLICY "ams_progress_upsert_own" ON public.ams_user_progress FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "ams_progress_update_own" ON public.ams_user_progress FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.ams_user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.ams_achievements(id) ON DELETE CASCADE,
  progress numeric NOT NULL DEFAULT 0,
  unlocked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);
GRANT SELECT, INSERT, UPDATE ON public.ams_user_achievements TO authenticated;
GRANT ALL ON public.ams_user_achievements TO service_role;
ALTER TABLE public.ams_user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_ua_select" ON public.ams_user_achievements FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));
CREATE POLICY "ams_ua_insert_own" ON public.ams_user_achievements FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "ams_ua_update_own" ON public.ams_user_achievements FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.ams_user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.ams_badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);
GRANT SELECT, INSERT ON public.ams_user_badges TO authenticated;
GRANT ALL ON public.ams_user_badges TO service_role;
ALTER TABLE public.ams_user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_ub_select" ON public.ams_user_badges FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));
CREATE POLICY "ams_ub_insert_own" ON public.ams_user_badges FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE TABLE public.ams_user_trophies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trophy_id uuid NOT NULL REFERENCES public.ams_trophies(id) ON DELETE CASCADE,
  season text,
  rank integer,
  earned_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ams_user_trophies TO authenticated;
GRANT ALL ON public.ams_user_trophies TO service_role;
ALTER TABLE public.ams_user_trophies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_ut_select" ON public.ams_user_trophies FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));
CREATE POLICY "ams_ut_insert_own" ON public.ams_user_trophies FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE TABLE public.ams_user_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  milestone_id uuid NOT NULL REFERENCES public.ams_milestones(id) ON DELETE CASCADE,
  current_value numeric NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, milestone_id)
);
GRANT SELECT, INSERT, UPDATE ON public.ams_user_milestones TO authenticated;
GRANT ALL ON public.ams_user_milestones TO service_role;
ALTER TABLE public.ams_user_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_um_select" ON public.ams_user_milestones FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));
CREATE POLICY "ams_um_insert_own" ON public.ams_user_milestones FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "ams_um_update_own" ON public.ams_user_milestones FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.ams_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  streak_type text NOT NULL DEFAULT 'daily_login',
  current_count integer NOT NULL DEFAULT 0,
  longest_count integer NOT NULL DEFAULT 0,
  last_activity_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, streak_type)
);
GRANT SELECT, INSERT, UPDATE ON public.ams_streaks TO authenticated;
GRANT ALL ON public.ams_streaks TO service_role;
ALTER TABLE public.ams_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_streaks_select" ON public.ams_streaks FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));
CREATE POLICY "ams_streaks_insert_own" ON public.ams_streaks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "ams_streaks_update_own" ON public.ams_streaks FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.ams_xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  source text NOT NULL,
  reference_id uuid,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ams_xp_events TO authenticated;
GRANT ALL ON public.ams_xp_events TO service_role;
ALTER TABLE public.ams_xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_xp_select" ON public.ams_xp_events FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));
CREATE POLICY "ams_xp_insert_own" ON public.ams_xp_events FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE TABLE public.ams_user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reward_id uuid NOT NULL REFERENCES public.ams_rewards(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'claimed',
  claimed_at timestamptz NOT NULL DEFAULT now(),
  fulfilled_at timestamptz,
  points_spent integer NOT NULL DEFAULT 0,
  meta jsonb DEFAULT '{}'::jsonb
);
GRANT SELECT, INSERT ON public.ams_user_rewards TO authenticated;
GRANT ALL ON public.ams_user_rewards TO service_role;
ALTER TABLE public.ams_user_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_ur_select" ON public.ams_user_rewards FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));
CREATE POLICY "ams_ur_insert_own" ON public.ams_user_rewards FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE TABLE public.ams_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reward_id uuid NOT NULL REFERENCES public.ams_rewards(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid,
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.ams_claims TO authenticated;
GRANT ALL ON public.ams_claims TO service_role;
ALTER TABLE public.ams_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_claims_select" ON public.ams_claims FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));
CREATE POLICY "ams_claims_insert_own" ON public.ams_claims FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "ams_claims_admin_update" ON public.ams_claims FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'))
  WITH CHECK (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));

CREATE TABLE public.ams_leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_id uuid NOT NULL REFERENCES public.ams_leaderboards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  score numeric NOT NULL DEFAULT 0,
  rank integer,
  period_key text NOT NULL DEFAULT 'all_time',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (leaderboard_id, user_id, period_key)
);
GRANT SELECT, INSERT, UPDATE ON public.ams_leaderboard_entries TO authenticated;
GRANT ALL ON public.ams_leaderboard_entries TO service_role;
ALTER TABLE public.ams_leaderboard_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_lb_read_all" ON public.ams_leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "ams_lb_upsert_own" ON public.ams_leaderboard_entries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "ams_lb_update_own" ON public.ams_leaderboard_entries FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.ams_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notif_type text NOT NULL,
  title text NOT NULL,
  body text,
  reference_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.ams_notifications TO authenticated;
GRANT ALL ON public.ams_notifications TO service_role;
ALTER TABLE public.ams_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_notif_select_own" ON public.ams_notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'boss_owner'));
CREATE POLICY "ams_notif_insert_own" ON public.ams_notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "ams_notif_update_own" ON public.ams_notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.ams_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ams_audit_logs TO authenticated;
GRANT ALL ON public.ams_audit_logs TO service_role;
ALTER TABLE public.ams_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_audit_admin_select" ON public.ams_audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'boss_owner') OR public.has_role(auth.uid(), 'ceo'));
CREATE POLICY "ams_audit_insert" ON public.ams_audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.ams_set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_ams_ach_upd BEFORE UPDATE ON public.ams_achievements FOR EACH ROW EXECUTE FUNCTION public.ams_set_updated_at();
CREATE TRIGGER trg_ams_badges_upd BEFORE UPDATE ON public.ams_badges FOR EACH ROW EXECUTE FUNCTION public.ams_set_updated_at();
CREATE TRIGGER trg_ams_trophies_upd BEFORE UPDATE ON public.ams_trophies FOR EACH ROW EXECUTE FUNCTION public.ams_set_updated_at();
CREATE TRIGGER trg_ams_rewards_upd BEFORE UPDATE ON public.ams_rewards FOR EACH ROW EXECUTE FUNCTION public.ams_set_updated_at();
CREATE TRIGGER trg_ams_milestones_upd BEFORE UPDATE ON public.ams_milestones FOR EACH ROW EXECUTE FUNCTION public.ams_set_updated_at();
CREATE TRIGGER trg_ams_progress_upd BEFORE UPDATE ON public.ams_user_progress FOR EACH ROW EXECUTE FUNCTION public.ams_set_updated_at();
CREATE TRIGGER trg_ams_um_upd BEFORE UPDATE ON public.ams_user_milestones FOR EACH ROW EXECUTE FUNCTION public.ams_set_updated_at();
CREATE TRIGGER trg_ams_streaks_upd BEFORE UPDATE ON public.ams_streaks FOR EACH ROW EXECUTE FUNCTION public.ams_set_updated_at();
CREATE TRIGGER trg_ams_claims_upd BEFORE UPDATE ON public.ams_claims FOR EACH ROW EXECUTE FUNCTION public.ams_set_updated_at();

-- Indexes
CREATE INDEX idx_ams_ua_user ON public.ams_user_achievements(user_id);
CREATE INDEX idx_ams_ub_user ON public.ams_user_badges(user_id);
CREATE INDEX idx_ams_ut_user ON public.ams_user_trophies(user_id);
CREATE INDEX idx_ams_ur_user ON public.ams_user_rewards(user_id);
CREATE INDEX idx_ams_xp_user ON public.ams_xp_events(user_id, created_at DESC);
CREATE INDEX idx_ams_claims_status ON public.ams_claims(status);
CREATE INDEX idx_ams_notif_user_read ON public.ams_notifications(user_id, is_read);
CREATE INDEX idx_ams_lb_entries_lb ON public.ams_leaderboard_entries(leaderboard_id, score DESC);
