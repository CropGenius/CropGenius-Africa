/**
 * 🚀 FLOATING ACTION BUTTON - Production Ready
 * Multi-action FAB with smooth animations
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Cloud, TrendingUp, X } from 'lucide-react';

interface FloatingActionButtonProps {
  onScanCrop: () => void;
  onWeatherCheck: () => void;
  onMarketCheck: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onScanCrop,
  onWeatherCheck,
  onMarketCheck
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { 
      id: 'scan', 
      icon: Camera, 
      label: 'Scan Crop', 
      color: 'bg-green-500', 
      action: onScanCrop 
    },
    { 
      id: 'weather', 
      icon: Cloud, 
      label: 'Weather', 
      color: 'bg-blue-500', 
      action: onWeatherCheck 
    },
    { 
      id: 'market', 
      icon: TrendingUp, 
      label: 'Market', 
      color: 'bg-purple-500', 
      action: onMarketCheck 
    }
  ];

  const handleActionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-4 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ scale: 0, x: 20 }}
                  animate={{ scale: 1, x: 0 }}
                  exit={{ scale: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleActionClick(action.action)}
                  className={`flex items-center justify-center w-12 h-12 ${action.color} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="h-6 w-6" />
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </motion.button>
    </div>
  );
};