import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CollaborativeEditor from "@/components/CollaborativeEditor";
import { SwipeToJoin } from "@/components/SwipeToJoin";
import Home from "@/pages/Home";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  const { sessionCode: routeSessionCode } = useParams<{
    sessionCode: string;
  }>();
  const [sessionCode, setSessionCode] = useState<string>("");
  const [showSwipeToJoin, setShowSwipeToJoin] = useState<boolean>(false);
  const [inviteCode, setInviteCode] = useState<string>("");

  // Check URL for session code parameter on load and restore session from localStorage
  useEffect(() => {
    // First check if there's a session code in the route
    if (routeSessionCode) {
      setSessionCode(routeSessionCode.toUpperCase());
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get("join");
    if (joinCode) {
      const code = joinCode.toUpperCase();
      setInviteCode(code);
      setShowSwipeToJoin(true);
      return;
    }

    // Check for stored session to restore
    const storedSession = localStorage.getItem("weavepaste_session");
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        // Restore the stored session if it wasn't manually disconnected
        if (parsed.sessionCode && parsed.disconnectReason !== "manual") {
          setSessionCode(parsed.sessionCode);
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        localStorage.removeItem("weavepaste_session");
      }
    }
  }, [routeSessionCode]);

  const handleSessionCreated = (code: string) => {
    setSessionCode(code);
    setShowSwipeToJoin(false);
  };

  const handleSessionJoined = (code: string) => {
    setSessionCode(code);
    setShowSwipeToJoin(false);
  };

  const handleSwipeJoin = () => {
    setSessionCode(inviteCode);
    setShowSwipeToJoin(false);
  };

  const handleLeaveSession = () => {
    setSessionCode("");
    setInviteCode("");
    setShowSwipeToJoin(false);
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
      {showSwipeToJoin && inviteCode && (
        <SwipeToJoin
          sessionCode={inviteCode}
          onJoin={handleSwipeJoin}
          deviceCount={0} // We'll update this with real data later
          sessionTitle="Live Collaboration Session"
        />
      )}
      <Toaster />
    </>
  );
};

export default Index;
