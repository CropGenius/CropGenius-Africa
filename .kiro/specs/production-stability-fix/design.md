# Design Document

## Overview

The CropGenius application is experiencing critical production errors that stem from three main areas:
1. **Database Schema Mismatches**: Code attempting to access non-existent database columns
2. **Mapbox Integration Issues**: Component lifecycle management problems causing undefined property access
3. **API Error Handling**: Insufficient error boundaries and retry mechanisms

This design provides a systematic approach to identify, fix, and prevent these issues through improved error handling, schema validation, and component lifecycle management.

## Architecture

### Error Detection and Resolution Strategy

The solution follows a layered approach:

```
┌─────────────────────────────────────────┐
│           Error Boundary Layer          │
├─────────────────────────────────────────┤
│         Service Layer Validation        │
├─────────────────────────────────────────┤
│        Database Schema Alignment        │
├─────────────────────────────────────────┤
│       Component Lifecycle Management    │
└─────────────────────────────────────────┘
```

### Root Cause Analysis

Based on the error logs and code analysis:

1. **Database Column Mismatch**: 
   - Error: `column fields.created_by does not exist`
   - Root Cause: Code references `created_by` but schema has `created_at`
   - Location: FarmHealthService.fetchFarmHealthData method

2. **Mapbox Component Error**:
   - Error: `Cannot read properties of undefined (reading 'indoor')`
   - Root Cause: Component cleanup attempting to access undefined map properties
   - Location: MapboxFieldMap component destruction

3. **API Response Handling**:
   - Error: Multiple 400/406 HTTP status codes
   - Root Cause: Insufficient error handling and retry logic

## Components and Interfaces

### 1. Database Schema Validator

```typescript
interface SchemaValidator {
  validateTableColumns(tableName: string, requiredColumns: string[]): Promise<ValidationResult>
  getTableSchema(tableName: string): Promise<TableSchema>
  suggestColumnMapping(expectedColumn: string, availableColumns: string[]): string | null
}
```

### 2. Enhanced Error Boundary

```typescript
interface ErrorBoundaryProps {
  fallback: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  componentStack: string
}
```

### 3. Service Layer Error Handler

```typescript
interface ServiceErrorHandler {
  handleDatabaseError(error: DatabaseError): Promise<ErrorResponse>
  handleAPIError(error: APIError): Promise<ErrorResponse>
  retryWithBackoff<T>(operation: () => Promise<T>, maxRetries: number): Promise<T>
}
```

### 4. Component Lifecycle Manager

```typescript
interface ComponentLifecycleManager {
  registerCleanup(componentId: string, cleanupFn: () => void): void
  safeCleanup(componentId: string): Promise<void>
  isComponentMounted(componentId: string): boolean
}
```

## Data Models

### Error Tracking Model

```typescript
interface ErrorLog {
  id: string
  timestamp: Date
  errorType: 'database' | 'api' | 'component' | 'unknown'
  message: string
  stackTrace: string
  componentStack?: string
  userId?: string
  sessionId: string
  resolved: boolean
  resolution?: string
}
```

### Schema Validation Model

```typescript
interface TableSchema {
  tableName: string
  columns: ColumnDefinition[]
  indexes: IndexDefinition[]
  constraints: ConstraintDefinition[]
}

interface ColumnDefinition {
  name: string
  type: string
  nullable: boolean
  defaultValue?: any
}
```

## Error Handling

### 1. Database Error Resolution

**Strategy**: Implement column mapping and fallback queries
- Detect column mismatches at runtime
- Provide automatic column name suggestions
- Implement fallback queries for missing columns
- Log schema mismatches for future fixes

**Implementation**:
```typescript
// Auto-detect and map column names
const columnMapping = {
  'created_by': 'created_at', // Map incorrect column to correct one
  'updated_by': 'updated_at'
}
```

### 2. Mapbox Component Stabilization

**Strategy**: Implement safe component lifecycle management
- Add null checks before accessing map properties
- Implement proper cleanup sequence
- Add component mounting state tracking
- Provide fallback UI for map failures

**Implementation**:
```typescript
// Safe map cleanup with null checks
const safeMapCleanup = (map: mapboxgl.Map | null) => {
  if (map && map.getContainer && map.getContainer()) {
    try {
      map.remove()
    } catch (error) {
      console.warn('Map cleanup warning:', error)
    }
  }
}
```

### 3. API Error Recovery

**Strategy**: Implement comprehensive retry and fallback mechanisms
- Exponential backoff for transient failures
- Circuit breaker pattern for persistent failures
- Graceful degradation with cached data
- User-friendly error messages

## Testing Strategy

### 1. Error Simulation Tests

- Database connection failures
- Column mismatch scenarios
- Component mounting/unmounting edge cases
- API timeout and error responses

### 2. Integration Tests

- End-to-end error recovery flows
- Database schema validation
- Component lifecycle management
- Error boundary functionality

### 3. Performance Tests

- Error handling overhead measurement
- Memory leak detection during error scenarios
- Component cleanup verification

## Implementation Phases

### Phase 1: Critical Fixes (Immediate)
- Fix database column references
- Add null checks to Mapbox component
- Implement basic error boundaries

### Phase 2: Enhanced Error Handling (Short-term)
- Add retry logic with exponential backoff
- Implement schema validation
- Add comprehensive logging

### Phase 3: Monitoring and Prevention (Long-term)
- Add error tracking dashboard
- Implement automated schema validation
- Add performance monitoring

## Monitoring and Alerting

### Error Metrics
- Error rate by component
- Database query failure rate
- API response time and error rate
- Component lifecycle failure rate

### Alerting Thresholds
- Critical: >5% error rate in any component
- Warning: >2% database query failures
- Info: New error types detected

## Rollback Strategy

### Immediate Rollback Triggers
- Error rate exceeds 10%
- Database connectivity issues
- Critical component failures

### Rollback Procedure
1. Revert to last known stable version
2. Enable maintenance mode if necessary
3. Investigate and fix issues in staging
4. Gradual re-deployment with monitoring