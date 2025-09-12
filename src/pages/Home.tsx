import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/use-toast";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import CodeInput from "@/components/CodeInput";
import {
  QrCode,
  Camera,
  Keyboard,
  Plus,
  ArrowRight,
  Github,
  ExternalLink,
} from "lucide-react";

interface HomeProps {
  onSessionCreated: (code: string) => void;
  onSessionJoined: (code: string) => void;
}

const Home = ({ onSessionCreated, onSessionJoined }: HomeProps) => {
  const [sessionCode, setSessionCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [joinMethod, setJoinMethod] = useState<"manual">("manual");
  const [joinError, setJoinError] = useState<string | null>(null);
  const { createSession, joinSession, isLoading } = useSession();
  const { toast } = useToast();

  const handleCreateSession = async () => {
    const session = await createSession();
    if (session) {
      setCreatedCode(session.session_code);
      onSessionCreated(session.session_code);
      toast({
        title: "Session Created",
        description: `Your session ${session.session_code} is ready`,
      });
    }
  };

  const handleJoinSession = async () => {
    if (!sessionCode.trim()) return;

    const session = await joinSession(sessionCode);
    if (session) {
      onSessionJoined(session.session_code);
      toast({
        title: "Joined Successfully",
        description: `Connected to ${session.session_code}`,
      });
    } else {
      // Show create session option when join fails
      toast({
        title: "Session Not Found",
        description: `Session "${sessionCode}" doesn't exist. Would you like to create it?`,
        action: (
          <Button
            size="sm"
            onClick={handleCreateSession}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Create Session
          </Button>
        ),
      });
    }
  };

  const handleSessionCodeChange = (value: string) => {
    const cleanValue = value.replace(/[^A-Z0-9]/g, "").slice(0, 7);
    setSessionCode(cleanValue);
  };

  const handleAutoJoin = async (code: string) => {
    setJoinError(null);
    const session = await joinSession(code);
    if (session) {
      onSessionJoined(session.session_code);
      toast({
        title: "Joined Successfully",
        description: `Connected to ${session.session_code}`,
      });
    } else {
      setJoinError(`Session "${code}" not found`);
      toast({
        title: "Session Not Found",
        description: `Session "${code}" doesn't exist. Would you like to create it?`,
        action: (
          <Button
            size="sm"
            onClick={handleCreateSession}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Create Session
          </Button>
        ),
      });
    }
  };

  const copySessionCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: "Session code copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black text-white mb-4 tracking-tight">
            WeavePaste
          </h1>
          <p className="text-xl text-white/80 font-semibold max-w-2xl mx-auto">
            Sync clipboard across devices instantly and securely
          </p>
        </div>

        {/* Main Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Create Session Card */}
          <Card className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Plus className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Create New Session
              </h2>
              <p className="text-white/70 font-medium">
                Generate a secure session for clipboard sync
              </p>
            </div>

            {createdCode ? (
              <div className="space-y-6">
                <div className="text-center">
                  <Badge
                    variant="outline"
                    className="text-2xl font-bold px-8 py-4 bg-white/20 backdrop-blur-sm border-white/30 text-white"
                  >
                    {createdCode}
                  </Badge>
                  <p className="text-sm text-white/60 mt-3 font-medium">
                    Share this code with your devices
                  </p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-6 bg-white rounded-3xl shadow-xl">
                    <QRCodeGenerator sessionCode={createdCode} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => copySessionCode(createdCode)}
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-semibold"
                  >
                    Copy Code
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleCreateSession}
                    disabled={isLoading}
                    className="text-white hover:bg-white/10 font-semibold"
                  >
                    New Code
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleCreateSession}
                disabled={isLoading}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl rounded-2xl"
              >
                {isLoading ? "Creating..." : "Create Session"}
              </Button>
            )}
          </Card>

          {/* Join Session Card */}
          <Card className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ArrowRight className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Join Session
              </h2>
              <p className="text-white/70 font-medium">
                Enter a session code to join
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <CodeInput
                  onComplete={handleAutoJoin}
                  disabled={isLoading}
                  error={joinError}
                />
                <div className="text-center">
                  <span className="text-sm text-white/60 font-medium">
                    Enter 7-character session code
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              QR Code Sharing
            </h3>
            <p className="text-white/70 text-sm font-medium">
              Share sessions instantly with QR codes
            </p>
          </div>

          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Real-time Sync
            </h3>
            <p className="text-white/70 text-sm font-medium">
              Instant clipboard synchronization
            </p>
          </div>

          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Camera className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Secure Sessions
            </h3>
            <p className="text-white/70 text-sm font-medium">
              6-hour auto-expiring secure sessions
            </p>
          </div>
        </div>

        {/* Developer Footer */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-white font-semibold mb-1">
                  Developed by{" "}
                  <span className="text-blue-400 font-bold">
                    Somrit Dasgupta
                  </span>
                </p>
                <p className="text-white/70 text-sm font-medium">
                  Open source clipboard sync solution
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open("https://github.com/somritdasgupta", "_blank")
                  }
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-semibold"
                >
                  <Github className="w-4 h-4 mr-2" />
                  @somritdasgupta
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      "https://github.com/somritdasgupta/weavepaste",
                      "_blank"
                    )
                  }
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-semibold"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Repository
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
