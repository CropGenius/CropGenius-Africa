
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

  useEffect(() => {
    // Listen for the beforeinstallprompt event (when available)
    const handler = (e: any) => {
      console.log('🔥 [PWA] beforeinstallprompt event received');
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Track successful install
    const installHandler = () => {
      console.log('🚀 [PWA] App installed successfully');
      localStorage.setItem("cg_installed", "true");
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", installHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installHandler);
    };
  }, []);

  // Don't show if already installed
  if (installed) return null;

  const handleInstall = async () => {
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
    
    // For mobile browsers that don't support beforeinstallprompt
    alert("Install CropGenius:\n• iPhone: Share → Add to Home Screen\n• Android: Menu → Install app");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <LiquidButton onClick={handleInstall} variant="default" size="xxl">
        <Download className="mr-2" />
        Install CropGenius
      </LiquidButton>
    </div>
  );
}
