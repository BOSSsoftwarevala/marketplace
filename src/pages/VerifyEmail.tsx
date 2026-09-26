import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const VerifyEmail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const email = user?.email ?? new URLSearchParams(window.location.search).get('email') ?? '';

  const resend = async () => {
    if (!email) return;
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setBusy(false);
    if (error) toast.error('Could not resend right now. Please try again in a minute.');
    else toast.success('Verification email sent again.');
  };

  const checkAgain = async () => {
    setBusy(true);
    const { data } = await supabase.auth.refreshSession();
    setBusy(false);
    if (data.user?.email_confirmed_at) navigate('/dashboard', { replace: true });
    else toast.info('Not verified yet — please click the link in your email.');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center space-y-5">
        <MailCheck className="w-12 h-12 text-primary mx-auto" />
        <h1 className="text-2xl font-semibold text-foreground">Verify your email</h1>
        <p className="text-muted-foreground">
          We sent a confirmation link to <span className="text-foreground font-medium">{email || 'your email'}</span>.
          Open it to activate your account and unlock your dashboard.
        </p>
        <div className="flex flex-col gap-2">
          {user && (
            <Button onClick={checkAgain} disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "I've verified — continue"}
            </Button>
          )}
          <Button variant="outline" onClick={resend} disabled={busy || !email}>Resend email</Button>
          <Button variant="ghost" onClick={signOut}>Back to sign in</Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
