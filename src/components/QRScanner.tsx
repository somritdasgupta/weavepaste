import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Camera, CameraOff } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (sessionCode: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    const initializeScanner = async () => {
      try {
        if (!scannerRef.current && mounted) {
          const scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            false
          );

          scanner.render(
            (decodedText) => {
              console.log("QR Code scanned:", decodedText);
              // Extract session code from the scanned URL or text
              let sessionCode = "";

              try {
                // If it's a URL, extract the session code
                if (decodedText.includes("/join/")) {
                  const urlParts = decodedText.split("/join/");
                  sessionCode = urlParts[1]?.split("?")[0]?.split("/")[0] || "";
                } else if (decodedText.match(/^[A-Z0-9]{7}$/)) {
                  // If it's already a session code format
                  sessionCode = decodedText;
                } else {
                  throw new Error("Invalid QR code format");
                }

                if (sessionCode && sessionCode.length === 7) {
                  if (mounted) {
                    scanner.clear();
                    onScanSuccess(sessionCode);
                  }
                } else {
                  throw new Error("Invalid session code length");
                }
              } catch (err) {
                console.error("QR scan error:", err);
                if (mounted) {
                  setError(
                    "Invalid QR code. Please scan a valid WeavePaste session QR code."
                  );
                  setTimeout(() => setError(""), 3000);
                }
              }
            },
            (errorMessage) => {
              // Handle scan errors silently - they're usually just "no QR code found"
              console.log("QR scan error:", errorMessage);
            }
          );

          if (mounted) {
            scannerRef.current = scanner;
            setIsScanning(true);
          }
        }
      } catch (err) {
        console.error("Failed to initialize scanner:", err);
        if (mounted) {
          setError("Camera not available. Please check camera permissions.");
        }
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(initializeScanner, 100);

    return () => {
      mounted = false;
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.error("Error clearing scanner:", err);
        }
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess]);

  const handleClose = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
    onClose();
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-3xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan QR Code
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-white/10 h-8 w-8 p-0 rounded-xl"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
            <span className="text-red-200 text-sm font-bold">{error}</span>
          </div>
        )}

        <div
          id="qr-reader"
          className="w-full rounded-2xl overflow-hidden"
          style={{ minHeight: "300px" }}
        />

        {isScanning && (
          <div className="mt-4 text-center">
            <p className="text-sm text-white/70 mb-3 font-bold">
              Point your camera at a WeavePaste QR code
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-white/50">
              <Camera className="w-3 h-3 text-green-400" />
              <span className="font-bold">Camera active</span>
            </div>
          </div>
        )}

        {!isScanning && error && (
          <div className="text-center py-4">
            <CameraOff className="w-8 h-8 mx-auto text-white/50 mb-2" />
            <p className="text-white/70 text-sm font-bold">
              Camera not available
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default QRScanner;
