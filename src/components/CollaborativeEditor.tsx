import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  SyncIndicator,
  ContentSyncIndicator,
  TypingIndicator,
  ConnectionPulse,
  type SyncStatus,
} from "@/components/ui/loading-states";
import {
  Users,
  Copy,
  Menu,
  X,
  Activity,
  Clock,
  WifiOff,
  Monitor,
  Maximize2,
  Minimize2,
  LogOut,
  QrCode,
  Share,
  UserX,
  History,
  Edit,
  Trash,
  Send,
  Code,
  Type,
  Expand,
  Minimize,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { generateDeviceName } from "@/lib/deviceNames";

interface CollaborativeEditorProps {
  sessionCode?: string;
  onLeave?: () => void;
}

const CollaborativeEditor = ({
  sessionCode,
  onLeave,
}: CollaborativeEditorProps) => {
  const [content, setContent] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [copyHistory, setCopyHistory] = useState<
    Array<{ id: string; content: string; timestamp: Date }>
  >([]);

  // Floating editor state
  const [currentText, setCurrentText] = useState("");
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const {
    session,
    users,
    updateContent,
    isReconnecting,
    kickUser,
    currentUser,
  } = useSession(sessionCode);
  const { toast } = useToast();

  // Load copy history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(
      `copyHistory_${sessionCode || session?.session_code}`
    );
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // Convert timestamp strings back to Date objects
        const historyWithDates = parsed.map(
          (item: { id: string; content: string; timestamp: string }) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          })
        );
        setCopyHistory(historyWithDates);
      } catch (error) {
        console.error("Failed to load copy history:", error);
      }
    }
  }, [sessionCode, session?.session_code]);

  // Save copy history to localStorage whenever it changes
  useEffect(() => {
    if (copyHistory.length > 0 && (sessionCode || session?.session_code)) {
      localStorage.setItem(
        `copyHistory_${sessionCode || session?.session_code}`,
        JSON.stringify(copyHistory)
      );
    }
  }, [copyHistory, sessionCode, session?.session_code]);

  // Generate invite link
  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${sessionCode || session?.session_code}`
      : "";

  // Connection status detection
  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 2000);
    };

    const handleOffline = () => {
      setIsConnected(false);
      setSyncStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsConnected(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleContentChange = useCallback(
    async (newContent: string) => {
      setContent(newContent);
      setIsUploading(true);
      setSyncStatus("syncing");

      try {
        await updateContent?.(newContent);
        setSyncStatus("success");
        setIsUploading(false);
        setTimeout(() => setSyncStatus("idle"), 2000);
      } catch (error) {
        setSyncStatus("error");
        setIsUploading(false);
        console.error("Failed to sync content:", error);
      }
    },
    [updateContent]
  );

  const copyContent = () => {
    navigator.clipboard.writeText(content);

    // Add to copy history
    const newHistoryItem = {
      id: Date.now().toString(),
      content: content,
      timestamp: new Date(),
    };
    setCopyHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]); // Keep last 10 items

    // Removed toast notification for simple copy action
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);

    // Add to copy history
    const newHistoryItem = {
      id: Date.now().toString(),
      content: text,
      timestamp: new Date(),
    };
    setCopyHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]); // Keep last 10 items

    // Removed toast notification for simple copy action
  };

  const handleKickUser = async (userId: string, userName: string) => {
    if (!kickUser) return;

    const success = await kickUser(userId);
    if (success) {
      toast({
        title: "User removed",
        description: `${userName} has been removed from the session`,
      });
    } else {
      toast({
        title: "Failed to remove user",
        description: "Could not remove user from session",
        variant: "destructive",
      });
    }
  };

  const clearCopyHistory = () => {
    setCopyHistory([]);
    if (sessionCode || session?.session_code) {
      localStorage.removeItem(
        `copyHistory_${sessionCode || session?.session_code}`
      );
    }
    // Removed toast notification for history clear action
  };

  // Floating editor functions
  const handleSendText = useCallback(async () => {
    if (!currentText.trim()) return;

    try {
      const newHistoryItem = {
        id: Date.now().toString(),
        content: currentText,
        timestamp: new Date(),
      };

      // Add to history
      const updatedHistory = [newHistoryItem, ...copyHistory];
      setCopyHistory(updatedHistory);

      // Save to localStorage
      if (sessionCode || session?.session_code) {
        localStorage.setItem(
          `copyHistory_${sessionCode || session?.session_code}`,
          JSON.stringify(updatedHistory)
        );
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(currentText);

      // Clear text after sending
      setCurrentText("");

      toast({
        title: "Text synced",
        description: "Content synced to all devices",
      });
    } catch (error) {
      console.error("Error syncing text:", error);
      toast({
        title: "Sync failed",
        description: "Could not sync text to session",
        variant: "destructive",
      });
    }
  }, [currentText, copyHistory, sessionCode, session?.session_code, toast]);

  // Auto-sync effect
  useEffect(() => {
    if (!autoSyncEnabled || !currentText.trim()) return;

    const autoSyncTimer = setTimeout(() => {
      handleSendText();
    }, 2000); // Auto-sync after 2 seconds of no typing

    return () => clearTimeout(autoSyncTimer);
  }, [currentText, autoSyncEnabled, handleSendText]);

  const copyInviteLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      // Removed excessive success toast
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        // Removed excessive success toast
      } catch (fallbackErr) {
        toast({
          title: "Copy failed",
          description: "Please copy the link manually",
          variant: "destructive",
        });
      }
      document.body.removeChild(textArea);
    }
  }, [inviteLink, toast]);

  // Enhanced share functionality with native sharing API
  const shareSession = useCallback(async () => {
    const shareData = {
      title: "Join my Live Collaboration Session",
      text: "Come collaborate with me in real-time!",
      url: inviteLink,
    };

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy
        await copyInviteLink();
      }
    } catch (err) {
      // User cancelled or error occurred, fallback to copy
      await copyInviteLink();
    }
  }, [inviteLink, copyInviteLink]);

  // Update content when session content changes
  useEffect(() => {
    if (session?.content && session.content !== content) {
      setContent(session.content);
    }
  }, [session?.content, content]);

  return (
    <>
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:50px_50px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>

        {/* Ambient background effects */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-accent/5 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-10 w-48 h-48 bg-accent/3 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative z-10 p-4 sm:p-6 w-full">
          {/* Compact Header Card - Session Info & Share */}
          <Card className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-lg md:rounded-2xl p-2 md:p-4 mb-3 md:mb-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between gap-1 md:gap-4 flex-wrap sm:flex-nowrap">
              {/* Session Info - Compact */}
              <div className="flex items-center gap-1 md:gap-3 min-w-0 flex-1">
                <Badge
                  variant="outline"
                  className="text-xs md:text-lg font-bold px-1.5 md:px-3 py-0.5 md:py-2 bg-white/20 backdrop-blur-sm border-white/30 text-white rounded-md md:rounded-xl break-all"
                >
                  {sessionCode || session?.session_code}
                </Badge>
                <div className="flex items-center gap-1 md:gap-2">
                  {isConnected ? (
                    <></>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full" />
                      <span className="text-red-400 font-medium text-xs">
                        Offline
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons - Icons Only */}
              <div className="flex items-center gap-0.5 md:gap-2 flex-shrink-0">
                <Button
                  onClick={copyInviteLink}
                  size="sm"
                  className="h-6 w-6 md:h-8 md:w-8 p-0 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg rounded-md md:rounded-lg"
                  title="Copy invite link"
                >
                  <Copy className="w-2.5 h-2.5 md:w-4 md:h-4" />
                </Button>
                <QRCodeGenerator
                  sessionCode={sessionCode || session?.session_code || ""}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 md:h-8 md:w-8 p-0 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 rounded-md md:rounded-lg"
                    title="Show QR code"
                  >
                    <QrCode className="w-2.5 h-2.5 md:w-4 md:h-4" />
                  </Button>
                </QRCodeGenerator>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareSession}
                  className="h-6 w-6 md:h-8 md:w-8 p-0 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 rounded-md md:rounded-lg"
                  title="Share session"
                >
                  <Share className="w-2.5 h-2.5 md:w-4 md:h-4" />
                </Button>
                {onLeave && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLeave}
                    className="h-6 w-6 md:h-8 md:w-8 p-0 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-red-500/20 hover:border-red-400 rounded-md md:rounded-lg"
                    title="Leave session"
                  >
                    <LogOut className="w-2.5 h-2.5 md:w-4 md:h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Sync History Card */}
          <div className="mb-4 md:mb-8">
            <Card className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl md:rounded-3xl p-3 md:p-8 hover:bg-white/15 transition-all duration-300">
              <div className="text-center mb-3 md:mb-8">
                <div className="w-8 h-8 md:w-16 md:h-16 bg-green-500/20 rounded-lg md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-6">
                  <History className="w-4 h-4 md:w-8 md:h-8 text-green-400" />
                </div>
                <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-3">
                  Sync History
                </h2>
                <p className="text-white/70 font-medium text-xs md:text-base">
                  Recent clipboard syncs across all devices
                </p>
              </div>

              <div className="space-y-2 md:space-y-4 max-h-64 md:max-h-96 overflow-y-auto">
                {copyHistory.length > 0 ? (
                  copyHistory.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-2 md:p-4 rounded-lg md:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between gap-2 md:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                            <span className="text-xs font-medium text-white/50">
                              #{index + 1}
                            </span>
                            <span className="text-xs text-white/60">
                              {item.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-white text-xs md:text-sm font-medium leading-relaxed">
                            {item.content.length > 60
                              ? item.content.slice(0, 60) + "..."
                              : item.content}
                          </p>
                        </div>
                        <div className="flex gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(item.content)}
                            className="h-6 w-6 md:h-8 md:w-8 p-0 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                          >
                            <Copy className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentText(item.content)}
                            className="h-6 w-6 md:h-8 md:w-8 p-0 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                          >
                            <Edit className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 md:py-12">
                    <p className="text-white/50 font-medium text-xs md:text-base">
                      Nothing synced yet. Your recent clipboard syncs will
                      appear here.
                    </p>
                  </div>
                )}
              </div>

              {copyHistory.length > 0 && (
                <div className="flex gap-2 md:gap-3 mt-3 md:mt-6 pt-3 md:pt-6 border-t border-white/20">
                  <Button
                    variant="outline"
                    onClick={clearCopyHistory}
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-red-500/20 hover:border-red-400 text-xs md:text-sm px-2 md:px-4 h-8 md:h-auto"
                  >
                    <Trash className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Clear History
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const allContent = copyHistory
                        .map((item) => item.content)
                        .join("\n\n---\n\n");
                      copyToClipboard(allContent);
                    }}
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 text-xs md:text-sm px-2 md:px-4 h-8 md:h-auto"
                  >
                    <Copy className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Copy All
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Device Management & Session Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-8 mb-16 md:mb-24">
            {/* Added mb-16 for floating editor space */}
            {/* Connected Devices */}
            <Card className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl md:rounded-3xl p-3 md:p-8 hover:bg-white/15 transition-all duration-300">
              <div className="text-center mb-3 md:mb-8">
                <div className="w-8 h-8 md:w-16 md:h-16 bg-purple-500/20 rounded-lg md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-6">
                  <Users className="w-4 h-4 md:w-8 md:h-8 text-purple-400" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-3">
                  Connected Devices
                </h3>
                <p className="text-white/70 font-medium text-xs md:text-base">
                  {users.length} device{users.length !== 1 ? "s" : ""} online
                </p>
              </div>

              <div className="space-y-2 md:space-y-4 max-h-48 md:max-h-64 overflow-y-auto">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 md:gap-4 p-2 md:p-4 rounded-lg md:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-200"
                    >
                      <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-accent/80 to-accent/60 flex items-center justify-center">
                        <span className="text-white text-xs md:text-sm font-bold">
                          {user.user_name?.slice(0, 2).toUpperCase() || "UN"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white text-xs md:text-base">
                          {user.user_name}
                          {user.id === currentUser?.id && (
                            <span className="text-xs text-white/60 ml-1 md:ml-2 font-medium">
                              (You)
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-1 md:gap-2 text-xs">
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-green-400 font-medium">
                            Active now
                          </span>
                        </div>
                      </div>
                      {user.id !== currentUser?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleKickUser(user.id, user.user_name)
                          }
                          className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-red-500/20 hover:border-red-400 h-6 w-6 md:h-8 md:w-8 p-0"
                          title={`Remove ${user.user_name} from session`}
                        >
                          <UserX className="w-2.5 h-2.5 md:w-4 md:h-4" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 md:py-8">
                    <Users className="w-8 h-8 md:w-12 md:h-12 mx-auto text-white/30 mb-2 md:mb-4" />
                    <p className="text-white/50 font-medium text-xs md:text-base">
                      Only you are online
                    </p>
                    <p className="text-xs text-white/40 mt-1 md:mt-2 font-medium">
                      Share the session code to invite others
                    </p>
                  </div>
                )}
              </div>

              {/* Session Actions */}
              <div className="flex gap-2 md:gap-3 mt-4 md:mt-8 pt-3 md:pt-6 border-t border-white/20">
                <Button
                  variant="outline"
                  onClick={onLeave}
                  className="flex-1 h-8 md:h-12 text-sm md:text-lg font-bold bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-none shadow-xl rounded-lg md:rounded-2xl"
                >
                  <LogOut className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Leave Session
                </Button>
              </div>
            </Card>

            {/* Session Statistics */}
            <Card className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl md:rounded-3xl p-3 md:p-8 hover:bg-white/15 transition-all duration-300">
              <div className="text-center mb-3 md:mb-8">
                <div className="w-8 h-8 md:w-16 md:h-16 bg-blue-500/20 rounded-lg md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-6">
                  <Activity className="w-4 h-4 md:w-8 md:h-8 text-blue-400" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-3">
                  Session Stats
                </h3>
                <p className="text-white/70 font-medium text-xs md:text-base">
                  Real-time session information
                </p>
              </div>

              <div className="space-y-2 md:space-y-6">
                {/* Session Started */}
                <div className="flex items-center justify-between p-2 md:p-4 rounded-lg md:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center gap-1.5 md:gap-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-green-500/20 rounded-lg md:rounded-xl flex items-center justify-center">
                      <Clock className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                    </div>
                    <span className="text-white font-medium text-xs md:text-base">
                      Session Started
                    </span>
                  </div>
                  <span className="text-white/70 font-semibold text-xs md:text-base">
                    {session?.created_at
                      ? new Date(session.created_at).toLocaleTimeString()
                      : "--:--"}
                  </span>
                </div>

                {/* Session Duration */}
                <div className="flex items-center justify-between p-2 md:p-4 rounded-lg md:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center gap-1.5 md:gap-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-500/20 rounded-lg md:rounded-xl flex items-center justify-center">
                      <Activity className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                    </div>
                    <span className="text-white font-medium text-xs md:text-base">
                      Active Duration
                    </span>
                  </div>
                  <span className="text-white/70 font-semibold text-xs md:text-base">
                    {session?.created_at
                      ? Math.floor(
                          (Date.now() -
                            new Date(session.created_at).getTime()) /
                            (1000 * 60)
                        ) + " min"
                      : "0 min"}
                  </span>
                </div>

                {/* Total Syncs */}
                <div className="flex items-center justify-between p-2 md:p-4 rounded-lg md:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center gap-1.5 md:gap-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-500/20 rounded-lg md:rounded-xl flex items-center justify-center">
                      <History className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                    </div>
                    <span className="text-white font-medium text-xs md:text-base">Total Syncs</span>
                  </div>
                  <span className="text-white/70 font-semibold text-xs md:text-base">
                    {copyHistory.length}
                  </span>
                </div>

                {/* Session Expires */}
                <div className="flex items-center justify-between p-2 md:p-4 rounded-lg md:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center gap-1.5 md:gap-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-500/20 rounded-lg md:rounded-xl flex items-center justify-center">
                      <Clock className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                    </div>
                    <span className="text-white font-medium text-xs md:text-base">Expires In</span>
                  </div>
                  <span className="text-white/70 font-semibold text-xs md:text-base">
                    {session?.expires_at
                      ? Math.floor(
                          (new Date(session.expires_at).getTime() -
                            Date.now()) /
                            (1000 * 60 * 60)
                        ) + " hrs"
                      : "24 hrs"}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Floating Text Editor - Bottom */}
          <div className="fixed bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 z-40">
            {/* Minimized State - Compact Editor */}
            {!isEditorExpanded && (
              <div className="relative">
                <textarea
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full h-12 md:h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg md:rounded-2xl p-2 md:p-4 pr-16 md:pr-24 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 shadow-2xl"
                  style={{
                    fontSize: "clamp(0.75rem, 2vw, 1rem)",
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSendText();
                    }
                  }}
                />

                {/* Button Container */}
                <div className="absolute top-1 md:top-2 right-1 md:right-2 flex items-center gap-0.5 md:gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCodeMode(!isCodeMode)}
                    className="h-5 w-5 md:h-6 md:w-6 p-0 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 rounded-md"
                    title={isCodeMode ? "Text Mode" : "Code Mode"}
                  >
                    {isCodeMode ? (
                      <Type className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    ) : (
                      <Code className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentText("")}
                    disabled={!currentText.trim()}
                    className="h-5 w-5 md:h-6 md:w-6 p-0 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-red-500/20 hover:border-red-400 rounded-md"
                    title="Clear"
                  >
                    <Trash className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  </Button>

                  <Button
                    onClick={handleSendText}
                    size="sm"
                    className="h-5 w-5 md:h-6 md:w-6 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                    disabled={!currentText.trim()}
                    title="Sync"
                  >
                    <Send className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditorExpanded(true)}
                    className="h-5 w-5 md:h-6 md:w-6 p-0 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 rounded-md"
                    title="Expand"
                  >
                    <Maximize2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  </Button>
                </div>

                {/* Bottom Button Container */}
                <div className="absolute bottom-1 md:bottom-2 right-1 md:right-2 flex items-center gap-1">
                  <span className="text-xs text-white/50">
                    {currentText.length}
                  </span>
                  <SyncIndicator status={syncStatus} />
                </div>
              </div>
            )}
          </div>

          {/* Expanded State - Full Screen (Outside Card Structure) */}
          {isEditorExpanded && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              style={{ zIndex: 9999 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-purple-900/10 to-pink-900/10" />

              <div className="relative h-screen flex flex-col">
                {/* Expanded Header */}
                <div className="flex items-center justify-between p-2 md:p-4 border-b border-white/20 bg-white/10 backdrop-blur-xl">
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="w-5 h-5 md:w-8 md:h-8 bg-blue-500/20 rounded-md md:rounded-lg flex items-center justify-center">
                      <Type className="w-2.5 h-2.5 md:w-4 md:h-4 text-blue-400" />
                    </div>
                    <span className="text-sm md:text-lg font-bold text-white">
                      Editor
                    </span>
                  </div>

                  <div className="flex items-center gap-1 md:gap-2">
                    {/* Mode Switch */}
                    <Button
                      variant={isCodeMode ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setIsCodeMode(!isCodeMode)}
                      className="h-6 w-6 md:h-8 md:w-8 p-0 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 rounded-md md:rounded-lg"
                      title={isCodeMode ? "Text Mode" : "Code Mode"}
                    >
                      {isCodeMode ? (
                        <Type className="w-3 h-3 md:w-4 md:h-4" />
                      ) : (
                        <Code className="w-3 h-3 md:w-4 md:h-4" />
                      )}
                    </Button>

                    {/* Clear */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentText("")}
                      disabled={!currentText.trim()}
                      className="h-6 w-6 md:h-8 md:w-8 p-0 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-red-500/20 hover:border-red-400 rounded-md md:rounded-lg"
                      title="Clear"
                    >
                      <Trash className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>

                    {/* Sync */}
                    <Button
                      onClick={handleSendText}
                      disabled={!currentText.trim()}
                      size="sm"
                      className="h-8 w-8 p-0 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg"
                      title="Sync"
                    >
                      <Send className="w-4 h-4" />
                    </Button>

                    {/* Minimize */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditorExpanded(false)}
                      className="h-8 w-8 p-0 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 rounded-lg"
                      title="Minimize"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Text Area */}
                <div className="flex-1 p-2 sm:p-4">
                  <div className="relative h-full">
                    {/* Line Numbers (for code mode and when enabled) */}
                    {(isCodeMode || showLineNumbers) && (
                      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 bg-white/5 flex flex-col text-xs text-white/40 font-mono select-none">
                        {currentText.split("\n").map((_, index) => (
                          <div
                            key={index}
                            className="h-5 sm:h-6 flex items-center justify-end pr-1 border-r border-white/10"
                            style={{ lineHeight: isCodeMode ? "1.4" : "1.5" }}
                          >
                            {index + 1}
                          </div>
                        ))}
                      </div>
                    )}

                    <textarea
                      value={currentText}
                      onChange={(e) => setCurrentText(e.target.value)}
                      placeholder={
                        isCodeMode
                          ? "// Write your code here..."
                          : "Type your message here..."
                      }
                      className={`w-full h-full bg-transparent text-white placeholder-white/50 border-none outline-none resize-none font-medium ${
                        isCodeMode ? "font-mono" : ""
                      } ${
                        isCodeMode || showLineNumbers
                          ? "pl-10 sm:pl-12"
                          : "pl-0"
                      } ${wordWrap ? "whitespace-pre-wrap" : "whitespace-pre"}`}
                      style={{
                        fontSize: "clamp(14px, 3vw, 20px)",
                        lineHeight: isCodeMode ? "1.4" : "1.5",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          handleSendText();
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Editor Footer */}
                <div className="flex items-center justify-between border-t border-white/20 bg-white/5 backdrop-blur-sm p-2 md:p-3">
                  <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-white/70">
                    <span>{currentText.length} chars</span>
                    <span>{currentText.split("\n").length} lines</span>
                    {autoSyncEnabled && (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-400">Auto-sync</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <SyncIndicator status={syncStatus} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default CollaborativeEditor;
