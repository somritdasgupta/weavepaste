import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Users, 
  Zap, 
  Shield, 
  Clock,
  Github,
  ArrowRight,
  Copy,
  QrCode,
  Sparkles
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/use-toast";
import QRCodeGenerator from "@/components/QRCodeGenerator";

interface HomeProps {
  onSessionCreated: (code: string) => void;
  onSessionJoined: (code: string) => void;
}

const Home = ({ onSessionCreated, onSessionJoined }: HomeProps) => {
  const [sessionCode, setSessionCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const { createSession, joinSession, isLoading } = useSession();
  const { toast } = useToast();

  const handleCreateSession = async () => {
    const session = await createSession();
    if (session) {
      setCreatedCode(session.session_code);
      onSessionCreated(session.session_code);
      toast({
        title: "Session Created! 🎉",
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
        title: "Joined Successfully! 🚀",
        description: `Connected to ${session.session_code}`,
      });
    }
  };

  const handleSessionCodeChange = (value: string) => {
    const cleanValue = value.replace(/[^A-Z0-9]/g, '').slice(0, 7);
    setSessionCode(cleanValue);
  };

  const copySessionCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied! 📋",
      description: "Session code copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-12 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center animate-float">
              <span className="text-accent-foreground font-bold text-lg sm:text-xl">W</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              WeavePaste
            </h1>
          </div>
          
          <a 
            href="https://github.com/somritdasgupta" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">@somritdasgupta</span>
          </a>
        </header>

        {/* Hero Section */}
        <div className="text-center space-y-6 sm:space-y-8 mb-12 sm:mb-16">
          <div className="space-y-4">
            <Badge variant="secondary" className="glass">
              <Sparkles className="w-3 h-3" />
              Real-time Collaboration
            </Badge>
            
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold">
              <span className="bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                Share Text
              </span>
              <br />
              <span className="bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
                Instantly
              </span>
            </h2>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The fastest way to share text and code across multiple devices. No registration required.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-accent" />
              <span>Instant Sync</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-accent" />
              <span>Auto-Delete</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-accent" />
              <span>6 Hour Sessions</span>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {/* Create Session */}
          <Card className="glass-card space-y-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mx-auto">
                <Plus className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Create New Session</h3>
              <p className="text-muted-foreground">
                Start a new collaborative session and share the code with others
              </p>
            </div>

            {createdCode ? (
              <div className="space-y-4">
                <div className="text-center space-y-3">
                  <Badge variant="outline" className="glass text-2xl font-mono px-6 py-3">
                    {createdCode}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Share this code with other devices
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="glass" 
                    onClick={() => copySessionCode(createdCode)}
                    className="w-full"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </Button>
                  
                  <QRCodeGenerator sessionCode={createdCode}>
                    <Button variant="outline" className="glass w-full">
                      <QrCode className="w-4 h-4" />
                      QR Code
                    </Button>
                  </QRCodeGenerator>
                </div>
                
                <Button 
                  variant="glass" 
                  onClick={handleCreateSession}
                  disabled={isLoading}
                  className="w-full"
                >
                  Generate New Code
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleCreateSession} 
                disabled={isLoading}
                variant="glass"
                size="lg"
                className="w-full h-12"
              >
                {isLoading ? "Creating..." : "Create Session"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </Card>

          {/* Join Session */}
          <Card className="glass-card space-y-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Join Existing Session</h3>
              <p className="text-muted-foreground">
                Enter a session code to join an active collaboration
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter 7-digit session code"
                  value={sessionCode}
                  onChange={(e) => handleSessionCodeChange(e.target.value.toUpperCase())}
                  className="glass-input text-center font-mono text-lg tracking-wider h-12"
                  maxLength={7}
                />
                <p className="text-xs text-muted-foreground text-center">
                  {sessionCode.length}/7 characters
                </p>
              </div>
              
              <Button 
                onClick={handleJoinSession} 
                disabled={sessionCode.length !== 7 || isLoading}
                variant="glass"
                size="lg"
                className="w-full h-12"
              >
                {isLoading ? "Joining..." : "Join Session"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        <Separator className="my-8 sm:my-12 opacity-30" />

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <h4 className="font-semibold">Lightning Fast</h4>
            <p className="text-sm text-muted-foreground">
              Real-time synchronization across all connected devices
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <h4 className="font-semibold">Privacy First</h4>
            <p className="text-sm text-muted-foreground">
              Sessions auto-delete after 6 hours. No permanent storage.
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <h4 className="font-semibold">Multi-Device</h4>
            <p className="text-sm text-muted-foreground">
              Works seamlessly across phones, tablets, and computers
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 sm:mt-16 pt-8 border-t border-border/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Made by</span>
              <a 
                href="https://github.com/somritdasgupta" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80 transition-colors font-medium"
              >
                Somrit Dasgupta
              </a>
            </div>
            <a 
              href="https://github.com/somritdasgupta" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
            >
              <Github className="w-4 h-4" />
              @somritdasgupta
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;