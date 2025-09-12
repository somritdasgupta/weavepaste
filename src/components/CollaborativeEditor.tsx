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
  QrCode,
  RefreshCw,
  Share,
  Clipboard
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
  const [clipboardPermission, setClipboardPermission] = useState<"granted" | "denied" | "prompt">("prompt");
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

  // Clipboard auto-detection and sync
  useEffect(() => {
    const checkClipboardPermission = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
        setClipboardPermission(permission.state);
      } catch (error) {
        console.log('Clipboard permission check not supported');
      }
    };
    
    checkClipboardPermission();
  }, []);

  const syncClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && clipboardText !== content) {
        setContent(clipboardText);
        updateContent(clipboardText, contentType);
        toast({
          title: "Clipboard Synced! 📋",
          description: "Content from clipboard has been added",
        });
      }
    } catch (error) {
      toast({
        title: "Clipboard Access Denied",
        description: "Please grant clipboard permissions to enable auto-sync",
        variant: "destructive",
      });
    }
  };

  const shareContent = async () => {
    try {
      if (navigator.share && content.trim()) {
        await navigator.share({
          title: 'WeavePaste Content',
          text: content,
        });
      } else {
        await navigator.clipboard.writeText(content);
        toast({
          title: "Copied to Share! 📤",
          description: "Content copied to clipboard for sharing",
        });
      }
    } catch (error) {
      console.log('Share failed, copying to clipboard instead');
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied! 📋",
        description: "Content copied to clipboard",
      });
    }
  };

  // Auto-detect clipboard changes (with user permission)
  useEffect(() => {
    if (clipboardPermission !== 'granted') return;

    const interval = setInterval(async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText && clipboardText !== content && clipboardText.length > 10) {
          setContent(clipboardText);
          updateContent(clipboardText, contentType);
          toast({
            title: "Auto-Sync! 🔄",
            description: "New clipboard content detected and synced",
          });
        }
      } catch (error) {
        // Silently fail - clipboard access might be restricted
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [clipboardPermission, content, contentType, updateContent]);

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Mobile Compact Header */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-lg sm:text-2xl font-bold">WeavePaste</h1>
            <Badge variant="secondary" className="glass font-mono text-xs px-2 py-1">
              {currentCode}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-3">
            {isOnline ? (
              <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
            ) : (
              <WifiOff className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
            )}
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs">{timeRemaining}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3 space-y-3 sm:space-y-4">
            {/* Editor Controls */}
            <Card className="glass-card p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <Button
                    variant={contentType === "text" ? "glass" : "ghost"}
                    size="sm"
                    onClick={() => handleContentTypeChange("text")}
                    className="h-8 px-2 sm:px-3"
                  >
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Text</span>
                  </Button>
                  <Button
                    variant={contentType === "code" ? "glass" : "ghost"}
                    size="sm"
                    onClick={() => handleContentTypeChange("code")}
                    className="h-8 px-2 sm:px-3"
                  >
                    <Code className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Code</span>
                  </Button>
                  <Button 
                    variant="glass" 
                    size="sm" 
                    onClick={syncClipboard}
                    className="h-8 px-2 sm:px-3"
                  >
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Sync</span>
                  </Button>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
                  <Button variant="ghost" size="sm" onClick={formatContent} className="flex-1 sm:flex-none h-8 px-2 sm:px-3">
                    <span className="text-xs sm:text-sm">Format</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={copyContent} className="h-8 px-2 sm:px-3">
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={downloadContent} className="h-8 px-2 sm:px-3">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button variant="glass" size="sm" onClick={shareContent} className="h-8 px-2 sm:px-3">
                    <Share className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Main Editor */}
            <Card className="glass-card p-0 min-h-[50vh] sm:min-h-[60vh]">
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="✨ Start typing or paste content here... Changes sync in real-time across all devices. Enable clipboard permissions for auto-sync!"
                className="glass-input border-none resize-none min-h-[50vh] sm:min-h-[60vh] text-sm sm:text-base font-mono leading-relaxed p-3 sm:p-4"
              />
            </Card>
            
            {/* Mobile Quick Actions Bar */}
            <div className="flex sm:hidden gap-2 px-2">
              <Button variant="glass" size="sm" onClick={syncClipboard} className="flex-1 h-10">
                <Clipboard className="w-4 h-4" />
                Sync Clipboard
              </Button>
              <Button variant="glass" size="sm" onClick={shareContent} className="flex-1 h-10">
                <Share className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Sidebar - Hidden on mobile, shown as bottom section */}
          <div className="space-y-3 sm:space-y-4">
            {/* Connected Devices */}
            <Card className="glass-card space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Connected Devices</span>
                  <span className="sm:hidden">Devices</span>
                </h3>
                <Badge variant="secondary" className="glass text-xs">
                  {users.length}
                </Badge>
              </div>
              
              <div className="space-y-2 max-h-32 sm:max-h-none overflow-y-auto">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg bg-background/50">
                      <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${user.color}`} />
                      <span className="text-xs sm:text-sm font-medium truncate flex-1">{user.user_name}</span>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full animate-pulse" />
                    </div>
                  ))
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground">No other users connected</p>
                )}
              </div>
            </Card>

            {/* Session Info */}
            <Card className="glass-card space-y-3 sm:space-y-4 p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-semibold">Session Details</h3>
              <div className="grid grid-cols-2 sm:block sm:space-y-2 gap-2 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-xs">{currentSession?.created_at ? new Date(currentSession.created_at).toLocaleTimeString() : 'Just now'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-muted-foreground">Expires</span>
                  <span className="text-xs">{timeRemaining}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-muted-foreground">Characters</span>
                  <span className="text-xs">{content.length.toLocaleString()}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-muted-foreground">Lines</span>
                  <span className="text-xs">{content.split('\n').length}</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card space-y-3 p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-semibold">Actions</h3>
              <div className="grid grid-cols-1 sm:space-y-2 gap-2">
                <Button variant="glass" size="sm" className="w-full justify-start h-8 sm:h-9">
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">Settings</span>
                </Button>
                
                <QRCodeGenerator sessionCode={currentCode}>
                  <Button variant="glass" size="sm" className="w-full justify-start h-8 sm:h-9">
                    <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Share QR</span>
                  </Button>
                </QRCodeGenerator>
                
                <Button variant="glass" size="sm" onClick={syncClipboard} className="w-full justify-start h-8 sm:h-9">
                  <Clipboard className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">Sync Clipboard</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-destructive h-8 sm:h-9"
                  onClick={handleLeave}
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">Leave Session</span>
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