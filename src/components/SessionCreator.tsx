import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { QrCode, Users, Clock, Copy } from "lucide-react";

const SessionCreator = () => {
  const [sessionCode, setSessionCode] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const generateSessionCode = () => {
    const code = Math.random().toString(36).substring(2, 9).toUpperCase();
    return code;
  };

  const createSession = async () => {
    setIsCreating(true);
    // Simulate session creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newCode = generateSessionCode();
    setSessionCode(newCode);
    setIsCreating(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sessionCode);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
          PasteSync
        </h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Real-time collaborative clipboard across multiple devices
        </p>
      </div>

      {/* Main Action Card */}
      <Card className="glass-card space-y-6">
        {!sessionCode ? (
          <>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-accent/10 rounded-2xl flex items-center justify-center animate-float">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-2xl font-semibold">Create New Session</h2>
              <p className="text-muted-foreground">
                Start a collaborative session and invite others to join
              </p>
            </div>
            
            <Button 
              onClick={createSession}
              disabled={isCreating}
              variant="glass"
              size="lg"
              className="w-full"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Creating Session...
                </div>
              ) : (
                "Create Session"
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-accent/10 rounded-2xl flex items-center justify-center animate-glow">
                <QrCode className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-2xl font-semibold">Session Created!</h2>
              <p className="text-muted-foreground">
                Share this code with others to join your session
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  value={sessionCode}
                  readOnly
                  className="glass-input text-2xl font-mono text-center tracking-wider"
                />
                <Button 
                  onClick={copyToClipboard}
                  variant="glass"
                  size="icon"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Session expires in 6 hours</span>
              </div>
            </div>

            <Button 
              variant="glass"
              size="lg"
              className="w-full"
              onClick={() => {/* Navigate to session */}}
            >
              Enter Session
            </Button>
          </>
        )}
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Users,
            title: "Multi-Device",
            description: "Connect unlimited devices"
          },
          {
            icon: Clock,
            title: "Auto-Cleanup",
            description: "Sessions auto-expire safely"
          },
          {
            icon: QrCode,
            title: "Easy Join",
            description: "QR codes or simple codes"
          }
        ].map((feature, index) => (
          <Card key={index} className="glass-card text-center space-y-3">
            <div className="w-10 h-10 mx-auto bg-accent/10 rounded-xl flex items-center justify-center">
              <feature.icon className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SessionCreator;