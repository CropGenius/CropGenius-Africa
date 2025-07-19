/**
 * 📋 FIELD ANALYSIS RESULTS - COMPREHENSIVE INSIGHTS
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  Droplets,
  Leaf,
  Target,
  Clock
} from 'lucide-react';
import { type EnhancedFieldAnalysis } from '@/intelligence/enhancedFieldIntelligence';

interface FieldAnalysisResultsProps {
  field: any;
  analysis: EnhancedFieldAnalysis;
}

export const FieldAnalysisResults: React.FC<FieldAnalysisResultsProps> = ({ 
  field, 
  analysis 
}) => {
  const healthPercentage = Math.round(analysis.fieldHealth * 100);
  const dataSource = analysis.soilAnalysis.data_source.replace(/_/g, ' ');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-3xl backdrop-blur-lg bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/20"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">Field Analysis Results</h3>
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-400 text-sm">
            {dataSource}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-semibold"
          >
            Save Report
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Metrics */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-cyan-400 flex items-center">
            <Leaf className="w-5 h-5 mr-2" />
            Health Metrics
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Field Health</span>
              <span className={`font-bold text-lg ${
                healthPercentage > 80 ? 'text-green-400' :
                healthPercentage > 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {healthPercentage}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">NDVI Score</span>
              <span className="text-white font-bold">
                {analysis.vegetationIndices.ndvi.toFixed(3)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">EVI Index</span>
              <span className="text-green-400 font-bold">
                {analysis.vegetationIndices.evi.toFixed(3)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">SAVI Index</span>
              <span className="text-blue-400 font-bold">
                {analysis.vegetationIndices.savi.toFixed(3)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Moisture Stress</span>
              <span className={`font-bold ${
                analysis.moistureStress === 'low' ? 'text-green-400' :
                analysis.moistureStress === 'moderate' ? 'text-yellow-400' :
                analysis.moistureStress === 'high' ? 'text-orange-400' : 'text-red-400'
              }`}>
                {analysis.moistureStress.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Data Quality */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-2">Data Quality</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Confidence</span>
              <span className="text-cyan-400 font-bold">
                {analysis.soilAnalysis.confidence_score}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Resolution</span>
              <span className="text-white text-sm">
                {analysis.soilAnalysis.spatial_resolution}
              </span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-purple-400 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Recommendations
          </h4>
          
          <div className="space-y-2 text-sm max-h-80 overflow-y-auto">
            {analysis.recommendations.map((rec, index) => {
              const isUrgent = rec.includes('CRITICAL') || rec.includes('URGENT') || rec.includes('🚨');
              const isGood = rec.includes('EXCELLENT') || rec.includes('✅') || rec.includes('🌟');
              
              return (
                <div 
                  key={index}
                  className={`p-3 rounded-xl border ${
                    isUrgent ? 'bg-red-400/10 border-red-400/20 text-red-400' :
                    isGood ? 'bg-green-400/10 border-green-400/20 text-green-400' :
                    'bg-blue-400/10 border-blue-400/20 text-blue-400'
                  }`}
                >
                  {isUrgent && <AlertTriangle className="w-4 h-4 inline mr-2" />}
                  {isGood && <CheckCircle className="w-4 h-4 inline mr-2" />}
                  {rec}
                </div>
              );
            })}
          </div>
        </div>

        {/* Economic Impact */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-orange-400 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Economic Impact
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Predicted Yield</span>
              <span className="text-white font-bold">
                {analysis.yieldPrediction} T/Ha
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Yield Potential</span>
              <span className="text-green-400 font-bold">
                {healthPercentage > 85 ? '90-100%' :
                 healthPercentage > 70 ? '75-90%' :
                 healthPercentage > 50 ? '50-75%' : '25-50%'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Est. Market Value</span>
              <span className="text-green-400 font-bold">
                ${Math.floor(analysis.yieldPrediction * 200)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Profit Margin</span>
              <span className="text-purple-400 font-bold">
                {Math.floor(healthPercentage * 0.8)}%
              </span>
            </div>
          </div>

          {/* Optimization Opportunities */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-400/20">
            <div className="text-sm font-medium text-green-400 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Optimization Potential
            </div>
            <div className="text-xs text-gray-300 space-y-1">
              <div>• Fertilizer savings: 15-25%</div>
              <div>• Water reduction: 20-30%</div>
              <div>• Yield increase: {Math.floor((1 - analysis.fieldHealth) * 20)}%</div>
            </div>
          </div>

          {/* Problem Areas Summary */}
          {analysis.problemAreas.length > 0 && (
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-400/20">
              <div className="text-sm font-medium text-orange-400 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Problem Areas
              </div>
              <div className="text-xs text-gray-300">
                {analysis.problemAreas.length} area(s) need attention
              </div>
              <div className="text-xs text-orange-300 mt-1">
                Potential yield loss: {Math.floor(analysis.problemAreas.length * 5)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alerts Summary */}
      {analysis.alerts.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-400/20">
          <h5 className="text-red-400 font-semibold mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Active Alerts ({analysis.alerts.length})
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.alerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <div>
                  <div className={`text-sm font-medium ${
                    alert.severity === 'critical' ? 'text-red-400' :
                    alert.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                  }`}>
                    {alert.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {alert.type.replace('_', ' ').toUpperCase()} • {alert.severity.toUpperCase()}
                  </div>
                </div>
                {alert.action_required && (
                  <div className="text-red-400 font-bold">!</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Metadata */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(analysis.soilAnalysis.analysis_date).toLocaleString()}
            </div>
            <div>
              Source: {dataSource}
            </div>
            <div>
              Resolution: {analysis.soilAnalysis.spatial_resolution}
            </div>
          </div>
          <div className="text-cyan-400">
            Confidence: {analysis.soilAnalysis.confidence_score}%
          </div>
        </div>
      </div>
    </motion.div>
  );
};