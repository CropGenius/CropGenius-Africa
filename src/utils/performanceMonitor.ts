interface PerformanceMetrics {
  fcp: number
  lcp: number
  fid: number
  cls: number
  tti: number
  bundleSize: number
  memoryUsage: number
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.init()
    }
  }

  private init() {
    // Core Web Vitals monitoring
    this.observeLCP()
    this.observeFID()
    this.observeCLS()
    this.observeFCP()
    this.observeTTI()
    this.monitorMemoryUsage()
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry
        this.metrics.lcp = lastEntry?.startTime || 0
        
        // Budget device optimization
        if (this.metrics.lcp > 2500) {
          this.optimizeForBudgetDevice('lcp')
        }
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(observer)
    } catch (e) {
      console.warn('LCP monitoring not supported')
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const firstEntry = entries[0] as PerformanceEntry
        this.metrics.fid = firstEntry?.processingStart - firstEntry?.startTime || 0
        
        // Budget device optimization
        if (this.metrics.fid > 100) {
          this.optimizeForBudgetDevice('fid')
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
      this.observers.push(observer)
    } catch (e) {
      console.warn('FID monitoring not supported')
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        this.metrics.cls = clsValue
        
        if (this.metrics.cls > 0.1) {
          this.optimizeForBudgetDevice('cls')
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(observer)
    } catch (e) {
      console.warn('CLS monitoring not supported')
    }
  }

  private observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
        this.metrics.fcp = fcpEntry?.startTime || 0
        
        if (this.metrics.fcp > 1800) {
          this.optimizeForBudgetDevice('fcp')
        }
      })
      observer.observe({ entryTypes: ['paint'] })
      this.observers.push(observer)
    } catch (e) {
      console.warn('FCP monitoring not supported')
    }
  }

  private observeTTI() {
    // TTI approximation using load event
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.metrics.tti = performance.now()
        if (this.metrics.tti > 3000) {
          this.optimizeForBudgetDevice('tti')
        }
      }, 0)
    })
  }

  private monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024) // MB
        
        // Budget device warning (1GB RAM = ~250MB for browser)
        if (this.metrics.memoryUsage > 150) {
          this.optimizeForBudgetDevice('memory')
        }
      }, 5000)
    }
  }

  private optimizeForBudgetDevice(metric: string) {
    console.warn(`[Performance] Budget device optimization triggered for ${metric}`)
    
    // Apply budget device optimizations
    switch (metric) {
      case 'lcp':
      case 'fcp':
        this.enableLiteMode()
        break
      case 'fid':
        this.reduceInputDelay()
        break
      case 'cls':
        this.stabilizeLayout()
        break
      case 'tti':
        this.deferNonCritical()
        break
      case 'memory':
        this.cleanupMemory()
        break
    }
  }

  private enableLiteMode() {
    // Enable lite mode for budget devices
    document.documentElement.classList.add('lite-mode')
    
    // Disable animations
    const style = document.createElement('style')
    style.textContent = `
      * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
      .lite-mode .animate-pulse,
      .lite-mode .animate-spin,
      .lite-mode .animate-bounce {
        animation: none !important;
      }
    `
    document.head.appendChild(style)
  }

  private reduceInputDelay() {
    // Preload critical resources
    const criticalLinks = [
      '/assets/index-*.css',
      '/assets/react-vendor-*.js',
      '/assets/ui-vendor-*.js'
    ]
    
    criticalLinks.forEach(href => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = href.includes('.css') ? 'style' : 'script'
      link.href = href
      document.head.appendChild(link)
    })
  }

  private stabilizeLayout() {
    // Reserve space for dynamic content
    const dynamicElements = document.querySelectorAll('[data-dynamic]')
    dynamicElements.forEach(el => {
      if (!el.getAttribute('data-height')) {
        const height = el.getBoundingClientRect().height
        el.setAttribute('data-height', height.toString())
        el.style.minHeight = `${height}px`
      }
    })
  }

  private deferNonCritical() {
    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script[data-defer]')
    scripts.forEach(script => {
      if (script.getAttribute('data-defersrc')) {
        script.src = script.getAttribute('data-defersrc')
        script.removeAttribute('data-defersrc')
        script.removeAttribute('data-defer')
      }
    })
  }

  private cleanupMemory() {
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc()
    }
    
    // Clear console logs
    console.clear()
    
    // Remove unused DOM elements
    const unused = document.querySelectorAll('[data-temp]')
    unused.forEach(el => el.remove())
  }

  public getMetrics() {
    return {
      ...this.metrics,
      bundleSize: this.getBundleSize()
    }
  }

  private getBundleSize() {
    const assets = performance.getEntriesByType('resource')
    const jsAssets = assets.filter(asset => 
      asset.name.includes('.js') && 
      !asset.name.includes('chrome-extension://')
    )
    
    return jsAssets.reduce((total, asset) => total + (asset.transferSize || 0), 0) / (1024 * 1024)
  }

  public report() {
    const metrics = this.getMetrics()
    
    console.table({
      'First Contentful Paint': `${Math.round(metrics.fcp || 0)}ms`,
      'Largest Contentful Paint': `${Math.round(metrics.lcp || 0)}ms`,
      'First Input Delay': `${Math.round(metrics.fid || 0)}ms`,
      'Cumulative Layout Shift': metrics.cls?.toFixed(3) || 'N/A',
      'Time to Interactive': `${Math.round(metrics.tti || 0)}ms`,
      'Bundle Size': `${(metrics.bundleSize || 0).toFixed(2)}MB`,
      'Memory Usage': `${(metrics.memoryUsage || 0).toFixed(2)}MB`
    })
  }

  public isBudgetDevice() {
    const memory = (navigator as any).deviceMemory
    const cores = navigator.hardwareConcurrency
    
    return memory <= 1 || cores <= 2
  }

  public enableBudgetDeviceMode() {
    if (this.isBudgetDevice()) {
      console.log('[Performance] Budget device detected - enabling optimizations')
      this.enableLiteMode()
      
      // Add budget device class
      document.documentElement.classList.add('budget-device')
      
      // Reduce image quality
      const images = document.querySelectorAll('img')
      images.forEach(img => {
        if (!img.src.includes('optimized')) {
          img.loading = 'lazy'
          img.decoding = 'async'
        }
      })
    }
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Global performance monitor
export const performanceMonitor = new PerformanceMonitor()

// Auto-enable for budget devices
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceMonitor.enableBudgetDeviceMode()
  })
}

export default PerformanceMonitor