import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { QrCode, ArrowRight, Scan } from "lucide-react";

const SessionJoiner = () => {
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinSession = async () => {
    if (!joinCode.trim()) return;
    
    setIsJoining(true);
    // Simulate joining session
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsJoining(false);
    // Navigate to session
  };

  const formatCode = (value: string) => {
    // Auto-format and uppercase the code
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 7);
  };

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-accent/10 rounded-3xl flex items-center justify-center animate-float">
          <Scan className="w-10 h-10 text-accent" />
        </div>
        <h1 className="text-4xl font-bold">Join Session</h1>
        <p className="text-muted-foreground">
          Enter the 7-digit code to join an active session
        </p>
      </div>

      {/* Join Form */}
      <Card className="glass-card space-y-6">
        <div className="space-y-4">
          <label className="text-sm font-medium">Session Code</label>
          <Input
            value={joinCode}
            onChange={(e) => setJoinCode(formatCode(e.target.value))}
            placeholder="ABC1234"
            className="glass-input text-2xl font-mono text-center tracking-wider h-14"
            maxLength={7}
          />
          <p className="text-xs text-muted-foreground text-center">
            7-character code provided by session creator
          </p>
        </div>

        <Button 
          onClick={handleJoinSession}
          disabled={joinCode.length !== 7 || isJoining}
          variant="glass"
          size="lg"
          className="w-full"
        >
          {isJoining ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              Joining Session...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Join Session
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>
      </Card>

      {/* QR Scanner Option */}
      <Card className="glass-card text-center space-y-4">
        <QrCode className="w-12 h-12 mx-auto text-muted-foreground" />
        <div className="space-y-2">
          <h3 className="font-semibold">Scan QR Code</h3>
          <p className="text-sm text-muted-foreground">
            Use your camera to scan a session QR code
          </p>
        </div>
        <Button variant="glass" className="w-full">
          Open Camera Scanner
        </Button>
      </Card>

      {/* Help */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Don't have a session code?
        </p>
        <Button variant="link" className="text-accent hover:text-accent/80">
          Create new session instead
        </Button>
      </div>
    </div>
  );
};

export default SessionJoiner;