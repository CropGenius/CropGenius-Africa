
import { useEffect, useState } from "react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

function isStandalone() {
  // PWA display-mode detection
  // @ts-ignore
  if (window.navigator.standalone) return true // iOS
  return window.matchMedia?.("(display-mode: standalone)")?.matches ?? false
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => {
    return isStandalone() || localStorage.getItem("cg_installed") === "true"
  });
  const [dismissed, setDismissed] = useState<boolean>(
    localStorage.getItem("cg_install_dismissed") === "true"
  );

  useEffect(() => {
    // Check if prompt is already available
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }

    // Listen for custom event from HTML
    const customHandler = (e: CustomEvent) => {
      console.log('🔥 [PWA] Custom prompt event received');
      setDeferredPrompt(e.detail);
    };

    window.addEventListener("pwapromptavailable", customHandler as EventListener);

    // Track successful install
    const installHandler = () => {
      console.log('🚀 [PWA] App installed successfully');
      localStorage.setItem("cg_installed", "true");
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", installHandler);

    return () => {
      window.removeEventListener("pwapromptavailable", customHandler as EventListener);
      window.removeEventListener("appinstalled", installHandler);
    };
  }, []);

  const handleInstall = async () => {
    console.log('🔍 [DEBUG] deferredPrompt:', deferredPrompt);
    console.log('🔍 [DEBUG] window.deferredPrompt:', window.deferredPrompt);
    if (deferredPrompt) {
      try {
        console.log('🔥 [PWA] Triggering install prompt');
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log('🔥 [PWA] User choice:', outcome);
        
        if (outcome === "accepted") {
          localStorage.setItem("cg_installed", "true");
          setInstalled(true);
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('🚨 [PWA] Install prompt failed:', error);
      }
      return;
    }
    
    // Minimal iOS help (no reinventing the wheel)
    alert("Install CropGenius:\n• iPhone: Share → Add to Home Screen\n• Android: Menu → Install app");
  };

  const handleDismiss = () => {
    localStorage.setItem("cg_install_dismissed", "true");
    setDismissed(true);
  };

  // Don't show if already installed or dismissed
  if (installed || dismissed) return null;

  // Show simplified version if no prompt available (iOS Safari, etc.)
  if (!deferredPrompt) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <LiquidButton onClick={handleInstall} variant="default" size="xxl">
          <Download className="mr-2" />
          Install CropGenius
        </LiquidButton>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-2xl shadow-xl border border-green-500/20 backdrop-blur-sm max-w-sm">
        <div className="flex items-start gap-3">
          <Download className="h-6 w-6 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Install CropGenius</h3>
            <p className="text-sm text-green-100 mb-4">Get faster access, offline features, and native app experience</p>
            
            <div className="flex gap-2">
              <LiquidButton
                onClick={handleInstall}
                variant="default"
                size="lg"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
              >
                Install Now
              </LiquidButton>
              <button
                onClick={handleDismiss}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
