import { useState } from "react";
import { Button } from "@/components/ui/button";
import SessionCreator from "@/components/SessionCreator";
import SessionJoiner from "@/components/SessionJoiner";
import CollaborativeEditor from "@/components/CollaborativeEditor";
import { Toaster } from "@/components/ui/toaster";
import { Github } from "lucide-react";

type AppState = "home" | "create" | "join" | "session";

const Index = () => {
  const [currentView, setCurrentView] = useState<AppState>("home");
  const [sessionCode, setSessionCode] = useState<string>("");

  const handleSessionCreated = (code: string) => {
    setSessionCode(code);
    setCurrentView("session");
  };

  const handleSessionJoined = (code: string) => {
    setSessionCode(code);
    setCurrentView("session");
  };

  const handleLeaveSession = () => {
    setSessionCode("");
    setCurrentView("home");
  };

  if (currentView === "session") {
    return (
      <>
        <CollaborativeEditor 
          sessionCode={sessionCode} 
          onLeave={handleLeaveSession}
        />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-12">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView("home")}
            className="text-accent hover:text-accent/80"
          >
            ← Back to Home
          </Button>
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">W</span>
            </div>
            <span className="font-bold text-lg">WeavePaste</span>
          </div>
        </div>

        {/* Content */}
        {currentView === "home" && (
          <div className="text-center space-y-12">
            {/* Hero Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center animate-float">
                  <span className="text-accent-foreground font-bold text-2xl">W</span>
                </div>
              </div>
              <h1 className="text-7xl font-bold bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                WeavePaste
              </h1>
              <p className="text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Revolutionary collaborative clipboard that syncs across multiple devices in real-time
              </p>
            </div>

            {/* Main Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button 
                variant="glass" 
                size="lg" 
                onClick={() => setCurrentView("create")}
                className="flex-1 h-14 text-lg"
              >
                Create Session
              </Button>
              <Button 
                variant="glass" 
                size="lg" 
                onClick={() => setCurrentView("join")}
                className="flex-1 h-14 text-lg"
              >
                Join Session
              </Button>
            </div>

            {/* Demo Button */}
            <Button 
              variant="ghost" 
              onClick={() => setCurrentView("session")}
              className="text-accent hover:text-accent/80"
            >
              View Demo Session
            </Button>
          </div>
        )}

        {currentView === "create" && (
          <SessionCreator onSessionCreated={handleSessionCreated} />
        )}
        {currentView === "join" && (
          <SessionJoiner onSessionJoined={handleSessionJoined} />
        )}
        
        {/* Footer */}
        {currentView === "home" && (
          <footer className="mt-16 pt-8 border-t border-border/30">
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
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
