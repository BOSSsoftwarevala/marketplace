import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Field = { key: string; label: string; placeholder?: string; textarea?: boolean };

const BASE_FIELDS: Field[] = [
  { key: 'full_name', label: 'Full name' },
  { key: 'phone', label: 'Phone number', placeholder: '+91 …' },
  { key: 'country', label: 'Country' },
];

const ROLE_FIELDS: Record<string, Field[]> = {
  client: [{ key: 'company', label: 'Company / business name' }, { key: 'industry', label: 'Industry' }],
  prime: [{ key: 'company', label: 'Company / business name' }, { key: 'industry', label: 'Industry' }],
  franchise: [{ key: 'business_name', label: 'Franchise business name' }, { key: 'city', label: 'City / territory' }],
  reseller: [{ key: 'business_name', label: 'Reseller business name' }, { key: 'city', label: 'City / territory' }],
  influencer: [{ key: 'social_handle', label: 'Main social handle' }, { key: 'audience_size', label: 'Audience size' }],
  developer: [{ key: 'skills', label: 'Primary skills', placeholder: 'React, Node, PHP…' }, { key: 'portfolio', label: 'Portfolio / GitHub link' }],
};
const STAFF_FIELDS: Field[] = [{ key: 'department', label: 'Department / team' }];

const schema = z.record(z.string().trim().max(300));

const Onboarding = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<string, string>>({});
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const role = userRole ?? 'client';
  const fields = [...BASE_FIELDS, ...(ROLE_FIELDS[role] ?? STAFF_FIELDS)];

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('full_name, phone, country, bio').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => {
        const meta = (user.user_metadata?.role_profile ?? {}) as Record<string, string>;
        setValues({ ...meta, full_name: data?.full_name ?? user.user_metadata?.full_name ?? '', phone: data?.phone ?? '', country: data?.country ?? '' });
        setBio(data?.bio ?? '');
      });
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const missing = fields.find((f) => !values[f.key]?.trim());
    if (missing) { toast.error(`Please fill in: ${missing.label}`); return; }
    const parsed = schema.safeParse(values);
    if (!parsed.success) { toast.error('Please keep each answer under 300 characters.'); return; }
    setSaving(true);
    const { full_name, phone, country, ...roleProfile } = parsed.data;
    const { error: pErr } = await supabase.from('profiles')
      .update({ full_name, display_name: full_name, phone, country, bio: bio.trim().slice(0, 1000) || null })
      .eq('user_id', user.id);
    const { error: mErr } = await supabase.auth.updateUser({
      data: { full_name, role_profile: roleProfile, onboarding_complete: true },
    });
    setSaving(false);
    if (pErr || mErr) { toast.error('Could not save your profile. Please try again.'); return; }
    toast.success('Profile complete — welcome aboard!');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <form onSubmit={submit} className="max-w-lg w-full rounded-2xl border border-border bg-card p-8 space-y-5">
        <div className="text-center space-y-2">
          <Sparkles className="w-10 h-10 text-primary mx-auto" />
          <h1 className="text-2xl font-semibold text-foreground">Complete your profile</h1>
          <p className="text-muted-foreground text-sm">
            A few details for your <span className="text-foreground font-medium">{role.replace(/_/g, ' ')}</span> account.
          </p>
        </div>
        {fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={f.key}>{f.label}</Label>
            <Input id={f.key} maxLength={300} placeholder={f.placeholder} value={values[f.key] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
          </div>
        ))}
        <div className="space-y-1.5">
          <Label htmlFor="bio">About you (optional)</Label>
          <Textarea id="bio" maxLength={1000} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finish setup'}
        </Button>
      </form>
    </div>
  );
};

export default Onboarding;
