import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

import { Field, Boundary, Coordinates } from '@/types/field';
import StepOne from './steps/StepOne';
import StepTwo from './steps/StepTwo';
import StepThree from './steps/StepThree';
import StepFour from './steps/StepFour';
import StepFive from './steps/StepFive';

import StepSoilIrrigation from './steps/StepSoilIrrigation';
import FieldSuccess from './FieldSuccess';
import { isOnline } from '@/utils/isOnline';
import { v4 as uuidv4 } from 'uuid';

interface AddFieldWizardProps {
  onSuccess?: (field: Field) => void;
  onCancel?: () => void;
  defaultLocation?: { lat: number; lng: number };
}

// Simplified field data interface
interface FieldWizardData {
  name: string;
  boundary: Boundary | null;
  location: Coordinates | null;
  size: number | undefined;
  size_unit: string;
  crop_type: string;
  planting_date: Date | null;
  soil_type: string;
  irrigation_type: string;
  location_description: string;

}

export default function AddFieldWizard({ onSuccess, onCancel, defaultLocation }: AddFieldWizardProps) {
  const navigate = useNavigate();

  // Core state - no complex session management
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [farmId, setFarmId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdField, setCreatedField] = useState<Field | null>(null);

  // Field data state
  const [fieldData, setFieldData] = useState<FieldWizardData>({
    name: '',
    boundary: null,
    location: defaultLocation || null,
    size: undefined,
    size_unit: 'hectares',
    crop_type: '',
    planting_date: null,
    soil_type: '',
    irrigation_type: '',
    location_description: '',

  });

  const totalSteps = 6;

  // Get user and farm - but NEVER block the flow
  useEffect(() => {
    const initializeContext = async () => {
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser?.id) {
          // Try to get user's farm
          const { data: farms, error } = await supabase
            .from('farms')
            .select('id, name')
            .eq('user_id', currentUser.id)
            .limit(1);

          if (farms && farms.length > 0) {
            setFarmId(farms[0].id);
          } else if (!error) {
            // Create default farm if none exists
            const { data: newFarm, error: createError } = await supabase
              .from('farms')
              .insert({
                name: 'My Farm',
                user_id: currentUser.id,
                size_unit: 'hectares'
              })
              .select()
              .single();

            if (newFarm && !createError) {
              setFarmId(newFarm.id);
            }
          }
        }
      } catch (error) {
        console.warn('Context initialization failed:', error);
        // Continue anyway - never block the user
      }
    };

    initializeContext();
  }, []);

  const updateFieldData = useCallback((partialData: Partial<FieldWizardData>) => {
    setFieldData(prev => ({ ...prev, ...partialData }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    handleNext();
  }, [handleNext]);

  const handleSuccessContinue = useCallback(() => {
    if (createdField) {
      if (onSuccess) {
        onSuccess(createdField);
      } else {
        navigate(`/fields/${createdField.id}`);
      }
    }
  }, [createdField, onSuccess, navigate]);

  // Main submission handler
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Generate field ID
      const fieldId = uuidv4();

      // Create field data
      const finalFieldData: Omit<Field, 'created_at' | 'updated_at'> = {
        id: fieldId,
        user_id: user?.id || 'anonymous',
        farm_id: farmId || `temp-farm-${Date.now()}`,
        name: fieldData.name || 'Unnamed Field',
        size: fieldData.size || 1,
        size_unit: fieldData.size_unit,
        boundary: fieldData.boundary,
        location_description: fieldData.location_description || null,
        soil_type: fieldData.soil_type || null,
        irrigation_type: fieldData.irrigation_type || null,

      };

      console.log('🌱 Creating field:', finalFieldData);

      // Try to save to database
      if (isOnline() && user?.id) {
        const { data, error } = await supabase
          .from('fields')
          .insert(finalFieldData)
          .select()
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          console.log('Field created successfully:', data.id);
          setCreatedField(data);
          setShowSuccess(true);
          return;
        }
      }

      // Offline fallback
      const offlineField: Field = {
        ...finalFieldData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        offline_id: fieldId,
        is_synced: false
      };

      // Save to localStorage
      const existingFields = JSON.parse(localStorage.getItem('cropgenius_offline_fields') || '[]');
      existingFields.push(offlineField);
      localStorage.setItem('cropgenius_offline_fields', JSON.stringify(existingFields));

      setCreatedField(offlineField);
      setShowSuccess(true);

    } catch (error: any) {
      console.error('❌ Field creation failed:', error);

      toast.error('Failed to create field', {
        description: error.message || 'Please try again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress calculation
  const progress = (currentStep / totalSteps) * 100;

  // Show success page
  if (showSuccess && createdField) {
    return (
      <FieldSuccess 
        fieldName={createdField.name}
        onContinue={handleSuccessContinue}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress indicator */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-2">
          <div className="flex justify-between text-sm">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto" style={{ minHeight: 0 }}>
        <div className="max-w-2xl mx-auto">
          <div key={currentStep}>
            {currentStep === 1 && (
              <StepOne
                fieldName={fieldData.name}
                onFieldNameChange={(name) => updateFieldData({ name })}
                onNext={handleNext}
              />
            )}

            {currentStep === 2 && (
              <StepTwo
                location={fieldData.location}
                boundary={fieldData.boundary}
                onLocationChange={(location, description) => {
                  updateFieldData({ 
                    location,
                    location_description: description || fieldData.location_description
                  });
                }}
                onBoundaryChange={(boundary) => updateFieldData({ boundary })}
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
              />
            )}

            {currentStep === 3 && (
              <StepThree
                cropType={fieldData.crop_type}
                onCropTypeChange={(crop_type) => updateFieldData({ crop_type })}
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
              />
            )}

            {currentStep === 4 && (
              <StepSoilIrrigation
                soilType={fieldData.soil_type}
                irrigationType={fieldData.irrigation_type}
                onSoilTypeChange={(soil_type) => updateFieldData({ soil_type })}
                onIrrigationTypeChange={(irrigation_type) => updateFieldData({ irrigation_type })}
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
              />
            )}

            {currentStep === 5 && (
              <StepFour
                size={fieldData.size}
                sizeUnit={fieldData.size_unit}
                onSizeChange={(size) => updateFieldData({ size })}
                onSizeUnitChange={(size_unit) => updateFieldData({ size_unit })}
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
              />
            )}

            {currentStep === 6 && (
              <StepFive
                plantingDate={fieldData.planting_date}
                onPlantingDateChange={(planting_date) => updateFieldData({ planting_date })}
                onBack={handleBack}
                onSubmit={handleSubmit}
                onSkip={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </div>

      {/* Global navigation (hidden on step 1 & 6) */}
      {currentStep > 1 && currentStep < 6 && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t px-4 py-4">
          <div className="max-w-2xl mx-auto flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isSubmitting}
              >
                Skip
              </Button>
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel button */}
      {onCancel && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t px-4 py-2">
          <div className="max-w-2xl mx-auto flex justify-center">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}