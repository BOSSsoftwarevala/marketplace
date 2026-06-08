import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Generic typed table helper
const sb = supabase as any;

const log = async (action: string, entity_type?: string, entity_id?: string, meta?: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await sb.from("ams_audit_logs").insert({ user_id: user?.id, action, entity_type, entity_id, meta: meta || {} });
  } catch {}
};

const notify = async (user_id: string, notif_type: string, title: string, body?: string, reference_id?: string) => {
  try {
    await sb.from("ams_notifications").insert({ user_id, notif_type, title, body, reference_id });
  } catch {}
};

export function useAMSCatalog<T = any>(table: string, key: string) {
  return useQuery({
    queryKey: ["ams", key],
    queryFn: async () => {
      const { data, error } = await sb.from(table).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as T[];
    },
  });
}

export function useAMSAchievements() { return useAMSCatalog("ams_achievements", "achievements"); }
export function useAMSBadges() { return useAMSCatalog("ams_badges", "badges"); }
export function useAMSTrophies() { return useAMSCatalog("ams_trophies", "trophies"); }
export function useAMSRewards() { return useAMSCatalog("ams_rewards", "rewards"); }
export function useAMSLevels() {
  return useQuery({
    queryKey: ["ams", "levels"],
    queryFn: async () => {
      const { data, error } = await sb.from("ams_levels").select("*").order("level_number", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}
export function useAMSMilestones() { return useAMSCatalog("ams_milestones", "milestones"); }
export function useAMSLeaderboards() { return useAMSCatalog("ams_leaderboards", "leaderboards"); }

export function useAMSProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ams", "progress", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await sb.from("ams_user_progress").select("*").eq("user_id", user!.id).maybeSingle();
      if (!data) {
        const { data: created } = await sb.from("ams_user_progress").insert({ user_id: user!.id }).select().single();
        return created;
      }
      return data;
    },
  });
}

export function useMyAchievements() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ams", "my-achievements", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await sb.from("ams_user_achievements").select("*, ams_achievements(*)").eq("user_id", user!.id);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useMyBadges() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ams", "my-badges", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await sb.from("ams_user_badges").select("*, ams_badges(*)").eq("user_id", user!.id);
      return data || [];
    },
  });
}

export function useMyTrophies() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ams", "my-trophies", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await sb.from("ams_user_trophies").select("*, ams_trophies(*)").eq("user_id", user!.id);
      return data || [];
    },
  });
}

export function useMyRewards() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ams", "my-rewards", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await sb.from("ams_user_rewards").select("*, ams_rewards(*)").eq("user_id", user!.id).order("claimed_at", { ascending: false });
      return data || [];
    },
  });
}

export function useMyStreaks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ams", "my-streaks", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await sb.from("ams_streaks").select("*").eq("user_id", user!.id);
      return data || [];
    },
  });
}

export function useMyMilestones() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ams", "my-milestones", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await sb.from("ams_user_milestones").select("*, ams_milestones(*)").eq("user_id", user!.id);
      return data || [];
    },
  });
}

export function useMyXPLedger() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ams", "xp-ledger", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await sb.from("ams_xp_events").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
  });
}

export function useMyNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ams", "notifications", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await sb.from("ams_notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    refetchInterval: 30000,
  });
}

export function useLeaderboardEntries(leaderboardId?: string) {
  return useQuery({
    queryKey: ["ams", "lb-entries", leaderboardId],
    enabled: !!leaderboardId,
    queryFn: async () => {
      const { data } = await sb.from("ams_leaderboard_entries").select("*").eq("leaderboard_id", leaderboardId).order("score", { ascending: false }).limit(100);
      return data || [];
    },
  });
}

export function useMyClaims() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ams", "my-claims", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await sb.from("ams_claims").select("*, ams_rewards(*)").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
  });
}

