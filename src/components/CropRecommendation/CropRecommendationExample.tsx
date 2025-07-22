/**
 * 🌾 CROPGENIUS – CROP RECOMMENDATION EXAMPLE
 * -------------------------------------------------------------
 * Example/Demo component for crop recommendations
 * - Shows realistic sample data
 * - Perfect for demos and testing
 * - Matches production component structure
 */

import React from 'react';
import CropRecommendation from '../CropRecommendation';
import type { FarmContext } from '@/hooks/useCropRecommendations';

interface CropRecommendationExampleProps {
  className?: string;
}

const CropRecommendationExample: React.FC<CropRecommendationExampleProps> = ({
  className = ''
}) => {
  // Sample farm context for demonstration
  const sampleFarmContext: FarmContext = {
    location: {
      lat: -1.2921,
      lng: 36.8219,
      country: 'Kenya',
      region: 'Central Kenya'
    },
    soilType: 'loamy',
    currentSeason: 'rainy',
    userId: 'demo-user-id',
    farmId: 'demo-farm-id',
    currentCrops: ['maize'],
    climateZone: 'tropical'
  };

  const sampleFieldId = 'demo-field-id';

  const handleSelectCrop = (cropId: string, confidence: number, aiReasoning: string) => {
    console.log('Demo crop selected:', { cropId, confidence, aiReasoning });
    // In a real app, this would navigate to planting workflow or save selection
  };

  return (
    <div className={className}>
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          🌾 Demo Mode - Sample Crop Recommendations
        </h3>
        <p className="text-sm text-blue-800">
          This is a demonstration of the CropGenius AI-powered crop recommendation system. 
          In production, this would analyze your actual field data and provide personalized recommendations.
        </p>
      </div>

      <CropRecommendation
        fieldId={sampleFieldId}
        farmContext={sampleFarmContext}
        onSelectCrop={handleSelectCrop}
        showMarketData={true}
        showDiseaseRisk={true}
        showEconomicViability={true}
      />
    </div>
  );
};

export default CropRecommendationExample;
export { CropRecommendationExample };