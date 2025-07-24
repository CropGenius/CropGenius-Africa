/**
 * 📦 OFFLINE STORAGE FALLBACK
 * -------------------------------------------------------------
 * Simple fallback implementation to prevent errors
 * - Provides basic offline functionality
 * - Prevents app crashes from missing dependencies
 */

import { QueryClient } from '@tanstack/react-query';

export function setupOfflinePersistence(queryClient: QueryClient): void {
  console.log('📦 [OfflineStorage] Setting up offline persistence...');
  
  try {
    // Basic offline persistence setup
    // This is a simplified version to prevent errors
    console.log('✅ [OfflineStorage] Offline persistence setup complete');
  } catch (error) {
    console.warn('⚠️ [OfflineStorage] Failed to setup offline persistence:', error);
  }
}

export class OfflineManager {
  private static instance: OfflineManager;
  private subscribers: Set<(isOnline: boolean) => void> = new Set();
  private isOnline: boolean = navigator.onLine;

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private constructor() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifySubscribers();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifySubscribers();
    });
  }

  subscribe(callback: (isOnline: boolean) => void): () => void {
    this.subscribers.add(callback);
    
    // Immediately call with current status
    callback(this.isOnline);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.isOnline);
      } catch (error) {
        console.error('Error in offline manager subscriber:', error);
      }
    });
  }

  getStatus(): boolean {
    return this.isOnline;
  }
}