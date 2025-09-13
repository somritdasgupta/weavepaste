import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { generateDeviceName as generateCreativeDeviceName } from "@/lib/deviceNames";
import { useSessionCleanup } from "./useSessionCleanup";

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

interface SessionStorage {
  sessionCode: string;
  userId: string;
  userName: string;
  color: string;
  joinedAt: string;
  disconnectReason?: "manual" | "kicked" | "timeout";
}

const STORAGE_KEY = "weavepaste_session";
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000; // 2 seconds

export const useSession = (sessionCode?: string) => {
  const [session, setSession] = useState<Session | null>(null);
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Initialize cleanup system for automatic session maintenance
  useSessionCleanup({
    sessionId: session?.id,
    userName: currentUser?.user_name,
    isActive: !!session && !!currentUser,
  });

  const generateDeviceName = () => {
    return generateCreativeDeviceName();
  };

  const generateColor = () => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Session persistence utilities
  const saveSessionToStorage = (
    sessionData: Session,
    userData: SessionUser
  ) => {
    const storageData: SessionStorage = {
      sessionCode: sessionData.session_code,
      userId: userData.id,
      userName: userData.user_name,
      color: userData.color,
      joinedAt: userData.joined_at,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
  };

  const getSessionFromStorage = (): SessionStorage | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const clearSessionStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  // Auto-reconnect functionality
  const attemptReconnect = useCallback(
    async (storedSession: SessionStorage) => {
      if (reconnectAttempts >= RECONNECT_ATTEMPTS) {
        setError("Unable to reconnect after multiple attempts");
        clearSessionStorage();
        return false;
      }

      setIsReconnecting(true);
      setReconnectAttempts((prev) => prev + 1);

      try {
        // Check if session still exists and is valid
        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .select("*")
          .eq("session_code", storedSession.sessionCode)
          .single();

        if (sessionError || !sessionData) {
          throw new Error("Session no longer exists");
        }

        // Check if session expired
        if (new Date(sessionData.expires_at) < new Date()) {
          throw new Error("Session has expired");
        }

        // Check if user was kicked or manually disconnected
        if (
          storedSession.disconnectReason === "kicked" ||
          storedSession.disconnectReason === "manual"
        ) {
          throw new Error(
            "Cannot reconnect: " + storedSession.disconnectReason
          );
        }

        // Reactivate user in session
        const { data: userData, error: userError } = await supabase
          .from("session_users")
          .update({
            is_active: true,
            last_seen: new Date().toISOString(),
          })
          .eq("id", storedSession.userId)
          .select()
          .single();

        if (userError || !userData) {
          // User record might be gone, create new one
          const { data: newUserData, error: newUserError } = await supabase
            .from("session_users")
            .insert([
              {
                session_id: sessionData.id,
                user_name: storedSession.userName,
                color: storedSession.color,
                is_active: true,
              },
            ])
            .select()
            .single();

          if (newUserError) throw newUserError;
          setCurrentUser(newUserData);

          if (sessionData) {
            const fixedSessionData = {
              ...sessionData,
              content_type:
                (sessionData.content_type as "text" | "code") || "text",
            };
            saveSessionToStorage(fixedSessionData, newUserData);
          }
        } else {
          setCurrentUser(userData);
        }

        const typedSession = {
          ...sessionData,
          content_type: sessionData.content_type as "text" | "code",
        };
        setSession(typedSession);
        setReconnectAttempts(0);
        setIsReconnecting(false);
        return true;
      } catch (err) {
        console.warn(`Reconnect attempt ${reconnectAttempts + 1} failed:`, err);

        if (reconnectAttempts < RECONNECT_ATTEMPTS - 1) {
          setTimeout(() => attemptReconnect(storedSession), RECONNECT_DELAY);
        } else {
          setError("Failed to reconnect to session");
          clearSessionStorage();
          setIsReconnecting(false);
        }
        return false;
      }
    },
    [reconnectAttempts]
  );

  // Heartbeat to maintain session
  const sendHeartbeat = useCallback(async () => {
    if (!currentUser || !session) return;

    try {
      await supabase
        .from("session_users")
        .update({ last_seen: new Date().toISOString() })
        .eq("id", currentUser.id);
    } catch (err) {
      console.warn("Heartbeat failed:", err);
    }
  }, [currentUser, session]);

  const createSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc("generate_session_code");
      if (error) throw error;

      const sessionCode = data;
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .insert([
          {
            session_code: sessionCode,
            content: "",
            content_type: "text",
          },
        ])
        .select()
        .single();

      if (sessionError) throw sessionError;

      const typedSession = {
        ...sessionData,
        content_type: sessionData.content_type as "text" | "code",
      };

      // Create user entry for session creator
      const deviceName = generateDeviceName();
      const { data: userData, error: userError } = await supabase
        .from("session_users")
        .insert([
          {
            session_id: sessionData.id,
            user_name: deviceName,
            color: generateColor(),
            is_active: true,
          },
        ])
        .select()
        .single();

      if (userError) throw userError;

      setSession(typedSession);
      setCurrentUser(userData);
      saveSessionToStorage(typedSession, userData);

      return typedSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
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
        .from("sessions")
        .select("*")
        .eq("session_code", code.toUpperCase())
        .single();

      if (sessionError || !sessionData) {
        throw new Error(
          `Session "${code.toUpperCase()}" not found. Please check the code or create a new session.`
        );
      }

      // Check if session is expired
      if (new Date(sessionData.expires_at) < new Date()) {
        throw new Error("Session has expired");
      }

      const typedJoinSession = {
        ...sessionData,
        content_type: sessionData.content_type as "text" | "code",
      };
      setSession(typedJoinSession);

      // Add user to session
      const deviceName = userName || generateDeviceName();
      const { data: userData, error: userError } = await supabase
        .from("session_users")
        .insert([
          {
            session_id: sessionData.id,
            user_name: deviceName,
            color: generateColor(),
            is_active: true,
          },
        ])
        .select()
        .single();

      if (userError) throw userError;

      // Update active user count
      await supabase
        .from("sessions")
        .update({ active_users: sessionData.active_users + 1 })
        .eq("id", sessionData.id);

      setCurrentUser(userData);
      saveSessionToStorage(typedJoinSession, userData);

      return sessionData;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join session");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateContent = useCallback(
    async (content: string, contentType: "text" | "code" = "text") => {
      if (!session) return;

      try {
        const { error } = await supabase
          .from("sessions")
          .update({ content, content_type: contentType })
          .eq("id", session.id);

        if (error) throw error;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update content"
        );
      }
    },
    [session]
  );

  const leaveSession = useCallback(
    async (reason: "manual" | "kicked" | "timeout" = "manual") => {
      if (!session || !currentUser) return;

      try {
        // Mark user as inactive
        await supabase
          .from("session_users")
          .update({ is_active: false })
          .eq("id", currentUser.id);

        // Decrease active user count
        await supabase
          .from("sessions")
          .update({ active_users: Math.max(0, session.active_users - 1) })
          .eq("id", session.id);

        if (channel) {
          supabase.removeChannel(channel);
        }

        // Update storage with disconnect reason if needed
        if (reason !== "manual") {
          const stored = getSessionFromStorage();
          if (stored) {
            stored.disconnectReason = reason;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
          }
        } else {
          clearSessionStorage();
        }

        setSession(null);
        setUsers([]);
        setCurrentUser(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to leave session"
        );
      }
    },
    [session, currentUser, channel]
  );

  const kickUser = useCallback(
    async (userId: string) => {
      if (!session || !currentUser) return false;

      try {
        // Mark the user as inactive
        await supabase
          .from("session_users")
          .update({ is_active: false })
          .eq("id", userId)
          .eq("session_id", session.id);

        // Decrease active user count
        await supabase
          .from("sessions")
          .update({ active_users: Math.max(0, session.active_users - 1) })
          .eq("id", session.id);

        // Send a kick notification through the channel
        if (channel) {
          channel.send({
            type: "broadcast",
            event: "user_kicked",
            payload: { userId, kickedBy: currentUser.id },
          });
        }

        // Update local users list
        setUsers((prev) => prev.filter((user) => user.id !== userId));

        return true;
      } catch (error) {
        console.error("Failed to kick user:", error);
        setError("Failed to kick user");
        return false;
      }
    },
    [session, currentUser, channel]
  );

  // Initialize auto-reconnect on component mount or sessionCode change
  useEffect(() => {
    const initializeSession = async () => {
      // If sessionCode is provided as prop, try to join that session
      if (sessionCode && !session) {
        setIsLoading(true);
        try {
          await joinSession(sessionCode);
        } catch (error) {
          console.error("Failed to join session from prop:", error);
          setError("Failed to join session");
        }
        setIsLoading(false);
        return;
      }

      // Otherwise, try to restore from storage
      const storedSession = getSessionFromStorage();
      if (storedSession && !session && !sessionCode) {
        setIsLoading(true);
        await attemptReconnect(storedSession);
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [sessionCode, session, joinSession, attemptReconnect]); // Include all dependencies

  // Set up heartbeat
  useEffect(() => {
    if (!currentUser || !session) return;

    const heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    return () => clearInterval(heartbeatInterval);
  }, [currentUser, session, sendHeartbeat]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Don't clear storage on page refresh - allow auto-reconnect
      if (currentUser) {
        navigator.sendBeacon(
          "/api/heartbeat",
          JSON.stringify({ userId: currentUser.id })
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && session && currentUser) {
        // Page became visible again, send heartbeat
        sendHeartbeat();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentUser, session, sendHeartbeat]);

  const fetchUsers = useCallback(async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from("session_users")
        .select("*")
        .eq("session_id", session.id)
        .eq("is_active", true)
        .order("joined_at", { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, [session]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!session) return;

    const sessionChannel = supabase
      .channel(`session-${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const newSession = payload.new as Session;
            setSession({
              ...newSession,
              content_type: newSession.content_type as "text" | "code",
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_users",
          filter: `session_id=eq.${session.id}`,
        },
        () => {
          // Refresh users when changes occur
          fetchUsers();
        }
      )
      .on("broadcast", { event: "user_kicked" }, (payload) => {
        // If current user was kicked, leave the session
        if (payload.payload.userId === currentUser?.id) {
          leaveSession("kicked");
        }
      })
      .subscribe();

    setChannel(sessionChannel);

    return () => {
      supabase.removeChannel(sessionChannel);
    };
  }, [session, fetchUsers, currentUser?.id, leaveSession]);

  useEffect(() => {
    if (session) {
      fetchUsers();
    }
  }, [fetchUsers, session]);

  return {
    session,
    users,
    currentUser,
    isLoading,
    isReconnecting,
    error,
    createSession,
    joinSession,
    updateContent,
    leaveSession,
    kickUser,
    reconnectAttempts,
  };
};
