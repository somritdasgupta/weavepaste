import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, Camera, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface QRScannerProps {
  onResult: (result: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ 
  onResult, 
  onError, 
  onClose 
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: {
        width: 250,
        height: 250,
      },
      aspectRatio: 1.0,
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
    };

    const scanner = new Html5QrcodeScanner(
      'qr-scanner-container',
      config,
      false
    );

    scannerRef.current = scanner;

    const handleSuccess = (decodedText: string, decodedResult: unknown) => {
      // Extract session code from URL or use direct code
      let sessionCode = decodedText;
      
      // If it's a URL, try to extract the session code
      try {
        const url = new URL(decodedText);
        const pathParts = url.pathname.split('/');
        const sessionIndex = pathParts.indexOf('session');
        if (sessionIndex !== -1 && pathParts[sessionIndex + 1]) {
          sessionCode = pathParts[sessionIndex + 1];
        }
      } catch {
        // If not a valid URL, treat as direct session code
      }

      // Validate session code format (should be 7 characters)
      if (sessionCode.length === 7) {
        scanner.clear();
        onResult(sessionCode);
      } else {
        setError('Invalid session code format. Expected 7 characters.');
      }
    };

    const handleError = (error: string) => {
      console.warn('QR Scanner error:', error);
      if (error.includes('NotAllowedError') || error.includes('Permission denied')) {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (error.includes('NotFoundError')) {
        setError('No camera found. Please check your device has a camera.');
      } else if (error.includes('NotSupportedError')) {
        setError('QR scanning is not supported on this device/browser.');
      } else {
        setError('Camera access failed. Please try again.');
      }
      onError?.(error);
    };

    try {
      setIsScanning(true);
      scanner.render(handleSuccess, handleError);
    } catch (err) {
      setError('Failed to initialize QR scanner.');
      console.error('QR Scanner initialization error:', err);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onResult, onError]);

  const handleRetry = () => {
    setError('');
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        window.location.reload(); // Simple retry by reloading
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Scan QR Code
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {error ? (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button
                  onClick={handleRetry}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div 
                id="qr-scanner-container" 
                className="w-full rounded-lg overflow-hidden bg-gray-100"
                style={{ minHeight: '300px' }}
              />
              <p className="text-sm text-gray-600 text-center">
                Point your camera at a QR code to scan the session code
              </p>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};