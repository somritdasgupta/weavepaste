import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Session {
  id: string;
  session_code: string;
  content: string;
  content_type: "text" | "code";
  created_at: string;
  expires_at: string;
  active_users: number;
  last_activity: string;
}

export interface SessionUser {
  id: string;
  session_id: string;
  user_name: string;
  color: string;
  joined_at: string;
  last_seen: string;
  is_active: boolean;
}

export const useSession = (sessionCode?: string) => {
  const [session, setSession] = useState<Session | null>(null);
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const generateDeviceName = () => {
    const brands = ["iPhone", "iPad", "MacBook", "Windows", "Android"];
    const numbers = Math.floor(Math.random() * 20) + 1;
    return `${brands[Math.floor(Math.random() * brands.length)]} ${numbers}`;
  };

  const generateColor = () => {
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500",
      "bg-yellow-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const createSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('generate_session_code');
      if (error) throw error;

      const sessionCode = data;
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert([
          {
            session_code: sessionCode,
            content: '',
            content_type: 'text'
          }
        ])
        .select()
        .single();

      if (sessionError) throw sessionError;

      const typedSession = {
        ...sessionData,
        content_type: sessionData.content_type as "text" | "code"
      };
      setSession(typedSession);
      return typedSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinSession = useCallback(async (code: string, userName?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Find session by code
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('session_code', code.toUpperCase())
        .single();

      if (sessionError || !sessionData) {
        throw new Error('Session not found');
      }

      // Check if session is expired
      if (new Date(sessionData.expires_at) < new Date()) {
        throw new Error('Session has expired');
      }

      const typedJoinSession = {
        ...sessionData,
        content_type: sessionData.content_type as "text" | "code"
      };
      setSession(typedJoinSession);

      // Add user to session
      const deviceName = userName || generateDeviceName();
      const { error: userError } = await supabase
        .from('session_users')
        .insert([
          {
            session_id: sessionData.id,
            user_name: deviceName,
            color: generateColor(),
            is_active: true
          }
        ]);

      if (userError) throw userError;

      // Update active user count
      await supabase
        .from('sessions')
        .update({ active_users: sessionData.active_users + 1 })
        .eq('id', sessionData.id);

      return sessionData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join session');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateContent = useCallback(async (content: string, contentType: "text" | "code" = "text") => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({ content, content_type: contentType })
        .eq('id', session.id);

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update content');
    }
  }, [session]);

  const leaveSession = useCallback(async () => {
    if (!session) return;

    try {
      // Mark user as inactive
      await supabase
        .from('session_users')
        .update({ is_active: false })
        .eq('session_id', session.id)
        .eq('is_active', true);

      // Decrease active user count
      await supabase
        .from('sessions')
        .update({ active_users: Math.max(0, session.active_users - 1) })
        .eq('id', session.id);

      if (channel) {
        supabase.removeChannel(channel);
      }

      setSession(null);
      setUsers([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave session');
    }
  }, [session, channel]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!session) return;

    const sessionChannel = supabase
      .channel(`session-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${session.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const newSession = payload.new as any;
            setSession({
              ...newSession,
              content_type: newSession.content_type as "text" | "code"
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_users',
          filter: `session_id=eq.${session.id}`
        },
        (payload) => {
          // Refresh users when changes occur
          fetchUsers();
        }
      )
      .subscribe();

    setChannel(sessionChannel);

    return () => {
      supabase.removeChannel(sessionChannel);
    };
  }, [session?.id]);

  const fetchUsers = useCallback(async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('session_users')
        .select('*')
        .eq('session_id', session.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, [session?.id]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    session,
    users,
    isLoading,
    error,
    createSession,
    joinSession,
    updateContent,
    leaveSession
  };
};