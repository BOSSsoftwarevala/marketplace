import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAMSProgress, useAMSAnalytics, useMyAchievements, useMyBadges, useMyStreaks } from "@/hooks/useAMS";
import { Trophy, Medal, Zap, Flame, Award, Users, Gift, BarChart3 } from "lucide-react";

export default function Overview() {
  const { data: progress } = useAMSProgress();
  const { data: analytics } = useAMSAnalytics();
  const { data: myAch } = useMyAchievements();
  const { data: myBadges } = useMyBadges();
  const { data: streaks } = useMyStreaks();

  const stats = [
    { label: "Level", value: progress?.current_level ?? 1, icon: Trophy, color: "text-yellow-500" },
    { label: "Total XP", value: progress?.total_xp ?? 0, icon: Zap, color: "text-blue-500" },
    { label: "Points", value: progress?.total_points ?? 0, icon: Gift, color: "text-green-500" },
    { label: "Streak", value: `${progress?.current_streak ?? 0}🔥`, icon: Flame, color: "text-orange-500" },
    { label: "Achievements", value: myAch?.filter((a: any) => a.unlocked_at).length ?? 0, icon: Award, color: "text-purple-500" },
    { label: "Badges", value: myBadges?.length ?? 0, icon: Medal, color: "text-pink-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Overview</h2>
        <p className="text-muted-foreground">Your gamification dashboard at a glance.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" />Platform Users</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{analytics?.totalUsers ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4" />XP (30d)</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{analytics?.xpLast30 ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Gift className="h-4 w-4" />Pending Claims</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{analytics?.pendingClaims ?? 0}</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
