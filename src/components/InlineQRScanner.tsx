import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Button } from './ui/button';
import { Camera, CameraOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface InlineQRScannerProps {
  onResult: (result: string) => void;
  onError?: (error: string) => void;
  isActive: boolean;
}

export const InlineQRScanner: React.FC<InlineQRScannerProps> = ({ 
  onResult, 
  onError, 
  isActive 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const handleScanning = async () => {
      if (isActive && !isScanning) {
        await startScanner();
      } else if (!isActive && isScanning) {
        stopScanner();
      }
    };

    handleScanning();

    return () => {
      stopScanner();
    };
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const startScanner = async () => {
    try {
      setError('');
      setIsScanning(true);
      
      // Initialize the reader
      if (!readerRef.current) {
        readerRef.current = new BrowserMultiFormatReader();
      }

      // Get video element
      if (!videoRef.current) return;

      // Start scanning
      await readerRef.current.decodeFromVideoDevice(
        undefined, // Use default camera
        videoRef.current,
        (result, error) => {
          if (result) {
            const scannedText = result.getText();
            handleScanResult(scannedText);
          }
          
          if (error && !error.message.includes('NotFoundException')) {
            console.warn('QR Scanner error:', error);
          }
        }
      );

      setHasPermission(true);
    } catch (err: unknown) {
      console.error('Failed to start scanner:', err);
      setHasPermission(false);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (errorMessage.includes('NotFoundError')) {
        setError('No camera found. Please check your device has a camera.');
      } else if (errorMessage.includes('NotSupportedError')) {
        setError('QR scanning is not supported on this device/browser.');
      } else {
        setError('Failed to access camera. Please try again.');
      }
      
      setIsScanning(false);
      onError?.(errorMessage);
    }
  };

  const stopScanner = () => {
    if (readerRef.current) {
      try {
        // Stop all video streams
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
        readerRef.current = null;
      } catch (error) {
        console.warn('Error stopping scanner:', error);
      }
    }
    setIsScanning(false);
  };

  const handleScanResult = (scannedText: string) => {
    // Extract session code from URL or use direct code
    let sessionCode = scannedText;
    
    // If it's a URL, try to extract the session code
    try {
      const url = new URL(scannedText);
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
      stopScanner();
      onResult(sessionCode);
    }
  };

  const handleRetry = () => {
    setError('');
    setHasPermission(null);
    startScanner();
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 overflow-hidden">
        {error ? (
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover rounded-xl bg-gray-800"
                playsInline
                muted
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-blue-400 rounded-lg relative">
                  {/* Corner indicators */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                  
                  {/* Scanning line animation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" />
                  </div>
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                {isScanning ? (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white text-sm font-medium">Scanning...</span>
                  </>
                ) : (
                  <>
                    <CameraOff className="w-4 h-4 text-red-400" />
                    <span className="text-white text-sm font-medium">Camera Off</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white/90 text-sm font-medium">
                  Camera Active - Point at QR Code
                </span>
              </div>
              <p className="text-white/60 text-xs">
                Position the QR code within the frame to scan automatically
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};