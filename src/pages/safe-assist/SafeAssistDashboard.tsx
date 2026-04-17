/**
 * Safe Assist Dashboard
 * Cloned pattern from IncidentCrisisDashboard (similar protection / monitoring role).
 * Renders the full SafeAssistScreen content with proper crisis-style chrome,
 * skipping auth-gated DashboardLayout so demo-mode users see the complete UI.
 */
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { SafeAssistScreen } from '@/components/wireframe/screens/SafeAssistScreen';

const SafeAssistDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(56,189,248,0.06),transparent_50%)]" />
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full blur-3xl"
            style={{
              left: `${15 + (i * 20) % 75}%`,
              top: `${10 + (i * 25) % 65}%`,
              background:
                i % 2 === 0
                  ? 'radial-gradient(circle, rgba(16,185,129,0.05), transparent)'
                  : 'radial-gradient(circle, rgba(56,189,248,0.04), transparent)',
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-emerald-500/20 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Safe Assist Control Center</h1>
            <p className="text-xs text-emerald-300/70">Live session monitoring & secure remote support</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SafeAssistScreen />
        </motion.div>
      </main>
    </div>
  );
};

export default SafeAssistDashboard;
