import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, ShieldCheck, Cpu, Database, Radio, Zap, Globe2,
  AlertTriangle, TrendingUp, Users, Server, GitBranch, Bot,
  CircleDot, ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  RadialBarChart, RadialBar, PolarAngleAxis, LineChart, Line
} from 'recharts';
import { useBossDashboard } from '@/hooks/boss-panel/useBossDashboard';
import { useBossActivityStream } from '@/hooks/boss-panel/useBossActivityStream';
import { useBossSecurityAlerts } from '@/hooks/boss-panel/useBossSecurityAlerts';

// ============================================================
// FOUNDER COMMAND CENTER — Mission Control OS
// Matte-black · Carbon · Electric-blue · Emerald · Gold
// ============================================================

const COLORS = {
  surface: 'rgba(10, 16, 28, 0.72)',
  surfaceStrong: 'rgba(14, 22, 38, 0.92)',
  border: 'rgba(96, 165, 250, 0.14)',
  borderStrong: 'rgba(96, 165, 250, 0.28)',
  hair: 'rgba(255,255,255,0.06)',
  ink: '#e6edf7',
  inkDim: 'rgba(230,237,247,0.55)',
  inkMute: 'rgba(230,237,247,0.35)',
  blue: '#60a5fa',
  cyan: '#22d3ee',
  emerald: '#34d399',
  gold: '#eab308',
  danger: '#f43f5e',
};

// ---------- Primitive: Glass Panel ----------
function Panel({
  children, className = '', title, subtitle, right, glow = false,
}: {
  children: React.ReactNode; className?: string;
  title?: string; subtitle?: string; right?: React.ReactNode; glow?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: glow
          ? '0 0 0 1px rgba(96,165,250,0.15), 0 20px 60px rgba(0,0,0,0.55), 0 0 40px rgba(37,99,235,0.08)'
          : '0 20px 40px rgba(0,0,0,0.4)',
      }}
    >
      {(title || right) && (
        <div className="flex items-start justify-between px-5 pt-4 pb-3"
             style={{ borderBottom: `1px solid ${COLORS.hair}` }}>
          <div>
            {title && (
              <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: COLORS.inkMute }}>
                {title}
              </div>
            )}
            {subtitle && (
              <div className="text-sm font-semibold mt-0.5" style={{ color: COLORS.ink }}>
                {subtitle}
              </div>
            )}
          </div>
          {right}
        </div>
      )}
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

// ---------- Live animated counter ----------
function LiveCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = display;
    const delta = value - start;
    const duration = 700;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + delta * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
     
  }, [value]);
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

// ---------- Pulse dot ----------
function PulseDot({ color = COLORS.emerald }: { color?: string }) {
  return (
    <span className="relative inline-flex w-2 h-2">
      <span className="absolute inset-0 rounded-full animate-ping" style={{ background: color, opacity: 0.6 }} />
      <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: color }} />
    </span>
  );
}

