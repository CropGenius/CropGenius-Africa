import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from './AuthProvider';

interface SubscriptionContextType {
  subscribeToChannel: (channelName: string, schema?: string, table?: string, filter?: string) => RealtimeChannel;
  unsubscribeFromChannel: (channel: RealtimeChannel) => void;
  activeSubscriptions: RealtimeChannel[];
}

// Create the context
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Hook to use the subscription context
export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
}

// Provider component
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [activeSubscriptions, setActiveSubscriptions] = useState<RealtimeChannel[]>([]);
  const { user } = useAuthContext();

  // Clean up all subscriptions when component unmounts or user changes
  useEffect(() => {
    return () => {
      activeSubscriptions.forEach(channel => {
        channel.unsubscribe();
      });
      setActiveSubscriptions([]);
    };
  }, [user?.id]);

  // Subscribe to a channel
  const subscribeToChannel = (channelName: string, schema?: string, table?: string, filter?: string): RealtimeChannel => {
    // Create a channel based on the parameters
    let channel = supabase.channel(channelName);

    // If schema and table are provided, set up a database change listener
    if (schema && table) {
      channel = channel.on(
        'postgres_changes',
        { event: '*', schema, table, filter },
        payload => {
          console.log('Database change received:', payload);
        }
      );
    }

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log(`Subscription to ${channelName} status:`, status);
    });

    // Add to active subscriptions
    setActiveSubscriptions(prev => [...prev, channel]);

    return channel;
  };

  // Unsubscribe from a channel
  const unsubscribeFromChannel = (channel: RealtimeChannel) => {
    channel.unsubscribe();
    setActiveSubscriptions(prev => prev.filter(sub => sub !== channel));
  };

  // Context value
  const value = {
    subscribeToChannel,
    unsubscribeFromChannel,
    activeSubscriptions
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}