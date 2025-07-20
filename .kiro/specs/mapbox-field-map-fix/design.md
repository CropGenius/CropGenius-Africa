# Design Document

## Overview

The MapboxFieldMap component fix addresses critical runtime errors caused by improper cleanup of Mapbox GL JS resources. The primary issue is the "Cannot read properties of undefined (reading 'indoor')" error that occurs when the map instance is being destroyed. This design implements defensive programming patterns, improved error handling, and safer resource cleanup to ensure application stability.

## Architecture

### Error Root Cause Analysis

The error occurs because:
1. Mapbox GL JS attempts to access internal properties during cleanup that may not exist
2. The component cleanup doesn't properly check for object existence before calling methods
3. Multiple cleanup attempts can occur due to React's strict mode or rapid re-renders
4. The map instance may be partially destroyed when cleanup methods are called

### Solution Architecture

```
MapboxFieldMap Component
├── Safe Initialization Layer
│   ├── Token Validation
│   ├── Environment Checks
│   └── Fallback Handling
├── Defensive Cleanup Layer
│   ├── Null/Undefined Checks
│   ├── Try-Catch Wrappers
│   └── Resource State Tracking
├── Error Boundary Integration
│   ├── Component-Level Error Handling
│   ├── Graceful Degradation
│   └── User-Friendly Error Messages
└── Offline/Online State Management
    ├── Cached Data Handling
    ├── Network Status Monitoring
    └── Seamless Mode Switching
```

## Components and Interfaces

### 1. Enhanced Cleanup Manager

```typescript
interface CleanupManager {
  isCleaningUp: boolean;
  cleanupAttempts: number;
  maxCleanupAttempts: number;
  safeCleanup(resource: any, cleanupFn: () => void): void;
  markCleanupComplete(): void;
}
```

**Responsibilities:**
- Track cleanup state to prevent multiple cleanup attempts
- Implement safe cleanup with try-catch wrappers
- Provide defensive programming for resource destruction

### 2. Map Instance Manager

```typescript
interface MapInstanceManager {
  mapInstance: mapboxgl.Map | null;
  isInitialized: boolean;
  isDestroyed: boolean;
  safeGetMap(): mapboxgl.Map | null;
  safeDestroyMap(): void;
  resetState(): void;
}
```

**Responsibilities:**
- Manage map instance lifecycle safely
- Provide safe accessors that check for existence
- Track initialization and destruction state

### 3. Resource Tracker

```typescript
interface ResourceTracker {
  markers: mapboxgl.Marker[];
  sources: string[];
  layers: string[];
  eventListeners: Array<{ event: string; handler: Function }>;
  addResource(type: string, resource: any): void;
  removeResource(type: string, id: string): void;
  cleanupAllResources(): void;
}
```

**Responsibilities:**
- Track all map resources (markers, sources, layers)
- Provide centralized cleanup for all resources
- Prevent resource leaks and orphaned objects

## Data Models

### Error State Model

```typescript
interface MapErrorState {
  hasError: boolean;
  errorType: 'initialization' | 'cleanup' | 'runtime' | 'network';
  errorMessage: string;
  canRecover: boolean;
  retryCount: number;
  lastErrorTime: number;
}
```

### Cleanup State Model

```typescript
interface CleanupState {
  isActive: boolean;
  startTime: number;
  completedSteps: string[];
  failedSteps: Array<{ step: string; error: string }>;
  totalSteps: number;
}
```

## Error Handling

### 1. Defensive Cleanup Pattern

```typescript
const safeCleanup = (resource: any, cleanupFn: () => void, resourceName: string) => {
  try {
    if (resource && typeof cleanupFn === 'function') {
      cleanupFn();
      console.log(`✅ [MapboxFieldMap] ${resourceName} cleaned up successfully`);
    }
  } catch (error) {
    console.warn(`⚠️ [MapboxFieldMap] Failed to cleanup ${resourceName}:`, error);
    // Don't throw - log and continue
  }
};
```

### 2. Map Instance Safety Checks

```typescript
const safeMapOperation = (operation: (map: mapboxgl.Map) => void) => {
  if (!map.current || map.current._destroyed || !map.current.getContainer()) {
    console.warn('[MapboxFieldMap] Map instance not available for operation');
    return;
  }
  
  try {
    operation(map.current);
  } catch (error) {
    console.error('[MapboxFieldMap] Map operation failed:', error);
    // Handle specific Mapbox errors
    if (error.message?.includes('indoor')) {
      console.warn('[MapboxFieldMap] Indoor property access error - ignoring');
      return;
    }
    throw error;
  }
};
```

### 3. Component-Level Error Recovery

```typescript
const handleMapError = (error: Error, errorInfo: any) => {
  console.error('[MapboxFieldMap] Component error:', error);
  
  // Attempt recovery based on error type
  if (error.message?.includes('indoor') || error.message?.includes('Cannot read properties')) {
    // This is likely a cleanup error - reset component state
    resetMapState();
    return;
  }
  
  // For other errors, set error state for user feedback
  setMapError(error.message);
};
```

## Testing Strategy

### 1. Unit Tests

- Test cleanup functions with null/undefined inputs
- Test error handling for various Mapbox GL errors
- Test resource tracking and cleanup
- Test offline/online mode switching

### 2. Integration Tests

- Test component mounting/unmounting cycles
- Test rapid re-renders and cleanup
- Test network connectivity changes
- Test token validation and fallback scenarios

### 3. Error Simulation Tests

- Simulate Mapbox GL internal errors
- Test cleanup with partially destroyed map instances
- Test memory leak prevention
- Test error boundary integration

## Implementation Phases

### Phase 1: Defensive Cleanup Implementation
- Implement safe cleanup wrappers
- Add null/undefined checks to all cleanup operations
- Track cleanup state to prevent multiple attempts

### Phase 2: Enhanced Error Handling
- Add component-level error boundaries
- Implement graceful degradation for map failures
- Add user-friendly error messages and recovery options

### Phase 3: Resource Management
- Implement centralized resource tracking
- Add memory leak prevention
- Optimize cleanup performance

### Phase 4: Testing and Validation
- Add comprehensive test coverage
- Validate error scenarios
- Performance testing and optimization

## Security Considerations

- Validate Mapbox access tokens before use
- Sanitize error messages to prevent information disclosure
- Implement rate limiting for map operations
- Secure handling of cached map data

## Performance Considerations

- Minimize cleanup operations during rapid re-renders
- Implement debounced cleanup for better performance
- Cache validation results to avoid repeated checks
- Optimize memory usage during offline mode