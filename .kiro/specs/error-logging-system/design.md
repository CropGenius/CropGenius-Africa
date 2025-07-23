# Design Document

## Overview

The CropGenius application is experiencing issues with its error logging system, as evidenced by repeated failures to store error batches and missing database tables. This design document outlines a comprehensive approach to implementing a robust error logging system that properly captures, stores, and reports errors to help developers quickly identify and resolve issues in the application.

## Architecture

The error logging system will follow a layered architecture with the following components:

```
┌─────────────────────────────────────────┐
│           Error Capture Layer           │
├─────────────────────────────────────────┤
│           Error Processing Layer        │
├─────────────────────────────────────────┤
│           Error Storage Layer           │
├─────────────────────────────────────────┤
│           Error Reporting Layer         │
└─────────────────────────────────────────┘
```

### Error Capture Layer

This layer is responsible for intercepting errors from various sources in the application:

1. **Global Error Handler**: Captures unhandled exceptions at the application level
2. **React Error Boundaries**: Captures errors in React component trees
3. **API Error Interceptors**: Captures errors from API calls
4. **Service Error Handlers**: Captures errors from service methods

### Error Processing Layer

This layer processes captured errors before storage:

1. **Error Normalization**: Standardizes error format
2. **Error Deduplication**: Identifies and aggregates similar errors
3. **Error Enrichment**: Adds context information (user, session, device)
4. **Error Prioritization**: Assigns severity levels

### Error Storage Layer

This layer handles the persistence of error data:

1. **Primary Storage**: Supabase database with error_logs table
2. **Fallback Storage**: Local storage for offline or database failure scenarios
3. **Batch Processing**: Groups errors for efficient storage
4. **Retry Mechanism**: Handles storage failures with exponential backoff

### Error Reporting Layer

This layer provides visibility into captured errors:

1. **Admin Dashboard**: Displays error summaries and details
2. **Real-time Alerts**: Notifies developers of critical errors
3. **Error Analytics**: Provides trends and patterns
4. **User Notifications**: Shows appropriate messages to end users

## Components and Interfaces

### 1. ErrorLogger Service

```typescript
interface ErrorLoggerOptions {
  batchSize?: number;
  flushInterval?: number;
  maxRetries?: number;
  includeContext?: boolean;
}

interface ErrorLogger {
  logError(error: Error, context?: Record<string, any>): void;
  logWarning(message: string, context?: Record<string, any>): void;
  logInfo(message: string, context?: Record<string, any>): void;
  flush(): Promise<void>;
}
```

### 2. ErrorProcessor

```typescript
interface ErrorProcessor {
  process(error: RawError): ProcessedError;
  deduplicate(error: ProcessedError, existingErrors: ProcessedError[]): boolean;
  enrich(error: ProcessedError, context: Record<string, any>): EnrichedError;
  prioritize(error: EnrichedError): PrioritizedError;
}
```

### 3. ErrorStorage

```typescript
interface ErrorStorage {
  store(errors: PrioritizedError[]): Promise<StorageResult>;
  batchStore(errors: PrioritizedError[]): Promise<BatchStorageResult>;
  query(filters: ErrorQueryFilters): Promise<PrioritizedError[]>;
  getStats(): Promise<ErrorStats>;
}
```

### 4. ErrorReporter

```typescript
interface ErrorReporter {
  generateSummary(timeframe: Timeframe): Promise<ErrorSummary>;
  alertCriticalErrors(errors: PrioritizedError[]): Promise<void>;
  getUserNotification(error: PrioritizedError): UserNotification;
}
```

## Data Models

### Error Log Model

```typescript
interface ErrorLog {
  id: string;                     // Unique identifier
  message: string;                // Error message
  category: string;               // Error category (api, component, database)
  severity: 'low' | 'medium' | 'high' | 'critical'; // Error severity
  context: Record<string, any>;   // Additional context
  count: number;                  // Occurrence count
  first_occurrence: Date;         // First time this error occurred
  last_occurrence: Date;          // Most recent occurrence
  resolved: boolean;              // Whether the error is resolved
  tags: string[];                 // Tags for categorization
  created_at: Date;               // Record creation timestamp
}
```

