/**
 * Demo Mode Utility
 * Allows one-click dashboard access without real authentication
 */

const DEMO_MODE_KEY = 'demo_mode_active';
const DEMO_ROLE_KEY = 'demo_mode_role';
const DEMO_USER_KEY = 'demo_mode_user';

export interface DemoUser {
  id: string;
  role: string;
  email: string;
  name: string;
}

export function activateDemoMode(user: DemoUser): void {
  sessionStorage.setItem(DEMO_MODE_KEY, 'true');
  sessionStorage.setItem(DEMO_ROLE_KEY, user.role);
  sessionStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
}

export function deactivateDemoMode(): void {
  sessionStorage.removeItem(DEMO_MODE_KEY);
  sessionStorage.removeItem(DEMO_ROLE_KEY);
  sessionStorage.removeItem(DEMO_USER_KEY);
}

export function isDemoMode(): boolean {
  return sessionStorage.getItem(DEMO_MODE_KEY) === 'true';
}

export function getDemoRole(): string | null {
  return sessionStorage.getItem(DEMO_ROLE_KEY);
}

export function getDemoUser(): DemoUser | null {
  const raw = sessionStorage.getItem(DEMO_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
