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
}

export default function MapboxFieldMap({
  initialBoundary,
  onBoundaryChange,
  onLocationChange,
  readOnly = false,
  defaultLocation
}: MapboxFieldMapProps) {
  const { logError, logSuccess, trackOperation } = useErrorLogging('MapboxFieldMap');
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates[]>(initialBoundary?.coordinates || []);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [searchResults, setSearchResults] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [showRecommender, setShowRecommender] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [mapSnapshot, setMapSnapshot] = useState<string | null>(null);
  const [isCapturingSnapshot, setIsCapturingSnapshot] = useState(false);

  // Local storage for caching map data
  const [cachedMapData, setCachedMapData] = useLocalStorage<{
    boundary?: Boundary;
    location?: { name: string; coordinates: Coordinates };
    snapshot?: string;
    lastUpdated?: number;
  }>('mapbox-field-map-cache', {});

  const geocodingClient = useRef<any>(null);
  const drawMarkers = useRef<mapboxgl.Marker[]>([]);
  const areaPolygon = useRef<any>(null);
  const flyToLocation = useRef<(lng: number, lat: number, zoom: number) => void>();
  const locationMarker = useRef<mapboxgl.Marker | null>(null);
  const markerPulse = useRef<HTMLDivElement | null>(null);

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

  // Function to capture map snapshot for offline use
  const captureMapSnapshot = useCallback(() => {
    if (!map.current || isCapturingSnapshot) return;

    try {
      console.log("📸 [MapboxFieldMap] Capturing map snapshot for offline use");
      setIsCapturingSnapshot(true);

      // Use setTimeout to ensure the map has rendered completely
      setTimeout(() => {
        if (!map.current) {
          setIsCapturingSnapshot(false);
          return;
        }

        // Get canvas element and convert to base64 image
        const canvas = map.current.getCanvas();
        const snapshot = canvas.toDataURL('image/jpeg', 0.7); // Use JPEG with 70% quality for smaller size

        setMapSnapshot(snapshot);

        // Save to cache
        setCachedMapData(prev => ({
          ...prev,
          snapshot,
          lastUpdated: Date.now(),
          boundary: coordinates.length > 2 ? { type: 'polygon', coordinates } : prev.boundary,
          location: locationName ? {
            name: locationName,
            coordinates: { 
              lng: map.current.getCenter().lng,
              lat: map.current.getCenter().lat
            }
          } : prev.location
        }));

        console.log("✅ [MapboxFieldMap] Map snapshot captured and cached");
        setIsCapturingSnapshot(false);
      }, 500);
    } catch (error) {
      console.error("❌ [MapboxFieldMap] Failed to capture snapshot:", error);
      setIsCapturingSnapshot(false);
      logError(error as Error, { context: 'captureSnapshot' });
    }
  }, [coordinates, locationName, isCapturingSnapshot, setCachedMapData, logError]);

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
      }

      // If we have cached location name, use it
      if (cachedMapData.location?.name) {
        setLocationName(cachedMapData.location.name);
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

        // Also capture snapshot when field boundary changes
        if (onBoundaryChange) {
          const originalOnBoundaryChange = onBoundaryChange;
          onBoundaryChange = (boundary: Boundary) => {
            originalOnBoundaryChange(boundary);
            // Capture snapshot after a short delay to ensure the boundary is rendered
            setTimeout(() => {
              captureMapSnapshot();
            }, 500);
          };
        }
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

  const handleSearch = trackOperation('searchLocation', async (searchInput: string) => {
    if (!searchInput.trim()) {
      toast.warning("Please enter a search term");
      return;
    }

    // Check if offline
    if (isOffline) {
      toast.warning("Search unavailable offline", { 
        description: "Location search requires an internet connection" 
      });
      return;
    }

    // Check if geocoding client is available
    if (!geocodingClient.current) {
      toast.error("Search service unavailable", { 
        description: "Please check your connection and try again" 
      });
      return;
    }

    setIsSearching(true);
    console.log("🔍 [MapboxFieldMap] Searching for:", searchInput);

    try {
      const response = await geocodingClient.current
        .forwardGeocode({
          query: searchInput,
          limit: 1,
          countries: ["ng", "gh", "ke", "za", "et", "tz", "ug", "rw"],
        })
        .send();

      const features = response.body.features;
      if (features && features.length > 0) {
        const [lng, lat] = features[0].center;
        const placeName = features[0].place_name;

        console.log("✅ [MapboxFieldMap] Location found:", placeName, lng, lat);
        setLocationName(placeName);
        setSearchResults({ name: placeName, lat, lng });

        // Cache the search result
        setCachedMapData(prev => ({
          ...prev,
          location: {
            name: placeName,
            coordinates: { lng, lat }
          },
          lastUpdated: Date.now()
        }));

        toast.success("Location found!", { 
          description: placeName,
          action: {
            label: "View",
            onClick: () => {
              if (flyToLocation.current) {
                flyToLocation.current(lng, lat, 16);
              }
            }
          }
        });

        if (flyToLocation.current) {
          flyToLocation.current(lng, lat, 16);
        }

        if (onLocationChange) {
          onLocationChange({ lng, lat });
        }

        // Capture a snapshot after location change
        setTimeout(() => {
          captureMapSnapshot();
        }, 2000);
      } else {
        console.error("❌ [MapboxFieldMap] No location found for:", searchInput);
        toast.warning("No location found", { description: "Try a different search term or be more specific" });
      }
    } catch (error: any) {
      const errorMessage = error.message || "Search failed";
      console.error("❌ [MapboxFieldMap] Geocoding error:", errorMessage);
      logError(error, { context: 'geocoding' });

      // Check if error is due to network connectivity
      if (!navigator.onLine || errorMessage.includes('network') || errorMessage.includes('connect')) {
        setIsOffline(true);
        toast.error("You're offline", { description: "Search requires an internet connection" });
      } else {
        toast.error("Search failed", { description: "Please check your connection and try again" });
      }
    } finally {
      setIsSearching(false);
    }
  });

  const drawFieldPolygon = (mapInstance: mapboxgl.Map, fieldCoords: Coordinates[]) => {
    try {
      if (mapInstance.getSource('field-polygon')) {
        mapInstance.removeLayer('field-polygon-fill');
        mapInstance.removeLayer('field-polygon-outline');
        mapInstance.removeSource('field-polygon');
      }

      if (fieldCoords.length < 3) return;

      const geojsonCoords = fieldCoords.map(coord => [coord.lng, coord.lat]);

      mapInstance.addSource('field-polygon', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [...geojsonCoords, geojsonCoords[0]]
            ]
          }
        }
      });

      mapInstance.addLayer({
        id: 'field-polygon-fill',
        type: 'fill',
        source: 'field-polygon',
        layout: {},
        paint: {
          'fill-color': '#4CAF50',
          'fill-opacity': 0.3
        }
      });

      mapInstance.addLayer({
        id: 'field-polygon-outline',
        type: 'line',
        source: 'field-polygon',
        layout: {},
        paint: {
          'line-color': '#4CAF50',
          'line-width': 2
        }
      });

      console.log("✅ [MapboxFieldMap] Field polygon drawn with", fieldCoords.length, "points");
    } catch (error) {
      logError(error as Error, { context: 'drawFieldPolygon' });
    }
  };

  const handleStartDrawing = (startPoint?: [number, number]) => {
    if (!map.current || readOnly) return;

    try {
      setIsDrawing(true);
      setCoordinates([]);

      console.log("🖌️ [MapboxFieldMap] Drawing mode activated");

      drawMarkers.current.forEach(marker => marker.remove());
      drawMarkers.current = [];

      if (startPoint) {
        const [lng, lat] = startPoint;
        addPoint(lng, lat);
      }

      toast.info("Drawing mode activated", {
        description: "Click on the map to add points to your field boundary"
      });
    } catch (error) {
      logError(error as Error, { context: 'startDrawing' });
    }
  };

  const addPoint = (lng: number, lat: number) => {
    if (!map.current || !isDrawing || readOnly) return;

    try {
      console.log(`📍 [MapboxFieldMap] Adding point at ${lng}, ${lat}`);
      const newCoords = [...coordinates, { lng, lat }];
      setCoordinates(newCoords);

      const marker = new mapboxgl.Marker({ color: "#FF5722" })
        .setLngLat([lng, lat])
        .addTo(map.current);

      drawMarkers.current.push(marker);

      if (newCoords.length >= 3) {
        drawFieldPolygon(map.current, newCoords);
      }

      if (onBoundaryChange) {
        onBoundaryChange({
          type: 'polygon',
          coordinates: newCoords
        });
      }
    } catch (error) {
      logError(error as Error, { context: 'addPoint' });
    }
  };

  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    if (!isDrawing || readOnly) return;

    try {
      const { lng, lat } = e.lngLat;
      addPoint(lng, lat);
    } catch (error) {
      logError(error as Error, { context: 'mapClick' });
    }
  };

  const handleComplete = () => {
    try {
      if (coordinates.length < 3) {
        toast.warning("Need more points", { 
          description: "Add at least 3 points to create a field boundary" 
        });
        return;
      }

      setIsDrawing(false);
      console.log("✅ [MapboxFieldMap] Field boundary completed with", coordinates.length, "points");

      if (onBoundaryChange) {
        onBoundaryChange({
          type: 'polygon',
          coordinates
        });
      }

      toast.success("Field boundary completed", { 
        description: `Field mapped with ${coordinates.length} points` 
      });

      setTimeout(() => {
        setShowRecommender(true);
      }, 800);
    } catch (error) {
      logError(error as Error, { context: 'completeDrawing' });
    }
  };

  const handleUndo = () => {
    if (coordinates.length === 0) return;

    try {
      console.log("↩️ [MapboxFieldMap] Undoing last point");
      const newCoords = coordinates.slice(0, -1);
      setCoordinates(newCoords);

      if (drawMarkers.current.length > 0) {
        const marker = drawMarkers.current.pop();
        if (marker) marker.remove();
      }

      if (map.current) {
        if (newCoords.length >= 3) {
          drawFieldPolygon(map.current, newCoords);
        } else if (map.current.getSource('field-polygon')) {
          map.current.removeLayer('field-polygon-fill');
          map.current.removeLayer('field-polygon-outline');
          map.current.removeSource('field-polygon');
        }
      }

      if (onBoundaryChange) {
        onBoundaryChange({
          type: 'polygon',
          coordinates: newCoords
        });
      }
    } catch (error) {
      logError(error as Error, { context: 'undoPoint' });
    }
  };

  const handleUseCurrentLocation = () => {
    if (!map.current) return;

    try {
      console.log("📱 [MapboxFieldMap] Requesting user location");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("📍 [MapboxFieldMap] Got user location:", latitude, longitude);

          if (flyToLocation.current) {
            flyToLocation.current(longitude, latitude, 17);
          }

          if (isDrawing) {
            addPoint(longitude, latitude);
            toast.success("Added current location", {
              description: "Your current position has been added to the field boundary"
            });
          } else {
            toast.success("Located", {
              description: "Map centered on your current position"
            });
          }
        },
        (error) => {
          console.error("❌ [MapboxFieldMap] Geolocation error:", error.message);
          logError(new Error(error.message), { context: 'geolocation' });
          toast.error("Location error", {
            description: "Could not access your location. Please check permissions."
          });
        }
      );
    } catch (error) {
      logError(error as Error, { context: 'useCurrentLocation' });
    }
  };

  const handleReset = () => {
    if (!map.current) return;

    try {
      console.log("🧹 [MapboxFieldMap] Resetting field boundary");
      setCoordinates([]);

      drawMarkers.current.forEach(marker => marker.remove());
      drawMarkers.current = [];

      if (map.current.getSource('field-polygon')) {
        map.current.removeLayer('field-polygon-fill');
        map.current.removeLayer('field-polygon-outline');
        map.current.removeSource('field-polygon');
      }

      if (onBoundaryChange) {
        onBoundaryChange({
          type: 'polygon',
          coordinates: []
        });
      }

      toast.info("Cleared", { description: "Field boundary has been reset" });
    } catch (error) {
      logError(error as Error, { context: 'resetField' });
    }
  };

  const calculateArea = (coords: Coordinates[]): number => {
    if (coords.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i].lng * coords[j].lat;
      area -= coords[j].lng * coords[i].lat;
    }

    area = Math.abs(area) / 2;

    const areaInHectares = area * 111319.9 * 111319.9 / 10000;
    return parseFloat(areaInHectares.toFixed(2));
  };

  const handleGetCropTips = () => {
    setShowRecommender(false);
    toast.success("Growing tips", {
      description: "Expert growing tips are now available in your Farm Plan"
    });
  };

  return (
    <ErrorBoundary>
      <div className="w-full h-full relative">
        <div className="absolute top-2 left-2 right-16 z-10 bg-white/95 dark:bg-gray-900/95 rounded-md shadow-md">
          <MapSearchInput 
            onSearch={handleSearch}
            onLocationSelect={(location) => {
              if (flyToLocation.current) {
                flyToLocation.current(location.lng, location.lat, 16);
              }
            }}
            isSearching={isSearching}
            className="px-1"
          />
        </div>

        {!readOnly && (
          <div className="absolute top-16 right-2 z-10">
            <MapNavigator
              onComplete={isDrawing ? handleComplete : handleStartDrawing}
              onUndo={handleUndo}
              onUseCurrentLocation={handleUseCurrentLocation}
              onReset={handleReset}
              isDrawing={isDrawing}
              hasPoints={coordinates.length > 0}
            />
          </div>
        )}

        {/* Offline mode with cached snapshot */}
      {isOffline && cachedMapData.snapshot ? (
        <div className="w-full h-full rounded-md overflow-hidden relative">
          <img 
            src={cachedMapData.snapshot} 
            alt="Cached map view" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs flex items-center">
            <WifiOff className="h-3 w-3 mr-1" />
            Offline Mode
          </div>
          {cachedMapData.lastUpdated && (
            <div className="absolute bottom-2 right-2 bg-background/80 text-xs px-2 py-1 rounded">
              Last updated: {new Date(cachedMapData.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
      ) : (
        <div 
          ref={mapContainer} 
          className="w-full h-full rounded-md overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      )}

        {/* Error state */}
        {mapError && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="bg-background p-4 rounded-md shadow-md max-w-md text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
              <h3 className="text-lg font-bold mb-2">Map Error</h3>
              <p className="text-muted-foreground mb-4">{mapError}</p>

              {isOffline && cachedMapData.snapshot ? (
                <>
                  <p className="text-sm mb-4">You're currently offline. Using cached map data.</p>
                  <Button 
                    onClick={() => {
                      setMapError(null);
                      setMapLoaded(true);
                    }}
                    className="mx-auto"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Use Cached Map
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => window.location.reload()}
                    className="mx-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  {!MAPBOX_ACCESS_TOKEN && (
                    <p className="mt-4 text-xs text-muted-foreground">
                      Missing VITE_MAPBOX_ACCESS_TOKEN in environment configuration.
                      Please add it to your .env file.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {showRecommender && coordinates.length >= 3 && (
          <div className="absolute bottom-4 left-2 right-2 z-20">
            <SmartFieldRecommender 
              coordinates={coordinates}
              locationName={locationName || "Your Field"}
              area={calculateArea(coordinates)}
              onClose={() => setShowRecommender(false)}
              onGetTips={handleGetCropTips}
            />
          </div>
        )}

        {!showRecommender && coordinates.length >= 3 && searchResults && (
          <div className="absolute bottom-4 left-2 right-2 z-10">
            <FieldConfirmationCard
              locationName={locationName || "Your Field"}
              coordinates={coordinates}
              area={calculateArea(coordinates)}
              areaUnit="hectares"
            />
          </div>
        )}

        {!showRecommender && coordinates.length >= 3 && (
          <div className="absolute bottom-20 left-2 bg-white/90 dark:bg-gray-900/90 p-2 rounded-md shadow-md text-xs space-y-1 max-w-xs">
            <div className="font-medium">Field Statistics:</div>
            <div>Points: {coordinates.length}</div>
            <div>Area (approx): {calculateArea(coordinates)} hectares</div>
            <div className="text-muted-foreground">
              {isDrawing ? "Click to add more points" : "Field boundary complete"}
            </div>
          </div>
        )}

        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-sm font-medium">Loading map...</div>
            </div>
          </div>
        )}

        {isDrawing && !readOnly && (
          <div className="absolute bottom-2 left-2 right-2 bg-background/90 p-2 px-3 rounded text-xs text-center">
            Click on map to add points. Add at least 3 points to create a field boundary.
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
