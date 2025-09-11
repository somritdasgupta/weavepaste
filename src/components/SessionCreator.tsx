import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, QrCode, RefreshCw, CheckCircle } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/use-toast";

interface SessionCreatorProps {
  onSessionCreated?: (sessionCode: string) => void;
}

const SessionCreator = ({ onSessionCreated }: SessionCreatorProps) => {
  const [sessionCode, setSessionCode] = useState("");
  const { createSession, isLoading } = useSession();
  const { toast } = useToast();

  const generateSessionCode = async () => {
    const session = await createSession();
    if (session) {
      setSessionCode(session.session_code);
      onSessionCreated?.(session.session_code);
      toast({
        title: "Session Created",
        description: "Your collaborative session is ready!",
      });
    }
  };

  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode);
    toast({
      title: "Copied!",
      description: "Session code copied to clipboard",
    });
  };

  const generateQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '?join=' + sessionCode)}`;
    window.open(qrUrl, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">Create New Session</h2>
        <p className="text-muted-foreground text-lg">
          Generate a unique session code for collaborative clipboard sharing
        </p>
      </div>

      <Card className="glass-card max-w-md mx-auto space-y-6">
        {!sessionCode ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Click below to generate a new session
            </p>
            <Button 
              onClick={generateSessionCode} 
              disabled={isLoading}
              variant="glass"
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Session Code"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-accent">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">Session Created Successfully!</p>
              </div>
              <Badge variant="outline" className="glass text-2xl font-mono px-6 py-3">
                {sessionCode}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Share this code with other devices to start collaborating
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={copySessionCode} 
                variant="glass" 
                size="lg" 
                className="w-full"
              >
                <Copy className="w-4 h-4" />
                Copy Session Code
              </Button>
              
              <Button 
                onClick={generateQRCode} 
                variant="outline" 
                size="lg" 
                className="w-full glass"
              >
                <QrCode className="w-4 h-4" />
                Generate QR Code
              </Button>
              
              <Button 
                onClick={generateSessionCode} 
                variant="ghost" 
                size="lg" 
                className="w-full"
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4" />
                Generate New Code
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SessionCreator;