import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  QrCode, 
  Camera, 
  Users,
  UserCheck,
  AlertCircle,
  Building,
  Phone,
  Mail,
  GraduationCap,
  Briefcase
} from "lucide-react";
import QrScanner from "qr-scanner";

interface ScanResult {
  message: string;
  visitor: any;
  alreadyScanned: boolean;
}

export function ExhibitorScanner() {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [standNumber, setStandNumber] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  // Fetch current events for selection
  const { data: events = [] } = useQuery({
    queryKey: ["/api/cba-events/active"],
  });

  // Scan visitor mutation
  const scanVisitorMutation = useMutation({
    mutationFn: async (data: { visitorId: string; eventId: number | null; standNumber: string }): Promise<ScanResult> => {
      const response = await apiRequest("POST", "/api/exhibitor/scan-visitor", data);
      return response as ScanResult;
    },
    onSuccess: (data: ScanResult) => {
      setScanResult(data);
      if (data.alreadyScanned) {
        toast({
          title: "Visitor Already Scanned",
          description: "This visitor has already been scanned at your stand.",
          variant: "default",
        });
      } else {
        toast({
          title: "Success",
          description: "Visitor scanned successfully!",
        });
      }
      stopScanning();
    },
    onError: (error: any) => {
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to scan visitor",
        variant: "destructive",
      });
      stopScanning();
    },
  });

  // Initialize QR scanner
  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      setScanResult(null);

      // Check for camera permission
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        throw new Error("No camera found on this device");
      }

      // Create QR scanner instance
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScanSuccess(result.data),
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await scannerRef.current.start();
    } catch (error: any) {
      console.error("Failed to start scanner:", error);
      toast({
        title: "Scanner Error",
        description: error.message || "Failed to start camera",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  // Stop scanning
  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Handle successful scan
  const handleScanSuccess = (data: string) => {
    try {
      // Parse the QR code data
      const qrData = JSON.parse(data);
      
      if (!qrData.userId) {
        throw new Error("Invalid QR code format");
      }

      // Submit the scan
      scanVisitorMutation.mutate({
        visitorId: qrData.userId,
        eventId: selectedEventId,
        standNumber: standNumber,
      });
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast({
        title: "Invalid QR Code",
        description: "This QR code is not a valid visitor badge",
        variant: "destructive",
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Get visitor type badge color
  const getTypeBadgeColor = (type: string | null) => {
    switch (type) {
      case "student":
        return "bg-blue-100 text-blue-800";
      case "resident":
        return "bg-green-100 text-green-800";
      case "volunteer":
        return "bg-purple-100 text-purple-800";
      case "vip":
        return "bg-yellow-100 text-yellow-800";
      case "speaker":
        return "bg-red-100 text-red-800";
      case "exhibitor":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Exhibition Stand Scanner</h1>
        <p className="text-gray-600">
          Scan visitor badges to capture their contact information
        </p>
      </div>

      {/* Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Scanner Configuration</CardTitle>
          <CardDescription>
            Set up your stand details before scanning visitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event">Event (Optional)</Label>
              <select
                id="event"
                className="w-full p-2 border rounded-md"
                value={selectedEventId || ""}
                onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">No specific event</option>
                {Array.isArray(events) && events.map((event: any) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="stand">Stand Number (Optional)</Label>
              <Input
                id="stand"
                placeholder="e.g., A12, B5..."
                value={standNumber}
                onChange={(e) => setStandNumber(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scanner */}
      <Card>
        <CardHeader>
          <CardTitle>QR Code Scanner</CardTitle>
          <CardDescription>
            Point the camera at a visitor's badge QR code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Video preview */}
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${!isScanning && "hidden"}`}
              />
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Camera preview will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Control buttons */}
            <div className="flex justify-center gap-4">
              {!isScanning ? (
                <Button onClick={startScanning} size="lg">
                  <Camera className="mr-2 h-5 w-5" />
                  Start Scanning
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="destructive" size="lg">
                  Stop Scanning
                </Button>
              )}
            </div>

            {/* Scan result */}
            {scanResult && (
              <Alert className={scanResult.alreadyScanned ? "border-yellow-500" : "border-green-500"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">
                      {scanResult.alreadyScanned ? "Visitor Already Scanned" : "Visitor Scanned Successfully"}
                    </p>
                    {scanResult.visitor && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-lg">
                                {scanResult.visitor.visitorName || "Unknown Visitor"}
                              </h4>
                              <Badge className={getTypeBadgeColor(scanResult.visitor.visitorType)}>
                                {scanResult.visitor.visitorType || "Attendee"}
                              </Badge>
                            </div>

                            {scanResult.visitor.visitorEmail && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-3 w-3" />
                                {scanResult.visitor.visitorEmail}
                              </div>
                            )}

                            {scanResult.visitor.visitorPhone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-3 w-3" />
                                {scanResult.visitor.visitorPhone}
                              </div>
                            )}

                            {scanResult.visitor.visitorCompany && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Building className="h-3 w-3" />
                                {scanResult.visitor.visitorCompany}
                                {scanResult.visitor.visitorTitle && ` - ${scanResult.visitor.visitorTitle}`}
                              </div>
                            )}

                            {scanResult.visitor.visitorUniversity && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <GraduationCap className="h-3 w-3" />
                                {scanResult.visitor.visitorUniversity}
                                {scanResult.visitor.visitorCourse && ` - ${scanResult.visitor.visitorCourse}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">View All Scanned Visitors</p>
              <p className="text-lg">Manage and export your visitor list</p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = "/exhibitor-visitors"}>
              <Users className="mr-2 h-4 w-4" />
              View Visitors
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}