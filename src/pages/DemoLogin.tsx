import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Crown, Shield, Users, Server, Briefcase, UserCheck, 
  TrendingUp, Headphones, Code, DollarSign, Eye, 
  Loader2, CheckCircle2, AlertTriangle, Target, Scale,
  Megaphone, Search, BarChart3, Calculator, Cpu, UserCog,
  Star, ShoppingCart, Store, Zap, MessageSquare, FileCheck,
  HandMetal, ClipboardCheck, MapPin, MonitorPlay, Gavel, Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { activateDemoMode } from '@/utils/demoMode';

interface DemoAccount {
  id: string;
  role: string;
  email: string;
  password: string;
  icon: any;
  color: string;
  description: string;
  redirectPath: string;
  tier: 'owner' | 'master' | 'admin' | 'manager' | 'staff';
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  // ===== TIER 0: OWNER =====
  {
    id: 'boss_owner',
    role: 'Boss Owner',
    email: 'boss@demo.softwarevala.com',
    password: 'Demo@Boss2025!',
    icon: Crown,
    color: 'from-yellow-500 to-amber-600',
    description: 'Company Owner • Full System Control',
    redirectPath: '/owner',
    tier: 'owner',
  },
  {
    id: 'ceo',
    role: 'AI CEO',
    email: 'ceo@demo.softwarevala.com',
    password: 'Demo@CEO2025!',
    icon: Bot,
    color: 'from-purple-600 to-indigo-700',
    description: 'AI Intelligence Observer • Decision Engine',
    redirectPath: '/ai-ceo',
    tier: 'owner',
  },

  // ===== TIER 1: MASTER =====
  {
    id: 'master',
    role: 'Master Admin',
    email: 'masteradmin@demo.softwarevala.com',
    password: 'Demo@Master2025!',
    icon: Crown,
    color: 'from-purple-500 to-purple-700',
    description: 'System Root • Hidden Endpoint',
    redirectPath: '/master-admin',
    tier: 'master',
  },

  // ===== TIER 2: ADMIN =====
  {
    id: 'super_admin',
    role: 'Super Admin',
    email: 'superadmin@demo.softwarevala.com',
    password: 'Demo@Super2025!',
    icon: Shield,
    color: 'from-amber-500 to-orange-600',
    description: 'Platform Commander • Global Control',
    redirectPath: '/super-admin',
    tier: 'admin',
  },
  {
    id: 'admin',
    role: 'Admin',
    email: 'admin@demo.softwarevala.com',
    password: 'Demo@Admin2025!',
    icon: Users,
    color: 'from-blue-500 to-blue-700',
    description: 'System Operator • Daily Operations',
    redirectPath: '/dashboard',
    tier: 'admin',
  },

