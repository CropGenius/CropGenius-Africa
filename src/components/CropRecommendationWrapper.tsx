/**
 * 🌾 CROPGENIUS – CROP RECOMMENDATION WRAPPER
 * -------------------------------------------------------------
 * Wrapper component to handle route parameters and integrate
 * CropRecommendation with proper field context
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { useSimpleAuthContext as useAuth } from '@/providers/SimpleAuthProvider';
import { useFieldData } from '@/hooks/useFieldData';
import CropRecommendation from './CropRecommendation';
import OptimizedLoading from './loading/OptimizedLoading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const CropRecommendationWrapper: React.FC = () => {
  const { id: fieldId } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // Fetch field data using the field ID
  const { data: fieldData, isLoading, error } = useFieldData(fieldId || '');

  if (isLoading) {
    return <OptimizedLoading text="Loading field recommendations..." />;
  }

  if (error || !fieldData) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Field not found. Please check the field ID and try again.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to view crop recommendations
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Create farm context from field data
  const farmContext = {
    userId: user.id,
    location: {
      lat: fieldData.coordinates?.lat || 0,
      lng: fieldData.coordinates?.lng || 0,
    },
    soilType: fieldData.soil_type || 'loam',
    season: fieldData.season || 'long_rains',
    fieldSize: fieldData.area_hectares || 1,
    currentCrop: fieldData.crop_type || undefined,
    climateZone: fieldData.climate_zone || 'tropical',
    rainfall: fieldData.avg_rainfall || 800,
    temperature: fieldData.avg_temperature || 25,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Crop Recommendations for {fieldData.name}
          </h1>
          <p className="text-gray-600">
            AI-powered recommendations based on your field's specific conditions
          </p>
        </div>
        
        <CropRecommendation
          fieldId={fieldId!}
          farmContext={farmContext}
          showMarketData={true}
          showDiseaseRisk={true}
          showEconomicViability={true}
        />
      </div>
    </div>
  );
};

export default CropRecommendationWrapper;