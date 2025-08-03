import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Zap, Users, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when scanner becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleManualScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value && value !== lastScan?.code) {
      const now = Date.now();
      
      // Prevent duplicate scans within 2 seconds
      if (!lastScan || now - lastScan.timestamp > 2000) {
        setLastScan({ code: value, timestamp: now });
        setScanHistory(prev => [value, ...prev.slice(0, 9)]); // Keep last 10 scans
        onScan(value);
        e.target.value = ''; // Clear input for next scan
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      if (input.value.trim()) {
        handleManualScan({ target: input } as any);
      }
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
          {/* Scanning Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Scan QR Code or Enter Manually
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="Scan QR code here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={handleManualScan}
              onKeyPress={handleKeyPress}
              autoComplete="off"
            />
            <p className="text-xs text-gray-500">
              Position QR code in scanner or type the code manually
            </p>
          </div>

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