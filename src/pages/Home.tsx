import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/use-toast";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import CodeInput from "@/components/CodeInput";
import { InlineQRScanner } from "@/components/InlineQRScanner";
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
  const [joinMethod, setJoinMethod] = useState<"manual" | "qr">("manual");
  const [joinError, setJoinError] = useState<string | null>(null);
  const { createSession, joinSession, isLoading } = useSession();
  const { toast } = useToast();
  
  // Touch gesture handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const swipeThreshold = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0 && joinMethod === "manual") {
        // Swipe left to QR
        setJoinMethod("qr");
        setJoinError(null);
      } else if (swipeDistance < 0 && joinMethod === "qr") {
        // Swipe right to manual
        setJoinMethod("manual");
        setJoinError(null);
      }
    }
  };

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

  const handleQRScanResult = async (result: string) => {
    setJoinError(null);

    // Process the scanned result
    await handleAutoJoin(result);
  };

  const handleQRScanError = (error: string) => {
    console.error("QR scan error:", error);
    toast({
      title: "Scanner Error",
      description: "Failed to scan QR code. Please try again.",
      variant: "destructive",
    });
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
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
          {/* Create Session Card */}
          <Card className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl md:rounded-3xl p-6 md:p-8 hover:bg-white/15 transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl transform">
            <div className="text-center mb-6 md:mb-8">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500/20 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 transition-all duration-300 hover:scale-110">
                <Plus className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">
                Create New Session
              </h2>
              <p className="text-white/70 font-medium text-sm md:text-base">
                Generate a secure session for clipboard sync
              </p>
            </div>

            {createdCode ? (
              <div className="space-y-4 md:space-y-6">
                <div className="text-center">
                  <Badge
                    variant="outline"
                    className="text-xl md:text-2xl font-bold px-6 md:px-8 py-3 md:py-4 bg-white/20 backdrop-blur-sm border-white/30 text-white transition-all duration-300 hover:scale-105"
                  >
                    {createdCode}
                  </Badge>
                  <p className="text-xs md:text-sm text-white/60 mt-2 md:mt-3 font-medium">
                    Share this code with your devices
                  </p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl shadow-xl transition-all duration-300 hover:scale-105">
                    <QRCodeGenerator sessionCode={createdCode} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <Button
                    variant="outline"
                    onClick={() => copySessionCode(createdCode)}
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-semibold text-sm md:text-base py-2 md:py-3 transition-all duration-300 hover:scale-105"
                  >
                    Copy Code
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleCreateSession}
                    disabled={isLoading}
                    className="text-white hover:bg-white/10 font-semibold text-sm md:text-base py-2 md:py-3 transition-all duration-300 hover:scale-105"
                  >
                    New Code
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleCreateSession}
                disabled={isLoading}
                className="w-full h-12 md:h-14 text-base md:text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl rounded-xl md:rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 touch-manipulation"
              >
                {isLoading ? "Creating..." : "Create Session"}
              </Button>
            )}
          </Card>

          {/* Join Session Card */}
          <Card className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl md:rounded-3xl p-6 md:p-8 hover:bg-white/15 transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl transform">
            <div className="text-center mb-6 md:mb-8">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/20 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 transition-all duration-300 hover:scale-110">
                <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">
                Join Session
              </h2>
              <p className="text-white/70 font-medium text-sm md:text-base">
                Enter code manually or scan QR code
              </p>
            </div>

            <div className="space-y-6">
              {/* Join Method Toggle with Animation */}
              <div className="relative flex gap-1 p-1 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <div
                  className={`absolute top-1 bottom-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-sm rounded-xl transition-all duration-500 ease-out ${
                    joinMethod === "manual"
                      ? "left-1 right-1/2 mr-0.5"
                      : "left-1/2 right-1 ml-0.5"
                  }`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setJoinMethod("manual");
                    setJoinError(null);
                  }}
                  className={`relative z-10 flex-1 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    joinMethod === "manual"
                      ? "text-white bg-transparent shadow-lg"
                      : "text-white/60 hover:text-white/80 bg-transparent"
                  }`}
                >
                  <Keyboard className="w-4 h-4 mr-2" />
                  Manual Input
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setJoinMethod("qr");
                    setJoinError(null);
                  }}
                  className={`relative z-10 flex-1 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    joinMethod === "qr"
                      ? "text-white bg-transparent shadow-lg"
                      : "text-white/60 hover:text-white/80 bg-transparent"
                  }`}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Scan QR
                </Button>
              </div>

              {/* Join Methods with Smooth Transitions and Swipe Support */}
              <div 
                className="relative min-h-[200px] overflow-hidden select-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Swipe Indicator */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 md:hidden">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${joinMethod === "manual" ? "bg-white" : "bg-white/30"}`} />
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${joinMethod === "qr" ? "bg-white" : "bg-white/30"}`} />
                  </div>
                </div>
                {/* Manual Input */}
                <div
                  className={`absolute inset-0 transition-all duration-500 ease-out ${
                    joinMethod === "manual"
                      ? "opacity-100 transform translate-x-0"
                      : "opacity-0 transform -translate-x-full pointer-events-none"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                      <CodeInput
                        onComplete={handleAutoJoin}
                        disabled={isLoading}
                        error={joinError}
                      />
                      <div className="text-center mt-4">
                        <span className="text-sm text-white/60 font-medium">
                          Enter 7-character session code
                        </span>
                        <div className="mt-2 md:hidden">
                          <span className="text-xs text-white/40 font-medium">
                            ← Swipe to switch to QR scanner →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Scanner */}
                <div
                  className={`absolute inset-0 transition-all duration-500 ease-out ${
                    joinMethod === "qr"
                      ? "opacity-100 transform translate-x-0"
                      : "opacity-0 transform translate-x-full pointer-events-none"
                  }`}
                >
                  <div className="space-y-4">
                    <InlineQRScanner 
                      onResult={handleQRScanResult}
                      onError={handleQRScanError}
                      isActive={joinMethod === "qr"}
                    />
                    <div className="text-center">
                      <span className="text-sm text-white/60 font-medium">
                        Point camera at QR code to join session automatically
                      </span>
                      <div className="mt-2 md:hidden">
                        <span className="text-xs text-white/40 font-medium">
                          ← Swipe to switch to manual input →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
          <div className="text-center p-4 md:p-6 bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:scale-105">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/20 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <QrCode className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-white mb-1 md:mb-2">
              QR Code Sharing
            </h3>
            <p className="text-white/70 text-xs md:text-sm font-medium">
              Share sessions instantly with QR codes
            </p>
          </div>

          <div className="text-center p-4 md:p-6 bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:scale-105">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-white mb-1 md:mb-2">
              Real-time Sync
            </h3>
            <p className="text-white/70 text-xs md:text-sm font-medium">
              Instant clipboard synchronization
            </p>
          </div>

          <div className="text-center p-4 md:p-6 bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:scale-105">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Camera className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-white mb-1 md:mb-2">
              Secure Sessions
            </h3>
            <p className="text-white/70 text-xs md:text-sm font-medium">
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
