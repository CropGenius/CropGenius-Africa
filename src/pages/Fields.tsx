import React, { useEffect, useMemo } from 'react';
import { useSimpleAuthContext } from '@/providers/SimpleAuthProvider';
import { useQuery } from '@tanstack/react-query';

// Type for coordinates
interface GeoLocation {
  lat: number;
  lng: number;
}

interface DbField {
  id: string;
  name: string;
  size: number;
  size_unit?: string;
  crop_type?: string;
  boundary?: {
    coordinates: GeoLocation[];
  } | null;
  [key: string]: any; // Allow other fields from the database
}

interface Field {
  id: string;
  name: string;
  size: string; // Display as string in the UI
  size_unit?: string;
  crop_type?: string;
  boundary?: {
    coordinates: GeoLocation[];
  } | null;
}
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Satellite, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SatelliteImageryDisplay from '@/components/SatelliteImageryDisplay';
import { ZeroFrictionFieldCreator } from '@/components/fields/ZeroFrictionFieldCreator';

const Fields = () => {
  const navigate = useNavigate();
  const { user } = useSimpleAuthContext();
  
  const isPro = useMemo(() => {
    try { return localStorage.getItem('plan_is_pro') === 'true'; } catch { return false; }
  }, []);

  // Redirect to upgrade if trying to access satellite view without pro
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'satellite' && !isPro) {
      navigate('/upgrade');
    }
  }, [isPro, navigate]);
  
  const { data: fields } = useQuery<Field[]>({
    queryKey: ['all-fields'],
    queryFn: async () => {
      // Load all fields without authentication
      const { data } = await supabase
        .from('fields')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Map database fields to our UI model
      return (data || []).map((dbField: any) => {
        // Safely parse the boundary data
        let boundary = null;
        if (dbField.boundary && dbField.boundary.coordinates) {
          try {
            // Convert coordinates to the format expected by GeoLocation
            const coords = Array.isArray(dbField.boundary.coordinates[0])
              ? dbField.boundary.coordinates.map(([lng, lat]: [number, number]) => ({ lat, lng }))
              : dbField.boundary.coordinates;
            
            boundary = {
              coordinates: coords
            };
          } catch (e) {
            console.error('Error parsing boundary data:', e);
          }
        }

        return {
          id: dbField.id,
          name: dbField.name || 'Unnamed Field',
          size: (dbField.size || 0).toString(),
          size_unit: dbField.size_unit || 'hectares',
          crop_type: dbField.crop_type,
          boundary
        } as Field;
      });
    }
  });
  const isLoading = false;
  

  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Fields</h1>
          <p className="text-gray-600">{fields?.length || 0} fields monitored</p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => navigate('/manage-fields')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>
      
      {fields && fields.length > 0 ? (
        <div className="space-y-6">
          <div className="grid gap-4">
            {fields.map((field) => {
              const healthScore = Math.round(65 + Math.random() * 30);
              const healthColor = healthScore > 80 ? 'text-green-600' : healthScore > 60 ? 'text-yellow-600' : 'text-red-600';
              
              return (
                <Card key={field.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/fields/${field.id}`)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="font-semibold">{field.name}</h3>
                          <p className="text-sm text-gray-600">
                            {field.size} {field.size_unit || 'hectares'} • Health: <span className={healthColor}>{healthScore}%</span>
                          </p>
                          {field.crop_type && (
                            <p className="text-xs text-gray-500">Crop: {field.crop_type}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-16 h-12 rounded ${
                          healthScore > 80 ? 'bg-green-200' : 
                          healthScore > 60 ? 'bg-yellow-200' : 'bg-red-200'
                        }`}></div>
                        <Satellite className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Satellite Intelligence for first field - Pro only */}
          {fields[0] && isPro && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Satellite className="h-5 w-5 mr-2 text-cyan-600" />
                  Satellite Field Intelligence (Pro)
                </h3>
                <SatelliteImageryDisplay 
                  fieldCoordinates={fields[0].boundary?.coordinates}
                  fieldId={fields[0].id}
                />
              </CardContent>
            </Card>
          )}
          {fields[0] && !isPro && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center justify-center py-8">
                  <Shield className="h-10 w-10 text-amber-500 mb-2" />
                  <h3 className="text-lg font-semibold mb-2">Satellite Intelligence is a Pro Feature</h3>
                  <p className="text-gray-600 mb-4">Upgrade to Pro to unlock satellite field analysis, NDVI mapping, and advanced field insights.</p>
                  <Button 
                    onClick={() => navigate('/upgrade')} 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Fields Added Yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first field to monitor crop health and get AI insights</p>
            
            <div className="space-y-4 max-w-sm mx-auto">
              <ZeroFrictionFieldCreator />
              
              <Button 
                variant="outline"
                onClick={() => navigate('/manage-fields')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Manual Field Creation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Fields;