export function useAllClaims() {
  return useQuery({
    queryKey: ["ams", "all-claims"],
    queryFn: async () => {
      const { data } = await sb.from("ams_claims").select("*, ams_rewards(*)").order("created_at", { ascending: false });
      return data || [];
    },
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ["ams", "audit-logs"],
    queryFn: async () => {
      const { data } = await sb.from("ams_audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });
}

// ==================== ENGINES ====================

export function useXPEngine() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount, source, reference_id }: { amount: number; source: string; reference_id?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      await sb.from("ams_xp_events").insert({ user_id: user.id, amount, source, reference_id });
      const { data: prog } = await sb.from("ams_user_progress").select("*").eq("user_id", user.id).maybeSingle();
      const newXP = (prog?.total_xp || 0) + amount;
      const newPoints = (prog?.total_points || 0) + amount;
      const { data: levels } = await sb.from("ams_levels").select("*").lte("xp_required", newXP).order("level_number", { ascending: false }).limit(1);
      const newLevel = levels?.[0]?.level_number || prog?.current_level || 1;
      const leveledUp = newLevel > (prog?.current_level || 1);
      if (prog) {
        await sb.from("ams_user_progress").update({ total_xp: newXP, total_points: newPoints, current_level: newLevel, last_activity_at: new Date().toISOString() }).eq("user_id", user.id);
      } else {
        await sb.from("ams_user_progress").insert({ user_id: user.id, total_xp: newXP, total_points: newPoints, current_level: newLevel, last_activity_at: new Date().toISOString() });
      }
      if (leveledUp) {
        await notify(user.id, "level_up", `Level ${newLevel} reached!`, `You leveled up to level ${newLevel}.`);
      }
      await log("xp_granted", "xp_event", undefined, { amount, source });
      return { newXP, newLevel, leveledUp };
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["ams"] });
      if (r.leveledUp) toast.success(`🎉 Level Up! You are now level ${r.newLevel}`);
    },
  });
}

