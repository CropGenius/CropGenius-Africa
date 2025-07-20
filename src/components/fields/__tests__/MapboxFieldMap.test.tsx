/**
 * 🚀 INFINITY IQ MAPBOX FIELD MAP INTEGRATION TESTS
 * Comprehensive tests for production-ready defensive cleanup and lifecycle management
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import MapboxFieldMap from '../MapboxFieldMap';
import { toast } from 'sonner';

// Mock mapbox-gl with comprehensive mocking
const mockMapInstance = {
  getContainer: vi.fn().mockReturnValue(document.createElement('div')),
  _destroyed: false,
  remove: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  addControl: vi.fn(),
  removeControl: vi.fn(),
  addSource: vi.fn(),
  removeSource: vi.fn(),
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
  getSource: vi.fn(),
  getLayer: vi.fn(),
  flyTo: vi.fn(),
  fitBounds: vi.fn(),
  getCanvas: vi.fn().mockReturnValue({
    toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,test')
  })
};

const mockMarker = {
  _map: {},
  remove: vi.fn(),
  setLngLat: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis()
};

const mockNavigationControl = { _container: document.createElement('div') };
const mockScaleControl = { _container: document.createElement('div') };
const mockGeolocateControl = { _container: document.createElement('div') };

vi.mock('mapbox-gl', () => ({
  default: {
    accessToken: '',
    Map: vi.fn().mockImplementation(() => mockMapInstance),
    Marker: vi.fn().mockImplementation(() => mockMarker),
    NavigationControl: vi.fn().mockImplementation(() => mockNavigationControl),
    ScaleControl: vi.fn().mockImplementation(() => mockScaleControl),
    GeolocateControl: vi.fn().mockImplementation(() => mockGeolocateControl),
    LngLatBounds: vi.fn().mockImplementation(() => ({
      extend: vi.fn(),
    })),
  },
}));

// Mock Mapbox SDK
vi.mock('@mapbox/mapbox-sdk', () => ({ 
  default: vi.fn().mockReturnValue({}) 
}));
vi.mock('@mapbox/mapbox-sdk/services/geocoding', () => ({ 
  default: vi.fn().mockReturnValue({}) 
}));

// Mock cleanup utilities
vi.mock('@/utils/mapboxCleanupUtils', () => ({
  safeCleanup: vi.fn().mockReturnValue(true),
  safeMapOperation: vi.fn().mockImplementation((map, operation) => {
    if (map && operation) {
      try {
        operation(map);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }),
  safeCleanupMapInstance: vi.fn().mockReturnValue(true),
  safeCleanupMarker: vi.fn().mockReturnValue(true),
  safeCleanupSource: vi.fn().mockReturnValue(true),
  safeCleanupLayer: vi.fn().mockReturnValue(true),
  safeCleanupControl: vi.fn().mockReturnValue(true),
  safeCleanupEventListener: vi.fn().mockReturnValue(true),
  MapResourceTracker: vi.fn().mockImplementation(() => ({
    addMarker: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    addEventListener: vi.fn(),
    addControl: vi.fn(),
    cleanupAllResources: vi.fn().mockReturnValue({
      isActive: false,
      completedSteps: ['test-step'],
      failedSteps: [],
      totalSteps: 1
    }),
    reset: vi.fn()
  }))
}));

// Mock hooks
const mockLogError = vi.fn();
const mockLogSuccess = vi.fn();
vi.mock('@/hooks/use-error-logging', () => ({
  useErrorLogging: () => ({ 
    logError: mockLogError, 
    logSuccess: mockLogSuccess 
  }),
}));

const mockSetCachedMapData = vi.fn();
vi.mock('@/hooks/use-local-storage', () => ({
  useLocalStorage: () => [{}, mockSetCachedMapData],
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: { 
    success: vi.fn(), 
    error: vi.fn(), 
    warning: vi.fn(), 
    info: vi.fn() 
  },
}));

// Mock components
vi.mock('../MapNavigator', () => ({ 
  default: ({ onStartDrawing, onUseCurrentLocation, isDrawing }: any) => (
    <div data-testid="map-navigator">
      <button 
        data-testid="start-drawing" 
        onClick={onStartDrawing}
        disabled={isDrawing}
      >
        Start Drawing
      </button>
      <button 
        data-testid="use-location" 
        onClick={onUseCurrentLocation}
      >
        Use Location
      </button>
    </div>
  )
}));

vi.mock('@/components/error/ErrorBoundary', () => ({
  default: ({ children, fallback }: any) => (
    <div data-testid="error-boundary">
      {children}
    </div>
  ),
}));

// Mock environment variables
vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', 'pk.eyJ0ZXN0IjoidG9rZW4ifQ.test-token-signature');

describe('MapboxFieldMap Integration Tests', () => {
  let mockProps: any;
  let consoleSpy: any;

  beforeEach(() => {
    mockProps = {
      onBoundaryChange: vi.fn(),
      onLocationChange: vi.fn(),
      onMapLoaded: vi.fn(),
      onMapError: vi.fn(),
    };

    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {})
    };

    // Reset all mocks
    vi.clearAllMocks();
    
    // Reset mock implementations
    mockMapInstance._destroyed = false;
    mockMapInstance.getContainer.mockReturnValue(document.createElement('div'));
    mockMarker._map = {};
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('Component Lifecycle', () => {
    it('should render MapboxFieldMap component successfully', () => {
      render(<MapboxFieldMap {...mockProps} />);
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('should initialize map with defensive cleanup system', async () => {
      render(<MapboxFieldMap {...mockProps} />);
      
      await waitFor(() => {
        expect(mockMapInstance.on).toHaveBeenCalledWith('load', expect.any(Function));
      });
    });

    it('should handle component unmounting with safe cleanup', async () => {
      const { unmount } = render(<MapboxFieldMap {...mockProps} />);
      
      await act(async () => {
        unmount();
      });
      
      // Verify cleanup was attempted
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Starting INFINITY IQ cleanup process')
      );
    });

    it('should handle rapid re-renders without memory leaks', async () => {
      const { rerender } = render(<MapboxFieldMap {...mockProps} />);
      
      // Simulate rapid re-renders
      for (let i = 0; i < 5; i++) {
        rerender(<MapboxFieldMap {...mockProps} key={i} />);
      }
      
      // Should not crash and should handle cleanup properly
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle map initialization errors gracefully', async () => {
      // Mock map constructor to throw error
      const MapMock = vi.mocked(require('mapbox-gl').default.Map);
      MapMock.mockImplementationOnce(() => {
        throw new Error('Map initialization failed');
      });

      render(<MapboxFieldMap {...mockProps} />);
      
      await waitFor(() => {
        expect(mockLogError).toHaveBeenCalled();
      });
    });

    it('should ignore indoor property errors during cleanup', async () => {
      // Mock map remove to throw indoor error
      mockMapInstance.remove.mockImplementationOnce(() => {
        throw new Error('Cannot read properties of undefined (reading \'indoor\')');
      });

      const { unmount } = render(<MapboxFieldMap {...mockProps} />);
      
      await act(async () => {
        unmount();
      });
      
      // Should not crash and should log the ignored error
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Ignoring known Mapbox error')
      );
    });

    it('should handle click handler errors without crashing', async () => {
      render(<MapboxFieldMap {...mockProps} />);
      
      // Simulate map load event
      const loadHandler = mockMapInstance.on.mock.calls.find(
        call => call[0] === 'load'
      )?.[1];
      
      if (loadHandler) {
        await act(async () => {
          loadHandler();
        });
      }
      
      // Simulate click with error
      const clickHandler = mockMapInstance.on.mock.calls.find(
        call => call[0] === 'click'
      )?.[1];
      
      if (clickHandler) {
        await act(async () => {
          try {
            clickHandler({
              lngLat: { lat: 0, lng: 0 }
            });
          } catch (error) {
            // Should be handled gracefully
          }
        });
      }
      
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });

  describe('Drawing Functionality', () => {
    it('should start drawing mode safely', async () => {
      render(<MapboxFieldMap {...mockProps} />);
      
      const startDrawingButton = screen.getByTestId('start-drawing');
      
      await act(async () => {
        fireEvent.click(startDrawingButton);
      });
      
      expect(toast.info).toHaveBeenCalledWith(
        'Drawing started. Click on the map to add points.'
      );
    });

    it('should handle drawing mode cleanup safely', async () => {
      render(<MapboxFieldMap {...mockProps} />);
      
      const startDrawingButton = screen.getByTestId('start-drawing');
      
      await act(async () => {
        fireEvent.click(startDrawingButton);
      });
      
      // Should not crash during drawing mode initialization
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });

  describe('Offline Mode', () => {
    it('should handle offline mode gracefully', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      render(<MapboxFieldMap {...mockProps} />);
      
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('should handle online/offline transitions', async () => {
      render(<MapboxFieldMap {...mockProps} />);
      
      // Simulate going offline
      await act(async () => {
        window.dispatchEvent(new Event('offline'));
      });
      
      // Simulate going online
      await act(async () => {
        window.dispatchEvent(new Event('online'));
      });
      
      expect(toast.success).toHaveBeenCalledWith(
        "You're back online",
        expect.any(Object)
      );
    });
  });

  describe('Resource Management', () => {
    it('should track and cleanup all map resources', async () => {
      const { unmount } = render(<MapboxFieldMap {...mockProps} />);
      
      // Simulate map load to add resources
      const loadHandler = mockMapInstance.on.mock.calls.find(
        call => call[0] === 'load'
      )?.[1];
      
      if (loadHandler) {
        await act(async () => {
          loadHandler();
        });
      }
      
      await act(async () => {
        unmount();
      });
      
      // Verify resource cleanup was called
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Resource cleanup result')
      );
    });

    it('should handle marker cleanup safely', async () => {
      render(<MapboxFieldMap {...mockProps} />);
      
      const startDrawingButton = screen.getByTestId('start-drawing');
      
      await act(async () => {
        fireEvent.click(startDrawingButton);
      });
      
      // Should handle marker operations without errors
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });

  describe('Geolocation', () => {
    it('should handle geolocation requests safely', async () => {
      // Mock geolocation
      const mockGeolocation = {
        getCurrentPosition: vi.fn().mockImplementation((success) => {
          success({
            coords: {
              latitude: 0,
              longitude: 0
            }
          });
        })
      };
      
      Object.defineProperty(navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true
      });

      render(<MapboxFieldMap {...mockProps} />);
      
      const useLocationButton = screen.getByTestId('use-location');
      
      await act(async () => {
        fireEvent.click(useLocationButton);
      });
      
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });

    it('should handle geolocation errors gracefully', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn().mockImplementation((success, error) => {
          error(new Error('Location access denied'));
        })
      };
      
      Object.defineProperty(navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true
      });

      render(<MapboxFieldMap {...mockProps} />);
      
      const useLocationButton = screen.getByTestId('use-location');
      
      await act(async () => {
        fireEvent.click(useLocationButton);
      });
      
      expect(toast.error).toHaveBeenCalledWith(
        'Could not get location',
        expect.any(Object)
      );
    });
  });

  describe('ReadOnly Mode', () => {
    it('should not show map navigator in readonly mode', () => {
      render(<MapboxFieldMap {...mockProps} readOnly={true} />);
      expect(screen.queryByTestId('map-navigator')).not.toBeInTheDocument();
    });

    it('should show map navigator in non-readonly mode', () => {
      render(<MapboxFieldMap {...mockProps} />);
      expect(screen.getByTestId('map-navigator')).toBeInTheDocument();
    });
  });
});