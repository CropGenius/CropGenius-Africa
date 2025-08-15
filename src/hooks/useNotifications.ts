/**
 * 🚀 CROPGENIUS NOTIFICATION HOOK - THE REAL IMPLEMENTATION
 * 
 * This hook replaces the fake notification system with ACTUAL functionality.
 * No more lies, no more placeholders - this delivers real notifications!
 * 
 * Features:
 * - Real push notification management
 * - User preference enforcement
 * - Permission handling
 * - Subscription management
 * - Delivery tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { notificationService, type NotificationPreferences } from '@/services/NotificationService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface NotificationState {
  permission: NotificationPermission;
  isSubscribed: boolean;
  isSupported: boolean;
  isLoading: boolean;
  preferences: NotificationPreferences | null;
  error: string | null;
}

export interface NotificationHookReturn extends NotificationState {
  // Permission management
  requestPermission: () => Promise<boolean>;
  
  // Subscription management
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  
  // Preferences management
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<boolean>;
  refreshPreferences: () => Promise<void>;
  
  // Notification sending
  sendTestNotification: () => Promise<void>;
  sendWeatherAlert: (weatherType: string, location: string, severity: 'low' | 'medium' | 'high' | 'critical') => Promise<void>;
  sendTaskReminder: (taskTitle: string, dueTime: string) => Promise<void>;
  sendMarketAlert: (cropName: string, priceChange: number, newPrice: number) => Promise<void>;
  
  // Utility methods
  clearError: () => void;
  checkNotificationSupport: () => boolean;
}

// ============================================================================
// DEFAULT PREFERENCES
// ============================================================================

const DEFAULT_PREFERENCES: NotificationPreferences = {
  email_enabled: true,
  push_enabled: true,
  whatsapp_enabled: false,
  sms_enabled: false,
  weather_alerts: true,
  market_alerts: true,
  task_reminders: true,
  system_notifications: true,
  emergency_alerts: true,
  weekly_reports: false,
  timezone: 'UTC',
  max_daily_notifications: 10,
  reminder_frequency: 'once'
};

// ============================================================================
// MAIN HOOK IMPLEMENTATION
// ============================================================================

export function useNotifications(): NotificationHookReturn {
  const { user } = useAuthContext();
  
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isSubscribed: false,
    isSupported: false,
    isLoading: true,
    preferences: null,
    error: null
  });

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    initializeNotifications();
  }, [user]);

  const initializeNotifications = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check notification support
      const isSupported = checkNotificationSupport();
      
      // Get current permission
      const permission = 'Notification' in window ? Notification.permission : 'denied';
      
      // Check if user is subscribed to push notifications
      let isSubscribed = false;
      if (user && isSupported && permission === 'granted') {
        isSubscribed = await checkPushSubscription();
      }

      // Load user preferences
      let preferences = null;
      if (user) {
        preferences = await loadUserPreferences();
      }

      setState(prev => ({
        ...prev,
        permission,
        isSubscribed,
        isSupported,
        preferences,
        isLoading: false
      }));

    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize notifications',
        isLoading: false
      }));
    }
  }, [user]);

  // ============================================================================
  // PERMISSION MANAGEMENT
  // ============================================================================

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const permission = await notificationService.requestNotificationPermission();
      
      setState(prev => ({ ...prev, permission, isLoading: false }));

      if (permission === 'granted') {
        toast.success('Notifications enabled! You\'ll now receive important farming alerts.');
        return true;
      } else if (permission === 'denied') {
        toast.error('Notifications blocked. Enable them in your browser settings to receive alerts.');
        return false;
      } else {
        toast.info('Notification permission not granted.');
        return false;
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to request permission';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user) {
      toast.error('Please log in to enable notifications');
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const subscription = await notificationService.subscribeToPushNotifications(user.id);
      
      if (subscription) {
        setState(prev => ({ ...prev, isSubscribed: true, isLoading: false }));
        toast.success('Successfully subscribed to push notifications!');
        
        // Send welcome notification
        await notificationService.sendWelcomeNotification(user.id);
        
        return true;
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
        toast.error('Failed to subscribe to notifications');
        return false;
      }
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to subscribe';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      toast.error(errorMessage);
      return false;
    }
  }, [user]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await notificationService.unsubscribeFromPushNotifications(user.id);
      
      setState(prev => ({ ...prev, isSubscribed: false, isLoading: false }));
      toast.success('Unsubscribed from push notifications');
      
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from notifications:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to unsubscribe';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      toast.error(errorMessage);
      return false;
    }
  }, [user]);

  // ============================================================================
  // PREFERENCES MANAGEMENT
  // ============================================================================

  const updatePreferences = useCallback(async (
    newPreferences: Partial<NotificationPreferences>
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Please log in to update preferences');
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await notificationService.updateUserPreferences(user.id, newPreferences);
      
      // Refresh preferences from server
      const updatedPreferences = await notificationService.getUserPreferences(user.id);
      
      setState(prev => ({
        ...prev,
        preferences: updatedPreferences,
        isLoading: false
      }));

      toast.success('Notification preferences updated successfully!');
      return true;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      toast.error(errorMessage);
      return false;
    }
  }, [user]);

  const refreshPreferences = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const preferences = await notificationService.getUserPreferences(user.id);
      setState(prev => ({ ...prev, preferences }));
    } catch (error) {
      console.error('Failed to refresh preferences:', error);
    }
  }, [user]);

  // ============================================================================
  // NOTIFICATION SENDING METHODS
  // ============================================================================

  const sendTestNotification = useCallback(async (): Promise<void> => {
    if (!user) {
      toast.error('Please log in to send test notification');
      return;
    }

    try {
      await notificationService.sendImmediatePushNotification(user.id, {
        title: 'CropGenius Test Notification',
        message: 'This is a test notification to verify your settings are working correctly!',
        data: { isTest: true },
        icon: '/icons/notification-icon.png'
      });
      
      toast.success('Test notification sent! Check if you received it.');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast.error('Failed to send test notification. Please check your settings.');
    }
  }, [user]);

  const sendWeatherAlert = useCallback(async (
    weatherType: string,
    location: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> => {
    if (!user) return;

    try {
      await notificationService.sendWeatherAlert(user.id, weatherType, location, severity);
      toast.success(`Weather alert sent: ${weatherType} in ${location}`);
    } catch (error) {
      console.error('Failed to send weather alert:', error);
      toast.error('Failed to send weather alert');
    }
  }, [user]);

  const sendTaskReminder = useCallback(async (
    taskTitle: string,
    dueTime: string
  ): Promise<void> => {
    if (!user) return;

    try {
      await notificationService.sendTaskReminder(user.id, taskTitle, dueTime);
      toast.success(`Task reminder sent: ${taskTitle}`);
    } catch (error) {
      console.error('Failed to send task reminder:', error);
      toast.error('Failed to send task reminder');
    }
  }, [user]);

  const sendMarketAlert = useCallback(async (
    cropName: string,
    priceChange: number,
    newPrice: number
  ): Promise<void> => {
    if (!user) return;

    try {
      await notificationService.sendMarketAlert(user.id, cropName, priceChange, newPrice);
      toast.success(`Market alert sent: ${cropName} price update`);
    } catch (error) {
      console.error('Failed to send market alert:', error);
      toast.error('Failed to send market alert');
    }
  }, [user]);

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const checkNotificationSupport = useCallback((): boolean => {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }, []);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const checkPushSubscription = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('Failed to check push subscription:', error);
      return false;
    }
  };

  const loadUserPreferences = async (): Promise<NotificationPreferences> => {
    try {
      return await notificationService.getUserPreferences(user!.id);
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  };

  // ============================================================================
  // REALTIME SUBSCRIPTION FOR PREFERENCE UPDATES
  // ============================================================================

  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel(`notification_preferences:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification_preferences',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification preferences updated:', payload);
          refreshPreferences();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, refreshPreferences]);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // State
    ...state,
    
    // Permission management
    requestPermission,
    
    // Subscription management
    subscribe,
    unsubscribe,
    
    // Preferences management
    updatePreferences,
    refreshPreferences,
    
    // Notification sending
    sendTestNotification,
    sendWeatherAlert,
    sendTaskReminder,
    sendMarketAlert,
    
    // Utility methods
    clearError,
    checkNotificationSupport
  };
}

// ============================================================================
// CONVENIENCE HOOKS FOR SPECIFIC USE CASES
// ============================================================================

/**
 * Hook for managing push notification subscription only
 */
export function usePushNotifications() {
  const {
    permission,
    isSubscribed,
    isSupported,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    clearError
  } = useNotifications();

  return {
    permission,
    isSubscribed,
    isSupported,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    clearError
  };
}

/**
 * Hook for managing notification preferences only
 */
export function useNotificationPreferences() {
  const {
    preferences,
    isLoading,
    error,
    updatePreferences,
    refreshPreferences,
    clearError
  } = useNotifications();

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    refreshPreferences,
    clearError
  };
}

/**
 * Hook for sending notifications
 */
export function useNotificationSender() {
  const {
    sendTestNotification,
    sendWeatherAlert,
    sendTaskReminder,
    sendMarketAlert
  } = useNotifications();

  return {
    sendTestNotification,
    sendWeatherAlert,
    sendTaskReminder,
    sendMarketAlert
  };
}