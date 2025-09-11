import { useState, useEffect } from "react";
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
  FileText
} from "lucide-react";

interface ConnectedUser {
  id: string;
  name: string;
  color: string;
  lastSeen: Date;
}

const CollaborativeEditor = () => {
  const [content, setContent] = useState("");
  const [sessionCode] = useState("ABC1234");
  const [connectedUsers] = useState<ConnectedUser[]>([
    { id: "1", name: "Device 1", color: "bg-green-500", lastSeen: new Date() },
    { id: "2", name: "Device 2", color: "bg-blue-500", lastSeen: new Date() },
    { id: "3", name: "Device 3", color: "bg-purple-500", lastSeen: new Date() },
  ]);
  const [isOnline] = useState(true);
  const [contentType, setContentType] = useState<"text" | "code">("text");
  const [timeRemaining, setTimeRemaining] = useState("5h 23m");

  const handleContentChange = (value: string) => {
    setContent(value);
    // In real implementation, this would sync via Supabase real-time
  };

  const copyContent = () => {
    navigator.clipboard.writeText(content);
  };

  const downloadContent = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pastesync-${sessionCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatContent = () => {
    // Auto-format based on content type
    if (contentType === "code") {
      // In real implementation, this would use a code formatter
      setContent(content.trim());
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">PasteSync</h1>
            <Badge variant="secondary" className="glass font-mono">
              {sessionCode}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-sm">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-accent" />
              ) : (
                <WifiOff className="w-4 h-4 text-destructive" />
              )}
              <span className="text-muted-foreground">
                {isOnline ? "Connected" : "Disconnected"}
              </span>
            </div>
            
            {/* Time remaining */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{timeRemaining}</span>
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
                    onClick={() => setContentType("text")}
                  >
                    <FileText className="w-4 h-4" />
                    Text
                  </Button>
                  <Button
                    variant={contentType === "code" ? "glass" : "ghost"}
                    size="sm"
                    onClick={() => setContentType("code")}
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
                  {connectedUsers.length}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {connectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                    <div className={`w-3 h-3 rounded-full ${user.color}`} />
                    <span className="text-sm font-medium">{user.name}</span>
                    <div className="ml-auto w-2 h-2 bg-accent rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Session Info */}
            <Card className="glass-card space-y-4">
              <h3 className="font-semibold">Session Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>37m ago</span>
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
                <Button variant="ghost" size="sm" className="w-full justify-start text-destructive">
                  Leave Session
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeEditor;