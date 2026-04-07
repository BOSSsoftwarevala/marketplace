import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Blinking Eyes Component
const BlinkingEyes = ({ watching, passwordMode }: { watching: boolean; passwordMode: boolean }) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-6 mb-2">
      {/* Left Eye */}
      <div className="relative w-16 h-16 bg-white rounded-full shadow-lg border-2 border-slate-200 flex items-center justify-center overflow-hidden">
        <motion.div
          animate={{
            scaleY: isBlinking ? 0.05 : 1,
            y: passwordMode ? 6 : 0,
          }}
          transition={{ duration: isBlinking ? 0.1 : 0.3 }}
          className="relative w-8 h-8"
        >
          {passwordMode ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-800 rounded-full" />
            </div>
          ) : (
            <>
              <motion.div
                animate={{ x: watching ? 3 : 0, y: watching ? 2 : 0 }}
                className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center"
              >
                <div className="w-3 h-3 bg-white rounded-full relative -top-0.5 -left-0.5" />
              </motion.div>
            </>
          )}
        </motion.div>
      </div>

      {/* Right Eye */}
      <div className="relative w-16 h-16 bg-white rounded-full shadow-lg border-2 border-slate-200 flex items-center justify-center overflow-hidden">
        <motion.div
          animate={{
            scaleY: isBlinking ? 0.05 : 1,
            y: passwordMode ? 6 : 0,
          }}
          transition={{ duration: isBlinking ? 0.1 : 0.3 }}
          className="relative w-8 h-8"
        >
          {passwordMode ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-800 rounded-full" />
            </div>
          ) : (
            <>
              <motion.div
                animate={{ x: watching ? 3 : 0, y: watching ? 2 : 0 }}
                className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center"
              >
                <div className="w-3 h-3 bg-white rounded-full relative -top-0.5 -left-0.5" />
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const BossBlinkLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/super-admin');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    console.log('[BOSS LOGIN] Attempting login for:', email);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        console.error('[BOSS LOGIN] Error:', error.message);
        toast.error(error.message || 'Login failed');
        setLoading(false);
        return;
      }

      console.log('[BOSS LOGIN] Success!');
      toast.success('Welcome back, Boss!');
      navigate('/super-admin');
    } catch (err: any) {
      console.error('[BOSS LOGIN] Catch:', err);
      toast.error(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-2xl shadow-purple-500/10 p-8">
          {/* Blinking Eyes */}
          <div className="flex flex-col items-center mb-6">
            <BlinkingEyes
              watching={focusedField === 'email'}
              passwordMode={focusedField === 'password' && !showPassword}
            />
            <motion.h1
              className="text-2xl font-bold text-white mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Boss Login
            </motion.h1>
            <p className="text-purple-300/70 text-sm mt-1">Software Vala Control Center</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="boss-email" className="text-purple-200 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <Input
                  id="boss-email"
                  type="email"
                  placeholder="boss@softwarevala.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="pl-10 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="boss-password" className="text-purple-200 text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <Input
                  id="boss-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="pl-10 pr-10 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold h-12 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <span className="flex items-center gap-2">
                  Login
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-purple-400/50 mt-6">
            Powered by <span className="font-semibold text-purple-400/70">Software Vala</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BossBlinkLogin;
