import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useErrorLogging } from '@/hooks/use-error-logging';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { Field, Boundary, Coordinates } from '@/types/field';
import StepOne from './steps/StepOne';
import StepTwo from './steps/StepTwo';
import StepThree from './steps/StepThree';
import StepFour from './steps/StepFour';
import StepFive from './steps/StepFive';
import FieldMapperStep from './steps/FieldMapperStep';
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
  const { logError, logSuccess } = useErrorLogging('AddFieldWizard');
  const navigate = useNavigate();
  
  // Core state - no complex session management
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [farmId, setFarmId] = useState<string | null>(null);
  
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
          logSuccess('field_created', { field_id: data.id });
          toast.success('Field created successfully!', {
            description: `${fieldData.name} has been added to your farm.`
          });

          if (onSuccess) {
            onSuccess(data);
          } else {
            navigate(`/fields/${data.id}`);
          }
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

      toast.success('Field saved offline!', {
        description: 'Your field will sync when you\'re back online.'
      });

      if (onSuccess) {
        onSuccess(offlineField);
      } else {
        navigate('/fields');
      }

    } catch (error: any) {
      console.error('❌ Field creation failed:', error);
      logError(error, { context: 'handleSubmit' });
      
      toast.error('Failed to create field', {
        description: error.message || 'Please try again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress calculation
  const progress = (currentStep / totalSteps) * 100;

  return (
    <ErrorBoundary>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Progress indicator */}
        <div className="space-y-2">
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

        {/* Step content */}
        <Card>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && (
                  <StepOne
                    fieldName={fieldData.name}
                    onFieldNameChange={(name) => updateFieldData({ name })}
                    onNext={handleNext}
                  />
                )}
                
                {currentStep === 2 && (
                  <FieldMapperStep
                    defaultLocation={fieldData.location || undefined}
                    onNext={(data) => {
                      updateFieldData({
                        boundary: data.boundary,
                        location: data.location,
                        name: data.name || fieldData.name
                      });
                      handleNext();
                    }}
                    onBack={handleBack}
                    onSkip={handleSkip}
                    initialBoundary={fieldData.boundary}
                    initialName={fieldData.name}
                  />
                )}
                
                {currentStep === 3 && (
                  <StepTwo
                    location={fieldData.location}
                    boundary={fieldData.boundary}
                    onLocationChange={(location) => updateFieldData({ location })}
                    onBoundaryChange={(boundary) => updateFieldData({ boundary })}
                    onNext={handleNext}
                    onBack={handleBack}
                    onSkip={handleSkip}
                  />
                )}
                
                {currentStep === 4 && (
                  <StepThree
                    cropType={fieldData.crop_type}
                    onCropTypeChange={(crop_type) => updateFieldData({ crop_type })}
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
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Global navigation (hidden on step 1 & 6) */}
        {currentStep > 1 && currentStep < 6 && (
          <div className="flex justify-between">
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
        )}

        {/* Cancel button */}
        {onCancel && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}