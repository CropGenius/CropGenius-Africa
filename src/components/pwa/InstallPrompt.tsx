import { useEffect, useState } from "react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { Smartphone, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(
    localStorage.getItem("cg_installed") === "true"
  );
  const [dismissed, setDismissed] = useState<boolean>(
    localStorage.getItem("cg_install_dismissed") === "true"
  );

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      console.log('🔥 [PWA] BeforeInstallPrompt captured');
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);

    // Track successful install
    const installHandler = () => {
      console.log('🚀 [PWA] App installed successfully');
      localStorage.setItem("cg_installed", "true");
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", installHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler as EventListener);
      window.removeEventListener("appinstalled", installHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

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
  };

  const handleDismiss = () => {
    localStorage.setItem("cg_install_dismissed", "true");
    setDismissed(true);
  };

  // Don't show if already installed, dismissed, or no prompt available
  if (installed || dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-2xl shadow-xl border border-green-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            <div>
              <p className="font-semibold text-sm">Install CropGenius</p>
              <p className="text-xs text-green-100">Get faster access & offline features</p>
            </div>
          </div>
          
          <div className="flex gap-1">
            <Button
              onClick={handleInstall}
              size="sm"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-0 h-8"
            >
              Install
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