  // ===== TIER 3: MANAGERS =====
  {
    id: 'server_manager',
    role: 'Server Manager',
    email: 'server@demo.softwarevala.com',
    password: 'Demo@Server2025!',
    icon: Server,
    color: 'from-slate-500 to-slate-700',
    description: 'Infrastructure • Zero Trust Security',
    redirectPath: '/server-manager',
    tier: 'manager',
  },
  {
    id: 'franchise',
    role: 'Franchise',
    email: 'franchise@demo.softwarevala.com',
    password: 'Demo@Franchise2025!',
    icon: Briefcase,
    color: 'from-emerald-500 to-emerald-700',
    description: 'Business Operations • Regional Sales',
    redirectPath: '/franchise',
    tier: 'manager',
  },
  {
    id: 'reseller',
    role: 'Reseller',
    email: 'reseller@demo.softwarevala.com',
    password: 'Demo@Reseller2025!',
    icon: Store,
    color: 'from-teal-500 to-teal-700',
    description: 'Product Resale • Commission Tracking',
    redirectPath: '/reseller',
    tier: 'manager',
  },
  {
    id: 'area_manager',
    role: 'Area Manager',
    email: 'area@demo.softwarevala.com',
    password: 'Demo@Area2025!',
    icon: MapPin,
    color: 'from-indigo-500 to-indigo-700',
    description: 'Regional Oversight • Territory Control',
    redirectPath: '/area-manager',
    tier: 'manager',
  },
  {
    id: 'demo_manager',
    role: 'Demo Manager',
    email: 'demo@demo.softwarevala.com',
    password: 'Demo@Demo2025!',
    icon: MonitorPlay,
    color: 'from-cyan-500 to-cyan-700',
    description: 'Demo Catalog • Product Showcase',
    redirectPath: '/demo-manager',
    tier: 'manager',
  },
  {
    id: 'product_demo_manager',
    role: 'Product Demo Manager',
    email: 'productdemo@demo.softwarevala.com',
    password: 'Demo@ProdDemo2025!',
    icon: ShoppingCart,
    color: 'from-orange-500 to-orange-700',
    description: 'Product Demos • Order System',
    redirectPath: '/product-demo-manager',
    tier: 'manager',
  },
  {
    id: 'lead_manager',
    role: 'Lead Manager',
    email: 'lead@demo.softwarevala.com',
    password: 'Demo@Lead2025!',
    icon: Target,
    color: 'from-rose-500 to-rose-700',
    description: 'Lead Pipeline • Conversion Tracking',
    redirectPath: '/lead-manager',
    tier: 'manager',
  },
  {
    id: 'task_manager',
    role: 'Task Manager',
    email: 'task@demo.softwarevala.com',
    password: 'Demo@Task2025!',
    icon: ClipboardCheck,
    color: 'from-sky-500 to-sky-700',
    description: 'Task Assignment • Project Tracking',
    redirectPath: '/task-manager',
    tier: 'manager',
  },
  {
    id: 'finance_manager',
    role: 'Finance Manager',
    email: 'finance@demo.softwarevala.com',
    password: 'Demo@Finance2025!',
    icon: DollarSign,
    color: 'from-green-500 to-green-700',
    description: 'Financial Operations • Billing',
    redirectPath: '/finance',
    tier: 'manager',
  },
  {
    id: 'marketing_manager',
    role: 'Marketing Manager',
    email: 'marketing@demo.softwarevala.com',
    password: 'Demo@Marketing2025!',
    icon: Megaphone,
    color: 'from-pink-500 to-pink-700',
    description: 'Campaigns • Brand & Growth',
    redirectPath: '/marketing-manager',
    tier: 'manager',
  },
  {
    id: 'seo_manager',
    role: 'SEO Manager',
    email: 'seo@demo.softwarevala.com',
    password: 'Demo@SEO2025!',
    icon: Search,
    color: 'from-lime-500 to-lime-700',
    description: 'SEO Optimization • Traffic Analytics',
    redirectPath: '/seo-manager',
    tier: 'manager',
  },
  {
    id: 'hr_manager',
    role: 'HR Manager',
    email: 'hr@demo.softwarevala.com',
    password: 'Demo@HR2025!',
    icon: UserCog,
    color: 'from-fuchsia-500 to-fuchsia-700',
    description: 'Team Management • Recruitment',
    redirectPath: '/hr-manager',
    tier: 'manager',
  },
  {
    id: 'legal_manager',
    role: 'Legal Manager',
    email: 'legal@demo.softwarevala.com',
    password: 'Demo@Legal2025!',
    icon: Gavel,
    color: 'from-stone-500 to-stone-700',
    description: 'Legal Compliance • Contracts',
    redirectPath: '/legal-manager',
    tier: 'manager',
  },
  {
    id: 'performance_manager',
    role: 'Performance Manager',
    email: 'performance@demo.softwarevala.com',
    password: 'Demo@Perf2025!',
    icon: BarChart3,
    color: 'from-violet-500 to-violet-700',
    description: 'KPIs • Team Performance',
    redirectPath: '/performance',
    tier: 'manager',
  },
  {
    id: 'rnd_manager',
    role: 'R&D Manager',
    email: 'rnd@demo.softwarevala.com',
    password: 'Demo@RnD2025!',
    icon: Cpu,
    color: 'from-amber-500 to-yellow-700',
    description: 'Research • Innovation Lab',
    redirectPath: '/rnd-dashboard',
    tier: 'manager',
  },
  {
    id: 'ai_manager',
    role: 'AI Manager',
    email: 'ai@demo.softwarevala.com',
    password: 'Demo@AI2025!',
    icon: Zap,
    color: 'from-cyan-500 to-blue-700',
    description: 'AI Operations • API Control',
    redirectPath: '/api-manager',
    tier: 'manager',
  },
  {
    id: 'reseller_manager',
    role: 'Reseller Manager',
    email: 'resellermgr@demo.softwarevala.com',
    password: 'Demo@ResMgr2025!',
    icon: Store,
    color: 'from-emerald-600 to-teal-700',
    description: 'Reseller Network • Onboarding',
    redirectPath: '/reseller-manager',
    tier: 'manager',
  },
  {
    id: 'sales_support_manager',
    role: 'Sales Support Manager',
    email: 'salessupport@demo.softwarevala.com',
    password: 'Demo@SalesSup2025!',
    icon: TrendingUp,
    color: 'from-blue-600 to-indigo-700',
    description: 'Sales Operations • Support Escalation',
    redirectPath: '/sales-support-manager',
    tier: 'manager',
  },
  {
    id: 'influencer_manager',
    role: 'Influencer Manager',
    email: 'inflmgr@demo.softwarevala.com',
    password: 'Demo@InflMgr2025!',
    icon: Star,
    color: 'from-pink-600 to-rose-700',
    description: 'Influencer Network • Campaign Tracking',
    redirectPath: '/influencer-manager-secure',
    tier: 'manager',
  },
  {
    id: 'assist_manager',
    role: 'Assist Manager',
    email: 'assist@demo.softwarevala.com',
    password: 'Demo@Assist2025!',
    icon: HandMetal,
    color: 'from-sky-600 to-blue-700',
    description: 'Remote Assist • Session Control',
    redirectPath: '/assist-manager',
    tier: 'manager',
  },
  {
    id: 'promise_management',
    role: 'Promise Management',
    email: 'promise@demo.softwarevala.com',
    password: 'Demo@Promise2025!',
    icon: FileCheck,
    color: 'from-teal-600 to-emerald-700',
    description: 'Commitments • Delivery Tracking',
    redirectPath: '/promise-management',
    tier: 'manager',
  },

