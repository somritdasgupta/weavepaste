import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseSessionCleanupProps {
  sessionId?: string;
  userName?: string;
  isActive?: boolean;
}

/**
 * Hook to handle automatic session cleanup and user heartbeats
 * This keeps the user active and triggers cleanup of old sessions
 */
export const useSessionCleanup = ({
  sessionId,
  userName,
  isActive = true,
}: UseSessionCleanupProps) => {
  const heartbeatInterval = useRef<NodeJS.Timeout>();
  const cleanupInterval = useRef<NodeJS.Timeout>();

  // User heartbeat - tells server this user is still active
  const sendHeartbeat = useCallback(async () => {
    if (!sessionId || !userName || !isActive) return;

    try {
      // Use the database function for proper heartbeat
      const { error } = await supabase.rpc("user_heartbeat", {
        p_session_id: sessionId,
        p_user_name: userName,
      });

      if (error) {
        console.warn("Heartbeat failed:", error);
      }
    } catch (error) {
      console.warn("Heartbeat error:", error);
    }
  }, [sessionId, userName, isActive]);

  // Trigger cleanup of expired sessions
  const triggerCleanup = useCallback(async () => {
    try {
      // Call the cleanup function
      const { error } = await supabase.rpc("cleanup_expired_sessions");

      if (error) {
        console.warn("Cleanup failed:", error);
      } else {
        console.log("🧹 Session cleanup completed");
      }
    } catch (error) {
      console.warn("Cleanup error:", error);
    }
  }, []);

  // Start heartbeat when user becomes active
  useEffect(() => {
    if (!sessionId || !userName || !isActive) {
      // Clear intervals if user becomes inactive
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = undefined;
      }
      return;
    }

    // Send initial heartbeat
    sendHeartbeat();

    // Set up heartbeat interval (every 30 seconds)
    heartbeatInterval.current = setInterval(sendHeartbeat, 30000);

    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = undefined;
      }
    };
  }, [sessionId, userName, isActive, sendHeartbeat]);

  // Periodic cleanup (runs less frequently)
  useEffect(() => {
    // Run cleanup every 5 minutes
    cleanupInterval.current = setInterval(triggerCleanup, 5 * 60 * 1000);

    // Run initial cleanup after 10 seconds
    const initialCleanup = setTimeout(triggerCleanup, 10000);

    return () => {
      if (cleanupInterval.current) {
        clearInterval(cleanupInterval.current);
        cleanupInterval.current = undefined;
      }
      clearTimeout(initialCleanup);
    };
  }, [triggerCleanup]);

  // Cleanup when user leaves (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Mark user as inactive immediately when leaving
      if (sessionId && userName) {
        supabase
          .from("session_users")
          .update({ is_active: false })
          .eq("session_id", sessionId)
          .eq("user_name", userName);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload(); // Also cleanup when component unmounts
    };
  }, [sessionId, userName]);

  return {
    sendHeartbeat,
    triggerCleanup,
  };
};

/**
 * Hook to get session statistics
 */
export const useSessionStats = () => {
  const getActiveSessionsCount = async () => {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("id")
        .gt("expires_at", new Date().toISOString())
        .gt("active_users", 0);

      if (error) {
        console.error("Failed to get active sessions count:", error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error("Active sessions count error:", error);
      return 0;
    }
  };

  const getTotalSessionsCount = async () => {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("id", { count: "exact" });

      if (error) {
        console.error("Failed to get total sessions count:", error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error("Total sessions count error:", error);
      return 0;
    }
  };

  return {
    getActiveSessionsCount,
    getTotalSessionsCount,
  };
};
