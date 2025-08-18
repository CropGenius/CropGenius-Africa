import { supabase } from '@/integrations/supabase/client';

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  whatsapp_enabled: boolean;
  sms_enabled: boolean;
  weather_alerts: boolean;
  market_alerts: boolean;
  task_reminders: boolean;
  system_notifications: boolean;
  emergency_alerts: boolean;
  weekly_reports: boolean;
  timezone: string;
  max_daily_notifications: number;
  reminder_frequency: 'once' | 'daily' | 'weekly';
}

class NotificationService {
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn("This browser does not support notifications.");
      return 'denied';
    }
    const permission = await Notification.requestPermission();
    return permission;
  }

  async subscribeToPushNotifications(userId: string): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn("Push notifications not supported.");
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Replace with your actual VAPID public key
      const VAPID_PUBLIC_KEY = import.meta.env.VITE_APP_WEB_PUSH_PUBLIC_KEY; 
      if (!VAPID_PUBLIC_KEY) {
        console.error("VAPID public key not set. Cannot subscribe to push notifications.");
        return null;
      }
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY,
      });
    }

    // Send subscription to your backend (Supabase function, etc.)
    if (subscription) {
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')!) as any)),
        auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')!) as any)),
      });
      if (error) {
        console.error("Error saving push subscription to Supabase:", error);
        return null;
      }
    }

    return subscription;
  }

  async unsubscribeFromPushNotifications(userId: string): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      // Remove subscription from your backend
      const { error } = await supabase.from('push_subscriptions').delete().eq('user_id', userId).eq('endpoint', subscription.endpoint);
      if (error) {
        console.error("Error deleting push subscription from Supabase:", error);
        return false;
      }
    }
    return true;
  }

  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error fetching user preferences:", error);
      throw error;
    }

    return data || {
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
  }

  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: userId, ...preferences }, { onConflict: 'user_id' });

    if (error) {
      console.error("Error updating user preferences:", error);
      throw error;
    }
  }

  async sendImmediatePushNotification(userId: string, payload: { title: string; message: string; data?: any; icon?: string }): Promise<void> {
    // This would typically involve calling a Supabase Edge Function or a backend service
    // that then sends the push notification to the user's subscribed endpoint.
    console.log(`Sending immediate push notification to user ${userId}:`, payload);
    // Placeholder for actual push notification logic
    const { error } = await supabase.functions.invoke('send-push-notification', {
      body: { userId, payload },
    });
    if (error) {
      console.error("Error invoking send-push-notification function:", error);
      throw error;
    }
  }

  async sendWelcomeNotification(userId: string): Promise<void> {
    console.log(`Sending welcome notification to user ${userId}`);
    await this.sendImmediatePushNotification(userId, {
      title: 'Welcome to CropGenius!',
      message: 'Your journey to smarter farming begins now. Explore your dashboard!',
      icon: '/icons/notification-icon.png'
    });
  }

  async sendWeatherAlert(userId: string, weatherType: string, location: string, severity: 'low' | 'medium' | 'high' | 'critical'): Promise<void> {
    console.log(`Sending weather alert to user ${userId}: ${weatherType} in ${location} (${severity})`);
    await this.sendImmediatePushNotification(userId, {
      title: `Weather Alert: ${weatherType} in ${location}`,
      message: `Severity: ${severity.toUpperCase()}. Take necessary precautions.`,
      data: { type: 'weather', weatherType, location, severity },
      icon: '/icons/weather-icon.png'
    });
  }

  async sendTaskReminder(userId: string, taskTitle: string, dueTime: string): Promise<void> {
    console.log(`Sending task reminder to user ${userId}: ${taskTitle} due ${dueTime}`);
    await this.sendImmediatePushNotification(userId, {
      title: `Task Reminder: ${taskTitle}`,
      message: `Due by ${dueTime}. Don't forget to complete it!`,
      data: { type: 'task', taskTitle, dueTime },
      icon: '/icons/task-icon.png'
    });
  }

  async sendMarketAlert(userId: string, cropName: string, priceChange: number, newPrice: number): Promise<void> {
    console.log(`Sending market alert to user ${userId}: ${cropName} price change`);
    const changeText = priceChange >= 0 ? 'increased' : 'decreased';
    await this.sendImmediatePushNotification(userId, {
      title: `Market Alert: ${cropName} Price ${changeText}`,
      message: `${cropName} price has ${changeText} by ${Math.abs(priceChange)}%. New price: $${newPrice.toFixed(2)}.`,
      data: { type: 'market', cropName, priceChange, newPrice },
      icon: '/icons/market-icon.png'
    });
  }
}

export const notificationService = new NotificationService();