  // ===== TIER 4: STAFF =====
  {
    id: 'developer',
    role: 'Developer',
    email: 'developer@demo.softwarevala.com',
    password: 'Demo@Dev2025!',
    icon: Code,
    color: 'from-violet-500 to-violet-700',
    description: 'Development Tasks • Code Access',
    redirectPath: '/developer',
    tier: 'staff',
  },
  {
    id: 'influencer',
    role: 'Influencer',
    email: 'influencer@demo.softwarevala.com',
    password: 'Demo@Influencer2025!',
    icon: Star,
    color: 'from-pink-500 to-pink-700',
    description: 'Content Promotion • Referrals',
    redirectPath: '/influencer',
    tier: 'staff',
  },
  {
    id: 'prime',
    role: 'Prime User',
    email: 'prime@demo.softwarevala.com',
    password: 'Demo@Prime2025!',
    icon: Crown,
    color: 'from-amber-500 to-yellow-600',
    description: 'Premium Access • Priority Support',
    redirectPath: '/prime',
    tier: 'staff',
  },
  {
    id: 'client',
    role: 'Client',
    email: 'client@demo.softwarevala.com',
    password: 'Demo@Client2025!',
    icon: Users,
    color: 'from-blue-500 to-cyan-600',
    description: 'Client Portal • Project View',
    redirectPath: '/client-portal',
    tier: 'staff',
  },
  {
    id: 'support',
    role: 'Support Staff',
    email: 'support@demo.softwarevala.com',
    password: 'Demo@Support2025!',
    icon: Headphones,
    color: 'from-green-500 to-emerald-700',
    description: 'Client Support • Issue Resolution',
    redirectPath: '/support',
    tier: 'staff',
  },
  {
    id: 'client_success',
    role: 'Client Success',
    email: 'clientsuccess@demo.softwarevala.com',
    password: 'Demo@ClientS2025!',
    icon: MessageSquare,
    color: 'from-indigo-500 to-blue-700',
    description: 'Client Retention • Success Metrics',
    redirectPath: '/client-success',
    tier: 'staff',
  },
  {
    id: 'safe_assist',
    role: 'Safe Assist',
    email: 'safeassist@demo.softwarevala.com',
    password: 'Demo@SafeA2025!',
    icon: Shield,
    color: 'from-cyan-500 to-teal-700',
    description: 'Remote Assistance • Screen Share',
    redirectPath: '/safe-assist',
    tier: 'staff',
  },
  {
    id: 'promise_tracker',
    role: 'Promise Tracker',
    email: 'promisetrack@demo.softwarevala.com',
    password: 'Demo@PTrack2025!',
    icon: Eye,
    color: 'from-orange-500 to-red-700',
    description: 'Promise Monitoring • Audit Trail',
    redirectPath: '/promise-tracker',
    tier: 'staff',
  },
  {
    id: 'legal_compliance',
    role: 'Legal Compliance',
    email: 'legalcomp@demo.softwarevala.com',
    password: 'Demo@LegalC2025!',
    icon: Scale,
    color: 'from-gray-500 to-gray-700',
    description: 'Compliance Rules • Legal Audits',
    redirectPath: '/legal',
    tier: 'staff',
  },
  {
    id: 'incident_crisis',
    role: 'Incident & Crisis',
    email: 'crisis@demo.softwarevala.com',
    password: 'Demo@Crisis2025!',
    icon: AlertTriangle,
    color: 'from-red-500 to-red-700',
    description: 'Crisis Response • Incident Management',
    redirectPath: '/incident-crisis',
    tier: 'staff',
  },
];

