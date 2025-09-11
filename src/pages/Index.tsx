import { useState } from "react";
import { Button } from "@/components/ui/button";
import SessionCreator from "@/components/SessionCreator";
import SessionJoiner from "@/components/SessionJoiner";
import CollaborativeEditor from "@/components/CollaborativeEditor";

type AppState = "home" | "create" | "join" | "session";

const Index = () => {
  const [currentView, setCurrentView] = useState<AppState>("home");

  if (currentView === "session") {
    return <CollaborativeEditor />;
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
        </div>

        {/* Content */}
        {currentView === "home" && (
          <div className="text-center space-y-12">
            {/* Hero Section */}
            <div className="space-y-6">
              <h1 className="text-7xl font-bold bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                PasteSync
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

        {currentView === "create" && <SessionCreator />}
        {currentView === "join" && <SessionJoiner />}
      </div>
    </div>
  );
};

export default Index;
