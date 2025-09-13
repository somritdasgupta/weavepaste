import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Trash2,
  Activity,
  Users,
  Clock,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionStats } from "@/hooks/useSessionCleanup";

interface SessionData {
  session_code: string;
  created_at: string;
  expires_at: string;
  last_activity: string;
  active_users: number;
  content?: string;
}

interface UserData {
  user_name: string;
  session_code: string;
  last_seen: string;
  is_active: boolean;
  color: string;
}

interface UserWithSession {
  user_name: string;
  last_seen: string;
  is_active: boolean;
  color: string;
  sessions: {
    session_code: string;
  };
}

const DatabaseAdmin: React.FC = () => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [sessionUsers, setSessionUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    totalUsers: 0,
    activeUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastCleanup, setLastCleanup] = useState<string>("");

  const { getActiveSessionsCount, getTotalSessionsCount } = useSessionStats();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select(
          "session_code, created_at, expires_at, last_activity, active_users, content"
        )
        .order("last_activity", { ascending: false });

      if (!sessionsError && sessionsData) {
        setSessions(sessionsData);
      }

      // Load users with session info
      const { data: usersData, error: usersError } = await supabase
        .from("session_users")
        .select(
          `
          user_name, 
          last_seen, 
          is_active, 
          color,
          sessions!inner(session_code)
        `
        )
        .order("last_seen", { ascending: false });

      if (!usersError && usersData) {
        const formattedUsers: UserData[] = (usersData as UserWithSession[]).map(
          (user) => ({
            user_name: user.user_name,
            session_code: user.sessions.session_code,
            last_seen: user.last_seen,
            is_active: user.is_active,
            color: user.color,
          })
        );
        setSessionUsers(formattedUsers);
      }

      // Calculate stats
      const totalSessions = await getTotalSessionsCount();
      const activeSessions = await getActiveSessionsCount();
      const totalUsers =
        sessionsData?.reduce((sum, s) => sum + s.active_users, 0) || 0;
      const activeUsers = usersData?.filter((u) => u.is_active).length || 0;

      setStats({
        totalSessions,
        activeSessions,
        totalUsers,
        activeUsers,
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getTotalSessionsCount, getActiveSessionsCount]);

  const runCleanup = async () => {
    try {
      const { error } = await supabase.rpc("cleanup_expired_sessions");
      if (!error) {
        setLastCleanup(new Date().toLocaleTimeString());
        await loadData(); // Reload data after cleanup
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  const getSessionStatus = (session: SessionData) => {
    const now = new Date();
    const expires = new Date(session.expires_at);
    const lastActivity = new Date(session.last_activity);
    const minutesSinceActivity =
      (now.getTime() - lastActivity.getTime()) / (1000 * 60);

    if (expires < now) return { status: "EXPIRED", color: "bg-red-500" };
    if (session.active_users === 0 && minutesSinceActivity > 30)
      return { status: "INACTIVE", color: "bg-yellow-500" };
    if (session.active_users === 0 && minutesSinceActivity > 60)
      return { status: "ABANDONED", color: "bg-orange-500" };
    return { status: "ACTIVE", color: "bg-green-500" };
  };

  const formatTimeAgo = (dateString: string) => {
    const minutes = Math.floor(
      (new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60)
    );
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading database info...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Database className="w-8 h-8" />
            Database Administration
          </h1>
          <p className="text-white/70">
            Session cleanup and monitoring dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardContent className="p-4 text-center">
              <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {stats.totalSessions}
              </div>
              <div className="text-white/70 text-sm">Total Sessions</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
              <div className="text-2xl font-bold text-white">
                {stats.activeSessions}
              </div>
              <div className="text-white/70 text-sm">Active Sessions</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {stats.totalUsers}
              </div>
              <div className="text-white/70 text-sm">Total Users</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-green-400 rounded-full mx-auto mb-2"></div>
              <div className="text-2xl font-bold text-white">
                {stats.activeUsers}
              </div>
              <div className="text-white/70 text-sm">Active Users</div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Cleanup Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-white/70">
              <p>Manual cleanup removes expired and inactive sessions</p>
              {lastCleanup && (
                <p className="text-sm">Last cleanup: {lastCleanup}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadData}
                variant="outline"
                className="text-white border-white/30"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={runCleanup}
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Run Cleanup
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Table */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.slice(0, 10).map((session, index) => {
                const { status, color } = getSessionStatus(session);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={`${color} text-white`}>
                        {session.session_code}
                      </Badge>
                      <div className="text-white/70 text-sm">
                        <div>{session.active_users} users</div>
                        <div>Last: {formatTimeAgo(session.last_activity)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={status === "ACTIVE" ? "default" : "secondary"}
                      >
                        {status}
                      </Badge>
                      <Clock className="w-4 h-4 text-white/50" />
                      <span className="text-white/70 text-sm">
                        {Math.floor(
                          (new Date(session.expires_at).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60)
                        )}
                        h left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessionUsers.slice(0, 10).map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: user.color }}
                    ></div>
                    <span className="text-white font-medium">
                      {user.user_name}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-white/70 border-white/30"
                    >
                      {user.session_code}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                    <span className="text-white/70 text-sm">
                      {formatTimeAgo(user.last_seen)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseAdmin;
