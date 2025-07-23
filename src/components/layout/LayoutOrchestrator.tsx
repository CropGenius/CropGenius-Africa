/**
 * 🔥💪 LAYOUT ORCHESTRATOR - INFINITY GOD MODE ACTIVATED!
 * The most advanced responsive layout system for agricultural intelligence
 * Automatically detects device type and serves perfect layouts for 100M farmers
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  Settings,
  Zap
} from 'lucide-react';

// 🚀 PRODUCTION-READY COMPONENTS
import { MobileLayout } from '../mobile/MobileLayout';
import { DesktopLayout } from './DesktopLayout';
import { TabletLayout } from './TabletLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// 🔥 INFINITY IQ HOOKS
import { useErrorHandler } from '@/utils/errorHandling';
import { PageErrorBoundary } from '@/components/error/EnhancedErrorBoundary';

// 🚀 DEVICE DETECTION TYPES
type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'ultrawide';
type OrientationType = 'portrait' | 'landscape';
type LayoutMode = 'auto' | 'mobile' | 'desktop' | 'tablet';

interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  ultrawide: number;
}

interface LayoutOrchestratorProps {
  children: React.ReactNode;
  forceLayout?: LayoutMode;
  enableLayoutSwitcher?: boolean;
  customBreakpoints?: Partial<BreakpointConfig>;
}

/**
 * 🔥 INFINITY GOD MODE LAYOUT ORCHESTRATOR
 * Automatically serves the perfect layout for any device
 */
