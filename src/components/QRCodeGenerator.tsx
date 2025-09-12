import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

  const joinURL = `${window.location.origin}?join=${sessionCode}`;

  useEffect(() => {
    if (isOpen && sessionCode) {
      QRCode.toDataURL(joinURL, {
        width: 300,
        margin: 2,
        color: {
          dark: '#ffffff',
          light: '#0a0a0a'
        }
      })
        .then((url) => setQrDataURL(url))
        .catch((err) => console.error('QR Code generation error:', err));
    }
  }, [isOpen, sessionCode, joinURL]);

  const downloadQR = () => {
    if (!qrDataURL) return;
    
    const link = document.createElement('a');
    link.download = `weavepaste-${sessionCode}-qr.png`;
    link.href = qrDataURL;
    link.click();
    
    toast({
      title: "Downloaded!",
      description: "QR code saved to your device",
    });
  };

  const copyURL = () => {
    navigator.clipboard.writeText(joinURL);
    toast({
      title: "Copied!",
      description: "Join URL copied to clipboard",
    });
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
      <DialogContent className="glass-card border-white/20">
        <DialogHeader>
          <DialogTitle>QR Code for Session {sessionCode}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {qrDataURL && (
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                <img src={qrDataURL} alt={`QR Code for ${sessionCode}`} className="w-64 h-64" />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Scan with any device to join this session
            </p>
            <div className="flex gap-2">
              <Button variant="glass" className="flex-1" onClick={copyURL}>
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
              <Button variant="outline" className="glass flex-1" onClick={downloadQR}>
                <Download className="w-4 h-4" />
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