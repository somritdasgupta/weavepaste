import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QrCode, Download, Copy } from "lucide-react";
import QRCode from "qrcode";
import { useToast } from "@/hooks/use-toast";

interface QRCodeGeneratorProps {
  sessionCode: string;
  children?: React.ReactNode;
}

const QRCodeGenerator = ({ sessionCode, children }: QRCodeGeneratorProps) => {
  const [qrDataURL, setQrDataURL] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const joinURL = `${window.location.origin}/join/${sessionCode}`;

  useEffect(() => {
    if (isOpen && sessionCode) {
      QRCode.toDataURL(joinURL, {
        width: 300,
        margin: 2,
        color: {
          dark: "#ffffff",
          light: "#0a0a0a",
        },
      })
        .then((url) => setQrDataURL(url))
        .catch((err) => console.error("QR Code generation error:", err));
    }
  }, [isOpen, sessionCode, joinURL]);

  const downloadQR = () => {
    if (!qrDataURL) return;

    const link = document.createElement("a");
    link.download = `weavepaste-${sessionCode}-qr.png`;
    link.href = qrDataURL;
    link.click();

    // Removed unnecessary download toast
  };

  const copyURL = () => {
    navigator.clipboard.writeText(joinURL);
    // Removed unnecessary copy toast
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="glass">
            <QrCode className="w-4 h-4" />
            Generate QR Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md w-[90vw] max-w-[400px] mx-auto bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-base md:text-xl text-white">
            QR Code - Session {sessionCode}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 md:space-y-4">
          {qrDataURL && (
            <div className="flex justify-center">
              <div className="p-3 md:p-4 bg-white rounded-lg">
                <img
                  src={qrDataURL}
                  alt={`QR Code for ${sessionCode}`}
                  className="w-48 h-48 md:w-64 md:h-64"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs md:text-sm text-white/70 text-center">
              Scan with any device to join this session
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-xs md:text-sm bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                onClick={copyURL}
              >
                <Copy className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-xs md:text-sm bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                onClick={downloadQR}
              >
                <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeGenerator;
