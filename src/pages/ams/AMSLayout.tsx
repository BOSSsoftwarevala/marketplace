import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Award, Medal, Gift, Zap, TrendingUp, Flame, Target, Users, Bell, BarChart3, Shield, Settings, History, Star, Crown, ListChecks, Sparkles, ChevronLeft, LayoutDashboard, Coins, UserCheck, Activity, Globe, Calendar, Layers, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sections = [
  { to: "/ams", end: true, label: "Overview", icon: LayoutDashboard },
  { to: "/ams/achievements", label: "Achievements", icon: Trophy },
  { to: "/ams/badges", label: "Badges", icon: Medal },
  { to: "/ams/trophies", label: "Trophies", icon: Award },
  { to: "/ams/rewards", label: "Rewards Catalog", icon: Gift },
  { to: "/ams/levels", label: "Levels", icon: TrendingUp },
  { to: "/ams/xp", label: "XP Engine", icon: Zap },
  { to: "/ams/streaks", label: "Streaks", icon: Flame },
  { to: "/ams/milestones", label: "Milestones", icon: Target },
  { to: "/ams/leaderboards", label: "Leaderboards", icon: Users },
  { to: "/ams/my-progress", label: "My Progress", icon: Activity },
  { to: "/ams/my-achievements", label: "My Achievements", icon: Star },
  { to: "/ams/my-badges", label: "My Badges", icon: Medal },
  { to: "/ams/my-trophies", label: "My Trophies", icon: Crown },
  { to: "/ams/my-rewards", label: "My Rewards", icon: Gift },
  { to: "/ams/claims", label: "Claims", icon: ListChecks },
  { to: "/ams/notifications", label: "Notifications", icon: Bell },
  { to: "/ams/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/ams/audit", label: "Audit Logs", icon: History },
  { to: "/ams/admin/approvals", label: "Claim Approvals", icon: UserCheck },
  { to: "/ams/admin/roles", label: "Role Permissions", icon: Shield },
  { to: "/ams/seasons", label: "Seasons", icon: Calendar },
  { to: "/ams/categories", label: "Categories", icon: Layers },
  { to: "/ams/integrations", label: "Integrations", icon: GitBranch },
  { to: "/ams/settings", label: "Settings", icon: Settings },
];

export default function AMSLayout() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Achievement Management System</h1>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{userRole || "guest"}</div>
      </header>
      <div className="flex">
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-64 shrink-0 overflow-y-auto border-r border-border bg-card md:block">
          <nav className="space-y-1 p-3">
            {sections.map((s) => (
              <NavLink
                key={s.to}
                to={s.to}
                end={s.end}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <s.icon className="h-4 w-4" />
                <span>{s.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-h-[calc(100vh-57px)] flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
