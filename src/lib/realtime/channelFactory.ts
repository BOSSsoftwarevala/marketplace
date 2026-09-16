/**
 * Shared Realtime Channel Factory
 *
 * Single source of truth for:
 * - unique channel naming (per mount / per instance)
 * - channel creation + subscription
 * - guaranteed teardown (unsubscribe + removeChannel)
 *
 * Every realtime hook in the app should build channels through this module so
 * naming and cleanup behaviour stay identical everywhere.
 */

import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

let globalChannelCounter = 0;

/** Build a globally unique channel name from a stable base name. */
export function makeChannelName(baseName: string): string {
  return `${baseName}-${++globalChannelCounter}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

/**
 * Create + subscribe a channel imperatively (outside React).
 * Returns the channel and a teardown function that is safe to call twice.
 */
export function createRealtimeChannel(
  baseName: string,
  configure: (channel: RealtimeChannel) => RealtimeChannel,
  onStatus?: (status: string) => void
): { channel: RealtimeChannel; teardown: () => void } {
  const channel = configure(supabase.channel(makeChannelName(baseName)));

  channel.subscribe((status) => onStatus?.(status));

  let removed = false;
  const teardown = () => {
    if (removed) return;
    removed = true;
    supabase.removeChannel(channel);
  };

  return { channel, teardown };
}

export interface UseRealtimeSubscriptionOptions {
  /** Stable base name; a unique suffix is appended per mount. */
  name: string;
  /** Attach listeners here. Must return the channel. */
  configure: (channel: RealtimeChannel) => RealtimeChannel;
  /** Skip subscribing while false. */
  enabled?: boolean;
  /** Re-subscribe when these change. */
  deps?: unknown[];
  onStatus?: (status: string) => void;
}

/**
 * Canonical hook for realtime subscriptions.
 * Handles unique naming, mounted guards and cleanup on unmount / dep change.
 */
export function useRealtimeSubscription({
  name,
  configure,
  enabled = true,
  deps = [],
  onStatus
}: UseRealtimeSubscriptionOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const mountedRef = useRef(true);
  const configureRef = useRef(configure);
  const statusRef = useRef(onStatus);

  configureRef.current = configure;
  statusRef.current = onStatus;

  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) return;

    const { channel, teardown } = createRealtimeChannel(
      name,
      (c) => configureRef.current(c),
      (status) => {
        if (!mountedRef.current) return;
        statusRef.current?.(status);
      }
    );

    channelRef.current = channel;

    return () => {
      mountedRef.current = false;
      channelRef.current = null;
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, enabled, ...deps]);

  return {
    channelRef,
    isMountedRef: mountedRef
  };
}