export const LayoutOrchestrator: React.FC<LayoutOrchestratorProps> = ({
  children,
  forceLayout = 'auto',
  enableLayoutSwitcher = false,
  customBreakpoints = {}
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();

  // 🚀 DEFAULT BREAKPOINTS (PRODUCTION-OPTIMIZED)
  const breakpoints: BreakpointConfig = useMemo(() => ({
    mobile: 768,
    tablet: 1024,
    desktop: 1440,
    ultrawide: 1920,
    ...customBreakpoints
  }), [customBreakpoints]);

  // 🔥 STATE MANAGEMENT
  const [deviceType, setDeviceType] = useState<DeviceType>('mobile');
  const [orientation, setOrientation] = useState<OrientationType>('portrait');
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(forceLayout);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLayoutSwitcher, setShowLayoutSwitcher] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    layoutSwitches: 0,
    lastSwitch: Date.now()
  });

  // 🚀 DEVICE DETECTION LOGIC
  const detectDevice = useCallback((width: number, height: number): DeviceType => {
    try {
      if (width >= breakpoints.ultrawide) return 'ultrawide';
      if (width >= breakpoints.desktop) return 'desktop';
      if (width >= breakpoints.tablet) return 'tablet';
      return 'mobile';
    } catch (error) {
      handleError(error as Error, { 
        component: 'LayoutOrchestrator',
        operation: 'detectDevice',
        width,
        height
      });
      return 'mobile'; // Safe fallback
    }
  }, [breakpoints, handleError]);

  // 🔥 ORIENTATION DETECTION
  const detectOrientation = useCallback((width: number, height: number): OrientationType => {
    return width > height ? 'landscape' : 'portrait';
  }, []);

  // 🚀 WINDOW RESIZE HANDLER
  const handleResize = useCallback(() => {
    try {
      const startTime = performance.now();
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      
      const newDeviceType = detectDevice(width, height);
      const newOrientation = detectOrientation(width, height);
      
      // Only update if changed to prevent unnecessary re-renders
      if (newDeviceType !== deviceType) {
        setDeviceType(newDeviceType);
        setPerformanceMetrics(prev => ({
          ...prev,
          layoutSwitches: prev.layoutSwitches + 1,
          lastSwitch: Date.now()
        }));
        
        toast.info(`Layout switched to ${newDeviceType}`, {
          description: `Optimized for ${width}x${height} display`,
          duration: 2000
        });
      }
      
      if (newOrientation !== orientation) {
        setOrientation(newOrientation);
      }
      
      const endTime = performance.now();
      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime: endTime - startTime
      }));
      
    } catch (error) {
      handleError(error as Error, { 
        component: 'LayoutOrchestrator',
        operation: 'handleResize'
      });
    }
  }, [deviceType, orientation, detectDevice, detectOrientation, handleError]);

  // 🔥 INITIALIZE AND SETUP LISTENERS
  useEffect(() => {
    // Initial detection
    handleResize();
    
    // Setup listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Fullscreen detection
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleResize]);

  // 🚀 DETERMINE ACTIVE LAYOUT
  const activeLayout = useMemo(() => {
    if (forceLayout !== 'auto') return forceLayout;
    if (layoutMode !== 'auto') return layoutMode;
    
    // Auto-detection logic
    switch (deviceType) {
      case 'mobile':
        return 'mobile';
      case 'tablet':
        return orientation === 'landscape' ? 'desktop' : 'tablet';
      case 'desktop':
      case 'ultrawide':
        return 'desktop';
      default:
        return 'mobile';
    }
  }, [forceLayout, layoutMode, deviceType, orientation]);

  // 🔥 LAYOUT SWITCHING HANDLERS
  const handleLayoutSwitch = useCallback((newLayout: LayoutMode) => {
    try {
      setLayoutMode(newLayout);
      setShowLayoutSwitcher(false);
      
      toast.success(`Switched to ${newLayout} layout`, {
        description: 'Layout preference saved for this session'
      });
    } catch (error) {
      handleError(error as Error, { 
        component: 'LayoutOrchestrator',
        operation: 'handleLayoutSwitch',
        newLayout
      });
    }
  }, [handleError]);

  // 🚀 FULLSCREEN TOGGLE
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        toast.success('Entered fullscreen mode');
      } else {
        await document.exitFullscreen();
        toast.success('Exited fullscreen mode');
      }
    } catch (error) {
      handleError(error as Error, { 
        component: 'LayoutOrchestrator',
        operation: 'toggleFullscreen'
      });
      toast.error('Fullscreen not supported');
    }
  }, [handleError]);

  // 🔥 RENDER LAYOUT COMPONENT
  const renderLayout = () => {
    const layoutProps = {
      children,
      deviceType,
      orientation,
      windowSize,
      isFullscreen
    };

    switch (activeLayout) {
      case 'mobile':
        return <MobileLayout {...layoutProps} />;
      case 'tablet':
        return <TabletLayout {...layoutProps} />;
      case 'desktop':
        return <DesktopLayout {...layoutProps} />;
      default:
        return <MobileLayout {...layoutProps} />;
    }
  };

  // 🚀 GET DEVICE ICON
  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'desktop':
      case 'ultrawide': return <Monitor className="h-4 w-4" />;
      default: return <Smartphone className="h-4 w-4" />;
    }
  };

  return (
    <PageErrorBoundary errorBoundaryId="layout-orchestrator">
      <div className="relative min-h-screen">
        
        {/* 🔥 LAYOUT SWITCHER (DEVELOPMENT/ADMIN) */}
        {enableLayoutSwitcher && (
          <div className="fixed top-4 right-4 z-50">
            <div className="flex items-center space-x-2">
              {/* Device Info Badge */}
              <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                {getDeviceIcon(deviceType)}
                <span className="ml-1 text-xs">
                  {deviceType} • {windowSize.width}x{windowSize.height}
                </span>
              </Badge>

              {/* Layout Switcher Button */}
              <Button
                variant="outline"
                size="icon"
                className="bg-white/90 backdrop-blur-sm"
                onClick={() => setShowLayoutSwitcher(!showLayoutSwitcher)}
              >
                <Settings className="h-4 w-4" />
              </Button>

              {/* Fullscreen Toggle */}
              <Button
                variant="outline"
                size="icon"
                className="bg-white/90 backdrop-blur-sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Layout Switcher Panel */}
            <AnimatePresence>
              {showLayoutSwitcher && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-12 right-0 bg-white/95 backdrop-blur-xl rounded-lg shadow-xl border p-4 min-w-64"
                >
                  <h3 className="font-medium mb-3 flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                    Layout Control
                  </h3>
                  
                  <div className="space-y-2">
                    {(['auto', 'mobile', 'tablet', 'desktop'] as LayoutMode[]).map((layout) => (
                      <Button
                        key={layout}
                        variant={activeLayout === layout ? 'default' : 'outline'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleLayoutSwitch(layout)}
                      >
                        {layout === 'auto' && <RotateCcw className="h-4 w-4 mr-2" />}
                        {layout === 'mobile' && <Smartphone className="h-4 w-4 mr-2" />}
                        {layout === 'tablet' && <Tablet className="h-4 w-4 mr-2" />}
                        {layout === 'desktop' && <Monitor className="h-4 w-4 mr-2" />}
                        {layout.charAt(0).toUpperCase() + layout.slice(1)}
                      </Button>
                    ))}
                  </div>

                  {/* Performance Metrics */}
                  <div className="mt-4 pt-3 border-t text-xs text-gray-500">
                    <div>Render: {performanceMetrics.renderTime.toFixed(1)}ms</div>
                    <div>Switches: {performanceMetrics.layoutSwitches}</div>
                    <div>Orientation: {orientation}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 🚀 MAIN LAYOUT CONTENT */}
        <motion.div
          key={activeLayout}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="min-h-screen"
        >
          {renderLayout()}
        </motion.div>

        {/* 🔥 LAYOUT TRANSITION INDICATOR */}
        <AnimatePresence>
          {performanceMetrics.layoutSwitches > 0 && 
           Date.now() - performanceMetrics.lastSwitch < 3000 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-4 left-4 z-40 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
            >
              🚀 {activeLayout.toUpperCase()} MODE ACTIVATED
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageErrorBoundary>
  );
};

export default LayoutOrchestrator;