const DemoLogin = () => {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleDemoLogin = (account: DemoAccount) => {
    setLoadingId(account.id);
    
    // Activate demo mode - no real auth needed
    activateDemoMode({
      id: account.id,
      role: account.id,
      email: account.email,
      name: account.role,
    });

    setSuccessId(account.id);
    toast.success(`✅ Logged in as ${account.role}`);
    
    setTimeout(() => {
      navigate(account.redirectPath);
    }, 600);
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'owner': return { label: 'OWNER', color: 'bg-yellow-500/20 text-yellow-400' };
      case 'master': return { label: 'ROOT', color: 'bg-purple-500/20 text-purple-400' };
      case 'admin': return { label: 'ADMIN', color: 'bg-amber-500/20 text-amber-400' };
      case 'manager': return { label: 'MANAGER', color: 'bg-blue-500/20 text-blue-400' };
      case 'staff': return { label: 'STAFF', color: 'bg-emerald-500/20 text-emerald-400' };
      default: return { label: 'USER', color: 'bg-muted text-muted-foreground' };
    }
  };

  const tierConfig = [
    { key: 'owner', label: 'Owner & CEO', icon: Crown, iconColor: 'text-yellow-400' },
    { key: 'master', label: 'Root Authority', icon: Crown, iconColor: 'text-purple-400' },
    { key: 'admin', label: 'Administrative', icon: Shield, iconColor: 'text-amber-400' },
    { key: 'manager', label: 'Management', icon: Users, iconColor: 'text-blue-400' },
    { key: 'staff', label: 'Staff & Operations', icon: UserCheck, iconColor: 'text-emerald-400' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🚀 Demo Login Portal
          </motion.h1>
          <p className="text-gray-400">
            One-click login • {DEMO_ACCOUNTS.length} Roles • All Dashboards
          </p>
        </div>

        {/* Warning */}
        <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-400 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Demo accounts must be created in backend first. Click any button to try login.</span>
          </div>
        </div>

        {/* All Tiers */}
        <div className="space-y-6">
          {tierConfig.map(({ key, label, icon: TierIcon, iconColor }) => {
            const accounts = DEMO_ACCOUNTS.filter(a => a.tier === key);
            if (accounts.length === 0) return null;
            return (
              <div key={key}>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
                  <TierIcon className={`w-5 h-5 ${iconColor}`} />
                  {label}
                  <Badge variant="outline" className="text-gray-400 border-gray-600 text-xs">
                    {accounts.length}
                  </Badge>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {accounts.map((account, index) => {
                    const Icon = account.icon;
                    const loading = loadingId === account.id;
                    const success = successId === account.id;
                    const tierInfo = getTierLabel(account.tier);
                    
                    return (
                      <motion.div
                        key={account.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Card className="border-gray-800 bg-[#111827] hover:border-cyan-500/40 transition-all group">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${account.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h3 className="font-semibold text-white text-sm truncate">{account.role}</h3>
                                  <Badge variant="outline" className={`${tierInfo.color} text-[10px] px-1.5 py-0 flex-shrink-0`}>
                                    {tierInfo.label}
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-gray-500 truncate">{account.description}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className={`w-full text-xs h-8 ${
                                success 
                                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                                  : `bg-gradient-to-r ${account.color} hover:opacity-90`
                              } text-white transition-all`}
                              onClick={() => handleDemoLogin(account)}
                              disabled={loading || success}
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Logging in...
                                </>
                              ) : success ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Success! Redirecting...
                                </>
                              ) : (
                                <>⚡ Login as {account.role}</>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Credentials Table */}
        <Card className="mt-8 border-gray-800 bg-[#111827]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">📋 All Demo Credentials</CardTitle>
            <CardDescription>Copy to create accounts in backend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2 text-gray-400">Role</th>
                    <th className="text-left p-2 text-gray-400">Email</th>
                    <th className="text-left p-2 text-gray-400">Password</th>
                    <th className="text-left p-2 text-gray-400">Dashboard</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_ACCOUNTS.map((account) => (
                    <tr key={account.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-2 font-medium text-white">{account.role}</td>
                      <td className="p-2 font-mono text-gray-400">{account.email}</td>
                      <td className="p-2 font-mono text-gray-400">{account.password}</td>
                      <td className="p-2 font-mono text-cyan-400">{account.redirectPath}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DemoLogin;
