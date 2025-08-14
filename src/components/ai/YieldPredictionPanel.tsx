import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { yieldPredictorOracle, YieldPredictionInput, YieldPredictionResult } from '@/agents/YieldPredictorOracle';
import { weatherService } from '@/services/UnifiedWeatherService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface YieldPrediction {
  predictedYieldKgPerHa: number;
  confidenceScore: number;
  keyFactors: {
    weatherImpact: string;
    soilImpact: string;
    managementImpact: string;
  };
  recommendations: string[];
  harvestDateEstimate: string;
  economicImpact: {
    estimatedRevenue: number;
    profitMargin: number;
    breakEvenYield?: number;
    optimalHarvestWindow?: string;
    marketTimingAdvice?: string;
  };
  riskFactors: string[];
}

export const YieldPredictionPanel: React.FC<{ fieldId: string }> = ({ fieldId }) => {
  const [prediction, setPrediction] = useState<YieldPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldData, setFieldData] = useState<any>(null);

  useEffect(() => {
    loadFieldData();
  }, [fieldId]);

  const loadFieldData = async () => {
    try {
      const { data } = await supabase
        .from('fields')
        .select(`
          *,
          farms!inner(location, user_id),
          crop_types(name)
        `)
        .eq('id', fieldId)
        .single();

      setFieldData(data);
    } catch (error) {
      console.error('Error loading field data:', error);
    }
  };

  const generatePrediction = async () => {
    if (!fieldData) return;

    setLoading(true);
    try {
      // Get location coordinates
      const [lat, lng] = fieldData.farms.location.split(',').map(Number);
      
      // Get enhanced weather data
      const weatherData = await weatherService.getWeatherByCoordinates(lat, lng);

      // Prepare enhanced prediction input
      const predictionInput: YieldPredictionInput = {
        fieldId: fieldData.id,
        cropType: fieldData.crop_types?.name || 'maize',
        farmSize: fieldData.area_hectares || 1,
        plantingDate: new Date(fieldData.planted_at || Date.now()),
        location: { lat, lng, country: 'Kenya' },
        soilType: fieldData.soil_type || 'Loam',
        expectedRainfall: 'moderate',
        fertilizerUse: fieldData.fertilizer_type || 'organic',
        previousYield: fieldData.last_yield_kg_per_ha,
        // Enhanced context for better AI predictions
        weatherContext: {
          currentTemp: weatherData.current.temperature,
          humidity: weatherData.current.humidity,
          condition: weatherData.current.condition,
          forecast: weatherData.forecast.slice(0, 5), // Next 5 days
        },
        fieldContext: {
          fieldName: fieldData.name,
          totalArea: fieldData.area_hectares,
          soilPh: fieldData.soil_ph,
          elevation: fieldData.elevation,
        }
      };

      const result: YieldPredictionResult = await yieldPredictorOracle.generateYieldPrediction(predictionInput);
      
      // Convert to the interface used by this component
      const convertedResult: YieldPrediction = {
        predictedYieldKgPerHa: result.predictedYieldKgPerHa,
        confidenceScore: result.confidenceScore,
        keyFactors: result.keyFactors,
        recommendations: result.recommendations,
        harvestDateEstimate: result.harvestDateEstimate,
        economicImpact: result.economicImpact,
        riskFactors: result.riskFactors
      };

      setPrediction(convertedResult);
      toast.success('Enhanced AI prediction generated using Gemini 2.5 Flash!', {
        description: `${Math.round(result.predictedYieldKgPerHa)} kg/ha predicted with ${Math.round(result.confidenceScore)}% confidence`
      });
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast.error('Failed to generate yield prediction', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'slightly negative': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'positive': return '✅';
      case 'negative': return '❌';
      case 'slightly negative': return '⚠️';
      default: return '➡️';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            📊 Yield Prediction
          </CardTitle>
          <Button onClick={generatePrediction} disabled={loading || !fieldData}>
            {loading ? 'Analyzing...' : 'Generate Prediction'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {prediction ? (
          <div className="space-y-6">
            {/* Main Prediction */}
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-green-700">
                {Math.round(prediction.predictedYieldKgPerHa).toLocaleString()} kg/ha
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Predicted Yield
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm">Confidence:</span>
                  <Progress value={prediction.confidenceScore} className="w-24" />
                  <span className="text-sm font-medium">
                    {Math.round(prediction.confidenceScore)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Key Factors */}
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(prediction.keyFactors).map(([factor, impact]) => (
                <div key={factor} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {factor.replace('Impact', '')}
                    </span>
                    <div className={`flex items-center gap-1 ${getImpactColor(impact)}`}>
                      <span>{getImpactIcon(impact)}</span>
                      <span className="text-xs">{impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Harvest Date */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">🗓️ Estimated Harvest:</span>
                <Badge variant="secondary">
                  {new Date(prediction.harvestDateEstimate).toLocaleDateString()}
                </Badge>
              </div>
            </div>

            {/* Economic Impact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Estimated Revenue</div>
                <div className="text-xl font-bold text-green-700">
                  ${Math.round(prediction.economicImpact.estimatedRevenue).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {prediction.economicImpact.profitMargin}% profit margin
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Break-even Yield</div>
                <div className="text-xl font-bold text-blue-700">
                  {prediction.economicImpact.breakEvenYield ? 
                    `${Math.round(prediction.economicImpact.breakEvenYield).toLocaleString()} kg/ha` : 
                    'N/A'
                  }
                </div>
                <div className="text-xs text-gray-500">
                  Minimum for profitability
                </div>
              </div>
            </div>

            {/* Market Timing */}
            {prediction.economicImpact.optimalHarvestWindow && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">🎯 Optimal Harvest Window:</span>
                </div>
                <div className="text-sm text-gray-700">
                  {prediction.economicImpact.optimalHarvestWindow}
                </div>
                {prediction.economicImpact.marketTimingAdvice && (
                  <div className="text-xs text-gray-600 mt-1">
                    💡 {prediction.economicImpact.marketTimingAdvice}
                  </div>
                )}
              </div>
            )}

            {/* Risk Factors */}
            {prediction.riskFactors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">⚠️ Risk Factors</h4>
                <div className="space-y-2">
                  {prediction.riskFactors.map((risk, index) => (
                    <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="space-y-2">
              <h4 className="font-medium">📋 AI Recommendations</h4>
              <div className="space-y-2">
                {prediction.recommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                    ✅ {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">🔮</div>
            <p>Generate AI-powered yield predictions</p>
            <p className="text-xs mt-1">
              Based on weather, soil, and crop health data
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};