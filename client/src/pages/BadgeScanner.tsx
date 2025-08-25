import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Camera, Users, Phone, Mail, Building, Briefcase, CheckCircle, X, ScanLine, UserPlus } from "lucide-react";
import QrScanner from "qr-scanner";

interface ScannedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  bio?: string;
  profileImageUrl?: string;
}

interface NetworkingConnection {
  id: number;
  scannedUser: ScannedUser;
  connectionNotes?: string;
  scannedAt: string;
  eventName?: string;
}

export default function BadgeScanner() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  
  const [scanning, setScanning] = useState(false);
  const [scannedUser, setScannedUser] = useState<ScannedUser | null>(null);
  const [connectionNotes, setConnectionNotes] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  // Fetch user's networking connections
  const { data: connections = [], isLoading: connectionsLoading } = useQuery<NetworkingConnection[]>({
    queryKey: ['/api/networking/connections'],
    enabled: isAuthenticated
  });

  // Save connection mutation
  const saveConnectionMutation = useMutation({
    mutationFn: async (data: { scannedUserId: string; notes?: string }) => {
      return await apiRequest('/api/networking/connections', {
        method: 'POST',
        body: JSON.stringify({
          scannedUserId: data.scannedUserId,
          connectionNotes: data.notes,
          eventId: 'ai-summit-2025',
          eventName: 'AI Summit 2025'
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/networking/connections'] });
      toast({
        title: "Contact Saved",
        description: "Connection added to your networking contacts",
      });
      setScannedUser(null);
      setConnectionNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save connection",
        variant: "destructive",
      });
    }
  });

  // Initialize QR scanner
  useEffect(() => {
    if (showCamera && videoRef.current) {
      const qrScanner = new QrScanner(
        videoRef.current,
        async (result) => {
          if (scanning) return;
          setScanning(true);
          
          try {
            // Extract QR handle from scanned data
            const qrHandle = result.data;
            
            // Fetch user details
            const response = await fetch(`/api/user-by-qr/${qrHandle}`);
            if (response.ok) {
              const userData = await response.json();
              setScannedUser(userData);
              setShowCamera(false);
              qrScanner.stop();
            } else {
              toast({
                title: "Invalid QR Code",
                description: "Could not find user profile",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Scan error:", error);
            toast({
              title: "Scan Error",
              description: "Failed to process QR code",
              variant: "destructive",
            });
          } finally {
            setScanning(false);
          }
        },
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      
      qrScanner.start();
      scannerRef.current = qrScanner;
      
      return () => {
        qrScanner.stop();
        qrScanner.destroy();
      };
    }
  }, [showCamera, scanning, toast]);

  const startScanning = () => {
    setShowCamera(true);
    setScannedUser(null);
  };

  const stopScanning = () => {
    setShowCamera(false);
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
  };

  const saveConnection = () => {
    if (scannedUser) {
      saveConnectionMutation.mutate({
        scannedUserId: scannedUser.id,
        notes: connectionNotes
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please log in to use the badge scanner
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Badge Scanner</h1>
        <p className="text-gray-600">
          Scan other attendees' badges to exchange contact information and build your network
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="w-5 h-5" />
              Scan Badge
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showCamera && !scannedUser && (
              <div className="text-center py-8">
                <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground mb-4">
                  Scan another attendee's QR code to connect
                </p>
                <Button onClick={startScanning} size="lg">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Scanning
                </Button>
              </div>
            )}

            {showCamera && (
              <div className="space-y-4">
                <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                  <video ref={videoRef} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-white/20 m-8 rounded-lg"></div>
                </div>
                <Button onClick={stopScanning} variant="outline" className="w-full">
                  <X className="w-4 h-4 mr-2" />
                  Cancel Scanning
                </Button>
              </div>
            )}

            {scannedUser && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {scannedUser.firstName} {scannedUser.lastName}
                      </h3>
                      {scannedUser.jobTitle && (
                        <p className="text-sm text-gray-600">{scannedUser.jobTitle}</p>
                      )}
                      {scannedUser.company && (
                        <p className="text-sm text-gray-600">{scannedUser.company}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {scannedUser.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{scannedUser.email}</span>
                    </div>
                  )}
                  {scannedUser.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{scannedUser.phone}</span>
                    </div>
                  )}
                  {scannedUser.bio && (
                    <p className="text-sm text-gray-600 italic">"{scannedUser.bio}"</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Add Notes (optional)</label>
                  <Textarea
                    placeholder="e.g., Discussed AI automation for retail, interested in collaboration"
                    value={connectionNotes}
                    onChange={(e) => setConnectionNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={saveConnection}
                    disabled={saveConnectionMutation.isPending}
                    className="flex-1"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Save Contact
                  </Button>
                  <Button
                    onClick={startScanning}
                    variant="outline"
                    className="flex-1"
                  >
                    Scan Another
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connections List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Connections
              </div>
              <Badge variant="secondary">{connections.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectionsLoading ? (
              <p className="text-center text-muted-foreground py-4">Loading connections...</p>
            ) : connections.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {connections.map((connection) => (
                  <div key={connection.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          {connection.scannedUser.firstName} {connection.scannedUser.lastName}
                        </h4>
                        {connection.scannedUser.jobTitle && (
                          <p className="text-sm text-gray-600">{connection.scannedUser.jobTitle}</p>
                        )}
                        {connection.scannedUser.company && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Building className="w-3 h-3" />
                            {connection.scannedUser.company}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(connection.scannedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {connection.scannedUser.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <a href={`mailto:${connection.scannedUser.email}`} className="text-blue-600 hover:underline">
                          {connection.scannedUser.email}
                        </a>
                      </div>
                    )}
                    
                    {connection.connectionNotes && (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                        📝 {connection.connectionNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-muted-foreground">No connections yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Start scanning badges to build your network
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}