/**
 * 🗺️ SATELLITE MAP DISPLAY - REAL VISUALIZATION
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type EnhancedFieldAnalysis } from '@/intelligence/enhancedFieldIntelligence';

interface SatelliteMapDisplayProps {
  viewMode: string;
  isAnalyzing: boolean;
  analysisData: EnhancedFieldAnalysis | null;
  onFieldSelect: (field: any) => void;
}

export const SatelliteMapDisplay: React.FC<SatelliteMapDisplayProps> = ({
  viewMode,
  isAnalyzing,
  analysisData,
  onFieldSelect
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="relative aspect-video rounded-3xl overflow-hidden backdrop-blur-lg bg-gradient-to-br from-gray-900 to-gray-800 border border-cyan-400/20"
    >
      {/* Map Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs text-white">
            📍 Field Analysis - {analysisData?.soilAnalysis?.spatial_resolution || 'Loading...'}
          </div>
          <div className={`px-3 py-1 rounded-full backdrop-blur-sm text-xs ${
            analysisData ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
          }`}>
            {analysisData ? `🛰️ ${analysisData.soilAnalysis.data_source.replace(/_/g, ' ')}` : '🛰️ Connecting...'}
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs text-white">
          {viewMode.toUpperCase()} Mode
        </div>
      </div>

      {/* Simulated Satellite Imagery */}
      <div className="absolute inset-0">
        <SatelliteImageLayer viewMode={viewMode} analysisData={analysisData} />
      </div>

      {/* Analysis Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-bold text-white mb-2">Analyzing Field</h3>
              <p className="text-gray-400">Processing satellite imagery...</p>
              <div className="mt-4 text-sm text-cyan-400">
                {analysisData?.soilAnalysis?.data_source ? 
                  `Using ${analysisData.soilAnalysis.data_source.replace(/_/g, ' ')}` : 
                  'Connecting to satellite services...'
                }
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Field Selection Zones */}
      {analysisData && (
        <div className="absolute inset-0">
          <FieldSelectionZones 
            analysisData={analysisData} 
            onSelect={onFieldSelect} 
          />
        </div>
      )}

      {/* Data Quality Indicator */}
      {analysisData && (
        <div className="absolute bottom-4 left-4">
          <div className="px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm text-xs">
            <div className="text-white font-medium">
              Quality: {analysisData.soilAnalysis.confidence_score}%
            </div>
            <div className="text-gray-400">
              {new Date(analysisData.soilAnalysis.analysis_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-xl bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70"
        >
          +
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-xl bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70"
        >
          -
        </motion.button>
      </div>
    </motion.div>
  );
};

// 🎨 SATELLITE IMAGE LAYER - REALISTIC IMAGERY SIMULATION
const SatelliteImageLayer: React.FC<{ 
  viewMode: string; 
  analysisData: EnhancedFieldAnalysis | null;
}> = ({ viewMode, analysisData }) => {
  const getImageStyle = () => {
    if (!analysisData) {
      return 'bg-gradient-to-br from-gray-700 to-gray-900';
    }

    const health = analysisData.fieldHealth;
    
    switch (viewMode) {
      case 'ndvi':
        // NDVI visualization: red (low) to green (high)
        if (health > 0.7) return 'bg-gradient-to-br from-green-400 via-green-500 to-green-600';
        if (health > 0.5) return 'bg-gradient-to-br from-yellow-400 via-green-400 to-green-500';
        if (health > 0.3) return 'bg-gradient-to-br from-orange-400 via-yellow-400 to-green-400';
        return 'bg-gradient-to-br from-red-500 via-orange-400 to-yellow-400';
      
      case 'rgb':
        // True color: healthy green to stressed brown
        if (health > 0.6) return 'bg-gradient-to-br from-green-700 via-green-500 to-green-600';
        return 'bg-gradient-to-br from-brown-600 via-green-500 to-brown-400';
      
      case 'infrared':
        // Infrared: vegetation appears red/pink
        return 'bg-gradient-to-br from-red-700 via-pink-500 to-purple-600';
      
      case 'moisture':
        // Moisture: blue (wet) to brown (dry)
        const moisture = analysisData.vegetationIndices.ndmi;
        if (moisture > 0.6) return 'bg-gradient-to-br from-blue-500 via-cyan-400 to-green-500';
        if (moisture > 0.4) return 'bg-gradient-to-br from-cyan-400 via-green-400 to-yellow-400';
        return 'bg-gradient-to-br from-yellow-400 via-orange-400 to-brown-500';
      
      default:
        return 'bg-gradient-to-br from-green-600 to-brown-500';
    }
  };

  return (
    <motion.div
      key={viewMode}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`w-full h-full ${getImageStyle()} relative overflow-hidden`}
    >
      {/* Field patterns based on analysis */}
      <div className="absolute inset-0 opacity-30">
        {analysisData?.problemAreas?.map((area, i) => (
          <div
            key={i}
            className="absolute bg-red-500/40 rounded-full animate-pulse"
            style={{
              width: 30 + Math.random() * 40,
              height: 30 + Math.random() * 40,
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
        
        {/* Healthy areas */}
        {analysisData && analysisData.fieldHealth > 0.6 && (
          <>
            {[...Array(8)].map((_, i) => (
              <div
                key={`healthy-${i}`}
                className="absolute bg-green-400/20 rounded-full"
                style={{
                  width: 40 + Math.random() * 60,
                  height: 40 + Math.random() * 60,
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Health indicator overlay */}
      {analysisData && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="text-center">
            <div className="text-4xl font-bold text-white drop-shadow-lg">
              {Math.round(analysisData.fieldHealth * 100)}%
            </div>
            <div className="text-sm text-white/80 drop-shadow">
              Field Health
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// 🎯 FIELD SELECTION ZONES - INTERACTIVE AREAS
const FieldSelectionZones: React.FC<{ 
  analysisData: EnhancedFieldAnalysis; 
  onSelect: (field: any) => void;
}> = ({ analysisData, onSelect }) => {
  const zones = [
    { 
      id: 1, 
      x: 30, 
      y: 40, 
      health: Math.round(analysisData.fieldHealth * 100), 
      crop: 'Main Field',
      ndvi: analysisData.vegetationIndices.ndvi
    },
    ...analysisData.problemAreas.slice(0, 2).map((area, index) => ({
      id: index + 2,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      health: Math.round((area.ndvi || 0) * 100),
      crop: 'Problem Area',
      ndvi: area.ndvi || 0,
      severity: area.severity
    }))
  ];

  return (
    <div className="absolute inset-0">
      {zones.map((zone) => (
        <motion.div
          key={zone.id}
          whileHover={{ scale: 1.1 }}
          onClick={() => onSelect(zone)}
          className="absolute w-16 h-16 cursor-pointer group"
          style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-full h-full border-2 rounded-full backdrop-blur-sm flex items-center justify-center ${
              zone.severity === 'critical' ? 'border-red-400 bg-red-400/20' :
              zone.severity === 'high' ? 'border-orange-400 bg-orange-400/20' :
              zone.health > 70 ? 'border-green-400 bg-green-400/20' :
              zone.health > 50 ? 'border-yellow-400 bg-yellow-400/20' :
              'border-red-400 bg-red-400/20'
            }`}
          >
            <span className="text-white font-bold text-xs">{zone.health}%</span>
          </motion.div>

          {/* Tooltip */}
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 rounded-lg px-3 py-2 text-xs text-white whitespace-nowrap">
            <div className="font-medium">{zone.crop}</div>
            <div>Health: {zone.health}%</div>
            <div>NDVI: {zone.ndvi?.toFixed(2) || 'N/A'}</div>
            {zone.severity && (
              <div className="text-red-400">⚠️ {zone.severity}</div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};