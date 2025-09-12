import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Upload,
  Download,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SyncStatus = "idle" | "syncing" | "success" | "error" | "offline";

interface SyncIndicatorProps {
  status: SyncStatus;
  message?: string;
  className?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function SyncIndicator({
  status,
  message,
  className,
  showRetry = false,
  onRetry,
}: SyncIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (status !== "idle") {
      setIsVisible(true);
      if (status === "success") {
        const timer = setTimeout(() => setIsVisible(false), 3000);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [status]);

  if (!isVisible) return null;

  const getStatusConfig = () => {
    switch (status) {
      case "syncing":
        return {
          icon: <RefreshCw className="w-3 h-3 animate-spin" />,
          variant: "glass" as const,
          className: "sync-pulse",
          defaultMessage: "Syncing...",
        };
      case "success":
        return {
          icon: <CheckCircle className="w-3 h-3" />,
          variant: "glass-accent" as const,
          className: "text-green-600",
          defaultMessage: "Synced successfully",
        };
      case "error":
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          variant: "destructive" as const,
          className: "text-red-600",
          defaultMessage: "Sync failed",
        };
      case "offline":
        return {
          icon: <WifiOff className="w-3 h-3" />,
          variant: "secondary" as const,
          className: "text-orange-600",
          defaultMessage: "Offline",
        };
      default:
        return {
          icon: <Wifi className="w-3 h-3" />,
          variant: "glass" as const,
          className: "",
          defaultMessage: "Connected",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={cn("flex items-center gap-2 animate-slideUp", className)}>
      <Badge
        variant={config.variant}
        className={cn("flex items-center gap-2 px-3 py-1", config.className)}
      >
        {config.icon}
        <span className="text-xs font-medium">
          {message || config.defaultMessage}
        </span>
      </Badge>
      {showRetry && status === "error" && onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-6 px-2"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}

interface ContentSyncIndicatorProps {
  isUploading?: boolean;
  isDownloading?: boolean;
  className?: string;
}

export function ContentSyncIndicator({
  isUploading,
  isDownloading,
  className,
}: ContentSyncIndicatorProps) {
  if (!isUploading && !isDownloading) return null;

  return (
    <div
      className={cn(
        "absolute top-2 right-2 flex items-center gap-1",
        className
      )}
    >
      {isUploading && (
        <div className="flex items-center gap-1 text-xs text-accent animate-pulse">
          <Upload className="w-3 h-3" />
          <span className="hidden sm:inline">Uploading</span>
        </div>
      )}
      {isDownloading && (
        <div className="flex items-center gap-1 text-xs text-blue-500 animate-pulse">
          <Download className="w-3 h-3" />
          <span className="hidden sm:inline">Updating</span>
        </div>
      )}
    </div>
  );
}

interface TypingIndicatorProps {
  users: Array<{ id: string; user_name: string; is_typing?: boolean }>;
  className?: string;
}

export function TypingIndicator({ users, className }: TypingIndicatorProps) {
  const typingUsers = users.filter((user) => user.is_typing);

  if (typingUsers.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground animate-slideUp",
        className
      )}
    >
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div
            className="w-1 h-1 bg-accent rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-1 h-1 bg-accent rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-1 h-1 bg-accent rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <span className="typing-indicator">
          {typingUsers.length === 1
            ? `${typingUsers[0].user_name} is typing...`
            : `${typingUsers.length} users are typing...`}
        </span>
      </div>
    </div>
  );
}

interface ConnectionPulseProps {
  isConnected: boolean;
  className?: string;
}

export function ConnectionPulse({
  isConnected,
  className,
}: ConnectionPulseProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "w-2 h-2 rounded-full transition-colors duration-300",
          isConnected ? "bg-green-500" : "bg-red-500"
        )}
      />
      {isConnected && (
        <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" />
      )}
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-3 h-3 border",
    md: "w-4 h-4 border-2",
    lg: "w-6 h-6 border-2",
  };

  return (
    <div
      className={cn(
        "border-accent border-t-transparent rounded-full animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface ProgressIndicatorProps {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
}

export function ProgressIndicator({
  progress,
  className,
  showPercentage = false,
}: ProgressIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent/80 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <span className="text-xs text-muted-foreground font-mono">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}
