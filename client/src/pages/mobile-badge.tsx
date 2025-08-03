import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";
import { QrCode, User, Building, Crown, Smartphone, Download, Share2, Maximize2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

interface PersonalBadge {
  id: number;
  userId: string;
  badgeId: string;
  qrHandle: string;
  isActive: boolean;
}

interface BadgeProfile {
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  jobTitle: string;
  phone: string;
  bio: string;
  qrHandle: string;
  membershipTier: string;
}

export default function MobileBadgePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [brightness, setBrightness] = useState(100);

  // Fetch user's personal badge
  const { data: personalBadge } = useQuery<PersonalBadge>({
    queryKey: ["/api/my-personal-badge"],
  });

  // Fetch badge profile information
  const { data: badgeProfile } = useQuery<BadgeProfile>({
    queryKey: ["/api/my-badge-profile"],
  });

  // Generate QR code when badge data is available
  useEffect(() => {
    if (personalBadge?.qrHandle) {
      QRCode.toDataURL(personalBadge.qrHandle, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(setQrCodeDataURL);
    }
  }, [personalBadge]);

  // Keep screen awake when displaying badge
  useEffect(() => {
    let wakeLock: any = null;
    
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.log('Wake lock not supported');
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, []);

  const membershipColors = {
    'Partner': '#9333EA',
    'Patron Tier': '#F59E0B', 
    'Strategic Tier': '#EF4444',
    'Growth Tier': '#10B981',
    'Starter Tier': '#3B82F6'
  };

  const badgeColor = membershipColors[badgeProfile?.membershipTier as keyof typeof membershipColors] || '#3B82F6';

  const handleShare = async () => {
    if (navigator.share && personalBadge) {
      try {
        await navigator.share({
          title: 'My CBA Digital Badge',
          text: `Check out my Croydon Business Association badge: @${personalBadge.qrHandle}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share not supported');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Badge link copied to clipboard"
      });
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (!personalBadge || !badgeProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Badge Found</h3>
            <p className="text-gray-600 mb-4">You need to create a personal badge first.</p>
            <Button onClick={() => window.location.href = '/enhanced-personal-badge'}>
              Create Badge
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" style={{ filter: `brightness(${brightness}%)` }}>
      <Helmet>
        <title>My Digital Badge - CBA</title>
        <meta name="description" content="Mobile digital badge for Croydon Business Association" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      </Helmet>

      {/* Controls Bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b p-2 flex justify-between items-center">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={toggleFullscreen}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Brightness</span>
          <input
            type="range"
            min="50"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Mobile Badge Display */}
      <div className="p-4 flex justify-center">
        <Card className="w-full max-w-sm shadow-2xl" style={{ borderColor: badgeColor, borderWidth: '3px' }}>
          {/* Header */}
          <div className="p-6 text-center text-white rounded-t-lg" style={{ background: `linear-gradient(135deg, ${badgeColor}, ${badgeColor}dd)` }}>
            <div className="text-lg font-bold mb-2">CROYDON BUSINESS ASSOCIATION</div>
            <Badge className="bg-white/20 text-white border-white/30">
              Digital Member Badge
            </Badge>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* QR Code Section */}
            <div className="text-center">
              {qrCodeDataURL && (
                <div className="inline-block p-4 bg-white rounded-xl shadow-lg" style={{ border: `2px solid ${badgeColor}` }}>
                  <img 
                    src={qrCodeDataURL} 
                    alt="QR Code" 
                    className="w-48 h-48 mx-auto"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              )}
              <div className="mt-3">
                <Badge variant="outline" style={{ color: badgeColor, borderColor: badgeColor }}>
                  @{personalBadge.qrHandle}
                </Badge>
              </div>
            </div>

            {/* Member Information */}
            <div className="text-center space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {badgeProfile.firstName} {badgeProfile.lastName}
                </h2>
                {badgeProfile.title && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Crown className="h-4 w-4 text-purple-600" />
                    <span className="text-purple-600 font-semibold">{badgeProfile.title}</span>
                  </div>
                )}
              </div>

              {badgeProfile.jobTitle && (
                <p className="text-gray-600 font-medium">{badgeProfile.jobTitle}</p>
              )}

              {badgeProfile.company && (
                <div className="flex items-center justify-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{badgeProfile.company}</span>
                </div>
              )}

              {/* Membership Tier */}
              <div className="pt-2">
                <Badge 
                  className="text-white px-4 py-1"
                  style={{ backgroundColor: badgeColor }}
                >
                  {badgeProfile.membershipTier || 'Member'}
                </Badge>
              </div>

              {/* Badge ID */}
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Badge ID</div>
                <div className="text-sm font-mono font-bold text-gray-800">{personalBadge.badgeId}</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>Show this QR code to event organizers for quick check-in</p>
              <p>Keep your screen bright for best scanning results</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center p-4 text-xs text-gray-500">
        <p>UK's Leading AI-Powered Business Association</p>
        <p>mytai.co.uk • Powered by Innovation</p>
      </div>
    </div>
  );
}