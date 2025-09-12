import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Copy, 
  Download, 
  Settings, 
  Clock,
  Wifi,
  WifiOff,
  Code,
  FileText,
  LogOut,
  Github,
  QrCode
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/use-toast";
import QRCodeGenerator from "@/components/QRCodeGenerator";

interface CollaborativeEditorProps {
  sessionCode?: string;
  onLeave?: () => void;
}

const CollaborativeEditor = ({ sessionCode, onLeave }: CollaborativeEditorProps) => {
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<"text" | "code">("text");
  const { session, users, updateContent, leaveSession } = useSession();
  const { toast } = useToast();
  
  // Use session from props or hook
  const currentSession = session;
  const currentCode = sessionCode || currentSession?.session_code || "DEMO123";
  
  const [timeRemaining, setTimeRemaining] = useState("5h 23m");
  const [isOnline] = useState(true);

  // Update content when session content changes
  useEffect(() => {
    if (currentSession?.content !== undefined) {
      setContent(currentSession.content);
      setContentType(currentSession.content_type);
    }
  }, [currentSession?.content, currentSession?.content_type]);

  // Calculate time remaining
  useEffect(() => {
    if (!currentSession?.expires_at) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const expiresAt = new Date(currentSession.expires_at);
      const diff = expiresAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining("Expired");
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [currentSession?.expires_at]);

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
  }, []);

  // Separate effect for debounced content updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateContent(content, contentType);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [content, contentType, updateContent]);

  const copyContent = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const downloadContent = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weavepaste-${currentCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: `File saved as weavepaste-${currentCode}.txt`,
    });
  };

  const formatContent = () => {
    // Auto-format based on content type
    if (contentType === "code") {
      // Basic formatting - trim whitespace
      const formatted = content.trim();
      setContent(formatted);
      updateContent(formatted, contentType);
      toast({
        title: "Formatted",
        description: "Code has been formatted",
      });
    }
  };

  const handleLeave = async () => {
    await leaveSession();
    onLeave?.();
    toast({
      title: "Left Session",
      description: "You have left the collaborative session",
    });
  };

  const handleContentTypeChange = (newType: "text" | "code") => {
    setContentType(newType);
    updateContent(content, newType);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold">WeavePaste</h1>
            <Badge variant="secondary" className="glass font-mono text-xs sm:text-sm">
              {currentCode}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-sm">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-accent" />
              ) : (
                <WifiOff className="w-4 h-4 text-destructive" />
              )}
              <span className="text-muted-foreground hidden sm:inline">
                {isOnline ? "Connected" : "Disconnected"}
              </span>
            </div>
            
            {/* Time remaining */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-xs sm:text-sm">{timeRemaining}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3 space-y-4">
            {/* Editor Controls */}
            <Card className="glass-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant={contentType === "text" ? "glass" : "ghost"}
                    size="sm"
                    onClick={() => handleContentTypeChange("text")}
                  >
                    <FileText className="w-4 h-4" />
                    Text
                  </Button>
                  <Button
                    variant={contentType === "code" ? "glass" : "ghost"}
                    size="sm"
                    onClick={() => handleContentTypeChange("code")}
                  >
                    <Code className="w-4 h-4" />
                    Code
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={formatContent}>
                    Format
                  </Button>
                  <Button variant="ghost" size="sm" onClick={copyContent}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={downloadContent}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Main Editor */}
            <Card className="glass-card p-0 min-h-[60vh]">
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start typing or paste your content here... All connected devices will see changes in real-time."
                className="glass-input border-none resize-none min-h-[60vh] text-base font-mono leading-relaxed"
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Connected Devices */}
            <Card className="glass-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Connected Devices
                </h3>
                <Badge variant="secondary" className="glass">
                  {users.length}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                      <div className={`w-3 h-3 rounded-full ${user.color}`} />
                      <span className="text-sm font-medium">{user.user_name}</span>
                      <div className="ml-auto w-2 h-2 bg-accent rounded-full animate-pulse" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No other users connected</p>
                )}
              </div>
            </Card>

            {/* Session Info */}
            <Card className="glass-card space-y-4">
              <h3 className="font-semibold">Session Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{currentSession?.created_at ? new Date(currentSession.created_at).toLocaleTimeString() : 'Just now'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auto-cleanup</span>
                  <span>{timeRemaining}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Characters</span>
                  <span>{content.length.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lines</span>
                  <span>{content.split('\n').length}</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card space-y-3">
              <h3 className="font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="glass" size="sm" className="w-full justify-start">
                  <Settings className="w-4 h-4" />
                  Session Settings
                </Button>
                
                <QRCodeGenerator sessionCode={currentCode}>
                  <Button variant="glass" size="sm" className="w-full justify-start">
                    <QrCode className="w-4 h-4" />
                    Share QR Code
                  </Button>
                </QRCodeGenerator>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-destructive"
                  onClick={handleLeave}
                >
                  <LogOut className="w-4 h-4" />
                  Leave Session
                </Button>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-border/30">
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

export default CollaborativeEditor;