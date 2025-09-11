import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Users, Loader2 } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/use-toast";

interface SessionJoinerProps {
  onSessionJoined?: (sessionCode: string) => void;
}

const SessionJoiner = ({ onSessionJoined }: SessionJoinerProps) => {
  const [sessionCode, setSessionCode] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const { joinSession, isLoading, error } = useSession();
  const { toast } = useToast();

  // Check URL for session code parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
      setSessionCode(joinCode.toUpperCase());
    }
  }, []);

  const handleJoinSession = async () => {
    if (!sessionCode.trim()) return;
    
    const session = await joinSession(sessionCode, deviceName);
    if (session) {
      onSessionJoined?.(session.session_code);
      toast({
        title: "Joined Session!",
        description: `Connected to session ${session.session_code}`,
      });
    }
  };

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const scanQRCode = () => {
    // For demo purposes, we'll simulate QR code scanning
    toast({
      title: "QR Scanner",
      description: "QR code scanning feature would be implemented using camera API",
    });
  };

  const handleSessionCodeChange = (value: string) => {
    // Only allow alphanumeric characters and limit to 7 characters
    const cleanValue = value.replace(/[^A-Z0-9]/g, '').slice(0, 7);
    setSessionCode(cleanValue);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">Join Session</h2>
        <p className="text-muted-foreground text-lg">
          Enter a session code to join an existing collaborative session
        </p>
      </div>

      <Card className="glass-card max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionCode" className="text-sm font-medium">
              Session Code
            </Label>
            <Input
              id="sessionCode"
              placeholder="Enter 7-digit session code"
              value={sessionCode}
              onChange={(e) => handleSessionCodeChange(e.target.value.toUpperCase())}
              className="glass-input text-center font-mono text-lg tracking-wider"
              maxLength={7}
            />
            <p className="text-xs text-muted-foreground text-center">
              {sessionCode.length}/7 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deviceName" className="text-sm font-medium">
              Device Name (Optional)
            </Label>
            <Input
              id="deviceName"
              placeholder="e.g., iPhone 13, MacBook Pro"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="glass-input"
              maxLength={20}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleJoinSession} 
            disabled={sessionCode.length !== 7 || isLoading}
            variant="glass"
            size="lg"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Joining Session...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                Join Session
              </>
            )}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          
          <Button 
            onClick={scanQRCode} 
            variant="outline" 
            size="lg" 
            className="w-full glass"
          >
            <QrCode className="w-4 h-4" />
            Scan QR Code
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SessionJoiner;