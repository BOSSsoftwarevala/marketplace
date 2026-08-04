/**
 * Safe Realtime Channel Hook
 *
 * Wraps Supabase Realtime subscriptions with:
 * - Unique channel names per mount (prevents duplicate subscription collisions)
 * - Guaranteed unsubscribe + remove on unmount
 * - Mounted guard for async setup
 */

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

let globalInstanceCounter = 0;

export function useUniqueChannelName(baseName: string): string {
  const instanceId = useRef<string>(`${baseName}-${++globalInstanceCounter}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`);
  return instanceId.current;
}

interface UseRealtimeChannelOptions {
  channelName: string;
  enabled?: boolean;
  onSubscribe?: (channel: RealtimeChannel) => RealtimeChannel;
  onStatus?: (status: string) => void;
}

export function useRealtimeChannel({
  channelName,
  enabled = true,
  onSubscribe,
  onStatus
}: UseRealtimeChannelOptions) {
  const uniqueName = useUniqueChannelName(channelName);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const mountedRef = useRef(true);

  const subscribe = useCallback(() => {
    if (!mountedRef.current || !enabled) return;

    // Remove any existing channel before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    let channel = supabase.channel(uniqueName);

    if (onSubscribe) {
      channel = onSubscribe(channel);
    }

    channel.subscribe((status) => {
      if (!mountedRef.current) {
        supabase.removeChannel(channel);
        return;
      }
      onStatus?.(status);
    });

    channelRef.current = channel;
  }, [uniqueName, enabled, onSubscribe, onStatus]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    subscribe();

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [subscribe, unsubscribe]);

  return {
    channel: channelRef.current,
    subscribe,
    unsubscribe
  };
}

export function useRealtimeCleanup(channel: RealtimeChannel | null | undefined) {
  useEffect(() => {
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [channel]);
}
