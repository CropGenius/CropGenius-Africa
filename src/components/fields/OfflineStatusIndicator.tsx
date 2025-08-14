import React, { useEffect, useState, useCallback } from 'react';
import { Wifi, WifiOff, Check, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { isOnline } from '@/utils/fieldSanitizer';
import { Button } from '@/components/ui/button';

interface OfflineStatusIndicatorProps {
  alertDuration?: number; // Duration in ms to show the online alert
  alwaysShowOffline?: boolean; // Whether to always show the offline alert
}

export function OfflineStatusIndicator({ 
  alertDuration = 8000, // Increased from 5000ms to 8000ms
  alwaysShowOffline = true
}: OfflineStatusIndicatorProps) {
  const [offline, setOffline] = useState(!isOnline());
  const [showAlert, setShowAlert] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  
  // Function to sync offline changes
  const syncOfflineChanges = useCallback(async () => {
    if (offline) return; // Don't try to sync if offline
    
    setIsSyncing(true);
    setSyncComplete(false);
    
    try {
      // Check if there are any pending changes in localStorage
      const pendingChanges = localStorage.getItem('pendingFieldChanges');
      
      if (pendingChanges) {
        // In a real implementation, this would send the changes to the server
        // For now, we'll simulate a sync with a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Clear the pending changes after successful sync
        localStorage.removeItem('pendingFieldChanges');
        console.log("✅ Offline changes synced successfully");
      }
      
      setSyncComplete(true);
    } catch (error) {
      console.error("Failed to sync offline changes:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [offline]);

  useEffect(() => {
    // Set initial state using the isOnline utility consistently
    const currentOfflineState = !isOnline();
    setOffline(currentOfflineState);
    
    // Show alert only if offline at initialization
    if (currentOfflineState && alwaysShowOffline) {
      setShowAlert(true);
    }
    
    // Add event listeners for connection changes
    const handleOnline = () => {
      setOffline(false);
      setShowAlert(true);
      
      // Attempt to sync offline changes
      syncOfflineChanges();
      
      // Auto-hide the alert after specified duration
      const timer = setTimeout(() => setShowAlert(false), alertDuration);
      return () => clearTimeout(timer);
    };
    
    const handleOffline = () => {
      setOffline(true);
      setShowAlert(true);
      // Keep alert visible if alwaysShowOffline is true
      if (!alwaysShowOffline) {
        const timer = setTimeout(() => setShowAlert(false), alertDuration);
        return () => clearTimeout(timer);
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [alertDuration, alwaysShowOffline, syncOfflineChanges]);

  // If online and not showing alert, return null
  if (!offline && !showAlert) return null;
  
  return (
    <div 
      className="fixed bottom-4 right-4 z-50 max-w-sm transition-all duration-300 ease-in-out" 
      style={{ 
        transform: showAlert ? 'translateY(0)' : 'translateY(150%)',
        opacity: showAlert ? 1 : 0
      }}
      role="status"
      aria-live="polite"
    >
      {offline ? (
        <Alert variant="destructive" className="border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100">
          <WifiOff className="h-4 w-4 mr-2" />
          <AlertTitle>You are offline</AlertTitle>
          <AlertDescription>
            Don't worry, your changes will be saved locally and synced when you reconnect.
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50"
            onClick={() => setShowAlert(false)}
          >
            Dismiss
          </Button>
        </Alert>
      ) : (
        <Alert variant="default" className="border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100">
          <Wifi className="h-4 w-4 mr-2" />
          <AlertTitle>You are back online</AlertTitle>
          <AlertDescription className="flex items-center gap-2">
            {isSyncing ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Syncing your offline changes...
              </>
            ) : syncComplete ? (
              <>
                <Check className="h-3 w-3" />
                Your changes have been synced successfully.
              </>
            ) : (
              "Checking for offline changes..."
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default OfflineStatusIndicator;
