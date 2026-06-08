import CatalogManager from "./CatalogManager";
import { useAMSAchievements, useAMSBadges, useAMSTrophies, useAMSRewards, useAMSLevels, useAMSMilestones, useAMSLeaderboards, useMyAchievements, useMyBadges, useMyTrophies, useMyRewards, useMyStreaks, useMyMilestones, useMyXPLedger, useMyNotifications, useMyClaims, useAllClaims, useAuditLogs, useAMSAnalytics, useAMSProgress, useLeaderboardEntries, useXPEngine, useStreakEngine, useRewardClaim, useApproveClaim, useMarkNotificationRead, useAchievementEngine } from "@/hooks/useAMS";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Check, X, Bell, Zap, Flame, Trophy, Gift, History, Shield, Calendar, Layers, GitBranch, Settings as SettingsIcon } from "lucide-react";

export function Achievements() {
  const q = useAMSAchievements();
  return <CatalogManager title="Achievements" description="Catalog of unlockable achievements" table="ams_achievements" cacheKey="achievements" items={q.data || []} isLoading={q.isLoading}
    fields={[
      { key: "name", label: "Name", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "category", label: "Category" },
      { key: "icon", label: "Icon" },
      { key: "points", label: "Points", type: "number" },
      { key: "xp_reward", label: "XP Reward", type: "number" },
      { key: "rarity", label: "Rarity", type: "select", options: ["common", "rare", "epic", "legendary"] },
      { key: "role_scope", label: "Role Scope (optional)" },
    ]}
    displayBadges={(i) => [{ label: i.rarity }, { label: `${i.points} pts` }, { label: `${i.xp_reward} XP` }]}
  />;
}

export function Badges() {
  const q = useAMSBadges();
  return <CatalogManager title="Badges" table="ams_badges" cacheKey="badges" items={q.data || []} isLoading={q.isLoading}
    fields={[
      { key: "name", label: "Name" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "tier", label: "Tier", type: "select", options: ["bronze", "silver", "gold", "platinum", "diamond"] },
      { key: "icon", label: "Icon" },
      { key: "color", label: "Color (#hex)" },
    ]} displayBadges={(i) => [{ label: i.tier }]}
  />;
}

export function Trophies() {
  const q = useAMSTrophies();
  return <CatalogManager title="Trophies" table="ams_trophies" cacheKey="trophies" items={q.data || []} isLoading={q.isLoading}
    fields={[
      { key: "name", label: "Name" }, { key: "description", label: "Description", type: "textarea" },
      { key: "tier", label: "Tier", type: "select", options: ["bronze", "silver", "gold", "platinum"] },
      { key: "season", label: "Season" }, { key: "icon", label: "Icon" },
    ]} displayBadges={(i) => [{ label: i.tier }, { label: i.season || "all-time" }]}
  />;
}

export function Rewards() {
  const q = useAMSRewards();
  return <CatalogManager title="Rewards Catalog" table="ams_rewards" cacheKey="rewards" items={q.data || []} isLoading={q.isLoading}
    fields={[
      { key: "name", label: "Name" }, { key: "description", label: "Description", type: "textarea" },
      { key: "reward_type", label: "Type", type: "select", options: ["digital", "physical", "voucher", "credit", "perk"] },
      { key: "value_amount", label: "Value", type: "number" },
      { key: "cost_points", label: "Cost (points)", type: "number" },
      { key: "stock", label: "Stock", type: "number" }, { key: "icon", label: "Icon" },
    ]} displayBadges={(i) => [{ label: i.reward_type }, { label: `${i.cost_points} pts` }]}
  />;
}

export function Levels() {
  const q = useAMSLevels();
  return <CatalogManager title="Levels" table="ams_levels" cacheKey="levels" items={q.data || []} isLoading={q.isLoading}
    fields={[
      { key: "level_number", label: "Level Number", type: "number" },
      { key: "name", label: "Name" },
      { key: "xp_required", label: "XP Required", type: "number" }, { key: "icon", label: "Icon" },
    ]} displayBadges={(i) => [{ label: `Lvl ${i.level_number}` }, { label: `${i.xp_required} XP` }]}
  />;
}

