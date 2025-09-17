import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Zap, Users, CheckCircle2, AlertCircle, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  isActive: boolean;
  onClose: () => void;
  sessionStats?: {
    totalScans: number;
    uniqueScans: number;
    duplicateScans: number;
    sessionTime: string;
  };
}

export function QRScanner({ onScan, isActive, onClose, sessionStats }: QRScannerProps) {
  const [lastScan, setLastScan] = useState<{ code: string; timestamp: number } | null>(null);
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const [showManualInput, setShowManualInput] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [debugInfo, setDebugInfo] = useState<string>('Ready to scan');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  const handleScanResult = (result: string) => {
    if (result && result !== lastScan?.code) {
      const now = Date.now();
      
      // Prevent duplicate scans within 2 seconds
      if (!lastScan || now - lastScan.timestamp > 2000) {
        setLastScan({ code: result, timestamp: now });
        setScanHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 scans
        onScan(result);
      }
    }
  };

  const handleManualInput = () => {
    if (manualInput.trim()) {
      handleScanResult(manualInput.trim());
      setManualInput('');
    }
  };

  // Initialize QR Scanner
  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    const initScanner = async () => {
      try {
        setDebugInfo('Starting scanner...');
        setIsScanning(true);
        setCameraError(null);
        
        const qrScanner = new QrScanner(
          videoRef.current!,
          (result: any) => {
            const text = typeof result === 'string' ? result : result?.data || result;
            setDebugInfo(`Detected: ${text}`);
            if (text) {
              handleScanResult(text);
            }
          }
        );
        
        qrScannerRef.current = qrScanner;
        await qrScanner.start();
        setDebugInfo('Scanner active - point at QR code');
        setIsScanning(true);
      } catch (error: any) {
        console.error('Failed to start QR scanner:', error);
        let errorMessage = 'Failed to access camera';
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported on this device.';
        }
        setCameraError(errorMessage);
        setShowManualInput(true);
        setIsScanning(false);
      }
    };

    initScanner();

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              QR Code Scanner
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Camera Scanner */}
          {!showManualInput && !cameraError && (
            <div className="space-y-2">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full aspect-square bg-black rounded-lg"
                  playsInline
                  muted
                />
                {isScanning && (
                  <div className="absolute inset-2 border-2 border-green-500 rounded-lg animate-pulse">
                    <div className="absolute inset-2 border border-green-300 rounded opacity-50"></div>
                    <div className="absolute top-2 left-2 right-2 text-green-500 text-xs font-medium bg-black/70 px-2 py-1 rounded text-center">
                      {debugInfo}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-center text-gray-600">
                Hold QR code steady in camera view for detection
              </p>
              
              <Button
                variant="outline"
                onClick={() => setShowManualInput(true)}
                className="w-full"
              >
                <Keyboard className="h-4 w-4 mr-2" />
                Enter Code Manually
              </Button>
            </div>
          )}

          {/* Camera Error */}
          {cameraError && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Camera Access Failed</span>
                </div>
                <p className="text-xs text-red-600 mt-1">{cameraError}</p>
              </div>
              
              <Button
                onClick={() => {
                  setCameraError(null);
                  setShowManualInput(false);
                }}
                className="w-full"
              >
                <Camera className="h-4 w-4 mr-2" />
                Try Camera Again
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowManualInput(true)}
                className="w-full"
              >
                <Keyboard className="h-4 w-4 mr-2" />
                Enter Code Manually
              </Button>
            </div>
          )}

          {/* Manual Input */}
          {showManualInput && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter QR Code Manually</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter QR code or badge ID..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
                  autoComplete="off"
                />
                <Button onClick={handleManualInput} disabled={!manualInput.trim()}>
                  Scan
                </Button>
              </div>
              
              {!cameraError && (
                <Button
                  variant="outline"
                  onClick={() => setShowManualInput(false)}
                  className="w-full"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Use Camera Instead
                </Button>
              )}
            </div>
          )}

          {/* Session Stats */}
          {sessionStats && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total Scans</span>
                </div>
                <p className="text-lg font-semibold text-blue-600">
                  {sessionStats.totalScans}
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Unique</span>
                </div>
                <p className="text-lg font-semibold text-green-600">
                  {sessionStats.uniqueScans}
                </p>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Duplicates</span>
                </div>
                <p className="text-lg font-semibold text-orange-600">
                  {sessionStats.duplicateScans}
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Time</span>
                </div>
                <p className="text-lg font-semibold text-purple-600">
                  {sessionStats.sessionTime}
                </p>
              </div>
            </div>
          )}

          {/* Recent Scans */}
          {scanHistory.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Scans</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {scanHistory.map((scan, index) => (
                  <div
                    key={index}
                    className={cn(
                      "px-2 py-1 text-xs rounded font-mono",
                      index === 0
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    )}
                  >
                    {scan}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Point camera at QR code or type manually</p>
            <p>• Duplicate scans within 2 seconds are ignored</p>
            <p>• Press Enter after typing manually</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}