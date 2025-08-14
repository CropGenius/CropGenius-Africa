/**
 * 📊 FIELD HEALTH METRICS - REAL DATA VISUALIZATION
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Satellite } from 'lucide-react';
import { type EnhancedFieldAnalysis } from '@/intelligence/enhancedFieldIntelligence';

interface FieldHealthMetricsProps {
  data: EnhancedFieldAnalysis | null;
}

export const FieldHealthMetrics: React.FC<FieldHealthMetricsProps> = ({ data }) => {
  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-3xl backdrop-blur-lg bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-400/20"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-green-400" />
          Field Health
        </h3>
        <div className="text-center py-8 text-gray-400">
          <Satellite className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Click "Analyze Field" to get satellite data</p>
        </div>
      </motion.div>
    );
  }

  const healthPercentage = Math.round(data.fieldHealth * 100);
  const dataSource = data.soilAnalysis.data_source.replace(/_/g, ' ');
  const lastUpdate = new Date(data.soilAnalysis.analysis_date).toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="p-6 rounded-3xl backdrop-blur-lg bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-400/20"
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-green-400" />
        Field Health
      </h3>

      <div className="space-y-4">
        {/* Health Score */}
        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Overall Health</span>
            <span className="text-2xl font-bold text-green-400">{healthPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${healthPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* NDVI and Yield */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 rounded-xl bg-white/5">
            <div className="text-lg font-bold text-cyan-400">
              {data.vegetationIndices.ndvi.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">NDVI Average</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <div className="text-lg font-bold text-purple-400">{data.yieldPrediction}T</div>
            <div className="text-xs text-gray-400">Predicted Yield</div>
          </div>
        </div>

        {/* Additional Indices */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-white/5">
            <div className="font-bold text-green-300">{data.vegetationIndices.evi.toFixed(2)}</div>
            <div className="text-gray-500">EVI</div>
          </div>
          <div className="p-2 rounded-lg bg-white/5">
            <div className="font-bold text-blue-300">{data.vegetationIndices.savi.toFixed(2)}</div>
            <div className="text-gray-500">SAVI</div>
          </div>
          <div className="p-2 rounded-lg bg-white/5">
            <div className="font-bold text-purple-300">{data.vegetationIndices.ndmi.toFixed(2)}</div>
            <div className="text-gray-500">NDMI</div>
          </div>
        </div>

        {/* Moisture Stress Indicator */}
        <div className="p-3 rounded-xl bg-white/5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Moisture Stress</span>
            <span className={`text-sm font-bold ${
              data.moistureStress === 'low' ? 'text-green-400' :
              data.moistureStress === 'moderate' ? 'text-yellow-400' :
              data.moistureStress === 'high' ? 'text-orange-400' : 'text-red-400'
            }`}>
              {data.moistureStress.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div>📅 {lastUpdate.split(',')[0]}</div>
            <div>🛰️ {dataSource}</div>
            <div>📐 {data.soilAnalysis.spatial_resolution}</div>
            <div>🎯 {data.soilAnalysis.confidence_score}% confidence</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};