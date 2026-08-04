import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ActivityItem {
  log_id: string;
  actor_role: string;
  actor_id: string | null;
  action_type: string;
  target: string | null;
  target_id: string | null;
  risk_level: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface ActivityFilter {
  role?: string;
  module?: string;
  riskLevel?: string;
  region?: string;
}

let instanceCounter = 0;

export function useBossActivityStream(streamingOn: boolean = true) {
  const [liveActivities, setLiveActivities] = useState<ActivityItem[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const channelNameRef = useRef<string>(`boss-activity-stream-${++instanceCounter}-${Date.now().toString(36)}`);
  const mountedRef = useRef(true);

  // Fetch initial activities
  const activitiesQuery = useQuery({
    queryKey: ['boss-activity-stream'],
    queryFn: async (): Promise<ActivityItem[]> => {
      const { data, error } = await supabase
        .from('system_activity_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as ActivityItem[];
    }
  });

  // Subscribe to realtime updates
  useEffect(() => {
    mountedRef.current = true;

    if (!streamingOn) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    const newChannel = supabase
      .channel(channelNameRef.current)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_activity_log'
        },
        (payload) => {
          if (!mountedRef.current) return;
          const newActivity = payload.new as ActivityItem;
          setLiveActivities(prev => [newActivity, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    channelRef.current = newChannel;

    return () => {
      mountedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [streamingOn]);

  const filterActivities = useCallback((filter: ActivityFilter) => {
    const allActivities = [...liveActivities, ...(activitiesQuery.data || [])];
    
    return allActivities.filter(activity => {
      if (filter.role && activity.actor_role !== filter.role) return false;
      if (filter.riskLevel && activity.risk_level !== filter.riskLevel) return false;
      if (filter.module && activity.target !== filter.module) return false;
      return true;
    });
  }, [liveActivities, activitiesQuery.data]);

  const allActivities = [...liveActivities, ...(activitiesQuery.data || [])]
    .filter((activity, index, self) => 
      index === self.findIndex(a => a.log_id === activity.log_id)
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    activities: allActivities,
    isLoading: activitiesQuery.isLoading,
    error: activitiesQuery.error,
    filterActivities,
    isStreaming: streamingOn && !!channel
  };
}
