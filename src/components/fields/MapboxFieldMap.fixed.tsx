import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Coordinates, Boundary } from "@/types/field";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Undo, MapPin, Navigation, Search, X, AlertTriangle, RefreshCw, WifiOff, Image } from "lucide-react";
import { toast } from "sonner";
import MapboxSDK from "@mapbox/mapbox-sdk";
import MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { useErrorLogging } from "@/hooks/use-error-logging";
import MapSearchInput from "./MapSearchInput";
import MapNavigator from "./MapNavigator";
import FieldConfirmationCard from "./FieldConfirmationCard";
import SmartFieldRecommender from "./SmartFieldRecommender";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { useLocalStorage } from "@/hooks/use-local-storage";

// Use environment variable for access token with fallback and UI error handling
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

// Set the token for mapbox-gl if available
if (MAPBOX_ACCESS_TOKEN) {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
} else {
  console.error("❌ [MapboxFieldMap] VITE_MAPBOX_ACCESS_TOKEN not found in environment variables");
  // We'll handle the missing token in the component rendering
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
  const { logError, logSuccess, trackOperation } = useErrorLogging('MapboxFieldMap');
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  // Add missing refs that are used in the component
  const geocodingClient = useRef<any>(null);
  const drawMarkers = useRef<mapboxgl.Marker[]>([]);
  const locationMarker = useRef<mapboxgl.Marker | null>(null);
  const flyToLocation = useRef<((lng: number, lat: number, zoom?: number) => void) | null>(null);
  const markerPulse = useRef<HTMLElement | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates[]>(initialBoundary?.coordinates || []);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>("");
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

  // Add missing functions that are referenced in the component
  const drawFieldPolygon = useCallback((mapInstance: mapboxgl.Map, coords: Coordinates[]) => {
    if (!mapInstance || coords.length < 3) return;

    // Clear existing polygon
    if (mapInstance.getSource('field-polygon')) {
      mapInstance.removeLayer('field-polygon');
      mapInstance.removeSource('field-polygon');
    }

    // Add new polygon
    const polygonCoords = [...coords, coords[0]].map(coord => [coord.lng, coord.lat]);

    mapInstance.addSource('field-polygon', {
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

    mapInstance.addLayer({
      id: 'field-polygon',
      type: 'fill',
      source: 'field-polygon',
      paint: {
        'fill-color': '#4CAF50',
        'fill-opacity': 0.3
      }
    });

    mapInstance.addLayer({
      id: 'field-polygon-outline',
      type: 'line',
      source: 'field-polygon',
      paint: {
        'line-color': '#4CAF50',
        'line-width': 2
      }
    });
  }, []);

  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (!isDrawing || readOnly) return;

    const newCoord: Coordinates = {
      lat: e.lngLat.lat,
      lng: e.lngLat.lng,
    };

    setCoordinates(prev => {
      const updated = [...prev, newCoord];
      
      // Add marker for this point
      const marker = new mapboxgl.Marker({ color: '#4CAF50' })
        .setLngLat([newCoord.lng, newCoord.lat])
        .addTo(map.current!);
      
      drawMarkers.current.push(marker);

      // Draw polygon if we have enough points
      if (updated.length >= 3 && map.current) {
        drawFieldPolygon(map.current, updated);
      }

      return updated;
    });
  }, [isDrawing, readOnly, drawFieldPolygon]);

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
    if (!MAPBOX_ACCESS_TOKEN) {
      setMapError("Missing Mapbox access token. Please check your environment configuration.");
      toast.error("Map configuration error", {
        description: "Map loading failed – check your internet or configuration"
      });
      return;
    }

    try {
      // Only initialize if online
      if (!isOffline) {
        const baseClient = MapboxSDK({ accessToken: MAPBOX_ACCESS_TOKEN });
        geocodingClient.current = MapboxGeocoding(baseClient);
        console.log("✅ [MapboxFieldMap] Geocoding client initialized");
      }
    } catch (error) {
      logError(error as Error, { context: 'geocodingClientInit' });
      setMapError("Failed to initialize geocoding client");
    }
  }, [isOffline]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // If offline and we have a cached snapshot, don't try to initialize the map
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

      // If we have cached location name, use it
      if (cachedMapData.location?.name) {
        setLocationName(cachedMapData.location.name);
      }
      
      // If we have cached location coordinates, notify parent
      if (cachedMapData.location?.coordinates && onLocationChange) {
        onLocationChange(cachedMapData.location.coordinates);
      }

      return;
    }

    if (!MAPBOX_ACCESS_TOKEN) {
      setMapError("Missing Mapbox access token. Please check your environment configuration.");
      return;
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

      mapInstance.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        "top-right"
      );

      mapInstance.addControl(
        new mapboxgl.ScaleControl({
          maxWidth: 150,
          unit: "metric",
        }),
        "bottom-left"
      );

      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      });
      mapInstance.addControl(geolocateControl, "top-right");

      flyToLocation.current = (lng: number, lat: number, zoom: number = 16) => {
        if (!map.current) return;

        console.log(`🚀 [MapboxFieldMap] Flying to: ${lng}, ${lat}, zoom: ${zoom}`);

        map.current.flyTo({
          center: [lng, lat],
          essential: true,
          zoom: zoom,
          duration: 2000,
          pitch: 60,
          bearing: Math.random() * 180 - 90,
          easing: (t) => {
            return t * (2 - t);
          }
        });

        if (locationMarker.current) {
          locationMarker.current.remove();
        }

        const el = document.createElement('div');
        el.className = 'location-marker';
        el.innerHTML = `
          <div class="location-marker-inner"></div>
          <div class="location-marker-pulse"></div>
        `;

        const style = document.createElement('style');
        style.innerHTML = `
          .location-marker {
            width: 24px;
            height: 24px;
            position: relative;
          }
          .location-marker-inner {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background-color: #4CAF50;
            border: 2px solid white;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            position: absolute;
            top: 5px;
            left: 5px;
          }
          .location-marker-pulse {
            width: 40px;
            height: 40px;
            background: rgba(76, 175, 80, 0.4);
            border-radius: 50%;
            position: absolute;
            top: -8px;
            left: -8px;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% {
              transform: scale(0.5);
              opacity: 1;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);

        locationMarker.current = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map.current);

        markerPulse.current = el;

        if (onLocationChange) {
          onLocationChange({ lng, lat });
        }
      };

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
        // Use a timeout to ensure the map has fully rendered
        setTimeout(() => {
          captureMapSnapshot();
        }, 2000);

        // Set up periodic snapshot capture (every 30 seconds when map changes)
        let lastMoveTime = Date.now();
        mapInstance.on('moveend', () => {
          // Only capture snapshot if it's been more than 30 seconds since the last one
          // and the user has stopped moving the map
          const now = Date.now();
          if (now - lastMoveTime > 30000) {
            captureMapSnapshot();
          }
          lastMoveTime = now;
        });
      });

      map.current = mapInstance;
      logSuccess('map_initialized');

      mapInstance.on('click', (e) => {
        if (isDrawing && !readOnly) {
          handleMapClick(e);
        }
      });

      return () => {
        drawMarkers.current.forEach(marker => marker.remove());
        if (locationMarker.current) locationMarker.current.remove();
        mapInstance.remove();
      };
    } catch (error) {
      logError(error as Error, { context: 'mapInitialization' });
      setMapError("Failed to load map. Please check your internet connection.");
    }
  }, [defaultLocation, onLocationChange]);

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setCoordinates([]);
    
    // Clear existing markers
    drawMarkers.current.forEach(marker => marker.remove());
    drawMarkers.current = [];
    
    // Clear existing polygon if any
    if (map.current && map.current.getSource('field-polygon')) {
      map.current.removeLayer('field-polygon');
      map.current.removeLayer('field-polygon-outline');
      map.current.removeSource('field-polygon');
    }
    
    toast.info("Drawing started. Click on the map to add points.");
  };

  const handleUndo = () => {
    if (coordinates.length === 0) return;
    
    // Remove the last marker
    const lastMarker = drawMarkers.current.pop();
    if (lastMarker) lastMarker.remove();
    
    // Update coordinates
    setCoordinates(coords => {
      const newCoords = coords.slice(0, -1);
      
      // Redraw polygon if we still have enough points
      if (newCoords.length >= 3 && map.current) {
        drawFieldPolygon(map.current, newCoords);
      } else if (map.current && map.current.getSource('field-polygon')) {
        // Remove polygon if not enough points
        map.current.removeLayer('field-polygon');
        map.current.removeLayer('field-polygon-outline');
        map.current.removeSource('field-polygon');
      }
      
      return newCoords;
    });
  };
  
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
    
    if (onBoundaryChange) onBoundaryChange(newBoundary);
    
    toast.success("Field boundary completed", {
      description: `Field mapped with ${coordinates.length} points`
    });
  };
  
  const handleUseCurrentLocation = () => {
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
          map.current.flyTo({ center: [longitude, latitude], zoom: 16 });
          
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
      (error) => toast.error("Could not get location", { description: error.message })
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
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => {
                  if (onMapError) onMapError(null);
                  setMapError(null);
                }}
              >
                <X className="h-3 w-3 mr-1" />
                Dismiss
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
      </div>
    </ErrorBoundary>
  );
}