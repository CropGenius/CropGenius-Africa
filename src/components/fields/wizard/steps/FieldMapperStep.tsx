import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Boundary, Coordinates } from '@/types/field';
import { isOnline } from '@/utils/isOnline';
// Error handling eliminated - using console.error instead

// Lazy load Mapbox map
const MapboxFieldMap = lazy(() => import('@/components/fields/MapboxFieldMap'));

interface FieldMapperStepProps {
  defaultLocation?: Coordinates;
  onNext: (data: { boundary: Boundary; location: Coordinates; name?: string }) => void;
  onBack: () => void;
  onSkip: () => void;
  initialBoundary?: Boundary | null;
  initialName?: string;
}

export default function FieldMapperStep({
  defaultLocation,
  onNext,
  onBack,
  onSkip,
  initialBoundary = null,
  initialName = ''
}: FieldMapperStepProps) {
  // Error logging eliminated - using console.error instead
  const [fieldName, setFieldName] = useState(initialName);
  const [boundary, setBoundary] = useState<Boundary | null>(initialBoundary);
  const [location, setLocation] = useState<Coordinates | null>(defaultLocation || null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isOnlineStatus, setIsOnlineStatus] = useState(isOnline());
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Session storage key for this step
  const SESSION_MAPPER_KEY = 'cropgenius_field_mapper_data';

  // Load data from session storage on mount
  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem(SESSION_MAPPER_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.boundary) setBoundary(parsedData.boundary);
        if (parsedData.location) setLocation(parsedData.location);
        if (parsedData.fieldName && !fieldName) setFieldName(parsedData.fieldName);
        
        console.log("✅ [FieldMapperStep] Restored data from session storage");
      }
    } catch (error) {
      console.error('Error loading field mapper data from session storage:', error);
    }
  }, [fieldName]);

  // Save data to session storage when it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_MAPPER_KEY, JSON.stringify({
        boundary,
        location,
        fieldName
      }));
    } catch (error) {
      console.error('Error saving field mapper data to session storage:', error);
    }
  }, [boundary, location, fieldName]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnlineStatus(true);
    const handleOffline = () => setIsOnlineStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle location change from map
  const handleMapLocation = useCallback((loc: Coordinates) => {
    console.log("📍 [FieldMapperStep] Location updated:", loc);
    setLocation(loc);
  }, []);

  // Handle boundary change from map
  const handleBoundaryChange = useCallback((newBoundary: Boundary) => {
    console.log("🔷 [FieldMapperStep] Boundary updated:", newBoundary);
    setBoundary(newBoundary);
    setIsDrawing(false);
  }, []);

  // Handle map loaded status
  const handleMapLoaded = useCallback((loaded: boolean) => {
    setIsMapLoaded(loaded);
  }, []);

  // Handle map error
  const handleMapError = useCallback((error: string | null) => {
    setMapError(error);
  }, []);

  // Handle continue button click
  const handleContinue = () => {
    try {
      // If offline and no boundary, allow using just location
      if (!isOnlineStatus && !boundary && location) {
        toast.info("Using location point only", { 
          description: "Field boundary will be created when you're back online" 
        });
        
        // Create a simple boundary around the location point
        const simpleBoundary: Boundary = {
          type: "polygon",
          coordinates: [
            { lat: location.lat + 0.001, lng: location.lng + 0.001 },
            { lat: location.lat + 0.001, lng: location.lng - 0.001 },
            { lat: location.lat - 0.001, lng: location.lng - 0.001 },
            { lat: location.lat - 0.001, lng: location.lng + 0.001 },
          ]
        };
        
        // Auto-generate field name if not provided
        let processedName = fieldName.trim();
        if (!processedName) {
          processedName = `Field ${new Date().toLocaleDateString()}`;
        }

        // Proceed to next step with data
        onNext({
          boundary: simpleBoundary,
          location,
          name: processedName
        });
        return;
      }
      
      // Normal validation when online or when we have a boundary
      if (!boundary || boundary.coordinates.length < 3) {
        toast.warning("Complete your field boundary", { 
          description: "Draw at least 3 points to create a field" 
        });
        return;
      }

      if (!location) {
        toast.warning("Missing location", { 
          description: "Please locate your field on the map first" 
        });
        return;
      }

      // Auto-generate field name if not provided
      let processedName = fieldName.trim();
      if (!processedName) {
        processedName = `Field ${new Date().toLocaleDateString()}`;
      }

      // Proceed to next step with data
      onNext({
        boundary,
        location,
        name: processedName
      });
      
      // Clear session storage for this step
      sessionStorage.removeItem(SESSION_MAPPER_KEY);
      
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  // Handle skip action with proper data
  const handleSkip = () => {
    // If we have a location but no boundary, create a simple boundary
    if (location && !boundary) {
      const simpleBoundary: Boundary = {
        type: "polygon",
        coordinates: [
          { lat: location.lat + 0.001, lng: location.lng + 0.001 },
          { lat: location.lat + 0.001, lng: location.lng - 0.001 },
          { lat: location.lat - 0.001, lng: location.lng - 0.001 },
          { lat: location.lat - 0.001, lng: location.lng + 0.001 },
        ]
      };
      
      setBoundary(simpleBoundary);
      
      // Auto-generate field name if not provided
      let processedName = fieldName.trim();
      if (!processedName) {
        processedName = `Field ${new Date().toLocaleDateString()}`;
      }
      
      onNext({
        boundary: simpleBoundary,
        location,
        name: processedName
      });
    } else {
      // Just skip if we don't have enough data
      onSkip();
    }
    
    // Clear session storage for this step
    sessionStorage.removeItem(SESSION_MAPPER_KEY);
  };

  return (
    <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center">Map Your Field</h2>
        <p className="text-center text-muted-foreground text-sm">
          Draw your field boundaries on the map
        </p>

        <Card>
          <CardContent className="p-0 overflow-hidden">
            <div className="h-[350px] md:h-[450px] lg:h-[500px] w-full relative">
              {!isOnlineStatus && !isMapLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-20 p-4">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                  <h3 className="text-lg font-medium mb-1">Offline Mode</h3>
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    Map functionality is limited while offline. You can continue with basic field information.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleSkip}
                    className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50"
                  >
                    Continue without map
                  </Button>
                </div>
              )}
              
              <Suspense fallback={
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Loading map...</p>
                  </div>
                </div>
              }>
                <MapboxFieldMap
                  onBoundaryChange={handleBoundaryChange}
                  onLocationChange={handleMapLocation}
                  initialBoundary={boundary}
                  defaultLocation={location || undefined}
                  readOnly={false}
                  onMapLoaded={handleMapLoaded}
                  onMapError={handleMapError}
                />
              </Suspense>
              
              {!isOnlineStatus && isMapLoaded && (
                <div className="absolute bottom-3 left-3 right-3 bg-background/90 text-xs p-2 rounded">
                  ⚠️ You're currently offline. Your field will be saved locally and synced when you're back online.
                </div>
              )}
              
              {mapError && (
                <div className="absolute bottom-3 left-3 right-3 bg-destructive/10 text-xs p-2 rounded">
                  ⚠️ {mapError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div>
            <label htmlFor="fieldName" className="block text-sm font-medium mb-1">
              Field Name
            </label>
            <Input
              id="fieldName"
              placeholder="Enter a name for your field"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={onBack} type="button">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button variant="outline" onClick={handleSkip} type="button">
              Skip
            </Button>
            <Button onClick={handleContinue} type="button">
              {boundary?.coordinates.length >= 3 ? 'Continue' : 'Draw Field'} 
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        
        {boundary && boundary.coordinates.length >= 3 && (
          <div className="text-center text-xs text-muted-foreground mt-2">
            <MapPin className="inline-block h-3 w-3 mr-1" />
            Field boundary mapped with {boundary.coordinates.length} points
          </div>
        )}
    </div>
  );
}