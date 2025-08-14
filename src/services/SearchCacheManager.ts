/**
 * 🚀 CROPGENIUS SEARCH CACHE MANAGER - INFINITY OFFLINE POWER
 * -----------------------------------------------------------
 * Advanced caching system for map searches with LRU eviction
 * Ensures farmers can navigate even in remote areas with poor connectivity
 * Built for 100 million farmers and their generations! 🌾💪
 */

import { SearchLocation } from './MapNavigationEngine';

export interface CachedSearch {
  query: string;
  location: SearchLocation;
  timestamp: number;
  usage_count: number;
  relevance_score: number;
}

export interface SearchCache {
  searches: CachedSearch[];
  lastUpdated: number;
  version: string;
}

/**
 * 🧠 INFINITY IQ SEARCH CACHE MANAGER
 * The most advanced caching system for agricultural mapping
 */
export class SearchCacheManager {
  private static readonly CACHE_KEY = 'cropgenius_map_search_cache';
  private static readonly MAX_CACHE_SIZE = 100; // Store up to 100 searches
  private static readonly CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
  private static readonly RECENT_SEARCHES_LIMIT = 10;
  private static readonly CACHE_VERSION = '1.0.0';

  /**
   * 💾 ADD TO CACHE
   * Intelligently stores search results with LRU eviction
   */
  static addToCache(query: string, location: SearchLocation): void {
    try {
      const cache = this.getCache();
      const normalizedQuery = query.toLowerCase().trim();

      // Check if search already exists
      const existingIndex = cache.searches.findIndex(
        search => search.query.toLowerCase() === normalizedQuery
      );

      if (existingIndex !== -1) {
        // Update existing search
        cache.searches[existingIndex].usage_count++;
        cache.searches[existingIndex].timestamp = Date.now();
        cache.searches[existingIndex].location = location; // Update with latest data
      } else {
        // Add new search
        const newSearch: CachedSearch = {
          query: normalizedQuery,
          location,
          timestamp: Date.now(),
          usage_count: 1,
          relevance_score: location.relevance || 1
        };

        cache.searches.unshift(newSearch); // Add to beginning
      }

      // Apply LRU eviction if cache is too large
      if (cache.searches.length > this.MAX_CACHE_SIZE) {
        // Sort by usage and recency, keep the most valuable
        cache.searches.sort((a, b) => {
          const scoreA = this.calculateCacheScore(a);
          const scoreB = this.calculateCacheScore(b);
          return scoreB - scoreA;
        });

        cache.searches = cache.searches.slice(0, this.MAX_CACHE_SIZE);
      }

      // Update cache metadata
      cache.lastUpdated = Date.now();
      cache.version = this.CACHE_VERSION;

      // Save to localStorage
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));

