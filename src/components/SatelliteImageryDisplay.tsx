/**
 * 🛰️ SATELLITE IMAGERY DISPLAY - REAL INTELLIGENCE SYSTEM
 * ================================================================
 * Production-grade satellite imagery with actual NDVI analysis
 * Connected to Sentinel Hub, NASA MODIS, and Landsat data sources
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { getMultiSourceSatelliteEngine } from '@/services/MultiSourceSatelliteEngine';
import { type EnhancedFieldAnalysis, type GeoLocation } from '@/intelligence/enhancedFieldIntelligence';
import { toast } from 'sonner';
import { SatelliteControlPanel } from './satellite/SatelliteControlPanel';
import { FieldHealthMetrics } from './satellite/FieldHealthMetrics';
import { ProblemAreasAlert } from './satellite/ProblemAreasAlert';
import { SatelliteMapDisplay } from './satellite/SatelliteMapDisplay';
import { FieldAnalysisResults } from './satellite/FieldAnalysisResults';

interface SatelliteImageryDisplayProps {
  fieldCoordinates?: GeoLocation[];
  fieldId?: string;
}

const SatelliteImageryDisplay: React.FC<SatelliteImageryDisplayProps> = ({ 
  fieldCoordinates,
  fieldId 
}) => {
  const [viewMode, setViewMode] = useState<'ndvi' | 'rgb' | 'infrared' | 'moisture'>('ndvi');
  const [selectedField, setSelectedField] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<EnhancedFieldAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Default coordinates for Nairobi area if none provided
  const [coordinates] = useState<GeoLocation[]>(
    fieldCoordinates || [
      { lat: -1.2921, lng: 36.8219 },
      { lat: -1.2921, lng: 36.8229 },
      { lat: -1.2911, lng: 36.8229 },
      { lat: -1.2911, lng: 36.8219 },
      { lat: -1.2921, lng: 36.8219 }
    ]
  );

  const { user } = useAuth();

  const handleFieldAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('🛰️ Starting multi-source satellite analysis...');
      const satelliteEngine = getMultiSourceSatelliteEngine();
      const analysis = await satelliteEngine.analyzeWithFallback(coordinates, user?.id);
      
      setAnalysisData(analysis);
      toast.success(`Satellite analysis complete using ${analysis.soilAnalysis.data_source.replace(/_/g, ' ')}!`);
      
      // Log analysis results for debugging
      console.log('📊 Analysis Results:', {
        health: `${(analysis.fieldHealth * 100).toFixed(1)}%`,
        ndvi: analysis.vegetationIndices.ndvi.toFixed(3),
        source: analysis.soilAnalysis.data_source,
        confidence: `${analysis.soilAnalysis.confidence_score}%`,
        alerts: analysis.alerts.length,
        executionTime: analysis.soilAnalysis.execution_time_ms || 'N/A'
      });
      
    } catch (error) {
      console.error('❌ Satellite analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
      toast.error('Satellite analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze on mount if coordinates are provided
  useEffect(() => {
    if (fieldCoordinates && fieldCoordinates.length > 0) {
      handleFieldAnalysis();
    }
  }, [fieldCoordinates]);

  return (
    <div className="px-6 pb-16">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Satellite Field Intelligence
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real-time NDVI analysis powered by Sentinel-2, NASA MODIS, and Landsat imagery. 
            Professional-grade satellite intelligence for precision agriculture.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Satellite Controls */}
          <div className="space-y-6">
            <SatelliteControlPanel
              viewMode={viewMode}
              setViewMode={setViewMode}
              onAnalyze={handleFieldAnalysis}
              isAnalyzing={isAnalyzing}
              error={error}
            />
            <FieldHealthMetrics data={analysisData} />
            <ProblemAreasAlert data={analysisData} />
          </div>

          {/* Main Satellite Display */}
          <div className="lg:col-span-2">
            <SatelliteMapDisplay
              viewMode={viewMode}
              isAnalyzing={isAnalyzing}
              analysisData={analysisData}
              onFieldSelect={setSelectedField}
            />
          </div>
        </div>

        {/* Analysis Results */}
        <AnimatePresence>
          {selectedField && analysisData && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="mt-8"
            >
              <FieldAnalysisResults field={selectedField} analysis={analysisData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SatelliteImageryDisplay;