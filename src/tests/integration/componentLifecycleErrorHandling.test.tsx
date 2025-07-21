import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MapboxFieldMap } from '@/components/fields/MapboxFieldMap';
import { useComponentLifecycle } from '@/utils/componentLifecycleManager';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { MapFallback } from '@/components/fallback/FallbackComponents';
import { errorLogger } from '@/services/errorLogger';

// Mock mapboxgl
jest.mock('mapbox-gl', () => ({
  Map: jest.fn().mockImplementation(() => ({
    on: jest.fn((event, callback) => {
      if (event === 'load' && !global.mockMapLoadError) {
        setTimeout(() => callback(), 0);
      }
    }),
    remove: jest.fn(),
    getContainer: jest.fn().mockReturnValue(document.createElement('div')),
    addControl: jest.fn(),
    flyTo: jest.fn(),
    getCanvasContainer: jest.fn().mockReturnValue({ id: 'test-map' }),
    getStyle: jest.fn().mockReturnValue({ name: 'test-style' }),
    getCenter: jest.fn().mockReturnValue({ lat: 0, lng: 0 }),
    getZoom: jest.fn().mockReturnValue(10),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    getSource: jest.fn().mockReturnValue(true),
    removeLayer: jest.fn(),
    removeSource: jest.fn()
  })),
  NavigationControl: jest.fn(),
  ScaleControl: jest.fn(),
  GeolocateControl: jest.fn(),
  Marker: jest.fn().mockImplementation(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn()
  })),
  LngLatBounds: jest.fn().mockImplementation(() => ({
    extend: jest.fn(),
    toArray: jest.fn().mockReturnValue([[0, 0], [1, 1]])
  }))
}));

// Mock component lifecycle manager
jest.mock('@/utils/componentLifecycleManager', () => {
  const originalModule = jest.requireActual('@/utils/componentLifecycleManager');
  
  return {
    ...originalModule,
    useComponentLifecycle: jest.fn().mockImplementation((componentId) => {
      const cleanupFns: Record<string, () => void> = {};
      
      return {
        registerCleanup: jest.fn((key, fn) => {
          cleanupFns[key] = fn;
        }),
        executeCleanup: jest.fn((key) => {
          if (cleanupFns[key]) {
            cleanupFns[key]();
          }
        }),
        executeAllCleanup: jest.fn(() => {
          Object.values(cleanupFns).forEach(fn => fn());
        }),
        isComponentMounted: jest.fn().mockReturnValue(true),
        createSafeStateSetter: jest.fn((setter) => setter),
        createSafeAsyncOperation: jest.fn((fn) => fn)
      };
    })
  };
});

// Mock error logger
jest.mock('@/services/errorLogger', () => ({
  errorLogger: {
    logError: jest.fn(),
    logSuccess: jest.fn()
  },
  logError: jest.fn(),
  logSuccess: jest.fn(),
  ErrorCategory: {
    COMPONENT: 'component'
  },
  ErrorSeverity: {
    HIGH: 'high'
  }
}));

// Mock local storage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Component Lifecycle Error Handling Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.mockMapLoadError = false;
    
    // Mock environment variable
    process.env.VITE_MAPBOX_ACCESS_TOKEN = 'pk.test123';
    
    // Set up mock cached data
    localStorage.setItem('mapboxFieldMapData', JSON.stringify({
      snapshot: 'data:image/png;base64,test',
      boundary: {
        type: 'polygon',
        coordinates: [
          { lat: 1, lng: 1 },
          { lat: 2, lng: 2 },
          { lat: 3, lng: 3 }
        ]
      }
    }));
  });
  
  describe('MapboxFieldMap Component', () => {
    test('handles safe component mounting and unmounting', async () => {
      // Render component
      const { unmount } = render(
        <ErrorBoundary>
          <MapboxFieldMap />
        </ErrorBoundary>
      );
      
      // Wait for map to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Verify component lifecycle hooks were used
      expect(useComponentLifecycle).toHaveBeenCalled();
      
      // Unmount component
      unmount();
      
      // Verify cleanup was executed
      const lifecycle = useComponentLifecycle('test');
      expect(lifecycle.executeAllCleanup).toHaveBeenCalled();
    });
    
    test('handles map initialization errors gracefully', async () => {
      // Mock map load error
      global.mockMapLoadError = true;
      
      // Mock mapboxgl.Map to throw error
      const mockMap = require('mapbox-gl').Map;
      mockMap.mockImplementationOnce(() => {
        throw new Error('Map initialization failed');
      });
      
      // Render component with error boundary
      render(
        <ErrorBoundary fallback={MapFallback}>
          <MapboxFieldMap />
        </ErrorBoundary>
      );
      
      // Wait for error boundary to catch error
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Verify error fallback is displayed
      expect(screen.getByText('Map Unavailable')).toBeInTheDocument();
      
      // Verify error was logged
      expect(errorLogger.logError).toHaveBeenCalled();
    });
    
    test('uses cached data when offline', async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
      
      // Render component
      render(
        <ErrorBoundary>
          <MapboxFieldMap />
        </ErrorBoundary>
      );
      
      // Wait for component to render
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Verify offline mode message is displayed
      expect(screen.getByText(/Offline mode/i)).toBeInTheDocument();
      
      // Restore navigator.onLine
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    });
    
    test('handles null safety during cleanup', async () => {
      // Render component
      const { unmount } = render(
        <ErrorBoundary>
          <MapboxFieldMap />
        </ErrorBoundary>
      );
      
      // Wait for map to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Mock map instance to be null before unmount
      const mapboxgl = require('mapbox-gl');
      const mockMap = mapboxgl.Map.mock.results[0].value;
      mockMap.getContainer.mockReturnValueOnce(null);
      
      // Unmount component - this should not throw despite null container
      expect(() => unmount()).not.toThrow();
    });
  });
  
  describe('Error Boundary Integration', () => {
    // Component that throws error during render
    const RenderErrorComponent = () => {
      throw new Error('Render error');
    };
    
    // Component that throws error during effect
    const EffectErrorComponent = () => {
      React.useEffect(() => {
        throw new Error('Effect error');
      }, []);
      
      return <div>Effect component</div>;
    };
    
    // Component that throws error during event handler
    const EventErrorComponent = () => {
      const handleClick = () => {
        throw new Error('Event error');
      };
      
      return <button onClick={handleClick} data-testid="error-button">Trigger Error</button>;
    };
    
    test('catches render errors and displays fallback UI', () => {
      render(
        <ErrorBoundary>
          <RenderErrorComponent />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
    
    test('catches effect errors and displays fallback UI', async () => {
      render(
        <ErrorBoundary>
          <EffectErrorComponent />
        </ErrorBoundary>
      );
      
      // Wait for effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
    
    test('catches event handler errors and displays fallback UI', async () => {
      render(
        <ErrorBoundary>
          <EventErrorComponent />
        </ErrorBoundary>
      );
      
      // Trigger error
      fireEvent.click(screen.getByTestId('error-button'));
      
      // Wait for error boundary to update
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
    
    test('isolates errors to prevent them from bubbling up', () => {
      render(
        <ErrorBoundary>
          <div>
            <ErrorBoundary isolate={true}>
              <RenderErrorComponent />
            </ErrorBoundary>
            <div data-testid="sibling">Sibling Component</div>
          </div>
        </ErrorBoundary>
      );
      
      // Sibling component should still be rendered
      expect(screen.getByTestId('sibling')).toBeInTheDocument();
    });
  });
});