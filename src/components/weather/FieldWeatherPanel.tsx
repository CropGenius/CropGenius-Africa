import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Wind, Sun, Loader2, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import YourFarmButton from './YourFarmButton';
import { Field } from '@/types/field';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LiquidWeatherGlass } from "@/components/ui/liquid-weather-glass";
import { useWeatherData } from "@/hooks/useWeatherData";

import AddFieldForm from '@/components/fields/AddFieldForm';
import QuickAddField from '@/components/fields/QuickAddField';
import WeatherAlerts from '@/components/fields/WeatherAlerts';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { geolocationService } from '@/services/GeolocationService';
import { bulletproofSupabase } from '@/services/BulletproofSupabase';

interface FieldWeatherPanelProps {
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
}

export default function FieldWeatherPanel({ location }: FieldWeatherPanelProps) {
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [fields, setFields] = useState<Field[]>([]);

  // Load fields - ALWAYS SUCCEEDS, ALWAYS HAS A FIELD
  useEffect(() => {
    const loadFields = async () => {
      console.log('🌾 Loading fields for weather panel...');
      
      const userFields = await loadUserFieldsSafely();
      
      if (userFields.length > 0) {
        setFields(userFields);
        setSelectedField(userFields[0]);
        toast.success(`🌾 Loaded ${userFields.length} fields for weather monitoring`);
      } else {
        const realLocationField = await createRealLocationField();
        setFields([realLocationField]);
        setSelectedField(realLocationField);
        toast.success('🌍 Showing weather for your current location!');
      }
    };
    loadFields();
  }, []);

  // Load user fields safely - BULLETPROOF database access
  const loadUserFieldsSafely = async (): Promise<Field[]> => {
    return await bulletproofSupabase.getUserFields();
  };

  // Create field with REAL user location
  const createRealLocationField = async (): Promise<Field> => {
    const location = await geolocationService.getCurrentLocation();
    
    const locationName = location.source === 'gps' 
      ? '📍 Your Location'
      : location.source === 'ip'
      ? '🌍 Your Area'
      : '🌾 Central Kenya';
    
    return {
      id: 'real-location-panel-' + Date.now(),
      name: locationName,
      latitude: location.lat,
      longitude: location.lon,
      size: 15,
      size_unit: 'acres',
      crop_type: 'mixed',
      user_id: 'current-user'
    };
  };

  const { current, forecast, loading, error, refetch } = useWeatherData({
    lat: selectedField?.latitude || selectedField?.location?.coordinates?.[1] || -1.2921,
    lon: selectedField?.longitude || selectedField?.location?.coordinates?.[0] || 36.8219,
    refreshInterval: 300000
  });

  const handleFieldSelect = (field: Field) => {
    setSelectedField(field);
  };

  const handleAddField = (field: Field) => {
    setSelectedField(field);
    setFields(prev => [...prev, field]);
  };

return (
    <div className="p-4">
      {fields.length > 1 && (
        <select onChange={(e) => setSelectedField(fields[e.target.value])} className="w-full mb-4 p-2 border rounded">
          {fields.map((f, i) => <option key={f.id} value={i}>{f.name}</option>)}
        </select>
      )}
      <Card>
        <CardContent className="p-4">
          {current ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{current.temperature}°C</div>
                <div className="text-lg">{current.condition}</div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <span>💧</span>
                    <span>{current.humidity}%</span>
                    {current.humidity > 85 && <span className="text-yellow-500 text-xs">HIGH</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💨</span>
                    <span>{current.windSpeed} km/h</span>
                    {current.windSpeed > 20 && <span className="text-red-500 text-xs">STRONG</span>}
                  </div>
                </div>
                {selectedField && (
                  <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                    📍 {selectedField.name} • Last updated: {new Date().toLocaleTimeString()}
                  </div>
                )}
              </div>
              <WeatherAlerts />
            </div>
          ) : <div className="text-center">Loading...</div>}
        </CardContent>
      </Card>
    </div>
  );
}
