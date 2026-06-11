import { useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle, Clock, KeyRound, Shield, UserCog, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type UserRoleRow = {
  id: string;
  user_id: string;
  role: string;
  approval_status: string | null;
  created_at: string;
  approved_at: string | null;
  force_logged_out_at: string | null;
};

type AuditRow = {
  id: string;
  action: string;
  module: string;
  role: string | null;
  timestamp: string;
  user_id: string | null;
};

function statusBadge(status: string | null, forceLoggedOut: string | null) {
  if (forceLoggedOut) return <Badge variant="destructive">forced out</Badge>;
  if (status === 'approved') return <Badge className="bg-emerald-600 text-white">approved</Badge>;
  if (status === 'rejected') return <Badge variant="destructive">rejected</Badge>;
  return <Badge variant="secondary">pending</Badge>;
}

function useAuthControlData() {
  const [roles, setRoles] = useState<UserRoleRow[]>([]);
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [roleResult, logResult] = await Promise.all([
      supabase
        .from('user_roles')
        .select('id,user_id,role,approval_status,created_at,approved_at,force_logged_out_at')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('audit_logs')
        .select('id,action,module,role,timestamp,user_id')
        .in('module', ['auth', 'security', 'boss-panel'])
        .order('timestamp', { ascending: false })
        .limit(30),
    ]);

    if (roleResult.error) toast.error('Auth users could not be loaded');
    if (logResult.error) toast.error('Auth audit could not be loaded');
    setRoles((roleResult.data || []) as UserRoleRow[]);
    setLogs((logResult.data || []) as AuditRow[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  return { roles, logs, loading, reload: load };
}

export function AuthDashboard() {
  const { roles, logs, loading, reload } = useAuthControlData();
  const stats = useMemo(() => {
    const approved = roles.filter((r) => r.approval_status === 'approved').length;
    const pending = roles.filter((r) => !r.approval_status || r.approval_status === 'pending').length;
    const locked = roles.filter((r) => Boolean(r.force_logged_out_at)).length;
    const privileged = roles.filter((r) => ['boss_owner', 'super_admin', 'admin', 'ceo'].includes(r.role)).length;
    return { approved, pending, locked, privileged };
  }, [roles]);

  const cards = [
    { label: 'Approved identities', value: stats.approved, icon: CheckCircle },
    { label: 'Pending approvals', value: stats.pending, icon: Clock },
    { label: 'Privileged access', value: stats.privileged, icon: Shield },
    { label: 'Forced logout locks', value: stats.locked, icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Auth Dashboard</h1>
          <p className="text-sm text-slate-500">Live authentication, role, and access health.</p>
        </div>
        <Button onClick={() => void reload()} disabled={loading}><Activity className="h-4 w-4 mr-2" />Refresh</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs text-slate-500">{card.label}</p>
                <p className="text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
              <card.icon className="h-7 w-7 text-blue-600" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent auth audit</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
              <div><span className="font-medium">{log.action}</span><span className="text-slate-500"> · {log.module}</span></div>
              <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
          ))}
          {!logs.length && <p className="text-sm text-slate-500">No auth audit events found.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export function AuthManagement() {
  const { user, userRole } = useAuth();
  const { roles, loading, reload } = useAuthControlData();
  const [busyId, setBusyId] = useState<string | null>(null);

  const updateRole = async (row: UserRoleRow, action: 'approved' | 'rejected' | 'force_logout') => {
    setBusyId(row.id);
    const update = action === 'force_logout'
      ? { force_logged_out_at: new Date().toISOString(), force_logged_out_by: user?.id }
      : { approval_status: action, approved_at: action === 'approved' ? new Date().toISOString() : null, approved_by: user?.id };
    const { error } = await supabase.from('user_roles').update(update).eq('id', row.id);
    if (!error) {
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        role: userRole as any,
        module: 'auth',
        action: `auth_${action}`,
        meta_json: { target_user_id: row.user_id, target_role: row.role },
      });
      toast.success('Auth access updated');
      await reload();
    } else {
      toast.error('Auth access update failed');
    }
    setBusyId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Auth Management</h1>
          <p className="text-sm text-slate-500">Approve, reject, and secure real user role access.</p>
        </div>
        <Button onClick={() => void reload()} disabled={loading}><KeyRound className="h-4 w-4 mr-2" />Sync</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {roles.map((row) => (
              <div key={row.id} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <UserCog className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-slate-900">{row.user_id.slice(0, 8)}</span>
                    <Badge variant="outline">{row.role}</Badge>
                    {statusBadge(row.approval_status, row.force_logged_out_at)}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Created {new Date(row.created_at).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => updateRole(row, 'approved')} disabled={busyId === row.id}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => updateRole(row, 'rejected')} disabled={busyId === row.id}>Reject</Button>
                  <Button size="sm" variant="destructive" onClick={() => updateRole(row, 'force_logout')} disabled={busyId === row.id}>Force out</Button>
                </div>
              </div>
            ))}
            {!roles.length && <p className="p-4 text-sm text-slate-500">No auth role records found.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}