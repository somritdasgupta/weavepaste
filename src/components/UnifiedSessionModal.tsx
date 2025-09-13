import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/use-toast";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import CodeInput from "@/components/CodeInput";
import { InlineQRScanner } from "@/components/InlineQRScanner";
import { QrCode, Plus, ArrowRight, Copy, Camera, X } from "lucide-react";

interface UnifiedSessionModalProps {
  onSessionCreated: (code: string) => void;
  onSessionJoined: (code: string) => void;
}

const UnifiedSessionModal = ({
  onSessionCreated,
  onSessionJoined,
}: UnifiedSessionModalProps) => {
  const [sessionCode, setSessionCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const { createSession, joinSession, isLoading } = useSession();
  const { toast } = useToast();

  const handleCreateSession = async () => {
    const session = await createSession();
    if (session) {
      setCreatedCode(session.session_code);
      onSessionCreated(session.session_code);
      toast({
        title: "✅ Session Created",
        description: `Your session ${session.session_code} is ready to use`,
      });
    }
  };

  const handleJoinSession = async (code?: string) => {
    const codeToJoin = code || sessionCode.trim();
    if (!codeToJoin) return;

    const session = await joinSession(codeToJoin);
    if (session) {
      onSessionJoined(session.session_code);
      toast({
        title: "🎉 Joined Successfully",
        description: `Connected to session ${session.session_code}`,
      });
      setSessionCode("");
      setIsScanning(false);
    } else {
      toast({
        title: "❌ Session Not Found",
        description: `Session "${codeToJoin}" doesn't exist`,
        action: (
          <Button
            size="sm"
            onClick={handleCreateSession}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Create It
          </Button>
        ),
      });
    }
  };

  const handleStartScanning = async () => {
    try {
      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });
      setIsScanning(true);
      setScannerError(null);
    } catch (error) {
      toast({
        title: "📷 Camera Access Required",
        description: "Please allow camera access to scan QR codes",
      });
      setScannerError("Camera permission denied");
    }
  };

  const handleQRScanResult = async (result: string) => {
    setScannerError(null);
    setIsScanning(false);
    await handleJoinSession(result);
  };

  const handleQRScanError = (error: string) => {
    console.error("QR scan error:", error);
    setScannerError("Failed to scan QR code");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copied!",
      description: "Session code copied to clipboard",
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Main Actions Card */}
      <Card className="p-6 bg-white/10 backdrop-blur-xl border-white/20">
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={handleCreateSession}
              disabled={isLoading}
              size="lg"
              className="h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold text-lg shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              {isLoading ? "Creating..." : "Create New Session"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white/10 text-white/60 text-sm">
                  OR
                </span>
              </div>
            </div>

            <Button
              onClick={handleStartScanning}
              disabled={isLoading || isScanning}
              size="lg"
              className="h-14 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold text-lg shadow-lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              {isScanning ? "Scanner Active..." : "Scan QR Code"}
            </Button>
          </div>

          {/* Manual Code Input */}
          <div className="space-y-3">
            <div className="text-center">
              <label className="text-white/80 text-sm font-medium">
                Or enter session code manually:
              </label>
            </div>
            <div className="w-full flex justify-center">
              <CodeInput
                onComplete={handleJoinSession}
                disabled={isLoading}
                error={null}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Created Session Display */}
      {createdCode && (
        <Card className="p-6 bg-green-500/10 backdrop-blur-xl border-green-500/30">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-white">
              ✅ Session Created
            </h3>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-white tracking-wider bg-black/30 px-6 py-3 rounded-lg">
                {createdCode}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(createdCode)}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="bg-white p-4 rounded-lg inline-block">
              <QRCodeGenerator sessionCode={createdCode} />
            </div>
            <p className="text-white/70 text-sm">
              Share this code or QR with other devices to join
            </p>
          </div>
        </Card>
      )}

      {/* QR Scanner Modal */}
      {isScanning && (
        <Card className="p-6 bg-blue-500/10 backdrop-blur-xl border-blue-500/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Camera className="w-5 h-5" />
                QR Scanner
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsScanning(false)}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative aspect-square bg-black/30 rounded-lg overflow-hidden max-w-sm mx-auto">
              <InlineQRScanner
                onResult={handleQRScanResult}
                onError={handleQRScanError}
                isActive={isScanning}
              />

              {/* Scanner Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 w-8 h-8 border-l-3 border-t-3 border-blue-400"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-r-3 border-t-3 border-blue-400"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-3 border-b-3 border-blue-400"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-3 border-b-3 border-blue-400"></div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 border-2 border-blue-400/50 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>

            {scannerError ? (
              <p className="text-red-400 text-sm text-center">{scannerError}</p>
            ) : (
              <p className="text-white/70 text-sm text-center">
                Point camera at QR code to join automatically
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default UnifiedSessionModal;
