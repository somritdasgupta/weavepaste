import {
  LoadingSkeleton,
  CardSkeleton,
  TextAreaSkeleton,
  DeviceListSkeleton,
} from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clipboard } from "lucide-react";

interface LoadingStateProps {
  type: "home" | "editor" | "connecting" | "initial";
  message?: string;
}

export function LoadingState({ type, message }: LoadingStateProps) {
  switch (type) {
    case "home":
      return (
        <div className="min-h-screen relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />
          <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-24 h-24 sm:w-32 sm:h-32 bg-accent/5 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-32 h-32 sm:w-48 sm:h-48 bg-accent/3 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />

          <div className="relative z-10 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <header className="flex flex-col sm:flex-row items-center justify-between mb-12 sm:mb-16 gap-6">
                <LoadingSkeleton />
              </header>

              <div className="text-center space-y-8 sm:space-y-12 mb-16 sm:mb-20">
                <div className="space-y-6">
                  <LoadingSkeleton />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
                    {[1, 2, 3].map((i) => (
                      <CardSkeleton key={i} className="h-24" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </div>
          </div>
        </div>
      );

    case "editor":
      return (
        <div className="min-h-screen relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />
          <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-24 h-24 sm:w-32 sm:h-32 bg-accent/5 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-32 h-32 sm:w-48 sm:h-48 bg-accent/3 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />

          <div className="relative z-10 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
              <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 glass-card">
                <LoadingSkeleton />
              </header>

              <div className="flex flex-col lg:grid lg:gap-6 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
                  <CardSkeleton />
                  <TextAreaSkeleton />
                </div>

                <div className="hidden lg:block space-y-4 order-1 lg:order-2">
                  <Card variant="glass" className="space-y-4">
                    <LoadingSkeleton />
                    <DeviceListSkeleton />
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "connecting":
      return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />

          <Card className="glass-card p-8 space-y-6 text-center max-w-md mx-auto">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-accent/20 via-accent/15 to-accent/10 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-accent animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Connecting to Session</h3>
              <p className="text-muted-foreground">
                {message || "Establishing secure connection..."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-muted-foreground">Please wait</span>
            </div>
          </Card>
        </div>
      );

    case "initial":
    default:
      return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />
          <div className="absolute top-20 left-10 w-32 h-32 bg-accent/5 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-20 right-10 w-48 h-48 bg-accent/3 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />

          <div className="text-center space-y-6 relative z-10">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent via-accent/80 to-accent/60 flex items-center justify-center animate-glow">
                  <Clipboard className="text-accent-foreground w-10 h-10" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full animate-pulse border-2 border-background" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                WeavePaste
              </h1>
              <p className="text-muted-foreground">
                {message || "Loading universal clipboard sync..."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              <Badge variant="glass" className="animate-pulse">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Initializing
              </Badge>
            </div>
          </div>
        </div>
      );
  }
}

export default LoadingState;
