import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ArrowRight,
  Shield,
  Smartphone,
  Wifi,
  CheckCircle,
  User,
  Globe,
} from "lucide-react";

interface JoinSessionProps {
  onJoin?: (sessionCode: string, deviceName: string) => void;
}

const JoinSession: React.FC<JoinSessionProps> = ({ onJoin }) => {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const navigate = useNavigate();
  const [deviceName, setDeviceName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{
    hostName?: string;
    deviceCount?: number;
    isActive?: boolean;
  } | null>(null);

  useEffect(() => {
    // Generate a default device name
    const generateDeviceName = () => {
      const adjectives = ["Quick", "Swift", "Bright", "Smart", "Cool", "Fast"];
      const nouns = ["Device", "Phone", "Computer", "Tablet", "Browser"];
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      return `${adj} ${noun}`;
    };

    setDeviceName(generateDeviceName());

    // TODO: Fetch session info from Supabase
    setSessionInfo({
      hostName: "crystalburst",
      deviceCount: 1,
      isActive: true,
    });
  }, [sessionCode]);

  const handleJoinSession = async () => {
    if (!sessionCode || !deviceName.trim()) return;

    setIsJoining(true);
    try {
      // TODO: Join session logic
      if (onJoin) {
        onJoin(sessionCode, deviceName.trim());
      }

      // Navigate to the collaborative editor
      navigate(
        `/session/${sessionCode}?device=${encodeURIComponent(
          deviceName.trim()
        )}`
      );
    } catch (error) {
      console.error("Failed to join session:", error);
    } finally {
      setIsJoining(false);
    }
  };

  if (!sessionCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 max-w-md w-full text-center">
          <div className="text-red-400 text-xl font-semibold mb-4">
            Invalid Session
          </div>
          <p className="text-white/70 mb-6">
            The session link appears to be invalid or malformed.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-purple-900/10 to-pink-900/10" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Invitation Card */}
        <Card className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/20 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                You've been invited!
              </h1>
              <p className="text-white/70 text-sm">
                Join this collaborative session to share text and sync across
                devices
              </p>
            </div>
          </div>

          {/* Session Info */}
          <div className="p-6 space-y-4">
            {/* Host Info */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {sessionInfo?.hostName || "Unknown Host"}
                  </div>
                  <div className="text-white/50 text-sm">Session Host</div>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-green-500/10 border-green-500/30 text-green-400"
              >
                Host
              </Badge>
            </div>

            {/* Session Code */}
            <div className="text-center py-4">
              <div className="text-white/70 text-sm mb-2">Session Code</div>
              <div className="flex justify-center">
                <Badge
                  variant="outline"
                  className="text-2xl font-bold px-6 py-3 bg-white/20 backdrop-blur-sm border-white/30 text-white rounded-xl"
                >
                  {sessionCode}
                </Badge>
              </div>
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-center mb-1">
                  <Globe className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-white/50 text-xs">Status</div>
                <div className="text-white font-semibold text-sm">
                  {sessionInfo?.isActive ? "Active" : "Inactive"}
                </div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-white/50 text-xs">Devices</div>
                <div className="text-white font-semibold text-sm">
                  {sessionInfo?.deviceCount || 0}
                </div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-center mb-1">
                  <Shield className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-white/50 text-xs">Secure</div>
                <div className="text-white font-semibold text-sm">
                  <CheckCircle className="w-3 h-3 text-green-400 mx-auto" />
                </div>
              </div>
            </div>

            {/* Device Name Input */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">
                Your Device Name
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Enter device name..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                  maxLength={30}
                />
              </div>
              <p className="text-white/50 text-xs">
                This name will be visible to other participants
              </p>
            </div>
          </div>

          {/* Join Button */}
          <div className="p-6 pt-0">
            <Button
              onClick={handleJoinSession}
              disabled={!deviceName.trim() || isJoining}
              className="w-full py-4 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-xl rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Joining Session...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Wifi className="w-5 h-5" />
                  Swipe to Join Session
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="text-center text-white/50 text-xs">
              By joining, you agree to share text and clipboard data with this
              session
            </div>
          </div>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
          >
            Create New Session Instead
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JoinSession;
