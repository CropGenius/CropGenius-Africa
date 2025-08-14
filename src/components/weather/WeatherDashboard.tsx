import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from 'lucide-react';
import WeatherForecastPanel from "./WeatherForecastPanel";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Field } from '@/types/field';
import { geolocationService } from '@/services/GeolocationService';
import { bulletproofSupabase } from '@/services/BulletproofSupabase';
import AddFieldWizardButton from '@/components/fields/AddFieldWizardButton';

interface WeatherDashboardProps {
  selectedField?: Field;
  onFieldChange?: (field: Field) => void;
}

export default function WeatherDashboard({ selectedField, onFieldChange }: WeatherDashboardProps) {
  const [userFields, setUserFields] = useState<Field[]>([]);
  const [currentField, setCurrentField] = useState<Field | null>(selectedField || null);

  // Load user fields - ALWAYS WORKS WITH REAL LOCATION
  useEffect(() => {
    const loadUserFields = async () => {
      console.log('🌾 Loading user fields...');
      
      // Try to get user and their fields
      const userFields = await getUserFieldsSafely();
      
      if (userFields.length > 0) {
        console.log(`🌾 Loaded ${userFields.length} user fields`);
        setUserFields(userFields);
        setCurrentField(userFields[0]);
      } else {
        console.log('🌾 No user fields, creating field with REAL location');
        const realLocationField = await createRealLocationField();
        setUserFields([realLocationField]);
        setCurrentField(realLocationField);
      }
    };
    loadUserFields();
  }, []);

  // Get user fields safely - BULLETPROOF database access
  const getUserFieldsSafely = async (): Promise<Field[]> => {
    return await bulletproofSupabase.getUserFields();
  };

  // Create field with PRECISE user location
  const createRealLocationField = async (): Promise<Field> => {
    const location = await geolocationService.getCurrentLocation();
    
    const locationName = location.source === 'gps' 
      ? '📍 Your Current Location'
      : location.source === 'ip'
      ? '🌍 Your Area'
      : '🌾 Central Kenya';
    
    return {
      id: 'current-location-' + Date.now(),
      name: locationName,
      latitude: location.lat,
      longitude: location.lon,
      size: 10,
      size_unit: 'acres',
      crop_type: 'mixed',
      user_id: 'current-user'
    };
  };

  // Handle field added from wizard
  const handleFieldAdded = (newField: Field) => {
    setUserFields(prev => [...prev, newField]);
    setCurrentField(newField);
  };
  
  const location = currentField?.boundary?.coordinates && currentField.boundary.coordinates.length > 0
    ? {
        lat: currentField.boundary.coordinates.reduce((sum, coord) => sum + coord.lat, 0) / currentField.boundary.coordinates.length,
        lng: currentField.boundary.coordinates.reduce((sum, coord) => sum + coord.lng, 0) / currentField.boundary.coordinates.length,
        name: currentField.name
      }
    : currentField?.latitude && currentField?.longitude
    ? {
        lat: currentField.latitude,
        lng: currentField.longitude,
        name: currentField.name
      }
    : undefined;

  const { current, forecast, loading, error, refetch } = useWeatherData({
    lat: location?.lat,
    lon: location?.lng,
    refreshInterval: 300000
  });

  const getLocationName = () => currentField?.name || current?.location || "Weather Dashboard";

  return (
    <>
      {/* Content Container */}
      <div className="min-h-screen p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 flex-1">
          <select 
            value={currentField?.id || ''} 
            onChange={(e) => {
              const field = userFields.find(f => f.id === e.target.value);
              setCurrentField(field || null);
              onFieldChange?.(field!);
            }}
            className="bg-white/10 border border-white/20 text-white rounded px-3 py-2 text-sm backdrop-blur-sm flex-1"
          >
            {userFields.map(field => (
              <option key={field.id} value={field.id} className="text-black">
                🌾 {field.name} ({field.size} {field.size_unit})
              </option>
            ))}
          </select>
          <AddFieldWizardButton 
            onFieldAdded={handleFieldAdded}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Plus className="h-4 w-4" />
          </AddFieldWizardButton>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={loading}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 ml-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <WeatherForecastPanel location={location || { lat: 0, lng: 0, name: 'Default' }} />
    </div>
    </>
  );
}