export function useAchievementEngine() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const xp = useXPEngine();
  return useMutation({
    mutationFn: async (achievement_id: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data: ach } = await sb.from("ams_achievements").select("*").eq("id", achievement_id).single();
      if (!ach) throw new Error("Achievement not found");
      const { data: existing } = await sb.from("ams_user_achievements").select("*").eq("user_id", user.id).eq("achievement_id", achievement_id).maybeSingle();
      if (existing?.unlocked_at) throw new Error("Already unlocked");
      if (existing) {
        await sb.from("ams_user_achievements").update({ progress: 100, unlocked_at: new Date().toISOString() }).eq("id", existing.id);
      } else {
        await sb.from("ams_user_achievements").insert({ user_id: user.id, achievement_id, progress: 100, unlocked_at: new Date().toISOString() });
      }
      const { data: prog } = await sb.from("ams_user_progress").select("achievements_count").eq("user_id", user.id).maybeSingle();
      await sb.from("ams_user_progress").update({ achievements_count: (prog?.achievements_count || 0) + 1 }).eq("user_id", user.id);
      if (ach.xp_reward > 0) await xp.mutateAsync({ amount: ach.xp_reward, source: "achievement", reference_id: achievement_id });
      await notify(user.id, "achievement", `Achievement unlocked: ${ach.name}`, ach.description, achievement_id);
      await log("achievement_unlocked", "achievement", achievement_id);
      return ach;
    },
    onSuccess: (a) => { qc.invalidateQueries({ queryKey: ["ams"] }); toast.success(`🏆 ${a.name} unlocked!`); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useBadgeEngine() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (badge_id: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data: badge } = await sb.from("ams_badges").select("*").eq("id", badge_id).single();
      await sb.from("ams_user_badges").insert({ user_id: user.id, badge_id });
      const { data: prog } = await sb.from("ams_user_progress").select("badges_count").eq("user_id", user.id).maybeSingle();
      await sb.from("ams_user_progress").update({ badges_count: (prog?.badges_count || 0) + 1 }).eq("user_id", user.id);
      await notify(user.id, "badge", `Badge earned: ${badge?.name}`, undefined, badge_id);
      await log("badge_earned", "badge", badge_id);
      return badge;
    },
    onSuccess: (b) => { qc.invalidateQueries({ queryKey: ["ams"] }); toast.success(`🎖 Badge: ${b?.name}`); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useTrophyEngine() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ trophy_id, rank, season }: { trophy_id: string; rank?: number; season?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data: trophy } = await sb.from("ams_trophies").select("*").eq("id", trophy_id).single();
      await sb.from("ams_user_trophies").insert({ user_id: user.id, trophy_id, rank, season });
      const { data: prog } = await sb.from("ams_user_progress").select("trophies_count").eq("user_id", user.id).maybeSingle();
      await sb.from("ams_user_progress").update({ trophies_count: (prog?.trophies_count || 0) + 1 }).eq("user_id", user.id);
      await notify(user.id, "trophy", `Trophy: ${trophy?.name}`, undefined, trophy_id);
      await log("trophy_earned", "trophy", trophy_id, { rank, season });
      return trophy;
    },
    onSuccess: (t) => { qc.invalidateQueries({ queryKey: ["ams"] }); toast.success(`🏆 Trophy: ${t?.name}`); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useStreakEngine() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (streak_type: string = "daily_login") => {
      if (!user?.id) throw new Error("Not authenticated");
      const today = new Date().toISOString().slice(0, 10);
      const { data: existing } = await sb.from("ams_streaks").select("*").eq("user_id", user.id).eq("streak_type", streak_type).maybeSingle();
      let current = 1, longest = 1;
      if (existing) {
        if (existing.last_activity_date === today) return existing;
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        current = existing.last_activity_date === yesterday ? existing.current_count + 1 : 1;
        longest = Math.max(existing.longest_count, current);
        await sb.from("ams_streaks").update({ current_count: current, longest_count: longest, last_activity_date: today }).eq("id", existing.id);
      } else {
        await sb.from("ams_streaks").insert({ user_id: user.id, streak_type, current_count: 1, longest_count: 1, last_activity_date: today });
      }
      await sb.from("ams_user_progress").update({ current_streak: current, longest_streak: longest }).eq("user_id", user.id);
      await log("streak_updated", "streak", undefined, { streak_type, current });
      return { current, longest };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ams"] }),
  });
}

export function useMilestoneEngine() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ milestone_id, delta }: { milestone_id: string; delta: number }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data: m } = await sb.from("ams_milestones").select("*").eq("id", milestone_id).single();
      const { data: existing } = await sb.from("ams_user_milestones").select("*").eq("user_id", user.id).eq("milestone_id", milestone_id).maybeSingle();
      const newVal = (existing?.current_value || 0) + delta;
      const completed = newVal >= (m?.target_value || Infinity);
      const payload: any = { current_value: newVal };
      if (completed && !existing?.completed_at) payload.completed_at = new Date().toISOString();
      if (existing) await sb.from("ams_user_milestones").update(payload).eq("id", existing.id);
      else await sb.from("ams_user_milestones").insert({ user_id: user.id, milestone_id, ...payload });
      if (completed) await notify(user.id, "milestone", `Milestone reached: ${m?.name}`, undefined, milestone_id);
      await log("milestone_progress", "milestone", milestone_id, { newVal, completed });
      return { newVal, completed };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ams"] }),
  });
}