### Database Schema

```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  context JSONB,
  count INTEGER DEFAULT 1,
  first_occurrence TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_occurrence TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX error_logs_category_idx ON error_logs(category);
CREATE INDEX error_logs_severity_idx ON error_logs(severity);
CREATE INDEX error_logs_resolved_idx ON error_logs(resolved);
CREATE INDEX error_logs_last_occurrence_idx ON error_logs(last_occurrence);
```

## Error Handling

### 1. Error Capture Strategy

**Global Error Handler**:
```typescript
window.addEventListener('error', (event) => {
  errorLogger.logError(event.error, {
    source: 'window',
    url: window.location.href
  });
});

window.addEventListener('unhandledrejection', (event) => {
  errorLogger.logError(new Error(event.reason), {
    source: 'promise',
    url: window.location.href
  });
});
```

**React Error Boundary**:
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    errorLogger.logError(error, {
      source: 'react',
      componentStack: errorInfo.componentStack
    });
  }
  
  render() {
    return this.state.hasError 
      ? this.props.fallback 
      : this.props.children;
  }
}
```

### 2. Error Storage Strategy

**Primary Storage**:
```typescript
async function storeErrors(errors) {
  try {
    await supabase
      .from('error_logs')
      .upsert(errors, { onConflict: 'id' });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
```

**Fallback Storage**:
```typescript
function storeErrorsLocally(errors) {
  try {
    const storedErrors = JSON.parse(localStorage.getItem('error_logs') || '[]');
    const updatedErrors = [...storedErrors, ...errors];
    localStorage.setItem('error_logs', JSON.stringify(updatedErrors));
    return { success: true };
  } catch (error) {
    console.error('Failed to store errors locally:', error);
    return { success: false, error };
  }
}
```

### 3. Batch Processing Strategy

```typescript
class ErrorBatchProcessor {
  private errorQueue: PrioritizedError[] = [];
  private processingInterval: number;
  
  constructor(options: BatchProcessorOptions) {
    this.processingInterval = setInterval(
      () => this.processBatch(), 
      options.flushInterval || 30000
    );
  }
  
  async processBatch() {
    if (this.errorQueue.length === 0) return;
    
    const batch = [...this.errorQueue];
    this.errorQueue = [];
    
    try {
      await this.storeBatch(batch);
    } catch (error) {
      // Re-queue errors with exponential backoff
      this.errorQueue = [...batch, ...this.errorQueue];
    }
  }
}
```

## Testing Strategy

### 1. Unit Tests

- Test error capture mechanisms
- Test error processing and deduplication
- Test storage and fallback mechanisms
- Test batch processing and retry logic

### 2. Integration Tests

- Test end-to-end error logging flow
- Test database schema and constraints
- Test error reporting and dashboard functionality

### 3. Error Simulation Tests

- Simulate various error types (API, component, database)
- Test offline and connectivity issues
- Test database unavailability scenarios

## Implementation Phases

### Phase 1: Core Error Logging Infrastructure

1. Create error_logs table in Supabase
2. Implement ErrorLogger service
3. Add global error handlers
4. Implement basic error storage

### Phase 2: Enhanced Error Processing

1. Implement error deduplication
2. Add context enrichment
3. Implement severity classification
4. Add batch processing with retry logic

### Phase 3: Error Reporting and Visualization

1. Create admin error dashboard
2. Implement error analytics
3. Add alerting mechanisms
4. Implement user-facing error notifications

## Monitoring and Metrics

- Error capture rate
- Error storage success rate
- Error resolution time
- Most frequent error types
- Critical error count

## Security Considerations

- Ensure no sensitive user data is included in error logs
- Implement access controls for error dashboard
- Sanitize error messages to prevent XSS
- Encrypt sensitive error context data