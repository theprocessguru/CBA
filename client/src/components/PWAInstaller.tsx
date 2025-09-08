import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if already installed (standalone mode)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(isInStandaloneMode);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show manual install instructions if not already installed
    if (isIOSDevice && !isInStandaloneMode) {
      // Show iOS install prompt after a short delay
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // Don't show if already installed
  if (isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <Card className="shadow-lg border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Install CBA Badge App</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-blue-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {isIOS ? (
            <div className="space-y-3">
              <p className="text-sm text-blue-800">
                Add to your home screen for quick access to your badge!
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <p>1. Tap the Share button (□↑) in your browser</p>
                <p>2. Scroll down and tap "Add to Home Screen"</p>
                <p>3. Tap "Add" to install the app</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-blue-800">
                Install the CBA Badge app for quick access to your digital badge and event features.
              </p>
              {deferredPrompt ? (
                <Button
                  onClick={handleInstallClick}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install App
                </Button>
              ) : (
                <div className="text-xs text-blue-700 space-y-1">
                  <p>On Chrome/Edge: Tap menu (⋮) → "Add to Home screen"</p>
                  <p>On Firefox: Tap menu → "Install"</p>
                  <p>Or look for the install prompt in your browser</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}