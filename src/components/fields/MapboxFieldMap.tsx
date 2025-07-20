import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Coordinates, Boundary } from "@/types/field";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Undo, MapPin, Navigation, AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { toast } from "sonner";
import MapboxSDK from "@mapbox/mapbox-sdk";
import MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { useErrorLogging } from "@/hooks/use-error-logging";
import MapNavigator from "./MapNavigator";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { 
  safeCleanup, 
  safeMapOperation, 
  safeCleanupMapInstance, 
  safeCleanupMarker,
  safeCleanupSource,
  safeCleanupLayer,
  safeCleanupControl,
  safeCleanupEventListener,
  MapResourceTracker 
} from "@/utils/mapboxCleanupUtils";

// Use environment variable for access token with PRODUCTION-READY validation
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

// INFINITY IQ token validation - handles ALL edge cases
const isValidMapboxToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;
  
  // Mapbox public tokens start with 'pk.' and are JWT format
  if (token.startsWith('pk.')) {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3 && token.length > 50;
  }
  
  // Mapbox secret tokens start with 'sk.'
  if (token.startsWith('sk.')) {
    const parts = token.split('.');
    return parts.length === 3 && token.length > 50;
  }
  
  return false;
};

// PRODUCTION-READY token configuration with fallback
if (MAPBOX_ACCESS_TOKEN && isValidMapboxToken(MAPBOX_ACCESS_TOKEN)) {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
  console.log("🚀 [MapboxFieldMap] INFINITY-LEVEL Mapbox token configured successfully");
} else {
  console.error("💥 [MapboxFieldMap] CRITICAL: Invalid or missing VITE_MAPBOX_ACCESS_TOKEN");
  console.error("🔧 Token format should be: pk.eyJ... (public) or sk.eyJ... (secret)");
  console.error("📋 Current token:", MAPBOX_ACCESS_TOKEN ? `${MAPBOX_ACCESS_TOKEN.substring(0, 20)}...` : 'MISSING');
}

interface MapboxFieldMapProps {
  initialBoundary?: Boundary | null;
  onBoundaryChange?: (boundary: Boundary) => void;
  onLocationChange?: (location: Coordinates) => void;
  readOnly?: boolean;
  defaultLocation?: Coordinates;
  isSaving?: boolean;
  onMapLoaded?: (loaded: boolean) => void;
  onMapError?: (error: string | null) => void;
}

