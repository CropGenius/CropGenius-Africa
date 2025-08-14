import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StepSoilIrrigationProps {
  soilType: string;
  irrigationType: string;
  onSoilTypeChange: (soilType: string) => void;
  onIrrigationTypeChange: (irrigationType: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const soilTypes = [
  { value: 'clay', label: 'Clay' },
  { value: 'sandy', label: 'Sandy' },
  { value: 'loam', label: 'Loam' },
  { value: 'silt', label: 'Silt' },
  { value: 'rocky', label: 'Rocky' },
  { value: 'unknown', label: 'Not sure' }
];

const irrigationTypes = [
  { value: 'rain_fed', label: 'Rain-fed' },
  { value: 'drip', label: 'Drip irrigation' },
  { value: 'sprinkler', label: 'Sprinkler' },
  { value: 'flood', label: 'Flood irrigation' },
  { value: 'manual', label: 'Manual watering' },
  { value: 'none', label: 'No irrigation' }
];

export default function StepSoilIrrigation({
  soilType,
  irrigationType,
  onSoilTypeChange,
  onIrrigationTypeChange,
  onNext,
  onBack,
  onSkip
}: StepSoilIrrigationProps) {
  const canContinue = soilType && irrigationType;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-center mb-2">Soil & Irrigation</h2>
        <p className="text-center text-muted-foreground mb-6">
          Tell us about your soil type and irrigation method
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h3 className="text-sm font-medium mb-3">Soil Type:</h3>
        <div className="grid grid-cols-2 gap-3">
          {soilTypes.map((soil) => (
            <Card 
              key={soil.value}
              className={cn(
                "p-3 text-center cursor-pointer hover:bg-primary/5 transition-colors",
                soilType === soil.value && "bg-primary/10 border-primary"
              )}
              onClick={() => onSoilTypeChange(soil.value)}
            >
              <div className="text-sm font-medium">{soil.label}</div>
            </Card>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h3 className="text-sm font-medium mb-3">Irrigation Method:</h3>
        <div className="grid grid-cols-2 gap-3">
          {irrigationTypes.map((irrigation) => (
            <Card 
              key={irrigation.value}
              className={cn(
                "p-3 text-center cursor-pointer hover:bg-primary/5 transition-colors",
                irrigationType === irrigation.value && "bg-primary/10 border-primary"
              )}
              onClick={() => onIrrigationTypeChange(irrigation.value)}
            >
              <div className="text-sm font-medium">{irrigation.label}</div>
            </Card>
          ))}
        </div>
      </motion.div>

      <motion.div 
        className="flex justify-between gap-3 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
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
            onClick={onNext}
            className="w-full"
            disabled={!canContinue}
          >
            Continue
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