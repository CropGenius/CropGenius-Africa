/**
 * 🎛️ SATELLITE CONTROL PANEL - REAL CONTROLS FOR REAL DATA
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Satellite,
  Activity,
  Eye,
  Zap,
  TrendingUp,
  Download,
  Share,
  AlertTriangle
} from 'lucide-react';

interface SatelliteControlPanelProps {
  viewMode: string;
  setViewMode: (mode: 'ndvi' | 'rgb' | 'infrared' | 'moisture') => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  error: string | null;
}

export const SatelliteControlPanel: React.FC<SatelliteControlPanelProps> = ({ 
  viewMode, 
  setViewMode, 
  onAnalyze, 
  isAnalyzing, 
  error 
}) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    className="p-6 rounded-3xl backdrop-blur-lg bg-white/5 border border-cyan-400/20"
  >
    <div className="flex items-center mb-6">
      <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mr-4">
        <Satellite className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">Satellite Controls</h3>
        <p className="text-gray-400 text-sm">Multi-source • Real Data</p>
      </div>
    </div>

    {/* View Mode Selector */}
    <div className="space-y-3 mb-6">
      <label className="text-sm font-medium text-gray-300">Imagery Mode</label>
      <div className="grid grid-cols-2 gap-2">
        {[
          { id: 'ndvi' as const, label: 'NDVI', icon: Activity, color: 'from-green-400 to-teal-400' },
          { id: 'rgb' as const, label: 'True Color', icon: Eye, color: 'from-blue-400 to-cyan-400' },
          { id: 'infrared' as const, label: 'Infrared', icon: Zap, color: 'from-red-400 to-orange-400' },
          { id: 'moisture' as const, label: 'Moisture', icon: TrendingUp, color: 'from-purple-400 to-pink-400' }
        ].map((mode) => (
          <motion.button
            key={mode.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode(mode.id)}
            className={`p-3 rounded-xl border transition-all ${viewMode === mode.id
              ? `bg-gradient-to-r ${mode.color} border-white/20 text-white`
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
          >
            <mode.icon className="w-4 h-4 mb-1 mx-auto" />
            <div className="text-xs">{mode.label}</div>
          </motion.button>
        ))}
      </div>
    </div>

    {/* Error Display */}
    {error && (
      <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-400/20 text-red-400 text-sm">
        <AlertTriangle className="w-4 h-4 inline mr-2" />
        {error}
      </div>
    )}

    {/* Analyze Button */}
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onAnalyze}
      disabled={isAnalyzing}
      className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-semibold relative overflow-hidden disabled:opacity-50"
    >
      <AnimatePresence>
        {isAnalyzing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
            />
            Analyzing...
          </motion.div>
        ) : (
          <span>Analyze Field</span>
        )}
      </AnimatePresence>
    </motion.button>

    {/* Quick Actions */}
    <div className="grid grid-cols-2 gap-2 mt-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
      >
        <Download className="w-4 h-4 mx-auto mb-1" />
        <div className="text-xs">Export</div>
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
      >
        <Share className="w-4 h-4 mx-auto mb-1" />
        <div className="text-xs">Share</div>
      </motion.button>
    </div>
  </motion.div>
);