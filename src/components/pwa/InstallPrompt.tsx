import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

const isAppInstalled = () => {
  // @ts-ignore: `standalone` is a non-standard property for iOS Safari.
  const isStandaloneIOS = !!window.navigator.standalone;
  const isStandalonePWA = window.matchMedia("(display-mode: standalone)").matches;
  return isStandaloneIOS || isStandalonePWA;
};

export default function InstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(isAppInstalled());

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (!isAppInstalled()) {
        setInstallPromptEvent(event as BeforeInstallPromptEvent);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPromptEvent(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // Listen for changes in display mode
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
        setIsInstalled(e.matches);
    };
    mediaQuery.addEventListener("change", handleDisplayModeChange);


    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
    }
  };

  if (isInstalled || !installPromptEvent) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button onClick={handleInstallClick} variant="default" size="lg">
        <Download className="mr-2 h-5 w-5" />
        Install CropGenius
      </Button>
    </div>
  );
}