export function useRewardClaim() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reward_id: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data: r } = await sb.from("ams_rewards").select("*").eq("id", reward_id).single();
      if (!r) throw new Error("Reward not found");
      const { data: prog } = await sb.from("ams_user_progress").select("total_points").eq("user_id", user.id).maybeSingle();
      if ((prog?.total_points || 0) < r.cost_points) throw new Error("Insufficient points");
      await sb.from("ams_claims").insert({ user_id: user.id, reward_id, status: "pending" });
      await sb.from("ams_user_progress").update({ total_points: (prog?.total_points || 0) - r.cost_points }).eq("user_id", user.id);
      await log("reward_claim_requested", "reward", reward_id);
      return r;
    },
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: ["ams"] }); toast.success(`Claim requested: ${r.name}`); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useApproveClaim() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ claim_id, approve }: { claim_id: string; approve: boolean }) => {
      const status = approve ? "approved" : "rejected";
      const { data: claim } = await sb.from("ams_claims").select("*, ams_rewards(*)").eq("id", claim_id).single();
      await sb.from("ams_claims").update({ status, approved_by: user?.id, approved_at: new Date().toISOString() }).eq("id", claim_id);
      if (approve && claim) {
        await sb.from("ams_user_rewards").insert({ user_id: claim.user_id, reward_id: claim.reward_id, status: "fulfilled", points_spent: claim.ams_rewards?.cost_points || 0, fulfilled_at: new Date().toISOString() });
        await notify(claim.user_id, "reward_approved", `Reward approved: ${claim.ams_rewards?.name}`);
      } else if (claim) {
        // refund
        const { data: prog } = await sb.from("ams_user_progress").select("total_points").eq("user_id", claim.user_id).maybeSingle();
        await sb.from("ams_user_progress").update({ total_points: (prog?.total_points || 0) + (claim.ams_rewards?.cost_points || 0) }).eq("user_id", claim.user_id);
        await notify(claim.user_id, "reward_rejected", `Reward rejected: ${claim.ams_rewards?.name}`);
      }
      await log("claim_" + status, "claim", claim_id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ams"] }); toast.success("Claim updated"); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ==================== ADMIN CRUD ====================
export function useUpsertCatalog(table: string, key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: any) => {
      const { id, ...rest } = record;
      if (id) {
        const { data, error } = await sb.from(table).update(rest).eq("id", id).select().single();
        if (error) throw error;
        await log(`${key}_updated`, key, id);
        return data;
      } else {
        const { data, error } = await sb.from(table).insert(rest).select().single();
        if (error) throw error;
        await log(`${key}_created`, key, data?.id);
        return data;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ams"] }); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteCatalog(table: string, key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from(table).update({ is_active: false }).eq("id", id);
      if (error) throw error;
      await log(`${key}_deactivated`, key, id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ams"] }); toast.success("Deactivated"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await sb.from("ams_notifications").update({ is_read: true }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ams", "notifications"] }),
  });
}

export function useAMSAnalytics() {
  return useQuery({
    queryKey: ["ams", "analytics"],
    queryFn: async () => {
      const [users, claims, xpEvents, achievements] = await Promise.all([
        sb.from("ams_user_progress").select("total_xp, total_points, current_level, achievements_count, badges_count, trophies_count"),
        sb.from("ams_claims").select("status"),
        sb.from("ams_xp_events").select("amount, created_at").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
        sb.from("ams_user_achievements").select("achievement_id, unlocked_at").not("unlocked_at", "is", null),
      ]);
      const totalUsers = users.data?.length || 0;
      const totalXP = users.data?.reduce((s: number, r: any) => s + (r.total_xp || 0), 0) || 0;
      const avgLevel = totalUsers ? users.data!.reduce((s: number, r: any) => s + (r.current_level || 0), 0) / totalUsers : 0;
      const pendingClaims = claims.data?.filter((c: any) => c.status === "pending").length || 0;
      const xpLast30 = xpEvents.data?.reduce((s: number, r: any) => s + (r.amount || 0), 0) || 0;
      const totalUnlocks = achievements.data?.length || 0;
      return { totalUsers, totalXP, avgLevel: Math.round(avgLevel * 10) / 10, pendingClaims, xpLast30, totalUnlocks };
    },
    refetchInterval: 60000,
  });
}
