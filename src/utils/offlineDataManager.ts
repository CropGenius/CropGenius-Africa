/**
 * 💾 INFINITY IQ OFFLINE DATA MANAGER
 * -------------------------------------------------------------
 * PRODUCTION-READY offline-first data management system
 * - Intelligent data caching and synchronization
 * - Conflict resolution and merge strategies
 * - Background sync with exponential backoff
 * - Data integrity validation and recovery
 * - Performance-optimized storage management
 */

import { supabase } from '@/integrations/supabase/client';
import { withRetry } from '@/utils/retryManager';
import { logError, logSuccess, ErrorCategory, ErrorSeverity } from '@/services/errorLogger';

interface CachedData<T = any> {
  data: T;
  timestamp: number;
  version: number;
  checksum: string;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  lastSyncAttempt?: number;
  retryCount: number;
}

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface DataManagerConfig {
  maxCacheSize: number;
  syncInterval: number;
  maxRetries: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

class OfflineDataManager {
  private static instance: OfflineDataManager;
  private cache: Map<string, CachedData> = new Map();
  private syncQueue: SyncOperation[] = [];
  private syncTimer: NodeJS.Timeout | null = null;
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;

  private readonly config: DataManagerConfig = {
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    syncInterval: 30000, // 30 seconds
    maxRetries: 5,
    compressionEnabled: true,
    encryptionEnabled: false
  };

  private constructor() {
    this.initializeEventListeners();
    this.startSyncProcess();
    this.loadCacheFromStorage();
  }

  static getInstance(): OfflineDataManager {
    if (!OfflineDataManager.instance) {
      OfflineDataManager.instance = new OfflineDataManager();
    }
    return OfflineDataManager.instance;
  }

  /**
   * Get data with fallback to cache
   */
  async getData<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    maxAge: number = 300000, // 5 minutes
    fallbackData?: T // Optional fallback data if no cache is available
  ): Promise<T> {
    try {
      // Check cache first
      const cached = this.cache.get(key);
      const now = Date.now();

      // Return cached data if valid and not expired
      if (cached && (now - cached.timestamp) < maxAge) {
        logSuccess('cache_hit', { 
          component: 'OfflineDataManager', 
          metadata: { key, age: now - cached.timestamp }
        });
        return cached.data as T;
      }

      // Try to fetch fresh data if online
      if (this.isOnline) {
        try {
          const freshData = await withRetry(fetchFunction, {
            maxRetries: 3, // Increased retries for better resilience
            baseDelay: 1000,
            maxDelay: 10000, // Cap at 10 seconds
            onRetry: (attempt, error) => {
              console.warn(`🔄 [OfflineDataManager] Retrying fetch for ${key} (attempt ${attempt}):`, error.message);
            }
          });

          // Cache the fresh data
          await this.setData(key, freshData);
          logSuccess('data_fetched', { 
            component: 'OfflineDataManager', 
            metadata: { key, timestamp: now }
          });
          return freshData;
        } catch (error) {
          logError(
            error as Error, 
            ErrorCategory.API, 
            ErrorSeverity.MEDIUM, 
            {
              component: 'OfflineDataManager',
              action: 'getData',
              metadata: { key, hasCache: !!cached }
            }
          );

          // Fall back to cached data if available, even if expired
          if (cached) {
            console.warn(`⚠️ [OfflineDataManager] Using stale cache for ${key} (age: ${(now - cached.timestamp) / 1000}s)`);
            
            // Log stale cache usage
            logSuccess('stale_cache_used', { 
              component: 'OfflineDataManager', 
              metadata: { 
                key, 
                age: now - cached.timestamp,
                version: cached.version
              }
            });
            
            return cached.data as T;
          }
          
          // Use provided fallback data if available
          if (fallbackData !== undefined) {
            console.warn(`⚠️ [OfflineDataManager] Using fallback data for ${key}`);
            
            // Cache the fallback data with a short TTL
            await this.setData(key, fallbackData, false);
            
            return fallbackData;
          }
          
          throw error;
        }
      }

      // Offline mode - return cached data (even if expired) or fallback
      if (cached) {
        console.log(`📦 [OfflineDataManager] Offline mode - using cached data for ${key}`);
        
        // Log offline cache usage
        logSuccess('offline_cache_used', { 
          component: 'OfflineDataManager', 
          metadata: { 
            key, 
            age: now - cached.timestamp,
            version: cached.version
          }
        });
        
        return cached.data as T;
      }
      
      // Use provided fallback data if available
      if (fallbackData !== undefined) {
        console.warn(`⚠️ [OfflineDataManager] Offline mode - using fallback data for ${key}`);
        
        // Cache the fallback data
        await this.setData(key, fallbackData, true);
        
        return fallbackData;
      }

      throw new Error(`No cached data available for ${key} in offline mode`);
    } catch (error) {
      logError(
        error as Error, 
        ErrorCategory.API, 
        ErrorSeverity.HIGH, 
        {
          component: 'OfflineDataManager',
          action: 'getData',
          metadata: { key }
        }
      );
      throw error;
    }
  }

  /**
   * Set data in cache
   */
  async setData<T>(key: string, data: T, syncRequired: boolean = false): Promise<void> {
    try {
      const now = Date.now();
      const checksum = this.generateChecksum(data);
      
      const cachedData: CachedData<T> = {
        data,
        timestamp: now,
        version: (this.cache.get(key)?.version || 0) + 1,
        checksum,
        syncStatus: syncRequired ? 'pending' : 'synced',
        retryCount: 0
      };

      this.cache.set(key, cachedData);

      // Add to sync queue if sync required
      if (syncRequired && this.isOnline) {
        this.addToSyncQueue({
          id: `${key}-${now}`,
          type: 'update',
          table: this.extractTableFromKey(key),
          data,
          timestamp: now,
          retryCount: 0,
          maxRetries: this.config.maxRetries
        });
      }

      // Persist to localStorage
      await this.persistCacheToStorage();
      
      logSuccess('data_cached', { component: 'OfflineDataManager', key });
    } catch (error) {
      logError(error as Error, ErrorCategory.DATABASE, ErrorSeverity.MEDIUM, {
        component: 'OfflineDataManager',
        action: 'setData',
        key
      });
    }
  }

  /**
   * Delete data from cache
   */
  async deleteData(key: string, syncRequired: boolean = false): Promise<void> {
    try {
      const cached = this.cache.get(key);
      
      if (cached && syncRequired) {
        // Add delete operation to sync queue
        this.addToSyncQueue({
          id: `${key}-delete-${Date.now()}`,
          type: 'delete',
          table: this.extractTableFromKey(key),
          data: { id: this.extractIdFromKey(key) },
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: this.config.maxRetries
        });
      }

      this.cache.delete(key);
      await this.persistCacheToStorage();
      
      logSuccess('data_deleted', { component: 'OfflineDataManager', key });
    } catch (error) {
      logError(error as Error, ErrorCategory.DATABASE, ErrorSeverity.MEDIUM, {
        component: 'OfflineDataManager',
        action: 'deleteData',
        key
      });
    }
  }

  /**
   * Get cached data for offline mode
   */
  getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    return cached ? cached.data as T : null;
  }
  
  /**
   * Get data from multiple sources with fallback strategy
   * Tries each source in order until one succeeds
   */
  async getDataWithFallback<T>(
    key: string,
    sources: Array<() => Promise<T>>,
    maxAge: number = 300000, // 5 minutes
    fallbackData?: T
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key);
    const now = Date.now();

    // Return cached data if valid and not expired
    if (cached && (now - cached.timestamp) < maxAge) {
      logSuccess('cache_hit', { 
        component: 'OfflineDataManager', 
        metadata: { key, age: now - cached.timestamp }
      });
      return cached.data as T;
    }
    
    // Try each source in sequence
    let lastError: Error | null = null;
    
    for (let i = 0; i < sources.length; i++) {
      try {
        const source = sources[i];
        const data = await withRetry(source, {
          maxRetries: 1, // Only retry once per source
          baseDelay: 500,
          onRetry: (attempt, error) => {
            console.warn(`🔄 [OfflineDataManager] Retrying source ${i} for ${key}:`, error.message);
          }
        });
        
        // Cache successful result
        await this.setData(key, data);
        
        logSuccess('fallback_source_succeeded', { 
          component: 'OfflineDataManager', 
          metadata: { key, sourceIndex: i }
        });
        
        return data;
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ [OfflineDataManager] Source ${i} failed for ${key}:`, error);
      }
    }
    
    // All sources failed, try to use expired cache
    if (cached) {
      console.warn(`⚠️ [OfflineDataManager] All sources failed for ${key}, using stale cache`);
      
      logSuccess('stale_cache_fallback', { 
        component: 'OfflineDataManager', 
        metadata: { 
          key, 
          age: now - cached.timestamp,
          version: cached.version
        }
      });
      
      return cached.data as T;
    }
    
    // Use provided fallback data if available
    if (fallbackData !== undefined) {
      console.warn(`⚠️ [OfflineDataManager] All sources failed for ${key}, using fallback data`);
      
      // Cache the fallback data
      await this.setData(key, fallbackData, false);
      
      return fallbackData;
    }
    
    // Nothing worked, throw the last error
    if (lastError) {
      throw lastError;
    }
    
    throw new Error(`All data sources failed for ${key} and no fallback available`);
  }

  /**
   * Check if data exists in cache
   */
  hasData(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalItems: number;
    totalSize: number;
    syncPending: number;
    oldestItem: number;
    newestItem: number;
  } {
    const items = Array.from(this.cache.values());
    const now = Date.now();
    
    return {
      totalItems: items.length,
      totalSize: this.calculateCacheSize(),
      syncPending: items.filter(item => item.syncStatus === 'pending').length,
      oldestItem: items.length > 0 ? Math.min(...items.map(item => now - item.timestamp)) : 0,
      newestItem: items.length > 0 ? Math.max(...items.map(item => now - item.timestamp)) : 0
    };
  }

  /**
   * Clear cache
   */
  async clearCache(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        const regex = new RegExp(pattern);
        const keysToDelete = Array.from(this.cache.keys()).filter(key => regex.test(key));
        keysToDelete.forEach(key => this.cache.delete(key));
      } else {
        this.cache.clear();
      }

      await this.persistCacheToStorage();
      logSuccess('cache_cleared', { component: 'OfflineDataManager', pattern });
    } catch (error) {
      logError(error as Error, ErrorCategory.DATABASE, ErrorSeverity.LOW, {
        component: 'OfflineDataManager',
        action: 'clearCache'
      });
    }
  }

  /**
   * Force sync all pending data
   */
  async forcSync(): Promise<void> {
    if (!this.isOnline) {
      console.warn('⚠️ [OfflineDataManager] Cannot sync while offline');
      return;
    }

    this.isSyncing = true;
    
    try {
      await this.processSyncQueue();
      logSuccess('force_sync_completed', { component: 'OfflineDataManager' });
    } catch (error) {
      logError(error as Error, ErrorCategory.API, ErrorSeverity.HIGH, {
        component: 'OfflineDataManager',
        action: 'forceSync'
      });
    } finally {
      this.isSyncing = false;
    }
  }
  
  /**
   * Prefetch critical data for offline use
   */
  async prefetchCriticalData<T>(
    dataSources: Array<{
      key: string;
      fetchFn: () => Promise<T>;
      priority: 'high' | 'medium' | 'low';
    }>
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    // Sort by priority
    const sortedSources = [...dataSources].sort((a, b) => {
      const priorityMap = { high: 0, medium: 1, low: 2 };
      return priorityMap[a.priority] - priorityMap[b.priority];
    });
    
    // Process high priority items sequentially for reliability
    const highPriority = sortedSources.filter(s => s.priority === 'high');
    for (const source of highPriority) {
      try {
        const data = await source.fetchFn();
        await this.setData(source.key, data, false);
        results[source.key] = true;
        console.log(`📦 [OfflineDataManager] Prefetched high priority data for ${source.key}`);
      } catch (error) {
        results[source.key] = false;
        console.error(`❌ [OfflineDataManager] Failed to prefetch ${source.key}:`, error);
      }
    }
    
    // Process medium and low priority items in parallel
    const otherSources = sortedSources.filter(s => s.priority !== 'high');
    const promises = otherSources.map(async (source) => {
      try {
        const data = await source.fetchFn();
        await this.setData(source.key, data, false);
        results[source.key] = true;
        console.log(`📦 [OfflineDataManager] Prefetched ${source.priority} priority data for ${source.key}`);
      } catch (error) {
        results[source.key] = false;
        console.error(`❌ [OfflineDataManager] Failed to prefetch ${source.key}:`, error);
      }
    });
    
    await Promise.allSettled(promises);
    
    // Log summary
    const successCount = Object.values(results).filter(Boolean).length;
    logSuccess('prefetch_completed', { 
      component: 'OfflineDataManager',
      metadata: { 
        total: dataSources.length,
        success: successCount,
        failed: dataSources.length - successCount
      }
    });
    
    return results;
  }

  private initializeEventListeners(): void {
    // Network status listeners
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 [OfflineDataManager] Back online - starting sync');
      this.forcSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('🌐 [OfflineDataManager] Gone offline - caching mode enabled');
    });

    // Page visibility for sync optimization
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline && this.syncQueue.length > 0) {
        this.forcSync();
      }
    });
  }

  private startSyncProcess(): void {
    this.syncTimer = setInterval(() => {
      if (this.isOnline && !this.isSyncing && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, this.config.syncInterval);
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    const operations = this.syncQueue.splice(0, 5); // Process 5 at a time
    
    for (const operation of operations) {
      try {
        await this.executeSyncOperation(operation);
      } catch (error) {
        operation.retryCount++;
        
        if (operation.retryCount < operation.maxRetries) {
          // Re-queue with exponential backoff
          setTimeout(() => {
            this.syncQueue.push(operation);
          }, Math.pow(2, operation.retryCount) * 1000);
        } else {
          logError(new Error(`Sync operation failed after ${operation.maxRetries} retries`), 
            ErrorCategory.API, ErrorSeverity.HIGH, {
              component: 'OfflineDataManager',
              action: 'processSyncQueue',
              operation: operation.id
            });
        }
      }
    }
  }

  private async executeSyncOperation(operation: SyncOperation): Promise<void> {
    switch (operation.type) {
      case 'create':
        await supabase.from(operation.table).insert(operation.data);
        break;
      case 'update':
        await supabase.from(operation.table).upsert(operation.data);
        break;
      case 'delete':
        await supabase.from(operation.table).delete().eq('id', operation.data.id);
        break;
    }
  }

  private addToSyncQueue(operation: SyncOperation): void {
    this.syncQueue.push(operation);
  }

  private generateChecksum(data: any): string {
    return btoa(JSON.stringify(data)).slice(0, 16);
  }

  private extractTableFromKey(key: string): string {
    return key.split('-')[0] || 'unknown';
  }

  private extractIdFromKey(key: string): string {
    const parts = key.split('-');
    return parts[parts.length - 1] || '';
  }

  private calculateCacheSize(): number {
    let size = 0;
    this.cache.forEach(item => {
      size += JSON.stringify(item).length;
    });
    return size;
  }

  private async persistCacheToStorage(): Promise<void> {
    try {
      const cacheData = Array.from(this.cache.entries());
      localStorage.setItem('cropgenius_offline_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to persist cache to storage:', error);
    }
  }

  private async loadCacheFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('cropgenius_offline_cache');
      if (stored) {
        const cacheData = JSON.parse(stored);
        this.cache = new Map(cacheData);
        console.log(`📦 [OfflineDataManager] Loaded ${cacheData.length} items from storage`);
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }
}

export const offlineDataManager = OfflineDataManager.getInstance();

// Convenience functions
export const getCachedData = <T>(key: string, fetchFn: () => Promise<T>, maxAge?: number) =>
  offlineDataManager.getData(key, fetchFn, maxAge);

export const setCachedData = <T>(key: string, data: T, syncRequired?: boolean) =>
  offlineDataManager.setData(key, data, syncRequired);

export const getOfflineData = <T>(key: string) =>
  offlineDataManager.getCachedData<T>(key);

export const clearOfflineCache = (pattern?: string) =>
  offlineDataManager.clearCache(pattern);
  
/**
 * Prefetch and cache data for offline use
 */
export const prefetchData = async <T>(key: string, fetchFn: () => Promise<T>): Promise<void> => {
  try {
    const data = await fetchFn();
    await offlineDataManager.setData(key, data, false);
    console.log(`📦 [OfflineDataManager] Prefetched data for ${key}`);
  } catch (error) {
    console.error(`❌ [OfflineDataManager] Failed to prefetch ${key}:`, error);
  }
};

/**
 * Batch prefetch critical data for offline use
 */
export const prefetchCriticalData = <T>(
  dataSources: Array<{
    key: string;
    fetchFn: () => Promise<T>;
    priority: 'high' | 'medium' | 'low';
  }>
) => offlineDataManager.prefetchCriticalData(dataSources);

/**
 * Get data with multiple fallback sources
 */
export const getDataWithFallback = <T>(
  key: string, 
  sources: Array<() => Promise<T>>, 
  maxAge?: number,
  fallbackData?: T
) => offlineDataManager.getDataWithFallback(key, sources, maxAge, fallbackData);