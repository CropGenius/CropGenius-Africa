import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useSubscription, Subscription } from '@/hooks/useSubscription';
import { useSimpleAuthContext } from './SimpleAuthProvider';

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  isActive: boolean;
  isPro: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  return context;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useSimpleAuthContext();
  const subscriptionData = useSubscription();
  
  // On app initialization, check localStorage and synchronize if needed
  useEffect(() => {
    if (!user) {
      // Clear pro status if no user is logged in
      localStorage.removeItem('plan_is_pro');
    } else {
      // Sync localStorage with the current subscription state on app load
      // (This is also handled in useSubscription, but this ensures it happens on app init)
      if (subscriptionData.isPro) {
        localStorage.setItem('plan_is_pro', 'true');
        console.log('App initialized with Pro status: true');
      }
    }
  }, [user, subscriptionData.isPro]);

  return (
    <SubscriptionContext.Provider value={subscriptionData}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export default SubscriptionProvider;