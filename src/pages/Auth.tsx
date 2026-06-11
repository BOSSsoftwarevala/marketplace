import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import {
  Mail, Lock, Eye, EyeOff, ShieldCheck, Sparkles, Mic, MicOff,
  ArrowRight, Zap, Activity, Globe, Cpu, Users, Building2,
  Code2, Megaphone, Headphones, Handshake, Loader2, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { Volume2, VolumeX } from 'lucide-react';

const emailSchema = z.string().email('Enter a valid email');
const passwordSchema = z.string().min(6, 'Min 6 characters');

type AIState = 'idle' | 'email' | 'password' | 'reveal' | 'processing' | 'success' | 'error';

const programs = [
  { icon: Handshake, label: 'Reseller', metric: '12,480', tone: 'from-cyan-500/20 to-blue-500/10' },
  { icon: Building2, label: 'Franchise', metric: '3,210', tone: 'from-indigo-500/20 to-violet-500/10' },
  { icon: Users, label: 'Partner', metric: '8,945', tone: 'from-sky-500/20 to-cyan-500/10' },
  { icon: Code2, label: 'Developer', metric: '21,067', tone: 'from-emerald-500/20 to-teal-500/10' },
  { icon: Megaphone, label: 'Sales', metric: '5,612', tone: 'from-blue-500/20 to-indigo-500/10' },
  { icon: Headphones, label: 'Support', metric: '1,438', tone: 'from-violet-500/20 to-purple-500/10' },
];

// ─── AI Avatar ──────────────────────────────────────────────────────────────
const AIAvatar = ({ state, cursor }: { state: AIState; cursor: { x: number; y: number } }) => {
  // eye target follows cursor (subtle)
  const dx = Math.max(-3, Math.min(3, (cursor.x - 0.5) * 8));
  const dy = Math.max(-2, Math.min(2, (cursor.y - 0.5) * 5));
  const eyesClosed = state === 'password' || state === 'processing';

  return (
    <div className="relative w-44 h-44 mx-auto">
      {/* halo rings */}
      <motion.div
        className="absolute inset-0 rounded-full border border-cyan-400/30"
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.2, 0.6] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-2 rounded-full border border-blue-400/20"
        animate={{ scale: [1.05, 1, 1.05], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      {/* core orb */}
      <motion.div
        className="absolute inset-6 rounded-full bg-gradient-to-br from-cyan-400/40 via-blue-500/30 to-indigo-600/40 backdrop-blur-xl border border-white/10"
        animate={{
          boxShadow: state === 'processing'
            ? ['0 0 20px rgba(34,211,238,0.4)', '0 0 60px rgba(34,211,238,0.8)', '0 0 20px rgba(34,211,238,0.4)']
            : state === 'success'
            ? '0 0 50px rgba(16,185,129,0.6)'
            : state === 'error'
            ? '0 0 40px rgba(239,68,68,0.5)'
            : '0 0 30px rgba(59,130,246,0.4)',
        }}
        transition={{ duration: 1.2, repeat: state === 'processing' ? Infinity : 0 }}
      >
        {/* face */}
        <div className="absolute inset-0 flex items-center justify-center">
          {state === 'processing' ? (
            <Loader2 className="w-10 h-10 text-cyan-200 animate-spin" />
          ) : state === 'success' ? (
            <CheckCircle2 className="w-12 h-12 text-emerald-300" />
          ) : (
            <div className="flex gap-3" style={{ transform: `translate(${dx}px, ${dy}px)` }}>
              {[0, 1].map((i) => (
                <motion.span
                  key={i}
                  className="block w-2.5 rounded-full bg-cyan-100"
                  animate={{ height: eyesClosed ? 2 : 10 }}
                  transition={{ duration: 0.18 }}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
      {/* scan line on processing */}
      {state === 'processing' && (
        <motion.div
          className="absolute inset-6 rounded-full overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <motion.div
            className="absolute left-0 right-0 h-px bg-cyan-300/80 shadow-[0_0_8px_rgba(34,211,238,0.9)]"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}
    </div>
  );
};

// ─── Page ───────────────────────────────────────────────────────────────────
const Auth = () => {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [aiState, setAiState] = useState<AIState>('idle');
  const [cursor, setCursor] = useState({ x: 0.5, y: 0.5 });
  const [aiMsg, setAiMsg] = useState('Welcome. I will guide you in.');
  const containerRef = useRef<HTMLDivElement>(null);

  // Voice intent router — fills fields and triggers actions hands-free
  const handleVoice = (text: string, isFinal: boolean) => {
    if (!isFinal) return;
    const t = text.toLowerCase().trim();
    const emailMatch = t.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    if (emailMatch) setEmail(emailMatch[0]);
    if (/(log ?in|sign in|enter|submit|authenticate)/.test(t)) {
      formRef.current?.requestSubmit();
    } else if (/(forgot|reset).*(password)/.test(t)) {
      navigate('/forgot-password');
    } else if (/show password/.test(t)) {
      setShowPassword(true);
    } else if (/hide password/.test(t)) {
      setShowPassword(false);
    }
  };

  const voice = useVoiceAssistant({ onTranscript: handleVoice });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { if (user) navigate('/dashboard', { replace: true }); }, [user, navigate]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const r = containerRef.current?.getBoundingClientRect();
      if (!r) return;
      setCursor({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const msgs: Record<AIState, string> = {
      idle: 'Welcome. I will guide you in.',
      email: 'Identifying your workspace…',
      password: 'Privacy mode active. I am not looking.',
      reveal: 'Confirming your key.',
      processing: 'Verifying with secure gateway…',
      success: 'Authenticated. Preparing your console.',
      error: 'I can help. Try again or recover access.',
    };
    setAiMsg(msgs[aiState]);
    if (voice.enabled) voice.speak(msgs[aiState]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiState]);

  const validate = () => {
    const e: typeof errors = {};
    const er = emailSchema.safeParse(email); if (!er.success) e.email = er.error.errors[0].message;
    const pr = passwordSchema.safeParse(password); if (!pr.success) e.password = pr.error.errors[0].message;
    setErrors(e); return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) { setAiState('error'); return; }
    setAiState('processing');
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setAiState('error');
        toast.error(error.message.includes('Invalid') ? 'Invalid email or password' : error.message);
      } else {
        setAiState('success');
        setTimeout(() => navigate('/dashboard', { replace: true }), 900);
      }
    } catch {
      setAiState('error');
      toast.error('Unexpected error');
    }
  };

  const oauth = (p: string) => toast.info(`${p} sign-in coming online`);

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full overflow-hidden relative bg-[#05070d] text-slate-100"
    >
      {/* ambient backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,211,238,0.10),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.12),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* top status bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)]">
            <Zap className="w-4 h-4 text-[#05070d]" />
          </div>
          <div className="font-mono text-sm tracking-widest">
            SOFTWARE <span className="text-cyan-300">VALA</span> <span className="text-slate-500">/ NEXUS</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-5 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-400" /> all systems nominal</span>
          <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-cyan-400" /> 17 regions</span>
          <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-indigo-400" /> ai gateway · live</span>
        </div>
      </header>

      {/* 3-zone layout */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.05fr_1.1fr_1fr] gap-6 px-6 py-8 max-w-[1600px] mx-auto">
        {/* LEFT — Ecosystem */}
        <section className="hidden lg:flex flex-col gap-4">
          <div className="text-xs font-mono uppercase tracking-[0.25em] text-slate-500">Nexus · opportunities</div>
          <h2 className="text-2xl font-semibold leading-tight">
            One identity. <span className="text-cyan-300">Six programs.</span> An ecosystem that thinks.
          </h2>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {programs.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`relative rounded-xl border border-white/10 bg-gradient-to-br ${p.tone} backdrop-blur-xl p-4 overflow-hidden`}
              >
                <div className="absolute inset-0 opacity-30 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.06),transparent)]" />
                <div className="flex items-center justify-between">
                  <p.icon className="w-5 h-5 text-cyan-200" />
                  <span className="text-[10px] font-mono text-emerald-300">● live</span>
                </div>
                <div className="mt-3 text-xs text-slate-300">{p.label} Program</div>
                <div className="font-mono text-lg text-white">{p.metric}</div>
              </motion.div>
            ))}
          </div>
          <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-4">
            <div className="text-xs font-mono text-slate-500 mb-2">live platform metrics</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[['Sessions','48.2k'],['Latency','38ms'],['Uptime','99.99%']].map(([k,v]) => (
                <div key={k}>
                  <div className="text-lg font-mono text-cyan-200">{v}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">{k}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CENTER — Auth */}
        <section className="flex flex-col items-stretch justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
          >
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-cyan-400/20 via-transparent to-indigo-500/20 -z-10 blur-xl opacity-60" />
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-300">secure gateway</div>
                <h1 className="text-2xl font-semibold mt-1">Authenticate</h1>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" /> tls · argon2 · jwt
              </div>
            </div>

            <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Email / Mobile / Username</label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="text" autoComplete="username" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setAiState('email')}
                    onBlur={() => aiState === 'email' && setAiState('idle')}
                    placeholder="you@nexus.io"
                    className="pl-9 h-11 bg-black/40 border-white/10 focus-visible:ring-cyan-400/50 focus-visible:border-cyan-400/50 text-slate-100 placeholder:text-slate-600"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Password</label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setAiState(showPassword ? 'reveal' : 'password')}
                    onBlur={() => (aiState === 'password' || aiState === 'reveal') && setAiState('idle')}
                    placeholder="••••••••••"
                    className="pl-9 pr-10 h-11 bg-black/40 border-white/10 focus-visible:ring-cyan-400/50 focus-visible:border-cyan-400/50 text-slate-100 placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => { const n = !showPassword; setShowPassword(n); if (document.activeElement?.tagName === 'INPUT') setAiState(n ? 'reveal' : 'password'); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-300 transition"
                    aria-label="toggle password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-cyan-400" />
                  Remember this device
                </label>
                <button type="button" onClick={() => navigate('/forgot-password')} className="text-cyan-300 hover:text-cyan-200">
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit" disabled={aiState === 'processing'}
                className="w-full h-11 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-[#05070d] font-semibold shadow-[0_0_30px_rgba(34,211,238,0.35)]"
              >
                {aiState === 'processing' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Authenticating…</>
                ) : aiState === 'success' ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2" />Verified</>
                ) : (
                  <>Enter Nexus <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>

            </form>

            <div className="mt-6 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> session encrypted</span>
              <span>v3.2 · nexus core</span>
            </div>
          </motion.div>
        </section>

        {/* RIGHT — AI Assistant */}
        <section className="hidden lg:flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 flex-1 flex flex-col"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-300">vala · ai assistant</div>
              <div className="flex items-center gap-1.5">
                <select
                  value={voice.lang}
                  onChange={(e) => voice.setLang(e.target.value)}
                  disabled={!voice.supported}
                  className="text-[10px] font-mono bg-black/40 border border-white/10 rounded-full px-2 py-1 text-slate-300 focus:outline-none focus:border-cyan-400/40"
                  aria-label="voice language"
                >
                  {voice.langs.map((l) => (
                    <option key={l.code} value={l.code} className="bg-black">{l.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => voice.setMuted(!voice.muted)}
                  disabled={!voice.supported}
                  title={voice.muted ? 'unmute voice output' : 'mute voice output'}
                  className="p-1.5 rounded-full border border-white/10 text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 transition disabled:opacity-40"
                >
                  {voice.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={voice.toggleListening}
                  disabled={!voice.supported}
                  className={`flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border transition disabled:opacity-40 ${
                    voice.enabled
                      ? 'border-cyan-400/50 text-cyan-300 bg-cyan-400/10'
                      : 'border-white/10 text-slate-400 hover:text-cyan-300'
                  }`}
                  title={voice.supported ? '' : 'voice not supported in this browser'}
                >
                  {voice.enabled ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                  {voice.enabled ? (voice.listening ? 'listening' : 'paused') : 'voice off'}
                </button>
              </div>
            </div>

            {voice.enabled && voice.transcript && (
              <div className="mt-3 text-[11px] font-mono text-slate-400 bg-black/30 border border-white/5 rounded-md px-2.5 py-1.5">
                <span className="text-cyan-300">›</span> {voice.transcript}
              </div>
            )}
            {voice.speaking && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-cyan-300">
                <span className="flex gap-0.5">
                  <span className="w-0.5 h-2 bg-cyan-300 rounded animate-pulse" />
                  <span className="w-0.5 h-3 bg-cyan-300 rounded animate-pulse [animation-delay:120ms]" />
                  <span className="w-0.5 h-2 bg-cyan-300 rounded animate-pulse [animation-delay:240ms]" />
                </span>
                speaking — say anything to interrupt
              </div>
            )}

            <div className="mt-6"><AIAvatar state={aiState} cursor={cursor} /></div>

            <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4 min-h-[88px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={aiMsg}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="text-sm text-slate-200 leading-relaxed"
                >
                  <Sparkles className="inline w-3.5 h-3.5 text-cyan-300 mr-1.5 -mt-0.5" />
                  {aiMsg}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono">
              {[
                ['presence', aiState === 'idle' ? 'detected' : 'engaged'],
                ['focus', aiState === 'email' ? 'email' : aiState === 'password' ? 'password' : '—'],
                ['privacy', aiState === 'password' ? 'eyes closed' : 'standard'],
                ['gateway', aiState === 'processing' ? 'verifying' : 'ready'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2 flex items-center justify-between">
                  <span className="text-slate-500 uppercase tracking-wider">{k}</span>
                  <span className="text-cyan-200">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4 text-[10px] font-mono text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ai never sees your password. privacy enforced at input level.
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default Auth;
