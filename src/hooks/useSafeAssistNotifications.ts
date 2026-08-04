/**
 * Safe Assist Notifications Hook
 * Triggers notifications when Safe Assist events occur
 */

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNotificationSound } from '@/hooks/useNotificationSound';

let instanceCounter = 0;

export function useSafeAssistNotifications() {
  const { user, userRole } = useAuth();
  const { addNotification } = useNotifications();
  const { playWarning, playCritical, playInfo } = useNotificationSound(userRole || 'developer');
  const sessionChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const alertChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const channelNameRef = useRef<string>(`safe-assist-notifications-${++instanceCounter}-${Date.now().toString(36)}`);
  const mountedRef = useRef(true);

  // Subscribe to Safe Assist session events
  useEffect(() => {
    mountedRef.current = true;

    if (!user) return;

    // Listen for session changes that are relevant to the user
    const sessionChannel = supabase
      .channel(`${channelNameRef.current}-sessions`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'safe_assist_sessions',
        },
        async (payload) => {
          if (!mountedRef.current) return;
          const session = payload.new as any;
          
          // Only notify if user is involved in the session
          if (session?.user_id !== user.id && session?.support_agent_id !== user.id) {
            // Check if user is a manager role
            if (!['safe_assist', 'assist_manager', 'super_admin', 'master'].includes(userRole || '')) {
              return;
            }
          }

          if (payload.eventType === 'INSERT') {
            // New session created
            if (['safe_assist', 'assist_manager'].includes(userRole || '')) {
              await addNotification('info', `New Safe Assist session requested`, 'safe_assist_new_session', {
                actionLabel: 'View Session',
                roleTarget: ['safe_assist', 'assist_manager'],
              });
              playInfo();
            }
          } else if (payload.eventType === 'UPDATE') {
            // Session status changed
            if (session.status === 'connected' && session.user_id === user.id) {
              await addNotification('success', 'Support agent has connected to your session', 'safe_assist_connected', {
                isBuzzer: false,
              });
              playInfo();
            } else if (session.status === 'terminated') {
              await addNotification('danger', 'Session was terminated due to security concerns', 'safe_assist_terminated', {
                isBuzzer: true,
                roleTarget: ['safe_assist', 'assist_manager', 'super_admin'],
              });
              playCritical();
            }
          }
        }
      )
      .subscribe();

    sessionChannelRef.current = sessionChannel;

    // Listen for AI alerts
    const alertChannel = supabase
      .channel(`${channelNameRef.current}-alerts`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'safe_assist_ai_logs',
        },
        async (payload) => {
          if (!mountedRef.current) return;
          const alert = payload.new as any;
          
          // Only notify managers and relevant roles
          if (!['safe_assist', 'assist_manager', 'super_admin', 'master'].includes(userRole || '')) {
            return;
          }

          if (alert.risk_level === 'critical') {
            await addNotification('danger', `Critical AI alert: ${alert.event_type}`, 'safe_assist_critical_alert', {
              isBuzzer: true,
              actionLabel: 'Review Now',
              roleTarget: ['safe_assist', 'assist_manager', 'super_admin'],
            });
            playCritical();
          } else if (alert.risk_level === 'high') {
            await addNotification('warning', `High risk detected: ${alert.event_type}`, 'safe_assist_high_alert', {
              actionLabel: 'Review',
              roleTarget: ['safe_assist', 'assist_manager'],
            });
            playWarning();
          }
        }
      )
      .subscribe();

    alertChannelRef.current = alertChannel;

    return () => {
      mountedRef.current = false;
      if (sessionChannelRef.current) {
        supabase.removeChannel(sessionChannelRef.current);
        sessionChannelRef.current = null;
      }
      if (alertChannelRef.current) {
        supabase.removeChannel(alertChannelRef.current);
        alertChannelRef.current = null;
      }
    };
  }, [user, userRole, addNotification, playWarning, playCritical, playInfo]);
}

export default useSafeAssistNotifications;
