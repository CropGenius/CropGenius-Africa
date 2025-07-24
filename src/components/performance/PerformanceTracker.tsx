/**
 * 🚀💪 INFINITY GOD MODE PERFORMANCE TRACKER COMPONENT
 * -------------------------------------------------------------
 * PRODUCTION-READY React component for automatic render tracking
 * Built for 100 million African farmers with military-grade precision!
 */

import React, { useEffect, useRef, ReactNode } from 'react';
import { trackComponentRender } from '@/utils/frontendPerformanceAnalyzer';

interface PerformanceTrackerProps {
  componentName: string;
  children: ReactNode;
  trackProps?: boolean;
  trackState?: boolean;
  threshold?: number; // ms - log warning if render time exceeds this
}

/**
 * 🔥 INFINITY GOD MODE PERFORMANCE TRACKER
 * Automatically tracks component render performance
 */
export const PerformanceTracker: React.FC<PerformanceTrackerProps> = ({
  componentName,
  children,
  trackProps = false,
  trackState = false,
  threshold = 16 // 60fps threshold
}) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  // 🚀 START RENDER TIMING
  renderStartTime.current = performance.now();
  renderCount.current++;

  // 🔥 TRACK RENDER COMPLETION
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    // Track the render performance
    trackComponentRender(
      componentName,
      renderTime,
      trackProps ? {} : undefined, // Would need props passed down
      trackState ? {} : undefined  // Would need state passed down
    );

    // Log warning for slow renders
    if (renderTime > threshold) {
      console.warn(
        `🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms (render #${renderCount.current})`
      );
    }
  });

  return <>{children}</>;
};

/**
 * 🚀 HOC for automatic performance tracking
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const TrackedComponent: React.FC<P> = (props) => {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Anonymous';
    
    return (
      <PerformanceTracker componentName={name} trackProps={true}>
        <WrappedComponent {...props} />
      </PerformanceTracker>
    );
  };

  TrackedComponent.displayName = `withPerformanceTracking(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;
  
  return TrackedComponent;
}

/**
 * 🔥 Hook for manual render timing
 */
export function useRenderTiming(componentName: string) {
  const renderStartTime = useRef<number>(0);
  
  const startTiming = () => {
    renderStartTime.current = performance.now();
  };
  
  const endTiming = (additionalData?: any) => {
    const renderTime = performance.now() - renderStartTime.current;
    trackComponentRender(componentName, renderTime, additionalData);
    return renderTime;
  };
  
  return { startTiming, endTiming };
}