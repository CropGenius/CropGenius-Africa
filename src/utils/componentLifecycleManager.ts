/**
 * Component Lifecycle Manager
 * Provides safe component cleanup and mounting state tracking
 */

interface CleanupFunction {
  (): void | Promise<void>;
}

interface ComponentState {
  isMounted: boolean;
  cleanupFunctions: CleanupFunction[];
  componentId: string;
}

class ComponentLifecycleManager {
  private static instance: ComponentLifecycleManager;
  private components: Map<string, ComponentState> = new Map();

  private constructor() {}

  static getInstance(): ComponentLifecycleManager {
    if (!ComponentLifecycleManager.instance) {
      ComponentLifecycleManager.instance = new ComponentLifecycleManager();
    }
    return ComponentLifecycleManager.instance;
  }

  /**
   * Register a component and mark it as mounted
   */
  registerComponent(componentId: string): void {
    this.components.set(componentId, {
      isMounted: true,
      cleanupFunctions: [],
      componentId
    });
  }

  /**
   * Register a cleanup function for a component
   */
  registerCleanup(componentId: string, cleanupFn: CleanupFunction): void {
    const component = this.components.get(componentId);
    if (component) {
      component.cleanupFunctions.push(cleanupFn);
    } else {
      console.warn(`Component ${componentId} not registered for cleanup`);
    }
  }

  /**
   * Check if a component is still mounted
   */
  isComponentMounted(componentId: string): boolean {
    const component = this.components.get(componentId);
    return component?.isMounted ?? false;
  }

  /**
   * Safely cleanup a component
   */
  async safeCleanup(componentId: string): Promise<void> {
    const component = this.components.get(componentId);
    if (!component) {
      console.warn(`Component ${componentId} not found for cleanup`);
      return;
    }

    // Mark as unmounted first
    component.isMounted = false;

    // Execute all cleanup functions safely
    const cleanupPromises = component.cleanupFunctions.map(async (cleanupFn) => {
      try {
        await cleanupFn();
      } catch (error) {
        console.error(`Error during cleanup for component ${componentId}:`, error);
      }
    });

    // Wait for all cleanup functions to complete
    await Promise.allSettled(cleanupPromises);

    // Remove component from registry
    this.components.delete(componentId);
  }

  /**
   * Create a safe async operation that checks if component is still mounted
   */
  createSafeAsyncOperation<T>(
    componentId: string,
    operation: () => Promise<T>
  ): () => Promise<T | null> {
    return async () => {
      if (!this.isComponentMounted(componentId)) {
        console.warn(`Component ${componentId} unmounted, skipping async operation`);
        return null;
      }

      try {
        const result = await operation();
        
        // Check again after async operation completes
        if (!this.isComponentMounted(componentId)) {
          console.warn(`Component ${componentId} unmounted during async operation`);
          return null;
        }

        return result;
      } catch (error) {
        console.error(`Error in safe async operation for ${componentId}:`, error);
        throw error;
      }
    };
  }

  /**
   * Create a safe state setter that only updates if component is mounted
   */
  createSafeStateSetter<T>(
    componentId: string,
    setter: (value: T | ((prev: T) => T)) => void
  ): (value: T | ((prev: T) => T)) => void {
    return (value) => {
      if (this.isComponentMounted(componentId)) {
        setter(value);
      } else {
        console.warn(`Component ${componentId} unmounted, skipping state update`);
      }
    };
  }

  /**
   * Get cleanup statistics for debugging
   */
  getStats(): { totalComponents: number; mountedComponents: number } {
    const mountedComponents = Array.from(this.components.values()).filter(
      (component) => component.isMounted
    ).length;

    return {
      totalComponents: this.components.size,
      mountedComponents
    };
  }
}

export const componentLifecycleManager = ComponentLifecycleManager.getInstance();

/**
 * React hook for component lifecycle management
 */
export function useComponentLifecycle(componentId: string) {
  const manager = ComponentLifecycleManager.getInstance();

  // Register component on mount
  React.useEffect(() => {
    manager.registerComponent(componentId);

    // Cleanup on unmount
    return () => {
      manager.safeCleanup(componentId);
    };
  }, [componentId, manager]);

  return {
    registerCleanup: (cleanupFn: CleanupFunction) => 
      manager.registerCleanup(componentId, cleanupFn),
    
    isComponentMounted: () => 
      manager.isComponentMounted(componentId),
    
    createSafeAsyncOperation: <T>(operation: () => Promise<T>) =>
      manager.createSafeAsyncOperation(componentId, operation),
    
    createSafeStateSetter: <T>(setter: (value: T | ((prev: T) => T)) => void) =>
      manager.createSafeStateSetter(componentId, setter)
  };
}

// Import React for the hook
import React from 'react';