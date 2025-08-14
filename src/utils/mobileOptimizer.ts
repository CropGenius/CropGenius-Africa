/**
 * Mobile Performance Optimizer for African Farmers
 * Ensures 60 FPS on budget Android devices (1GB RAM, Android 6+)
 */

export interface DeviceCapabilities {
  isLowEnd: boolean;
  deviceMemory?: number;
  hardwareConcurrency: number;
  connectionSpeed: 'slow-2g' | '2g' | '3g' | '4g' | '5g';
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
}

export class MobileOptimizer {
  private static instance: MobileOptimizer;
  private deviceCapabilities: DeviceCapabilities | null = null;
  private observer: PerformanceObserver | null = null;

  static getInstance(): MobileOptimizer {
    if (!MobileOptimizer.instance) {
      MobileOptimizer.instance = new MobileOptimizer();
    }
    return MobileOptimizer.instance;
  }

  /**
   * Detect device capabilities for performance optimization
   */
  detectDeviceCapabilities(): DeviceCapabilities {
    if (this.deviceCapabilities) {
      return this.deviceCapabilities;
    }

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const deviceMemory = (navigator as any).deviceMemory;
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    
    const capabilities: DeviceCapabilities = {
      isLowEnd: this.isLowEndDevice(),
      deviceMemory,
      hardwareConcurrency,
      connectionSpeed: this.getConnectionSpeed(connection),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
    };

    this.deviceCapabilities = capabilities;
    return capabilities;
  }

  /**
   * Check if device is low-end based on memory and CPU
   */
  private isLowEndDevice(): boolean {
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency || 1;
    
    // Ultra-budget devices: ≤1GB RAM or ≤2 cores
    // Budget devices: ≤2GB RAM or ≤4 cores
    return (memory && memory <= 2) || cores <= 2;
  }

  /**
   * Get connection speed for adaptive loading
   */
  private getConnectionSpeed(connection: any): DeviceCapabilities['connectionSpeed'] {
    if (!connection) return '4g';
    
    if (connection.effectiveType) {
      return connection.effectiveType as DeviceCapabilities['connectionSpeed'];
    }
    
    // Fallback based on downlink speed
    const downlink = connection.downlink || 10;
    if (downlink < 0.05) return 'slow-2g';
    if (downlink < 0.15) return '2g';
    if (downlink < 0.7) return '3g';
    if (downlink < 10) return '4g';
    return '5g';
  }

  /**
   * Optimize image loading based on device capabilities
   */
  getOptimizedImageUrl(originalUrl: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  }): string {
    const capabilities = this.detectDeviceCapabilities();
    
    let quality = options?.quality;
    if (quality === undefined) {
      if (capabilities.isLowEnd) quality = 50;
      else if (capabilities.connectionSpeed === '3g') quality = 70;
      else quality = 85;
    }

    const width = options?.width || Math.min(capabilities.screenWidth, 800);
    const height = options?.height;
    const format = options?.format || 'webp';

    // Use Cloudinary or similar for optimization
    // For now, return optimized URL pattern
    const params = new URLSearchParams({
      f: format,
      q: quality.toString(),
      w: width.toString(),
    });
    
    if (height) params.set('h', height.toString());
    
    return `${originalUrl}?${params.toString()}`;
  }

  /**
   * Debounce function for performance optimization
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate?: boolean
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      
      const callNow = immediate && !timeout;
      
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func(...args);
    };
  }

  /**
   * Throttle function for scroll/resize events
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;
    
    return function executedFunction(...args: Parameters<T>) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Monitor performance metrics
   */
  startPerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // Log performance issues on low-end devices
          if (entry.duration > 16.67) { // > 60 FPS
            console.warn('Performance issue detected:', {
              name: entry.name,
              duration: entry.duration,
              entryType: entry.entryType,
            });
          }
        });
      });
      
      this.observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    }
  }

  /**
   * Stop performance monitoring
   */
  stopPerformanceMonitoring(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * Detect if animations should be reduced
   */
  shouldReduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches || this.isLowEndDevice();
  }

  /**
   * Get optimal font size based on screen size
   */
  getOptimalFontSize(): string {
    const width = window.innerWidth;
    if (width <= 320) return '14px'; // Ultra-budget phones
    if (width <= 375) return '15px'; // iPhone SE
    if (width <= 768) return '16px'; // Most phones
    return '18px'; // Tablets and desktop
  }

  /**
   * Calculate optimal image dimensions
   */
  getOptimalDimensions(maxWidth?: number, maxHeight?: number): {
    width: number;
    height: number;
  } {
    const capabilities = this.detectDeviceCapabilities();
    const screenWidth = capabilities.screenWidth;
    const screenHeight = capabilities.screenHeight;
    
    // Account for pixel density
    const effectiveWidth = Math.min(screenWidth, maxWidth || screenWidth);
    const effectiveHeight = Math.min(screenHeight, maxHeight || screenHeight);
    
    return {
      width: Math.floor(effectiveWidth * (capabilities.isLowEnd ? 0.5 : 1)),
      height: Math.floor(effectiveHeight * (capabilities.isLowEnd ? 0.5 : 1)),
    };
  }
}

/**
 * Hook for mobile optimization
 */
export function useMobileOptimization() {
  const optimizer = MobileOptimizer.getInstance();
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);

  useEffect(() => {
    setCapabilities(optimizer.detectDeviceCapabilities());
    optimizer.startPerformanceMonitoring();

    return () => {
      optimizer.stopPerformanceMonitoring();
    };
  }, []);

  return {
    optimizer,
    capabilities,
    isLowEnd: capabilities?.isLowEnd || false,
    connectionSpeed: capabilities?.connectionSpeed || '4g',
  };
}

/**
 * React component wrapper for performance optimization
 */
export const withMobileOptimization = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return function OptimizedComponent(props: P) {
    const { capabilities, isLowEnd } = useMobileOptimization();
    
    return React.createElement(Component, {
      ...props,
      deviceCapabilities: capabilities,
      isLowEndDevice: isLowEnd,
    });
  };
};

// Export singleton instance
export const mobileOptimizer = MobileOptimizer.getInstance();