import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Mic, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface StepThreeProps {
  cropType: string;
  onCropTypeChange: (cropType: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function StepThree({
  cropType,
  onCropTypeChange,
  onNext,
  onBack,
  onSkip
}: StepThreeProps) {
  const [searchValue, setSearchValue] = useState(cropType || '');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Update crop type when search value changes
    onCropTypeChange(searchValue.trim());
  }, [searchValue, onCropTypeChange]);

  const handleListenForCrop = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      toast.warning('Speech recognition not supported in your browser');
      return;
    }

    setIsListening(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.start();
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchValue(transcript);
      setIsListening(false);
      toast.success(`Heard: ${transcript}`);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      toast.error('Could not understand speech', {
        description: 'Please try again or type your crop name'
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleNext = () => {
    if (!searchValue.trim()) {
      toast.warning('Please enter a crop name');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold mb-2">What are you growing here?</h2>
        <p className="text-center text-muted-foreground mb-6">
          Search for your crop by typing or using voice input
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Type your crop name (e.g., Maize, Tomato, Rice...)"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 py-6 text-lg"
              autoFocus
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className={`flex-shrink-0 h-12 w-12 ${isListening ? 'bg-primary text-primary-foreground animate-pulse' : ''}`}
            onClick={handleListenForCrop}
            disabled={isListening}
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>

        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 bg-primary/10 rounded-lg"
          >
            <p className="text-primary font-medium">🎤 Listening... Speak your crop name</p>
          </motion.div>
        )}

        {searchValue.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 rounded-lg border border-green-200"
          >
            <p className="text-green-800">
              <span className="font-medium">Selected crop:</span> {searchValue.trim()}
            </p>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-blue-50 p-4 rounded-lg"
      >
        <h3 className="font-medium text-blue-900 mb-2">💡 Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Enter any crop name (vegetables, fruits, grains, etc.)</li>
          <li>• Use the microphone button for voice input</li>
          <li>• Be specific (e.g., "Sweet Corn" instead of just "Corn")</li>
        </ul>
      </motion.div>

      <motion.div 
        className="flex justify-between gap-3 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <div className="space-y-2 flex-1">
          <Button 
            onClick={handleNext}
            disabled={!searchValue.trim()}
            className="w-full"
          >
            {searchValue.trim() ? "Continue" : "Enter a crop name"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="w-full text-xs font-normal"
          >
            Skip this step
          </Button>
        </div>
      </motion.div>
    </div>
  );
}