export default function MapboxFieldMap({
  initialBoundary,
  onBoundaryChange,
  onLocationChange,
  readOnly = false,
  defaultLocation,
  isSaving = false,
  onMapLoaded,
  onMapError
}: MapboxFieldMapProps) {
  const { logError, logSuccess } = useErrorLogging('MapboxFieldMap');
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  // 🚀 INFINITY IQ Resource Tracking - tracks ALL map resources
  const resourceTracker = useRef<MapResourceTracker>(new MapResourceTracker());
  const geocodingClient = useRef<any>(null);
  const drawMarkers = useRef<mapboxgl.Marker[]>([]);
  const locationMarker = useRef<mapboxgl.Marker | null>(null);
  
  // 🚀 INFINITY IQ Map State Management
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapDestroyed, setMapDestroyed] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates[]>(initialBoundary?.coordinates || []);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [mapSnapshot, setMapSnapshot] = useState<string | null>(null);
  const [isCapturingSnapshot, setIsCapturingSnapshot] = useState(false);

  // Local storage for caching map data
  const [cachedMapData, setCachedMapData] = useLocalStorage<{
    snapshot?: string;
    boundary?: Boundary;
    location?: { name: string; coordinates: Coordinates };
  }>('mapboxFieldMapData', {});

  // Update parent component with map status
  useEffect(() => {
    if (onMapLoaded) {
      onMapLoaded(mapLoaded);
    }
  }, [mapLoaded, onMapLoaded]);

  // Update parent component with map errors
  useEffect(() => {
    if (onMapError) {
      onMapError(mapError);
    }
  }, [mapError, onMapError]);

  // 🚀 INFINITY IQ Draw field polygon with DEFENSIVE resource tracking
  const drawFieldPolygon = useCallback((mapInstance: mapboxgl.Map, coords: Coordinates[]) => {
    if (!mapInstance || coords.length < 3) return;

    const success = safeMapOperation(mapInstance, (map) => {
      // Clear existing polygon safely
      safeCleanupLayer(map, 'field-polygon-outline');
      safeCleanupLayer(map, 'field-polygon');
      safeCleanupSource(map, 'field-polygon');

      // Add new polygon
      const polygonCoords = [...coords, coords[0]].map(coord => [coord.lng, coord.lat]);

      map.addSource('field-polygon', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [polygonCoords]
          }
        }
      });

      map.addLayer({
        id: 'field-polygon',
        type: 'fill',
        source: 'field-polygon',
        paint: {
          'fill-color': '#4CAF50',
          'fill-opacity': 0.3
        }
      });

      map.addLayer({
        id: 'field-polygon-outline',
        type: 'line',
        source: 'field-polygon',
        paint: {
          'line-color': '#4CAF50',
          'line-width': 2
        }
      });

      // Track resources for cleanup
      resourceTracker.current.addSource('field-polygon');
      resourceTracker.current.addLayer('field-polygon');
      resourceTracker.current.addLayer('field-polygon-outline');
    }, 'drawFieldPolygon');

    if (!success) {
      console.error("❌ [MapboxFieldMap] Failed to draw field polygon");
    }
  }, []);

  // Handle map click for drawing
  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (!isDrawing || readOnly || !map.current) return;

    const newCoord: Coordinates = {
      lat: e.lngLat.lat,
      lng: e.lngLat.lng,
    };

    setCoordinates(prev => {
      const updated = [...prev, newCoord];
      
      try {
        // Add marker for this point
        const marker = new mapboxgl.Marker({ color: '#4CAF50' })
          .setLngLat([newCoord.lng, newCoord.lat])
          .addTo(map.current!);
        
        drawMarkers.current.push(marker);

        // Draw polygon if we have enough points
        if (updated.length >= 3 && map.current) {
          drawFieldPolygon(map.current, updated);
          
          // Notify parent of boundary change
          if (onBoundaryChange && updated.length >= 3) {
            onBoundaryChange({
              type: 'polygon',
              coordinates: updated
            });
          }
        }
      } catch (error) {
        console.error("Error handling map click:", error);
      }

      return updated;
    });
  }, [isDrawing, readOnly, drawFieldPolygon, onBoundaryChange]);

  // Capture map snapshot for offline use
  const captureMapSnapshot = useCallback(() => {
    if (!map.current || isCapturingSnapshot) return;

    setIsCapturingSnapshot(true);
    
    try {
      const canvas = map.current.getCanvas();
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      setMapSnapshot(dataURL);
      
      // Cache the snapshot
      setCachedMapData(prev => ({
        ...prev,
        snapshot: dataURL
      }));
      
      console.log('📸 [MapboxFieldMap] Map snapshot captured');
    } catch (error) {
      console.error('Failed to capture map snapshot:', error);
    } finally {
      setIsCapturingSnapshot(false);
    }
  }, [isCapturingSnapshot, setCachedMapData]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log("🌐 [MapboxFieldMap] Network connection restored");
      setIsOffline(false);
      toast.success("You're back online", {
        description: "Map functionality has been restored"
      });
    };

    const handleOffline = () => {
      console.log("🌐 [MapboxFieldMap] Network connection lost");
      setIsOffline(true);
      toast.warning("You're offline", {
        description: "Limited map functionality available"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize geocoding client
  useEffect(() => {
    if (!MAPBOX_ACCESS_TOKEN || !isValidMapboxToken(MAPBOX_ACCESS_TOKEN)) {
      setMapError("Invalid Mapbox access token. Please check your environment configuration.");
      return;
    }

    try {
      // Only initialize if online and token is valid
      if (!isOffline) {
        const baseClient = MapboxSDK({ accessToken: MAPBOX_ACCESS_TOKEN });
        geocodingClient.current = MapboxGeocoding(baseClient);
        console.log("✅ [MapboxFieldMap] Geocoding client initialized");
      }
    } catch (error) {
      logError(error as Error, { context: 'geocodingClientInit' });
      setMapError("Failed to initialize geocoding client. Please check your token.");
    }
  }, [isOffline, logError]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // If offline and we have a cached snapshot, use cached data
    if (isOffline && cachedMapData.snapshot) {
      console.log("🌐 [MapboxFieldMap] Offline mode - using cached map data");
      setMapLoaded(true);

      // If we have cached coordinates, use them
      if (cachedMapData.boundary?.coordinates?.length > 2) {
        setCoordinates(cachedMapData.boundary.coordinates);
        
        // Notify parent of boundary
        if (onBoundaryChange) {
          onBoundaryChange(cachedMapData.boundary);
        }
      }
      
      // If we have cached location coordinates, notify parent
      if (cachedMapData.location?.coordinates && onLocationChange) {
        onLocationChange(cachedMapData.location.coordinates);
      }

      return;
    }

    if (!MAPBOX_ACCESS_TOKEN || !isValidMapboxToken(MAPBOX_ACCESS_TOKEN)) {
      setMapError("Invalid Mapbox access token. Please check your environment configuration.");
      return;
    }

    // Clean up previous map instance
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      console.log("🗺️ [MapboxFieldMap] Initializing map");

      // Use cached location if available, otherwise use default
      const cachedLocation = cachedMapData.location?.coordinates;
      const defaultCenter: [number, number] = cachedLocation 
        ? [cachedLocation.lng, cachedLocation.lat]
        : defaultLocation 
          ? [defaultLocation.lng, defaultLocation.lat]
          : [20, 5]; // Center of Africa

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: defaultCenter,
        zoom: cachedLocation ? 16 : 4,
        attributionControl: false,
      });

      // Add navigation controls with INFINITY IQ tracking
      const navigationControl = new mapboxgl.NavigationControl({
        visualizePitch: true,
      });
      mapInstance.addControl(navigationControl, "top-right");
      resourceTracker.current.addControl(navigationControl);

      // Add scale control with INFINITY IQ tracking
      const scaleControl = new mapboxgl.ScaleControl({
        maxWidth: 150,
        unit: "metric",
      });
      mapInstance.addControl(scaleControl, "bottom-left");
      resourceTracker.current.addControl(scaleControl);

      // Add geolocation control with INFINITY IQ tracking
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      });
      mapInstance.addControl(geolocateControl, "top-right");
      resourceTracker.current.addControl(geolocateControl);

      // Handle map load event
      mapInstance.on("load", () => {
        console.log("✅ [MapboxFieldMap] Map loaded successfully");
        setMapLoaded(true);
        setMapError(null);

        // Use cached coordinates if available and no coordinates are set
        const coordsToUse = coordinates.length > 0 
          ? coordinates 
          : cachedMapData.boundary?.coordinates || [];

        if (coordsToUse.length > 2) {
          drawFieldPolygon(mapInstance, coordsToUse);
          setCoordinates(coordsToUse);

          // Fit map to boundary
          const bounds = new mapboxgl.LngLatBounds();
          coordsToUse.forEach((coord) => {
            bounds.extend([coord.lng, coord.lat]);
          });

          mapInstance.fitBounds(bounds, {
            padding: 50,
            duration: 1000,
          });
          
          // Notify parent of boundary
          if (onBoundaryChange && coordsToUse.length >= 3) {
            onBoundaryChange({
              type: 'polygon',
              coordinates: coordsToUse
            });
          }
        }

        // Capture snapshot after map has loaded and rendered
        setTimeout(() => {
          captureMapSnapshot();
        }, 2000);
      });

      // Store map instance
      map.current = mapInstance;
      setMapInitialized(true);
      logSuccess('map_initialized', {});

      // Add click handler for drawing with INFINITY IQ error handling
      const clickHandler = (e: mapboxgl.MapMouseEvent) => {
        try {
          handleMapClick(e);
        } catch (error: any) {
          console.error('❌ [MapboxFieldMap] Click handler error:', error);
          // Handle specific errors that shouldn't crash the app
          if (error?.message?.includes('indoor') || 
              error?.message?.includes('Cannot read properties of undefined')) {
            console.log('🔧 [MapboxFieldMap] Ignoring known Mapbox error in click handler');
            return;
          }
          // For other errors, show user feedback but don't crash
          toast.error("Map interaction error", {
            description: "Please try again or refresh the page"
          });
        }
      };
      
      mapInstance.on('click', clickHandler);
      resourceTracker.current.addEventListener('click', clickHandler);

      // 🚀 INFINITY IQ PRODUCTION-READY CLEANUP - handles ALL edge cases
      return () => {
        console.log('🧹 [MapboxFieldMap] Starting INFINITY IQ cleanup process');
        setIsCleaningUp(true);
        
        try {
          // Clean up draw markers with defensive programming
          drawMarkers.current.forEach((marker, index) => {
            safeCleanupMarker(marker);
            resourceTracker.current.addMarker(marker); // Track for comprehensive cleanup
          });
          drawMarkers.current = [];
          
          // Clean up location marker defensively
          if (locationMarker.current) {
            safeCleanupMarker(locationMarker.current);
            locationMarker.current = null;
          }
          
          // Clean up ALL tracked resources before destroying map
          const cleanupResult = resourceTracker.current.cleanupAllResources(mapInstance);
          console.log('🚀 [MapboxFieldMap] Resource cleanup result:', cleanupResult);
          
          // Finally, destroy the map instance with INFINITY IQ safety
          const mapCleanupSuccess = safeCleanupMapInstance(mapInstance);
          if (mapCleanupSuccess) {
            console.log('✅ [MapboxFieldMap] Map instance destroyed successfully');
            setMapDestroyed(true);
          } else {
            console.warn('⚠️ [MapboxFieldMap] Map cleanup had issues but continued safely');
          }
          
        } catch (error: any) {
          console.error('❌ [MapboxFieldMap] Unexpected error during cleanup:', error);
          // Don't throw - this would crash the app during unmount
        } finally {
          setIsCleaningUp(false);
          map.current = null;
        }
      };
    } catch (error) {
      logError(error as Error, { context: 'mapInitialization' });
      setMapError("Failed to load map. Please check your internet connection.");
    }
  }, [defaultLocation, onLocationChange, onBoundaryChange, drawFieldPolygon, captureMapSnapshot, 
      cachedMapData, coordinates, handleMapClick, isOffline, logError, logSuccess]);

  // 🚀 INFINITY IQ Start drawing mode with DEFENSIVE cleanup
  const handleStartDrawing = () => {
    setIsDrawing(true);
    
    // Clear existing markers with DEFENSIVE programming
    drawMarkers.current.forEach(marker => safeCleanupMarker(marker));
    drawMarkers.current = [];
    
    // Clear coordinates
    setCoordinates([]);
    
    // Clear existing polygon with DEFENSIVE operations
    safeMapOperation(map.current, (mapInstance) => {
      safeCleanupLayer(mapInstance, 'field-polygon-outline');
      safeCleanupLayer(mapInstance, 'field-polygon');
      safeCleanupSource(mapInstance, 'field-polygon');
    }, 'clearPolygonForDrawing');
    
    toast.info("Drawing started. Click on the map to add points.");
  };

  // 🚀 INFINITY IQ Undo last point with DEFENSIVE cleanup
  const handleUndo = () => {
    if (coordinates.length === 0) return;
    
    // Remove the last marker with DEFENSIVE programming
    const lastMarker = drawMarkers.current.pop();
    if (lastMarker) {
      safeCleanupMarker(lastMarker);
    }
    
    // Update coordinates
    setCoordinates(coords => {
      const newCoords = coords.slice(0, -1);
      
      // Redraw polygon if we still have enough points
      if (newCoords.length >= 3 && map.current) {
        drawFieldPolygon(map.current, newCoords);
        
        // Notify parent of boundary change
        if (onBoundaryChange && newCoords.length >= 3) {
          onBoundaryChange({
            type: 'polygon',
            coordinates: newCoords
          });
        }
      } else {
        // Remove polygon if not enough points with DEFENSIVE operations
        safeMapOperation(map.current, (mapInstance) => {
          safeCleanupLayer(mapInstance, 'field-polygon-outline');
          safeCleanupLayer(mapInstance, 'field-polygon');
          safeCleanupSource(mapInstance, 'field-polygon');
        }, 'removePolygonOnUndo');
      }
      
      return newCoords;
    });
  };
  
  // Complete drawing
  const handleComplete = () => {
    if (coordinates.length < 3) {
      toast.warning("Please draw at least 3 points.");
      return;
    }
    
    const newBoundary: Boundary = {
      type: "polygon",
      coordinates: coordinates,
    };
    
    setIsDrawing(false);
    
    // Cache the boundary
    setCachedMapData(prev => ({
      ...prev,
      boundary: newBoundary
    }));
    
    // Notify parent of boundary change
    if (onBoundaryChange) {
      onBoundaryChange(newBoundary);
      
      toast.success("Field boundary completed", {
        description: `Field mapped with ${coordinates.length} points`
      });
    }
  };
  
  // Use current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        
        // Update location
        if (onLocationChange) {
          onLocationChange({ lng: longitude, lat: latitude });
        }
        
        // Cache the location
        setCachedMapData(prev => ({
          ...prev,
          location: {
            name: "Current Location",
            coordinates: { lng: longitude, lat: latitude }
          }
        }));
        
        // Fly to location if map is available
        if (map.current) {
          map.current.flyTo({ 
            center: [longitude, latitude], 
            zoom: 16,
            essential: true
          });
          
          // Add marker
          if (locationMarker.current) {
            locationMarker.current.remove();
          }
          
          locationMarker.current = new mapboxgl.Marker({ color: '#4CAF50' })
            .setLngLat([longitude, latitude])
            .addTo(map.current);
        }
        
        toast.success("Location updated", {
          description: "Using your current location"
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Could not get location", { 
          description: error.message || "Permission denied or location unavailable" 
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // If offline and we have a snapshot, show the snapshot instead of the map
  if (isOffline && cachedMapData.snapshot) {
    return (
      <ErrorBoundary fallback={<p>Map failed to load.</p>}>
        <div className="relative w-full h-full min-h-[400px] bg-gray-200">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <img 
              src={cachedMapData.snapshot} 
              alt="Cached map snapshot" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-2 text-xs text-center">
              <WifiOff className="inline-block h-3 w-3 mr-1" />
              Offline mode - using cached map data
            </div>
          </div>
          
          {!readOnly && (
            <div className="absolute top-4 right-4 z-10">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleUseCurrentLocation}
                className="bg-background/80"
              >
                <Navigation className="h-4 w-4 mr-1" />
                Use current location
              </Button>
            </div>
          )}
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary fallback={<p>Map failed to load.</p>}>
      <div ref={mapContainer} className="relative w-full h-full min-h-[400px] bg-gray-200">
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 z-20">
            <div className="bg-background/90 p-4 rounded-lg max-w-xs text-center">
              <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-destructive font-medium mb-2">Map Error</p>
              <p className="text-sm text-muted-foreground mb-4">{mapError}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="mr-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reload
              </Button>
            </div>
          </div>
        )}

        {!readOnly && (
          <div className="absolute top-4 right-4 z-10">
            <MapNavigator 
              onStartDrawing={handleStartDrawing}
              onUseCurrentLocation={handleUseCurrentLocation}
              isDrawing={isDrawing}
            />
          </div>
        )}
        
        {isDrawing && !readOnly && (
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-background/80 p-2 rounded-lg shadow-lg flex items-center gap-2">
             <Button onClick={handleUndo} variant="outline" disabled={coordinates.length === 0 || isSaving}>
               <Undo className="mr-2 h-4 w-4" />
               Undo
             </Button>
             <Button onClick={handleComplete} disabled={coordinates.length < 3 || isSaving}>
               {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
               {isSaving ? 'Saving...' : 'Complete Field'}
             </Button>
           </div>
        )}
        
        {coordinates.length >= 3 && (
          <div className="absolute bottom-2 left-2 bg-background/80 p-1 rounded text-xs">
            <MapPin className="inline-block h-3 w-3 mr-1 text-primary" />
            {coordinates.length} points mapped
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}