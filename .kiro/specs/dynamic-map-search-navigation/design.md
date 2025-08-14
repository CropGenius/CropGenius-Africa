# Design Document

## Overview

This design implements a dynamic map navigation system that seamlessly integrates location search with automatic map movement. The solution centers around enhancing the existing MapboxFieldMap component with intelligent search-to-navigation functionality, ensuring users can search for any location and have the map automatically fly to that precise location with smooth animations and appropriate zoom levels.

The design leverages Mapbox's powerful `flyTo` API combined with the existing Mapbox Geocoding service to create a fluid, responsive mapping experience that works both online and offline.

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    MapboxFieldMap                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  MapSearchInput │  │ NavigationEngine│  │ MarkerManager│ │
│  │                 │  │                 │  │             │ │
│  │ - Search UI     │  │ - flyTo logic   │  │ - Location  │ │
│  │ - Autocomplete  │  │ - Animation     │  │   markers   │ │
│  │ - Recent cache  │  │ - Zoom control  │  │ - Cleanup   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│           │                     │                    │      │
│           └─────────────────────┼────────────────────┘      │
│                                 │                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Mapbox GL JS Map Instance                  │ │
│  │                                                         │ │
│  │ - flyTo() / easeTo() / jumpTo()                        │ │
│  │ - Event handling                                        │ │
│  │ - Marker management                                     │ │
│  │ - Layer control                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Search Input** → User types location query
2. **Geocoding API** → Mapbox Geocoding returns coordinates and place details
3. **Navigation Engine** → Processes coordinates and determines optimal view parameters
4. **Map Animation** → Executes flyTo with calculated parameters
5. **Marker Placement** → Places location marker at destination
6. **Cache Update** → Stores successful searches for offline use

## Components and Interfaces

### Enhanced MapSearchInput Component

```typescript
interface MapSearchInputProps {
  onSearch: (query: string) => void;
  onLocationSelect: (location: SearchLocation) => void;
  onNavigationStart?: () => void;
  onNavigationComplete?: () => void;
  isSearching?: boolean;
  isNavigating?: boolean;
  className?: string;
  placeholder?: string;
  recentSearches?: SearchLocation[];
  disabled?: boolean;
}

interface SearchLocation {
  lat: number;
  lng: number;
  name: string;
  bbox?: [number, number, number, number]; // Bounding box for optimal zoom
  place_type?: string[];
  relevance?: number;
}
```

### NavigationEngine Service

```typescript
interface NavigationOptions {
  center: [number, number];
  zoom?: number;
  bearing?: number;
  pitch?: number;
  duration?: number;
  essential?: boolean;
}

interface NavigationEngine {
  flyToLocation(location: SearchLocation, options?: Partial<NavigationOptions>): Promise<void>;
  calculateOptimalView(location: SearchLocation): NavigationOptions;
  cancelCurrentNavigation(): void;
  isNavigating(): boolean;
}
```

### MarkerManager Service

```typescript
interface MarkerManager {
  addLocationMarker(location: SearchLocation): mapboxgl.Marker;
  removeLocationMarker(): void;
  addTemporaryMarker(location: SearchLocation, duration?: number): void;
  clearAllMarkers(): void;
  getActiveMarkers(): mapboxgl.Marker[];
}
```

## Data Models

### Search Cache Structure

```typescript
interface SearchCache {
  searches: CachedSearch[];
  lastUpdated: number;
  version: string;
}

interface CachedSearch {
  query: string;
  location: SearchLocation;
  timestamp: number;
  usage_count: number;
}
```

### Navigation State

```typescript
interface NavigationState {
  isNavigating: boolean;
  currentAnimation?: mapboxgl.AnimationOptions;
  destination?: SearchLocation;
  startTime?: number;
  duration?: number;
}
```

## Error Handling

### Search Error Scenarios

1. **Network Failure**
   - Fallback to cached recent searches
   - Display offline indicator
   - Provide retry mechanism

2. **Invalid Search Results**
   - Show "No results found" message
   - Suggest alternative search terms
   - Maintain previous map state

3. **Geocoding API Limits**
   - Implement request throttling
   - Cache successful results aggressively
   - Provide graceful degradation

### Navigation Error Scenarios

1. **Invalid Coordinates**
   - Validate coordinates before navigation
   - Log error and show user-friendly message
   - Maintain current map position

2. **Animation Interruption**
   - Cancel previous animations cleanly
   - Start new navigation immediately
   - Prevent memory leaks

3. **Map Instance Unavailable**
   - Check map readiness before navigation
   - Queue navigation requests if needed
   - Provide fallback behavior

## Testing Strategy

### Unit Tests

