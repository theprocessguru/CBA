import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Zap, Users, CheckCircle2, AlertCircle, Keyboard, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [debugInfo, setDebugInfo] = useState<string>('Ready to capture QR code');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Initialize camera stream
  useEffect(() => {
    if (!isActive || showManualInput) return;

    const initCamera = async () => {
      try {
        setDebugInfo('Starting camera...');
        setCameraError(null);
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 640 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          setDebugInfo('Camera ready - tap "Capture Photo" to scan QR code');
        }
      } catch (error: any) {
        console.error('Failed to start camera:', error);
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
      }
    };

    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const mediaStream = videoRef.current.srcObject as MediaStream;
        mediaStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [isActive, showManualInput]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const mediaStream = videoRef.current.srcObject as MediaStream;
        mediaStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setIsProcessing(true);
      setDebugInfo('Capturing photo...');

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Failed to get canvas context');

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      setDebugInfo('Analyzing QR code with AI...');

      // Send to OpenAI for analysis
      const response = await fetch('/api/analyze-qr-image', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: imageData
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success && result.qrData) {
        setDebugInfo(`QR code found: ${result.qrData}`);
        handleScanResult(result.qrData);
        setCapturedImage(null);
      } else {
        setDebugInfo('No QR code detected - try repositioning and capture again');
        setTimeout(() => {
          setCapturedImage(null);
          setDebugInfo('Camera ready - tap "Capture Photo" to scan QR code');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Photo capture failed:', error);
      setDebugInfo('Analysis failed - please try again');
      setCapturedImage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setDebugInfo('Processing uploaded image...');

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageData = e.target?.result as string;
          setCapturedImage(imageData);

          // Send to OpenAI for analysis
          const response = await fetch('/api/analyze-qr-image', {
            method: 'POST',
            body: JSON.stringify({
              imageBase64: imageData
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const result = await response.json();

          if (result.success && result.qrData) {
            setDebugInfo(`QR code found: ${result.qrData}`);
            handleScanResult(result.qrData);
            setCapturedImage(null);
          } else {
            setDebugInfo('No QR code detected in uploaded image');
            setTimeout(() => {
              setCapturedImage(null);
              setDebugInfo('Upload another image or use camera');
            }, 3000);
          }
        } catch (error: any) {
          console.error('Upload analysis failed:', error);
          setDebugInfo('Analysis failed - please try another image');
          setCapturedImage(null);
        } finally {
          setIsProcessing(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('File upload failed:', error);
      setDebugInfo('Upload failed - please try again');
      setIsProcessing(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              AI QR Code Scanner
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Stop camera before closing
                if (videoRef.current?.srcObject) {
                  const mediaStream = videoRef.current.srcObject as MediaStream;
                  mediaStream.getTracks().forEach(track => track.stop());
                  videoRef.current.srcObject = null;
                }
                onClose();
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Photo Capture Scanner */}
          {!showManualInput && !cameraError && (
            <div className="space-y-3">
              <div className="relative">
                {capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured QR code"
                    className="w-full aspect-square bg-black rounded-lg object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    className="w-full aspect-square bg-black rounded-lg object-cover"
                    playsInline
                    muted
                    autoPlay
                  />
                )}
                
                <div className="absolute inset-2 border-2 border-green-500 rounded-lg">
                  <div className="absolute inset-2 border border-green-300 rounded opacity-50"></div>
                  <div className="absolute top-2 left-2 right-2 text-green-500 text-xs font-medium bg-black/70 px-2 py-1 rounded text-center">
                    {debugInfo}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={capturePhoto}
                  disabled={isProcessing || !!capturedImage}
                  className="w-full"
                  data-testid="button-capture-photo"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full"
                  data-testid="button-upload-image"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <p className="text-sm text-center text-gray-600">
                Position QR code in view and capture photo for AI analysis
              </p>
              
              <Button
                variant="outline"
                onClick={() => setShowManualInput(true)}
                className="w-full"
                data-testid="button-manual-input"
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
                data-testid="button-retry-camera"
              >
                <Camera className="h-4 w-4 mr-2" />
                Try Camera Again
              </Button>
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                data-testid="button-upload-fallback"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload QR Code Image
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowManualInput(true)}
                className="w-full"
                data-testid="button-manual-fallback"
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
                  data-testid="input-manual-qr"
                />
                <Button 
                  onClick={handleManualInput} 
                  disabled={!manualInput.trim()}
                  data-testid="button-manual-scan"
                >
                  Scan
                </Button>
              </div>
              
              {!cameraError && (
                <Button
                  variant="outline"
                  onClick={() => setShowManualInput(false)}
                  className="w-full"
                  data-testid="button-use-camera"
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
            <p>• Capture photo or upload image with QR code for AI analysis</p>
            <p>• AI analysis takes 2-3 seconds for accurate results</p>
            <p>• Manual entry available as backup option</p>
          </div>
        </CardContent>
        
        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </Card>
    </div>
  );
}