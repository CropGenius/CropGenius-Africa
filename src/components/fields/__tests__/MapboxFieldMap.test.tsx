import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import MapboxFieldMap from '../MapboxFieldMap';

// Mock mapbox-gl
vi.mock('mapbox-gl', () => ({
  default: {
    accessToken: '',
    Map: vi.fn(),
    Marker: vi.fn(),
    NavigationControl: vi.fn(),
    ScaleControl: vi.fn(),
    GeolocateControl: vi.fn(),
    LngLatBounds: vi.fn(),
  },
}));

// Mock Mapbox SDK
vi.mock('@mapbox/mapbox-sdk', () => ({ default: vi.fn() }));
vi.mock('@mapbox/mapbox-sdk/services/geocoding', () => ({ default: vi.fn() }));

// Mock hooks
vi.mock('@/hooks/use-error-logging', () => ({
  useErrorLogging: () => ({ logError: vi.fn(), logSuccess: vi.fn() }),
}));

vi.mock('@/hooks/use-local-storage', () => ({
  useLocalStorage: () => [{}, vi.fn()],
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

// Mock components
vi.mock('../MapNavigator', () => ({ default: () => <div data-testid="map-navigator" /> }));
vi.mock('@/components/error/ErrorBoundary', () => ({
  default: ({ children }: any) => <div data-testid="error-boundary">{children}</div>,
}));

describe('MapboxFieldMap Component', () => {
  const mockProps = {
    onBoundaryChange: vi.fn(),
    onLocationChange: vi.fn(),
    onMapLoaded: vi.fn(),
    onMapError: vi.fn(),
  };

  it('should render MapboxFieldMap component', () => {
    render(<MapboxFieldMap {...mockProps} />);
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('should show map navigator in non-readonly mode', () => {
    render(<MapboxFieldMap {...mockProps} />);
    expect(screen.getByTestId('map-navigator')).toBeInTheDocument();
  });

  it('should not show map navigator in readonly mode', () => {
    render(<MapboxFieldMap {...mockProps} readOnly={true} />);
    expect(screen.queryByTestId('map-navigator')).not.toBeInTheDocument();
  });
});