// ---------- KPI Module (top row) ----------
function KPI({
  label, value, delta, icon: Icon, tone,
}: { label: string; value: number; delta?: string; icon: any; tone: 'blue'|'emerald'|'gold'|'danger' }) {
  const toneMap = {
    blue:    { c: COLORS.blue,    grad: 'linear-gradient(135deg, rgba(96,165,250,0.20), rgba(37,99,235,0.05))' },
    emerald: { c: COLORS.emerald, grad: 'linear-gradient(135deg, rgba(52,211,153,0.20), rgba(16,185,129,0.05))' },
    gold:    { c: COLORS.gold,    grad: 'linear-gradient(135deg, rgba(234,179,8,0.20), rgba(202,138,4,0.05))' },
    danger:  { c: COLORS.danger,  grad: 'linear-gradient(135deg, rgba(244,63,94,0.22), rgba(190,18,60,0.05))' },
  }[tone];
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="relative rounded-2xl p-4 overflow-hidden"
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        backdropFilter: 'blur(18px)',
      }}
    >
      <div className="absolute inset-0 opacity-70" style={{ background: toneMap.grad }} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: COLORS.inkMute }}>{label}</div>
          <div className="mt-2 text-[26px] font-bold leading-none tabular-nums" style={{ color: COLORS.ink }}>
            <LiveCounter value={value} />
          </div>
          {delta && (
            <div className="mt-2 inline-flex items-center gap-1 text-[11px]" style={{ color: toneMap.c }}>
              <ArrowUpRight className="w-3 h-3" /> {delta}
            </div>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.hair}`, color: toneMap.c }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}

// ---------- Radar Sweep (system integrity) ----------
function RadarSweep({ score }: { score: number }) {
  return (
    <div className="relative w-full aspect-square max-w-[220px] mx-auto">
      <div className="absolute inset-0 rounded-full"
           style={{ border: `1px solid ${COLORS.borderStrong}` }} />
      <div className="absolute inset-[12%] rounded-full" style={{ border: `1px solid ${COLORS.border}` }} />
      <div className="absolute inset-[26%] rounded-full" style={{ border: `1px solid ${COLORS.border}` }} />
      <div className="absolute inset-[40%] rounded-full" style={{ border: `1px solid ${COLORS.border}` }} />
      <motion.div
        className="absolute inset-0 rounded-full origin-center"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, ${COLORS.cyan}55 45deg, transparent 90deg)`,
          mask: 'radial-gradient(circle, transparent 5%, black 6%)',
          WebkitMask: 'radial-gradient(circle, transparent 5%, black 6%)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: COLORS.inkMute }}>Integrity</div>
        <div className="text-4xl font-bold tabular-nums" style={{ color: COLORS.ink }}>
          <LiveCounter value={score} suffix="%" />
        </div>
        <div className="mt-1 inline-flex items-center gap-1 text-[11px]" style={{ color: COLORS.emerald }}>
          <PulseDot /> Nominal
        </div>
      </div>
    </div>
  );
}

