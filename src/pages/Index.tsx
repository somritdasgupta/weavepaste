import { useState, useEffect } from "react";
import CollaborativeEditor from "@/components/CollaborativeEditor";
import Home from "@/pages/Home";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  const [sessionCode, setSessionCode] = useState<string>("");

  // Check URL for session code parameter on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
      setSessionCode(joinCode.toUpperCase());
    }
  }, []);

  const handleSessionCreated = (code: string) => {
    setSessionCode(code);
  };

  const handleSessionJoined = (code: string) => {
    setSessionCode(code);
  };

  const handleLeaveSession = () => {
    setSessionCode("");
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  if (sessionCode) {
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
    <>
      <Home 
        onSessionCreated={handleSessionCreated}
        onSessionJoined={handleSessionJoined}
      />
      <Toaster />
    </>
  );
};

export default Index;