1. **NavigationEngine Tests**
   ```typescript
   describe('NavigationEngine', () => {
     test('should calculate optimal zoom for different location types');
     test('should handle coordinate validation');
     test('should cancel ongoing animations');
     test('should handle edge cases for bearing calculation');
   });
   ```

2. **MarkerManager Tests**
   ```typescript
   describe('MarkerManager', () => {
     test('should add and remove markers correctly');
     test('should handle multiple marker scenarios');
     test('should cleanup markers on component unmount');
   });
   ```

3. **MapSearchInput Tests**
   ```typescript
   describe('MapSearchInput', () => {
     test('should handle search input and API calls');
     test('should manage recent searches cache');
     test('should handle offline scenarios');
   });
   ```

### Integration Tests

1. **Search-to-Navigation Flow**
   - Test complete user journey from search to map navigation
   - Verify smooth animation and marker placement
   - Test error scenarios and recovery

2. **Offline Functionality**
   - Test cached search functionality
   - Verify graceful degradation when offline
   - Test cache persistence and retrieval

3. **Mobile Responsiveness**
   - Test touch interactions
   - Verify responsive behavior on different screen sizes
   - Test keyboard handling on mobile devices

### Performance Tests

1. **Animation Performance**
   - Measure flyTo animation smoothness
   - Test performance with multiple rapid searches
   - Verify memory usage during navigation

2. **Search Response Time**
   - Measure geocoding API response times
   - Test search input debouncing effectiveness
   - Verify cache hit performance

## Implementation Details

### FlyTo Configuration

```typescript
const NAVIGATION_CONFIGS = {
  default: {
    zoom: 15,
    duration: 1500,
    essential: true,
    easing: (t: number) => t * (2 - t) // easeOutQuad
  },
  city: {
    zoom: 12,
    duration: 2000,
    essential: true
  },
  country: {
    zoom: 6,
    duration: 2500,
    essential: true
  },
  address: {
    zoom: 17,
    duration: 1200,
    essential: true
  }
};
```

### Optimal Zoom Calculation

```typescript
function calculateOptimalZoom(location: SearchLocation): number {
  const placeTypes = location.place_type || [];
  
  if (placeTypes.includes('address')) return 17;
  if (placeTypes.includes('poi')) return 16;
  if (placeTypes.includes('locality')) return 14;
  if (placeTypes.includes('place')) return 12;
  if (placeTypes.includes('region')) return 8;
  if (placeTypes.includes('country')) return 6;
  
  return 15; // Default zoom
}
```

### Bearing Optimization

```typescript
function calculateOptimalBearing(location: SearchLocation): number {
  // For agricultural areas, prefer north-up orientation
  if (location.place_type?.includes('locality')) return 0;
  
  // For urban areas, calculate based on street orientation
  // This could be enhanced with additional API calls
  return 0; // Default north-up
}
```

### Cache Management

```typescript
class SearchCacheManager {
  private static readonly CACHE_KEY = 'mapbox_search_cache';
  private static readonly MAX_CACHE_SIZE = 50;
  private static readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  static addToCache(query: string, location: SearchLocation): void {
    // Implementation with LRU eviction and timestamp management
  }

  static getFromCache(query: string): SearchLocation | null {
    // Implementation with expiry checking
  }

  static getRecentSearches(limit: number = 5): SearchLocation[] {
    // Implementation returning most recent/frequent searches
  }
}
```

## Security Considerations

1. **API Key Protection**
   - Ensure Mapbox token is properly configured
   - Implement rate limiting to prevent abuse
   - Monitor API usage and costs

2. **Input Validation**
   - Sanitize search queries before API calls
   - Validate coordinates before navigation
   - Prevent injection attacks through search input

3. **Cache Security**
   - Encrypt sensitive cached data
   - Implement cache size limits
   - Clear cache on security events

## Performance Optimizations

1. **Search Debouncing**
   - Implement 300ms debounce for search input
   - Cancel previous API requests when new ones start
   - Use AbortController for proper cleanup

2. **Animation Optimization**
   - Use requestAnimationFrame for smooth animations
   - Implement animation queuing for rapid selections
   - Optimize marker rendering during navigation

3. **Memory Management**
   - Properly cleanup event listeners
   - Remove unused markers and layers
   - Implement component lifecycle management

## Accessibility Features

1. **Keyboard Navigation**
   - Full keyboard support for search input
   - Arrow key navigation in search results
   - Enter key to select locations

2. **Screen Reader Support**
   - Proper ARIA labels for all interactive elements
   - Announce navigation status changes
   - Provide alternative text for visual indicators

3. **High Contrast Support**
   - Ensure sufficient color contrast for markers
   - Support system dark/light mode preferences
   - Provide visual focus indicators