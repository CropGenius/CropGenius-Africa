/**
 * 🚨 PROBLEM AREAS ALERT - REAL ISSUE DETECTION
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, Zap } from 'lucide-react';
import { type EnhancedFieldAnalysis } from '@/intelligence/enhancedFieldIntelligence';

interface ProblemAreasAlertProps {
  data: EnhancedFieldAnalysis | null;
  onProblemAreaClick?: (area: any) => void;
  showActionButtons?: boolean;
}

export const ProblemAreasAlert: React.FC<ProblemAreasAlertProps> = ({ 
  data, 
  onProblemAreaClick,
  showActionButtons = true 
}) => {
  if (!data || (!data.problemAreas?.length && !data.alerts?.length)) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-3xl backdrop-blur-lg bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-400/20"
      >
        <div className="flex items-center mb-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 bg-green-400 rounded-full mr-3"
          />
          <h3 className="text-lg font-semibold text-white">Field Status</h3>
        </div>
        
        <div className="text-center py-4">
          <div className="text-green-400 font-medium">✅ No Issues Detected</div>
          <div className="text-xs text-gray-400 mt-1">Field appears healthy</div>
        </div>
      </motion.div>
    );
  }

  const criticalAlerts = data.alerts?.filter(alert => alert.severity === 'critical') || [];
  const highAlerts = data.alerts?.filter(alert => alert.severity === 'high') || [];
  const problemAreas = data.problemAreas || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="p-6 rounded-3xl backdrop-blur-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/20"
    >
      <div className="flex items-center mb-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-3 h-3 bg-orange-400 rounded-full mr-3"
        />
        <h3 className="text-lg font-semibold text-white">Field Alerts</h3>
        {(criticalAlerts.length > 0 || highAlerts.length > 0) && (
          <div className="ml-auto">
            <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
              {criticalAlerts.length + highAlerts.length} URGENT
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Critical Alerts */}
        {criticalAlerts.map((alert, index) => (
          <div key={`critical-${index}`} className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-400/20">
            <div>
              <div className="text-red-400 font-medium flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                {alert.message}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {alert.type.replace('_', ' ').toUpperCase()} • CRITICAL
              </div>
            </div>
            <div className="text-red-400 font-bold text-xl">🚨</div>
          </div>
        ))}

        {/* High Priority Alerts */}
        {highAlerts.map((alert, index) => (
          <div key={`high-${index}`} className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-400/20">
            <div>
              <div className="text-orange-400 font-medium flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {alert.message}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {alert.type.replace('_', ' ').toUpperCase()} • HIGH PRIORITY
              </div>
            </div>
            <div className="text-orange-400 font-bold text-xl">⚠️</div>
          </div>
        ))}

        {/* Problem Areas */}
        {problemAreas.slice(0, 3).map((area, index) => (
          <div 
            key={`area-${index}`} 
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
              area.severity === 'critical' ? 'bg-red-500/10 border border-red-400/20 hover:bg-red-500/20' :
              area.severity === 'high' ? 'bg-orange-500/10 border border-orange-400/20 hover:bg-orange-500/20' :
              'bg-yellow-500/10 border border-yellow-400/20 hover:bg-yellow-500/20'
            }`}
            onClick={() => onProblemAreaClick?.(area)}
          >
            <div>
              <div className={`font-medium flex items-center ${
                area.severity === 'critical' ? 'text-red-400' :
                area.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
              }`}>
                <MapPin className="w-4 h-4 mr-2" />
                Low NDVI Zone ({area.ndvi?.toFixed(2) || 'N/A'})
              </div>
              <div className="text-xs text-gray-400 mt-1">
                GPS: {area.lat?.toFixed(4)}, {area.lng?.toFixed(4)} • {area.severity.toUpperCase()}
              </div>
            </div>
            <div className={`font-bold text-xl ${
              area.severity === 'critical' ? 'text-red-400' :
              area.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
            }`}>
              {area.severity === 'critical' ? '🚨' : area.severity === 'high' ? '⚠️' : '⚡'}
            </div>
          </div>
        ))}

        {problemAreas.length > 3 && (
          <div className="text-center py-2">
            <span className="text-sm text-gray-400">
              +{problemAreas.length - 3} more problem areas
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActionButtons && (criticalAlerts.length > 0 || problemAreas.length > 0) && (
        <div className="mt-4 space-y-2">
          {criticalAlerts.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-400 to-orange-400 text-white font-semibold"
            >
              🚨 Take Emergency Action
            </motion.button>
          )}
          
          {problemAreas.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
            >
              📍 View All Problem Areas
            </motion.button>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {(data.alerts?.length || data.problemAreas?.length) && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="font-bold text-red-400">{criticalAlerts.length}</div>
              <div className="text-gray-500">Critical</div>
            </div>
            <div>
              <div className="font-bold text-orange-400">{highAlerts.length}</div>
              <div className="text-gray-500">High</div>
            </div>
            <div>
              <div className="font-bold text-yellow-400">{problemAreas.length}</div>
              <div className="text-gray-500">Areas</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};