export function Milestones() {
  const q = useAMSMilestones();
  return <CatalogManager title="Milestones" table="ams_milestones" cacheKey="milestones" items={q.data || []} isLoading={q.isLoading}
    fields={[
      { key: "name", label: "Name" }, { key: "description", label: "Description", type: "textarea" },
      { key: "metric", label: "Metric (e.g. tasks_completed)" },
      { key: "target_value", label: "Target", type: "number" },
      { key: "reward_points", label: "Reward Points", type: "number" },
    ]} displayBadges={(i) => [{ label: i.metric }, { label: `${i.target_value}` }]}
  />;
}

export function Leaderboards() {
  const q = useAMSLeaderboards();
  const [selected, setSelected] = useState<string | undefined>();
  const entries = useLeaderboardEntries(selected);
  return (
    <div className="space-y-4">
      <CatalogManager title="Leaderboards" table="ams_leaderboards" cacheKey="leaderboards" items={q.data || []} isLoading={q.isLoading}
        fields={[
          { key: "name", label: "Name" }, { key: "description", label: "Description", type: "textarea" },
          { key: "metric", label: "Metric", type: "select", options: ["xp", "points", "achievements", "streak"] },
          { key: "scope", label: "Scope", type: "select", options: ["global", "role", "team"] },
          { key: "period", label: "Period", type: "select", options: ["all_time", "monthly", "weekly", "daily"] },
        ]}
        displayBadges={(i) => [{ label: i.metric }, { label: i.period }]}
      />
      <Card>
        <CardHeader><CardTitle>Standings</CardTitle></CardHeader>
        <CardContent>
          <select className="mb-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={selected || ""} onChange={(e) => setSelected(e.target.value || undefined)}>
            <option value="">Select a leaderboard…</option>
            {q.data?.map((lb: any) => <option key={lb.id} value={lb.id}>{lb.name}</option>)}
          </select>
          {entries.data?.length ? (
            <ol className="space-y-1">
              {entries.data.map((e: any, i: number) => (
                <li key={e.id} className="flex justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                  <span>#{i + 1} • {e.user_id.slice(0, 8)}</span>
                  <span className="font-bold">{e.score}</span>
                </li>
              ))}
            </ol>
          ) : <p className="text-sm text-muted-foreground">No entries yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export function XPEngine() {
  const xp = useXPEngine();
  const ledger = useMyXPLedger();
  const [amount, setAmount] = useState(10);
  const [source, setSource] = useState("manual");
  return (
    <div className="space-y-4">
      <div><h2 className="text-2xl font-bold">XP Engine</h2><p className="text-muted-foreground text-sm">Grant XP to yourself for testing/integration.</p></div>
      <Card><CardContent className="flex gap-2 p-4">
        <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-32" />
        <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="source" />
        <Button onClick={() => xp.mutate({ amount, source })} disabled={xp.isPending}><Zap className="h-4 w-4 mr-1" />Grant XP</Button>
      </CardContent></Card>
      <Card>
        <CardHeader><CardTitle>XP Ledger</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1">
            {ledger.data?.map((e: any) => (
              <div key={e.id} className="flex justify-between rounded bg-muted/40 px-3 py-2 text-sm">
                <span>{e.source}</span>
                <span className={e.amount >= 0 ? "text-green-500" : "text-red-500"}>{e.amount >= 0 ? "+" : ""}{e.amount}</span>
              </div>
            ))}
            {!ledger.data?.length && <p className="text-sm text-muted-foreground">No XP events yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function Streaks() {
  const s = useMyStreaks();
  const eng = useStreakEngine();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Streaks</h2><p className="text-muted-foreground text-sm">Daily activity streaks.</p></div>
        <Button onClick={() => eng.mutate("daily_login")}><Flame className="h-4 w-4 mr-1" />Check In</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {s.data?.map((st: any) => (
          <Card key={st.id}>
            <CardHeader><CardTitle className="text-base">{st.streak_type}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{st.current_count}🔥</p>
              <p className="text-xs text-muted-foreground">Longest: {st.longest_count}</p>
            </CardContent>
          </Card>
        ))}
        {!s.data?.length && <p className="text-muted-foreground text-sm">No streaks yet — check in to start one.</p>}
      </div>
    </div>
  );
}

export function MyProgress() {
  const { data: p } = useAMSProgress();
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Progress</h2>
      <Card><CardContent className="space-y-4 p-6">
        <div>
          <div className="flex justify-between text-sm"><span>Level {p?.current_level ?? 1}</span><span>{p?.total_xp ?? 0} XP</span></div>
          <Progress value={Math.min(100, ((p?.total_xp || 0) % 1000) / 10)} className="mt-2" />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div><p className="text-muted-foreground">Points</p><p className="text-xl font-bold">{p?.total_points ?? 0}</p></div>
          <div><p className="text-muted-foreground">Achievements</p><p className="text-xl font-bold">{p?.achievements_count ?? 0}</p></div>
          <div><p className="text-muted-foreground">Badges</p><p className="text-xl font-bold">{p?.badges_count ?? 0}</p></div>
          <div><p className="text-muted-foreground">Trophies</p><p className="text-xl font-bold">{p?.trophies_count ?? 0}</p></div>
        </div>
      </CardContent></Card>
    </div>
  );
}

export function MyAchievements() {
  const q = useMyAchievements();
  const all = useAMSAchievements();
  const unlock = useAchievementEngine();
  const unlockedIds = new Set(q.data?.filter((a: any) => a.unlocked_at).map((a: any) => a.achievement_id) || []);
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Achievements</h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {all.data?.map((a: any) => {
          const isUnlocked = unlockedIds.has(a.id);
          return (
            <Card key={a.id} className={isUnlocked ? "border-primary" : "opacity-60"}>
              <CardHeader className="pb-2"><CardTitle className="text-base">{a.name}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">{a.description}</p>
                <div className="flex justify-between">
                  <Badge variant="secondary">{a.rarity}</Badge>
                  {isUnlocked ? <Badge>Unlocked</Badge> : <Button size="sm" variant="outline" onClick={() => unlock.mutate(a.id)}>Claim</Button>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function MyBadges() {
  const q = useMyBadges();
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Badges</h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {q.data?.map((b: any) => (
          <Card key={b.id}>
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: b.ams_badges?.color || "hsl(var(--primary))" }}>
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <p className="font-medium">{b.ams_badges?.name}</p>
              <p className="text-xs text-muted-foreground">{b.ams_badges?.tier}</p>
            </CardContent>
          </Card>
        ))}
        {!q.data?.length && <p className="text-sm text-muted-foreground">No badges yet.</p>}
      </div>
    </div>
  );
}

export function MyTrophies() {
  const q = useMyTrophies();
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Trophies</h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {q.data?.map((t: any) => (
          <Card key={t.id}><CardContent className="p-4">
            <Trophy className="mb-2 h-8 w-8 text-yellow-500" />
            <p className="font-medium">{t.ams_trophies?.name}</p>
            <p className="text-xs text-muted-foreground">{t.ams_trophies?.tier} • {t.season || "all-time"}{t.rank ? ` • Rank #${t.rank}` : ""}</p>
          </CardContent></Card>
        ))}
        {!q.data?.length && <p className="text-sm text-muted-foreground">No trophies yet.</p>}
      </div>
    </div>
  );
}

export function MyRewards() {
  const q = useMyRewards();
  const rewards = useAMSRewards();
  const claim = useRewardClaim();
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Rewards Store</h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {rewards.data?.filter((r: any) => r.is_active).map((r: any) => (
          <Card key={r.id}>
            <CardHeader className="pb-2"><CardTitle className="text-base">{r.name}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">{r.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{r.cost_points} pts</Badge>
                <Button size="sm" onClick={() => claim.mutate(r.id)}><Gift className="h-3.5 w-3.5 mr-1" />Claim</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <h3 className="mt-6 text-lg font-semibold">My Claimed Rewards</h3>
      <div className="space-y-2">
        {q.data?.map((r: any) => (
          <Card key={r.id}><CardContent className="flex items-center justify-between p-4">
            <span>{r.ams_rewards?.name}</span>
            <Badge>{r.status}</Badge>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

export function Claims() {
  const q = useMyClaims();
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Claims</h2>
      {q.data?.map((c: any) => (
        <Card key={c.id}><CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium">{c.ams_rewards?.name}</p>
            <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
          </div>
          <Badge variant={c.status === "approved" ? "default" : c.status === "rejected" ? "destructive" : "secondary"}>{c.status}</Badge>
        </CardContent></Card>
      ))}
      {!q.data?.length && <p className="text-sm text-muted-foreground">No claims yet.</p>}
    </div>
  );
}

export function Notifications() {
  const q = useMyNotifications();
  const mark = useMarkNotificationRead();
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Notifications</h2>
      {q.data?.map((n: any) => (
        <Card key={n.id} className={n.is_read ? "opacity-60" : ""}>
          <CardContent className="flex items-start justify-between p-4">
            <div className="flex gap-3">
              <Bell className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">{n.title}</p>
                {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </div>
            {!n.is_read && <Button size="sm" variant="ghost" onClick={() => mark.mutate(n.id)}>Mark read</Button>}
          </CardContent>
        </Card>
      ))}
      {!q.data?.length && <p className="text-sm text-muted-foreground">No notifications.</p>}
    </div>
  );
}

export function Analytics() {
  const { data: a } = useAMSAnalytics();
  const items = [
    { label: "Total Users w/ Progress", value: a?.totalUsers ?? 0 },
    { label: "Total XP", value: a?.totalXP ?? 0 },
    { label: "Avg Level", value: a?.avgLevel ?? 0 },
    { label: "XP (30d)", value: a?.xpLast30 ?? 0 },
    { label: "Total Unlocks", value: a?.totalUnlocks ?? 0 },
    { label: "Pending Claims", value: a?.pendingClaims ?? 0 },
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Analytics</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((i) => (
          <Card key={i.label}><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{i.label}</p>
            <p className="text-3xl font-bold">{i.value}</p>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

export function AuditLogs() {
  const q = useAuditLogs();
  const { isBossOwner, isCEO } = useAuth();
  if (!isBossOwner && !isCEO) return <p className="text-muted-foreground">Admin access required.</p>;
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Audit Logs</h2>
      <Card><CardContent className="p-0">
        <div className="divide-y">
          {q.data?.map((l: any) => (
            <div key={l.id} className="flex items-start justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{l.action}</p>
                <p className="text-xs text-muted-foreground">{l.entity_type} {l.entity_id?.slice(0, 8)}</p>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
            </div>
          ))}
          {!q.data?.length && <p className="p-4 text-sm text-muted-foreground">No logs.</p>}
        </div>
      </CardContent></Card>
    </div>
  );
}

export function ClaimApprovals() {
  const q = useAllClaims();
  const approve = useApproveClaim();
  const { isBossOwner, isCEO } = useAuth();
  if (!isBossOwner && !isCEO) return <p className="text-muted-foreground">Admin access required.</p>;
  const pending = q.data?.filter((c: any) => c.status === "pending") || [];
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Claim Approvals</h2>
      {pending.map((c: any) => (
        <Card key={c.id}><CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium">{c.ams_rewards?.name}</p>
            <p className="text-xs text-muted-foreground">User {c.user_id.slice(0, 8)} • {new Date(c.created_at).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="default" onClick={() => approve.mutate({ claim_id: c.id, approve: true })}><Check className="h-4 w-4" /></Button>
            <Button size="sm" variant="destructive" onClick={() => approve.mutate({ claim_id: c.id, approve: false })}><X className="h-4 w-4" /></Button>
          </div>
        </CardContent></Card>
      ))}
      {!pending.length && <p className="text-sm text-muted-foreground">No pending claims.</p>}
    </div>
  );
}

export function RolePermissions() {
  const { isBossOwner, isCEO, userRole } = useAuth();
  const canAdmin = isBossOwner || isCEO;
  const roles = [
    { role: "boss_owner", access: "Full admin: create, update, deactivate catalog; approve claims; view audit." },
    { role: "ceo", access: "Full admin equivalent to boss_owner." },
    { role: "all authenticated", access: "View catalogs, view & manage own progress, claim rewards, view own notifications." },
    { role: "anon", access: "Read-only catalog access (achievements, badges, trophies, rewards, levels, milestones, leaderboards)." },
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-5 w-5" />Role Permissions</h2>
      <p className="text-sm text-muted-foreground">Current role: <Badge>{userRole || "guest"}</Badge> {canAdmin && <Badge variant="default" className="ml-2">Admin</Badge>}</p>
      <div className="space-y-2">
        {roles.map((r) => (
          <Card key={r.role}><CardContent className="p-4"><p className="font-medium">{r.role}</p><p className="text-sm text-muted-foreground">{r.access}</p></CardContent></Card>
        ))}
      </div>
    </div>
  );
}

export function Seasons() {
  const trophies = useAMSTrophies();
  const bySeason: Record<string, any[]> = {};
  trophies.data?.forEach((t: any) => { const k = t.season || "All-Time"; (bySeason[k] = bySeason[k] || []).push(t); });
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar className="h-5 w-5" />Seasons</h2>
      {Object.entries(bySeason).map(([s, ts]) => (
        <Card key={s}><CardHeader><CardTitle className="text-base">{s}</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{ts.map((t) => <Badge key={t.id} variant="secondary">{t.name}</Badge>)}</div></CardContent>
        </Card>
      ))}
      {!Object.keys(bySeason).length && <p className="text-sm text-muted-foreground">No trophies defined yet.</p>}
    </div>
  );
}

export function Categories() {
  const ach = useAMSAchievements();
  const byCat: Record<string, number> = {};
  ach.data?.forEach((a: any) => { byCat[a.category || "general"] = (byCat[a.category || "general"] || 0) + 1; });
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2"><Layers className="h-5 w-5" />Categories</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {Object.entries(byCat).map(([c, n]) => (
          <Card key={c}><CardContent className="p-4"><p className="font-medium">{c}</p><p className="text-2xl font-bold">{n}</p><p className="text-xs text-muted-foreground">achievements</p></CardContent></Card>
        ))}
      </div>
    </div>
  );
}

export function Integrations() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2"><GitBranch className="h-5 w-5" />Integrations</h2>
      <p className="text-sm text-muted-foreground">Wire AMS engines into your modules:</p>
      <Card><CardContent className="p-4 space-y-2 text-sm">
        <p className="font-mono">import {"{ useXPEngine, useAchievementEngine, useStreakEngine, useMilestoneEngine, useBadgeEngine, useTrophyEngine }"} from "@/hooks/useAMS";</p>
        <p className="text-muted-foreground">Call these from any user action across the platform to award XP, unlock achievements, advance streaks, and complete milestones.</p>
      </CardContent></Card>
    </div>
  );
}

export function AMSSettings() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2"><SettingsIcon className="h-5 w-5" />Settings</h2>
      <Card><CardContent className="p-4 text-sm text-muted-foreground">
        AMS uses Lovable Cloud for persistence. Auth, roles, and audit logs reuse the platform-wide systems. Notifications poll every 30s.
      </CardContent></Card>
    </div>
  );
}
