
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, Undo, MapPin, Navigation, Trash2 } from "lucide-react";

interface MapNavigatorProps {
  onStartDrawing?: () => void;
  onComplete?: () => void;
  onUndo?: () => void;
  onUseCurrentLocation?: () => void;
  onReset?: () => void;
  isDrawing?: boolean;
  hasPoints?: boolean | number;
}

export default function MapNavigator({
  onStartDrawing,
  onComplete,
  onUndo,
  onUseCurrentLocation,
  onReset,
  isDrawing = false,
  hasPoints = false
}: MapNavigatorProps) {
  // Handle errors for missing handlers
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      console.error("MapNavigator: onComplete handler is not defined");
    }
  };

  const handleUndo = () => {
    if (onUndo) {
      onUndo();
    } else {
      console.error("MapNavigator: onUndo handler is not defined");
    }
  };

  const handleUseCurrentLocation = () => {
    if (onUseCurrentLocation) {
      onUseCurrentLocation();
    } else {
      console.error("MapNavigator: onUseCurrentLocation handler is not defined");
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      console.error("MapNavigator: onReset handler is not defined");
    }
  };

  const handleStartDrawing = () => {
    if (onStartDrawing) {
      onStartDrawing();
    } else if (onComplete) {
      // Fallback to onComplete for backward compatibility
      onComplete();
    } else {
      console.error("MapNavigator: onStartDrawing handler is not defined");
    }
  };

  return (
    <div className="flex flex-col gap-1 bg-white/90 dark:bg-gray-900/90 p-1 rounded-md shadow-md" role="toolbar" aria-label="Map navigation controls">
      {isDrawing ? (
        <>
          <Button
            size="sm"
            variant="default"
            className="h-8 px-2 py-1"
            onClick={handleComplete}
            disabled={!hasPoints || (typeof hasPoints === 'number' && hasPoints < 3)}
            aria-label="Complete drawing field boundary"
          >
            <Save className="h-3 w-3 mr-1" />
            <span className="text-xs">Complete</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 py-1"
            onClick={handleUndo}
            disabled={!hasPoints}
            aria-label="Undo last point"
          >
            <Undo className="h-3 w-3 mr-1" />
            <span className="text-xs">Undo</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 py-1"
            onClick={handleUseCurrentLocation}
            aria-label="Use my current location"
          >
            <Navigation className="h-3 w-3 mr-1" />
            <span className="text-xs">Use My Location</span>
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 px-2 py-1"
            onClick={handleReset}
            disabled={!hasPoints}
            aria-label="Clear all points"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            <span className="text-xs">Clear</span>
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="default"
          className="h-8 px-2 py-1"
          onClick={handleStartDrawing}
          aria-label="Start drawing field boundary"
        >
          <MapPin className="h-3 w-3 mr-1" />
          <span className="text-xs">Draw Field</span>
        </Button>
      )}
    </div>
  );
}