      console.log(`💾 [SearchCache] Cached search: "${query}" -> ${location.name}`);
    } catch (error) {
      console.error('❌ [SearchCache] Failed to add to cache:', error);
    }
  }

  /**
   * 🔍 GET FROM CACHE
   * Retrieves cached search results with fuzzy matching
   */
  static getFromCache(query: string): SearchLocation | null {
    try {
      const cache = this.getCache();
      const normalizedQuery = query.toLowerCase().trim();

      // First, try exact match
      let match = cache.searches.find(
        search => search.query === normalizedQuery
      );

      // If no exact match, try fuzzy matching
      if (!match) {
        match = cache.searches.find(search => 
          search.query.includes(normalizedQuery) || 
          normalizedQuery.includes(search.query)
        );
      }

      if (match) {
        // Check if cache entry is still valid
        const isExpired = Date.now() - match.timestamp > this.CACHE_DURATION;
        
        if (!isExpired) {
          // Update usage statistics
          match.usage_count++;
          match.timestamp = Date.now();
          this.saveCache(cache);

          console.log(`🎯 [SearchCache] Cache hit: "${query}" -> ${match.location.name}`);
          return match.location;
        } else {
          // Remove expired entry
          cache.searches = cache.searches.filter(s => s !== match);
          this.saveCache(cache);
          console.log(`⏰ [SearchCache] Expired cache entry removed: "${query}"`);
        }
      }

      return null;
    } catch (error) {
      console.error('❌ [SearchCache] Failed to get from cache:', error);
      return null;
    }
  }

  /**
   * 📋 GET RECENT SEARCHES
   * Returns most recent and frequently used searches
   */
  static getRecentSearches(limit: number = this.RECENT_SEARCHES_LIMIT): SearchLocation[] {
    try {
      const cache = this.getCache();
      
      // Filter out expired entries
      const validSearches = cache.searches.filter(
        search => Date.now() - search.timestamp <= this.CACHE_DURATION
      );

      // Sort by recency and usage
      validSearches.sort((a, b) => {
        const scoreA = this.calculateRecentScore(a);
        const scoreB = this.calculateRecentScore(b);
        return scoreB - scoreA;
      });

      // Return top results
      return validSearches
        .slice(0, limit)
        .map(search => ({
          ...search.location,
          name: this.formatLocationName(search.location.name, search.query)
        }));
    } catch (error) {
      console.error('❌ [SearchCache] Failed to get recent searches:', error);
      return [];
    }
  }

  /**
   * 🔍 SEARCH SUGGESTIONS
   * Provides intelligent search suggestions based on cache
   */
  static getSearchSuggestions(partialQuery: string, limit: number = 5): string[] {
    try {
      if (partialQuery.length < 2) return [];

      const cache = this.getCache();
      const normalizedQuery = partialQuery.toLowerCase().trim();

      // Find matching queries
      const suggestions = cache.searches
        .filter(search => 
          search.query.startsWith(normalizedQuery) &&
          Date.now() - search.timestamp <= this.CACHE_DURATION
        )
        .sort((a, b) => this.calculateCacheScore(b) - this.calculateCacheScore(a))
        .slice(0, limit)
        .map(search => search.query);

      // Remove duplicates and return
      return [...new Set(suggestions)];
    } catch (error) {
      console.error('❌ [SearchCache] Failed to get suggestions:', error);
      return [];
    }
  }

  /**
   * 🧹 CLEAR CACHE
   * Removes all cached searches
   */
  static clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('🧹 [SearchCache] Cache cleared');
    } catch (error) {
      console.error('❌ [SearchCache] Failed to clear cache:', error);
    }
  }

  /**
   * 🧹 CLEANUP EXPIRED
   * Removes expired cache entries
   */
  static cleanupExpired(): number {
    try {
      const cache = this.getCache();
      const initialCount = cache.searches.length;

      cache.searches = cache.searches.filter(
        search => Date.now() - search.timestamp <= this.CACHE_DURATION
      );

      const removedCount = initialCount - cache.searches.length;

      if (removedCount > 0) {
        cache.lastUpdated = Date.now();
        this.saveCache(cache);
        console.log(`🧹 [SearchCache] Cleaned up ${removedCount} expired entries`);
      }

      return removedCount;
    } catch (error) {
      console.error('❌ [SearchCache] Failed to cleanup expired entries:', error);
      return 0;
    }
  }

  /**
   * 📊 GET CACHE STATS
   * Returns cache statistics for debugging
   */
  static getCacheStats(): {
    totalEntries: number;
    validEntries: number;
    expiredEntries: number;
    cacheSize: string;
    lastUpdated: Date | null;
  } {
    try {
      const cache = this.getCache();
      const now = Date.now();
      
      const validEntries = cache.searches.filter(
        search => now - search.timestamp <= this.CACHE_DURATION
      ).length;

      const expiredEntries = cache.searches.length - validEntries;

      // Calculate approximate cache size
      const cacheString = JSON.stringify(cache);
      const sizeInBytes = new Blob([cacheString]).size;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);

      return {
        totalEntries: cache.searches.length,
        validEntries,
        expiredEntries,
        cacheSize: `${sizeInKB} KB`,
        lastUpdated: cache.lastUpdated ? new Date(cache.lastUpdated) : null
      };
    } catch (error) {
      console.error('❌ [SearchCache] Failed to get cache stats:', error);
      return {
        totalEntries: 0,
        validEntries: 0,
        expiredEntries: 0,
        cacheSize: '0 KB',
        lastUpdated: null
      };
    }
  }

  // 🔧 PRIVATE HELPER METHODS

  /**
   * 📦 GET CACHE
   * Retrieves cache from localStorage with fallback
   */
  private static getCache(): SearchCache {
    try {
      const cacheString = localStorage.getItem(this.CACHE_KEY);
      if (cacheString) {
        const cache = JSON.parse(cacheString) as SearchCache;
        
        // Validate cache version
        if (cache.version === this.CACHE_VERSION) {
          return cache;
        } else {
          console.log('🔄 [SearchCache] Cache version mismatch, creating new cache');
        }
      }
    } catch (error) {
      console.error('❌ [SearchCache] Failed to parse cache, creating new:', error);
    }

    // Return empty cache
    return {
      searches: [],
      lastUpdated: Date.now(),
      version: this.CACHE_VERSION
    };
  }

  /**
   * 💾 SAVE CACHE
   * Saves cache to localStorage
   */
  private static saveCache(cache: SearchCache): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('❌ [SearchCache] Failed to save cache:', error);
    }
  }

  /**
   * 🧮 CALCULATE CACHE SCORE
   * Determines the value of a cache entry for LRU eviction
   */
  private static calculateCacheScore(search: CachedSearch): number {
    const recencyScore = Math.max(0, 1 - (Date.now() - search.timestamp) / this.CACHE_DURATION);
    const usageScore = Math.min(1, search.usage_count / 10); // Normalize usage count
    const relevanceScore = search.relevance_score || 0.5;

    // Weighted combination
    return (recencyScore * 0.4) + (usageScore * 0.4) + (relevanceScore * 0.2);
  }

  /**
   * 🧮 CALCULATE RECENT SCORE
   * Determines the score for recent searches display
   */
  private static calculateRecentScore(search: CachedSearch): number {
    const recencyScore = Math.max(0, 1 - (Date.now() - search.timestamp) / (7 * 24 * 60 * 60 * 1000)); // 7 days
    const usageScore = Math.min(1, search.usage_count / 5);

    return (recencyScore * 0.7) + (usageScore * 0.3);
  }

  /**
   * 🎨 FORMAT LOCATION NAME
   * Formats location names for better display
   */
  private static formatLocationName(locationName: string, originalQuery: string): string {
    // If the location name is very long, try to shorten it intelligently
    if (locationName.length > 50) {
      const parts = locationName.split(',');
      if (parts.length > 2) {
        return `${parts[0]}, ${parts[parts.length - 1]}`;
      }
    }

    return locationName;
  }
}