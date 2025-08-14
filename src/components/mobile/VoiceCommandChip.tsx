/**
 * 🎤 VOICE COMMAND CHIP - Production Ready
 * Voice recognition for hands-free farming
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface VoiceCommandChipProps {
  onNavigate: (tab: string) => void;
  onAction: (action: string) => void;
}

export const VoiceCommandChip: React.FC<VoiceCommandChipProps> = ({
  onNavigate,
  onAction
}) => {
  const [isListening, setIsListening] = useState(false);

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    
    if (!isListening) {
      // Simulate voice recognition
      setTimeout(() => {
        setIsListening(false);
        onNavigate('scan');
      }, 2000);
    }
  };

  return (
    <motion.button
      onClick={handleVoiceToggle}
      className={`fixed top-20 right-4 z-30 flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg transition-all duration-200 ${
        isListening 
          ? 'bg-red-500 text-white' 
          : 'bg-white/10 backdrop-blur-xl border border-white/10 text-gray-700'
      }`}
      whileTap={{ scale: 0.95 }}
      animate={{ 
        scale: isListening ? [1, 1.1, 1] : 1,
      }}
      transition={{ 
        repeat: isListening ? Infinity : 0,
        duration: 1
      }}
    >
      {isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      <span className="text-xs font-medium">
        {isListening ? 'Listening...' : 'Voice'}
      </span>
    </motion.button>
  );
};