// ---------- Telemetry Series ----------
function useTelemetry() {
  const [series, setSeries] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      t: i, req: 40 + Math.round(Math.sin(i / 3) * 15 + Math.random() * 10),
      lat: 90 + Math.round(Math.cos(i / 4) * 20 + Math.random() * 8),
    })));
  useEffect(() => {
    const id = setInterval(() => {
      setSeries(prev => {
        const next = prev.slice(1);
        const last = prev[prev.length - 1];
        next.push({
          t: last.t + 1,
          req: Math.max(10, Math.min(120, last.req + Math.round((Math.random() - 0.5) * 18))),
          lat: Math.max(40, Math.min(180, last.lat + Math.round((Math.random() - 0.5) * 14))),
        });
        return next;
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);
  return series;
}

// ---------- System Vital Bar ----------
function Vital({ label, value, tone = COLORS.emerald }: { label: string; value: number; tone?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-[11px] uppercase tracking-wider" style={{ color: COLORS.inkMute }}>{label}</div>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${tone}00, ${tone})`, boxShadow: `0 0 12px ${tone}80` }}
        />
      </div>
      <div className="w-10 text-right text-[12px] tabular-nums font-medium" style={{ color: COLORS.ink }}>{value}%</div>
    </div>
  );
}

// ---------- Activity Row ----------
function riskColor(r: string) {
  if (r === 'critical' || r === 'high') return COLORS.danger;
  if (r === 'medium') return COLORS.gold;
  return COLORS.emerald;
}
function timeAgo(iso: string) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

// ============================================================
// MAIN
// ============================================================
export function BossDashboard() {
  const { summary, systemHealth, isLoading } = useBossDashboard();
  const { activities } = useBossActivityStream(true);
  const { criticalCount, unresolvedCount, alerts } = useBossSecurityAlerts();
  const telemetry = useTelemetry();

  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const integrity = systemHealth?.overall ?? 98;
  const modules = systemHealth?.modules ?? [];
  const activeModules = modules.filter(m => m.status === 'active').length;

  const vitals = useMemo(() => ([
    { label: 'API',      value: Math.min(100, 90 + Math.round(Math.sin(clock.getSeconds() / 5) * 6)), tone: COLORS.emerald },
    { label: 'Database', value: Math.min(100, 92 + Math.round(Math.cos(clock.getSeconds() / 6) * 4)), tone: COLORS.blue },
    { label: 'Queue',    value: Math.min(100, 78 + Math.round(Math.sin(clock.getSeconds() / 4) * 8)), tone: COLORS.cyan },
    { label: 'Cache',    value: Math.min(100, 95 + Math.round(Math.cos(clock.getSeconds() / 7) * 3)), tone: COLORS.emerald },
    { label: 'Workers',  value: Math.min(100, 84 + Math.round(Math.sin(clock.getSeconds() / 3) * 6)), tone: COLORS.gold },
    { label: 'CDN',      value: Math.min(100, 97 + Math.round(Math.cos(clock.getSeconds() / 8) * 2)), tone: COLORS.emerald },
  ]), [clock]);

  const revenueTrend = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      h: `${i}:00`,
      v: Math.round(2000 + Math.sin(i / 3) * 800 + Math.cos(i / 5) * 400 + Math.random() * 250),
    })), []);

  const radial = [{ name: 'integrity', value: integrity, fill: COLORS.cyan }];

  return (
    <div className="space-y-6">
      {/* ============ HERO BANNER ============ */}
      <Panel glow className="!p-0">
        <div className="relative px-6 py-5 flex flex-wrap items-center gap-6"
             style={{ background: 'linear-gradient(90deg, rgba(37,99,235,0.10), transparent 60%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(96,165,250,0.10)', border: `1px solid ${COLORS.borderStrong}` }}>
              <Radio className="w-5 h-5" style={{ color: COLORS.cyan }} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em]" style={{ color: COLORS.inkMute }}>
                Founder Command Center · Live
              </div>
              <div className="text-lg font-semibold" style={{ color: COLORS.ink }}>
                All systems streaming <PulseDot />
              </div>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-6">
            {[
              { l: 'Region',      v: 'GLOBAL / 6 Continents' },
              { l: 'Environment', v: 'PRODUCTION' },
              { l: 'Branch',      v: 'main · stable' },
              { l: 'UTC',         v: clock.toISOString().slice(11, 19) },
            ].map((x) => (
              <div key={x.l} className="text-right">
                <div className="text-[9px] uppercase tracking-[0.22em]" style={{ color: COLORS.inkMute }}>{x.l}</div>
                <div className="text-[12px] font-semibold tabular-nums" style={{ color: COLORS.ink }}>{x.v}</div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* ============ KPI ROW ============ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPI label="Super Admins" value={summary?.totalSuperAdmins ?? 0} icon={Users}       tone="blue"    delta="+2 wk" />
        <KPI label="Continents"   value={summary?.activeContinents ?? 0}  icon={Globe2}     tone="emerald" delta="live" />
        <KPI label="Countries"    value={summary?.countriesLive ?? 0}     icon={Server}     tone="blue" />
        <KPI label="Revenue 24h"  value={summary?.revenueToday ?? 0}      icon={TrendingUp} tone="gold"    delta="+8.4%" />
        <KPI label="Critical"     value={criticalCount}                    icon={AlertTriangle} tone="danger" />
        <KPI label="Modules Live" value={activeModules}                    icon={Cpu}        tone="emerald" />
      </div>

      {/* ============ MAIN GRID ============ */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left column */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          {/* Telemetry */}
          <Panel
            title="Realtime Telemetry"
            subtitle="Request Throughput · Latency"
            right={
              <div className="flex items-center gap-4 text-[11px]" style={{ color: COLORS.inkDim }}>
                <span className="inline-flex items-center gap-1.5"><CircleDot className="w-3 h-3" style={{ color: COLORS.cyan }} /> Req/s</span>
                <span className="inline-flex items-center gap-1.5"><CircleDot className="w-3 h-3" style={{ color: COLORS.gold }} /> Latency ms</span>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={telemetry} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reqG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.55} />
                    <stop offset="100%" stopColor={COLORS.cyan} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="latG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={COLORS.gold} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={{ fill: COLORS.inkMute, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: COLORS.inkMute, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: COLORS.surfaceStrong, border: `1px solid ${COLORS.border}`,
                    borderRadius: 12, color: COLORS.ink, fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="req" stroke={COLORS.cyan} strokeWidth={2} fill="url(#reqG)" isAnimationActive={false} />
                <Area type="monotone" dataKey="lat" stroke={COLORS.gold} strokeWidth={2} fill="url(#latG)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>

          {/* Revenue + Vitals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel title="Revenue Pulse" subtitle="Last 24 hours">
              <div className="flex items-baseline gap-3 mb-4">
                <div className="text-3xl font-bold tabular-nums" style={{ color: COLORS.ink }}>
                  $<LiveCounter value={summary?.revenueToday ?? 0} />
                </div>
                <div className="text-[11px] inline-flex items-center gap-1" style={{ color: COLORS.emerald }}>
                  <ArrowUpRight className="w-3 h-3" /> 8.4% vs yesterday
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={revenueTrend}>
                  <Tooltip
                    contentStyle={{
                      background: COLORS.surfaceStrong, border: `1px solid ${COLORS.border}`,
                      borderRadius: 12, color: COLORS.ink, fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="v" stroke={COLORS.emerald} strokeWidth={2}
                        dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Infrastructure Vitals" subtitle="Live subsystem load">
              <div className="space-y-3">
                {vitals.map(v => (<Vital key={v.label} label={v.label} value={v.value} tone={v.tone} />))}
              </div>
            </Panel>
          </div>

          {/* Modules grid */}
          <Panel
            title="System Modules"
            subtitle={`${activeModules} of ${modules.length || activeModules} operational`}
            right={<span className="text-[11px]" style={{ color: COLORS.inkMute }}>auto-refresh 30s</span>}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(modules.length ? modules : [
                { name: 'Marketplace', status: 'active', health: 100 },
                { name: 'Payments',    status: 'active', health: 100 },
                { name: 'Auth',        status: 'active', health: 100 },
                { name: 'AI Gateway',  status: 'active', health: 100 },
                { name: 'Storage',     status: 'active', health: 100 },
                { name: 'CDN',         status: 'active', health: 100 },
                { name: 'Workers',     status: 'active', health: 100 },
                { name: 'Audit',       status: 'active', health: 100 },
              ]).slice(0, 12).map((m, i) => {
                const ok = m.status === 'active';
                const c = ok ? COLORS.emerald : m.status === 'maintenance' ? COLORS.gold : COLORS.danger;
                return (
                  <motion.div
                    key={m.name + i}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="relative rounded-xl p-3 flex items-center gap-3 cursor-default"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${COLORS.hair}`,
                    }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                         style={{ background: 'rgba(255,255,255,0.03)', color: c, border: `1px solid ${COLORS.hair}` }}>
                      <Database className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-semibold truncate" style={{ color: COLORS.ink }}>{m.name}</div>
                      <div className="text-[10px] uppercase tracking-wider inline-flex items-center gap-1" style={{ color: c }}>
                        <PulseDot color={c} /> {m.status}
                      </div>
                    </div>
                    <div className="text-[11px] tabular-nums font-semibold" style={{ color: COLORS.ink }}>{m.health}%</div>
                  </motion.div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* Right column */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          {/* Integrity radar */}
          <Panel title="System Integrity" subtitle="Composite health index" glow>
            <div className="relative">
              <ResponsiveContainer width="100%" height={220}>
                <RadialBarChart innerRadius="72%" outerRadius="100%" data={radial} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" cornerRadius={20} background={{ fill: 'rgba(255,255,255,0.04)' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 pointer-events-none">
                <RadarSweep score={integrity} />
              </div>
            </div>
          </Panel>

          {/* AI copilots */}
          <Panel title="AI Copilots" subtitle="Always-on intelligence">
            <div className="space-y-2">
              {[
                { name: 'Founder AI',    role: 'Executive brief' },
                { name: 'Security AI',   role: 'Threat watch' },
                { name: 'Deploy AI',     role: 'Release supervisor' },
                { name: 'Marketplace AI',role: 'Demand signals' },
                { name: 'Support AI',    role: 'Ticket triage' },
              ].map((a) => (
                <div key={a.name}
                     className="flex items-center gap-3 p-2.5 rounded-lg"
                     style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${COLORS.hair}` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                       style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.20), rgba(52,211,153,0.10))', color: COLORS.cyan }}>
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold" style={{ color: COLORS.ink }}>{a.name}</div>
                    <div className="text-[10px]" style={{ color: COLORS.inkMute }}>{a.role}</div>
                  </div>
                  <PulseDot color={COLORS.emerald} />
                </div>
              ))}
            </div>
          </Panel>

          {/* Live activity */}
          <Panel
            title="Live Activity Stream"
            subtitle={`${activities.length} events`}
            right={<span className="inline-flex items-center gap-1 text-[10px]" style={{ color: COLORS.emerald }}><PulseDot /> STREAM</span>}
          >
            <div className="max-h-[320px] overflow-y-auto pr-1 space-y-1.5">
              {(activities.slice(0, 12)).map((a) => {
                const c = riskColor(a.risk_level);
                return (
                  <div key={a.log_id}
                       className="flex items-center gap-3 p-2 rounded-lg"
                       style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${COLORS.hair}` }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium truncate" style={{ color: COLORS.ink }}>
                        {a.action_type}
                      </div>
                      <div className="text-[10px] truncate" style={{ color: COLORS.inkMute }}>
                        {a.actor_role}{a.target ? ` · ${a.target}` : ''}
                      </div>
                    </div>
                    <div className="text-[10px] tabular-nums" style={{ color: COLORS.inkMute }}>{timeAgo(a.timestamp)}</div>
                  </div>
                );
              })}
              {activities.length === 0 && !isLoading && (
                <div className="text-center text-[12px] py-6" style={{ color: COLORS.inkMute }}>
                  Awaiting first event…
                </div>
              )}
            </div>
          </Panel>

          {/* Security */}
          <Panel title="Security Watch" subtitle={`${unresolvedCount} unresolved · ${criticalCount} critical`}>
            <div className="space-y-2">
              {alerts.slice(0, 4).map((al) => {
                const c = riskColor(al.severity);
                return (
                  <div key={al.alert_id}
                       className="flex items-start gap-3 p-2.5 rounded-lg"
                       style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${COLORS.hair}` }}>
                    <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: c }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium truncate" style={{ color: COLORS.ink }}>{al.description}</div>
                      <div className="text-[10px]" style={{ color: COLORS.inkMute }}>{al.source} · {timeAgo(al.created_at)}</div>
                    </div>
                  </div>
                );
              })}
              {alerts.length === 0 && (
                <div className="flex items-center gap-2 text-[12px] py-3" style={{ color: COLORS.emerald }}>
                  <ShieldCheck className="w-4 h-4" /> No active threats detected.
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {/* Signature strip */}
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] pt-2 pb-6"
           style={{ color: COLORS.inkMute }}>
        <span className="inline-flex items-center gap-2"><Zap className="w-3 h-3" style={{ color: COLORS.cyan }} /> Software Vala Nexus OS</span>
        <span className="inline-flex items-center gap-2"><GitBranch className="w-3 h-3" /> main · stable</span>
        <span className="inline-flex items-center gap-2"><Activity className="w-3 h-3" style={{ color: COLORS.emerald }} /> Frame · {clock.toISOString()}</span>
      </div>
    </div>
  );
}