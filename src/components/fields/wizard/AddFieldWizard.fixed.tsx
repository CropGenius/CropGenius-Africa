import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Tractor, MapPin, ArrowRight, Circle, CheckCircle, Sparkles, AlertTriangle, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
// useErrorLogging eliminated - using console.error instead
import { Field, Boundary, Coordinates } from '@/types/field';
import StepOne from './steps/StepOne';
import StepTwo from './steps/StepTwo';
import StepThree from './steps/StepThree';
import StepFour from './steps/StepFour';
import StepFive from './steps/StepFive';
import FieldMapperStep from './steps/FieldMapperStep';
import { sanitizeFieldData, isOnline } from '@/utils/fieldSanitizer';
import { Database } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';
import { useCreateField } from '@/features/fields/hooks/useCreateField';
import { addOnlineStatusListener } from '@/utils/isOnline';
import OfflineStatusIndicator from '../OfflineStatusIndicator';

interface AddFieldWizardProps {
  onSuccess?: (field: Field) => void;
  onCancel?: () => void;
  defaultLocation?: { lat: number; lng: number };
}

// Session storage keys
const SESSION_FIELD_DATA_KEY = 'cropgenius_field_wizard_data';
const SESSION_STEP_KEY = 'cropgenius_field_wizard_step';
const SESSION_FARM_KEY = 'cropgenius_field_wizard_farm';

// Helper to safely parse JSON from session storage
const getSessionData = <T,>(key: string, defaultValue: T): T => {
  try {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving session data for ${key}:`, error);
    return defaultValue;
  }
};

// Helper to safely save JSON to session storage
const saveSessionData = <T,>(key: string, data: T): void => {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving session data for ${key}:`, error);
  }
};

// Helper to clear session data
const clearSessionData = (): void => {
  try {
    sessionStorage.removeItem(SESSION_FIELD_DATA_KEY);
    sessionStorage.removeItem(SESSION_STEP_KEY);
    sessionStorage.removeItem(SESSION_FARM_KEY);
  } catch (error) {
    console.error(`Error clearing session data:`, error);
  }
};

export default function AddFieldWizard({ onSuccess, onCancel, defaultLocation }: AddFieldWizardProps) {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  // --- Simple plan state (localStorage-based) ---
  const getIsPro = () => {
    try {
      const v = localStorage.getItem('plan_is_pro');
      return v === 'true';
    } catch { return false; }
  };
  const [isPro, setIsPro] = useState<boolean>(getIsPro());
  const [userFieldCount, setUserFieldCount] = useState<number | null>(null);
  const [isGated, setIsGated] = useState(false);
  
  // Initialize state from session storage if available
  const [currentStep, setCurrentStep] = useState(() => 
    getSessionData<number>(SESSION_STEP_KEY, 1)
  );
  
  const [isLoading, setIsLoading] = useState(true);
  const [farmContext, setFarmContext] = useState<{ id: string; name: string } | null>(() => 
    getSessionData<{ id: string; name: string } | null>(SESSION_FARM_KEY, null)
  );
  
  const [fieldData, setFieldData] = useState(() => {
    // Try to get saved field data from session storage
    const savedData = getSessionData(SESSION_FIELD_DATA_KEY, {
      name: '',
      boundary: null,
      location: defaultLocation || null,
      size: undefined as number | undefined,
      size_unit: 'hectares',
      crop_type: '',
      planting_date: null as Date | null,
      soil_type: '',
      irrigation_type: '',
      location_description: '',
    });
    
    // If we have default location but no saved location, use the default
    if (defaultLocation && !savedData.location) {
      savedData.location = defaultLocation;
    }
    
    return savedData;
  });
  
  // Track online status
  const [isOnlineStatus, setIsOnlineStatus] = useState(isOnline());
  
  // Progress steps
  const totalSteps = 6; // Increased to 6 to include field mapper step
  
  // Use the mutation hook
  const { mutate: createField, isPending: isSubmitting } = useCreateField();
  
  // Monitor online/offline status
  useEffect(() => {
    const cleanup = addOnlineStatusListener((online) => {
      setIsOnlineStatus(online);
      if (online) {
        toast.success("You're back online", {
          description: "Full functionality restored"
        });
      } else {
        toast.warning("You're offline", {
          description: "Your progress will be saved locally"
        });
      }
    });
    
    return cleanup;
  }, []);

  // Save field data to session storage whenever it changes
  useEffect(() => {
    saveSessionData(SESSION_FIELD_DATA_KEY, fieldData);
  }, [fieldData]);
  
  // Save current step to session storage whenever it changes
  useEffect(() => {
    saveSessionData(SESSION_STEP_KEY, currentStep);
  }, [currentStep]);
  
  // Save farm context to session storage whenever it changes
  useEffect(() => {
    if (farmContext) {
      saveSessionData(SESSION_FARM_KEY, farmContext);
    }
  }, [farmContext]);

  // Get farm context - but NEVER block the flow
  useEffect(() => {
    const loadFarmContext = async () => {
      try {
        setIsLoading(true);
        
        // If no user is logged in yet, don't block
        if (!user?.id) {
          console.log("⚠️ [AddFieldWizard] No user authenticated yet. Proceeding anyway.");
          setIsLoading(false);
          return;
        }
        
        // If offline, use cached farm context or create a temporary one
        if (!isOnlineStatus) {
          if (farmContext) {
            console.log("⚠️ [AddFieldWizard] Offline mode - using cached farm context");
            setIsLoading(false);
            return;
          }
          
          // Create a temporary farm context for offline mode
          const tempFarmContext = {
            id: `temp-farm-${Date.now()}`,
            name: 'My Farm (Offline)'
          };
          
          setFarmContext(tempFarmContext);
          console.log("⚠️ [AddFieldWizard] Offline mode - created temporary farm context");
          setIsLoading(false);
          return;
        }
        
        // Get user's farms
        const { data: farms, error } = await supabase
          .from('farms')
          .select('id, name')
          .eq('user_id', user.id);
          
        if (error) {
          console.error("❌ [AddFieldWizard] Error fetching farms:", error);
          // Don't block, show warning toast
          toast.warning("Some information couldn't be loaded", { 
            description: "You can continue adding your field" 
          });
        }
        
        // Try to use the selected farm
        if (farms && farms.length > 0) {
          setFarmContext(farms[0]);
          console.log("✅ [AddFieldWizard] Using farm:", farms[0]);
          
          // Show info toast
          toast.info("Using farm", {
            description: `Your field will be added to "${farms[0].name}"`,
          });
        }
        // If no farms exist, create a default one
        else if (user.id) {
          try {
            const { data: newFarm, error } = await supabase
              .from('farms')
              .insert({
                name: 'My Farm',
                user_id: user.id
              })
              .select()
              .single();
              
            if (error) throw error;
            
            setFarmContext(newFarm);
            console.log("✅ [AddFieldWizard] Created default farm:", newFarm);
            
            // Show success toast
            toast.success("Default farm created", {
              description: "Your field will be added to 'My Farm'",
            });
          } catch (err) {
            console.error("❌ [AddFieldWizard] Error creating default farm:", err);
            // Don't block the flow
            
            // Create a temporary farm context
            const tempFarmContext = {
              id: `temp-farm-${Date.now()}`,
              name: 'My Farm (Temporary)'
            };
            
            setFarmContext(tempFarmContext);
            console.log("⚠️ [AddFieldWizard] Created temporary farm context");
          }
        }
      } catch (error) {
        // Log but never block
        console.error("❌ [AddFieldWizard] Error in farm context:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFarmContext();
  }, [user?.id, isOnlineStatus, farmContext]);

  // Fetch user's field count and apply gating (FREE: max 1 field)
  useEffect(() => {
    const checkGating = async () => {
      try {
        if (!user?.id) return;
        // Count fields for this user
        const { count, error } = await supabase
          .from('fields')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        if (error) {
          console.error('Error counting fields:', error);
          return;
        }
        setUserFieldCount(count ?? 0);
        const gated = !getIsPro() && (count ?? 0) >= 1;
        setIsGated(gated);
        if (gated) {
          // Zero-friction: direct redirect to Upgrade page
          navigate('/upgrade');
        }
      } catch (e) {
        console.error('Gating check failed', e);
      }
    };
    checkGating();
  }, [user?.id]);
  
  const updateFieldData = (partialData: Partial<typeof fieldData>) => {
    setFieldData(prev => ({ ...prev, ...partialData }));
  };
  
  const handleNext = () => {
    if (currentStep < totalSteps) {
      // Validate current step before proceeding
      if (!validateCurrentStep()) {
        return; // Stop if validation fails
      }
      
      setCurrentStep(prev => prev + 1);
      
      // Play a subtle success sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRhoLAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfYKAABzVGeUd3FTUVxVZnGHm7iilblsY9aLYxkAZwMXCvYVDQDf8OQIaxVvEm0IPgTA+Mv0ovxVCwwZICESBcnsi97E4bXxlg5nIhMh4Q9C/LzwlvC29Jj75wHUBOMD1AHy+zP2MPfx+2AEPgkeCawB2fVp6jjlOeiI8Jn5gwLRCTgMWgmQBHb/3Pog+XT57flH+kj7z/tD/Cr7o/na94L2nfWb9Zv2I/nS/MsAPgS6BZsFIgTpASj/8fxI+2r6hvqw+0/9x/5TAGQBGwKyASEBTAAK/9n9yfxv/Jb8Hf0X/ob/GwFCAhsD0AIIAvYAev/X/Xb8OPs2+jT6Afui/Fz+8f8GAXgBnAEoAWUAIf+i/ZP8EvwA/Dv8+vyh/ZD+2//CAIsBJgLdAj0DewOqA5wDQQPBAgQCCQH4/9n+qP2T/J37Afut+m76YPoW+y38nv09/xwBHwNeBCkF8ASdBC8E/wLsAdgApv+J/mf9X/x2+7L6DPqD+Vb5cflH+tH7gv0y/xEBHwPFBCoGGAenB/wHswebBu4E5QKIAMf9dfot9y70gvJI8jby9vIR9Oj2dfr1/nYD/AdpC1UOChAhEXwRGxGkD6UNNQvpB54Ecgaa+c/3XPL581rz3PLR82n1WPep+d/8jQCaA+MFUwuJDrcQaxGfEREQzQz2BxAD/P1v+ODzse8F7UXr9+vw7SDwDfJg9QD5uPxMAK4DHAfPCYsL9Qu9C0wKNQjGBSID+P9r/Tn7aPhE9pfzRfKO8pbzDPby+af+hQPmBakIgwuQDSMPKRC4EKQQ6g8TD7MNcwsJCZIGtwPaAPP9CvvJ+M32ovVL9Gj07PQV9nb3h/n9+wr+HgAEAsgDdgXrBiQIHAnoCSEK9AkDCekHkQb9BL8DCQJwALb+gf1c/FD7Rvpz+fn4y/j0+Db5avnK+Vf6EPuV+0v8G/0N/vX+y/+vAHMBIwLgAm8D4QNSBKAEwASyBJAEUgQABJADCgNVAqwBEQGUACkArv9i/zf/Mf8//2P/nP/g/xkAUACAAJ4AqACYAGsALgDo/5b/P//t/pj+V/4n/gL+5/3e/ef99v0T/jj+af6m/u7+O/+I/9X/IABqALQA9QA0AWABiwGtAc0B5AHvAfQB8gHmAdABuAGYAXUBSgEbAfIAwwCTAF8ALADz/7j/e/89/wD/wv6I/lD+HP7r/b39nv2H/Xn9c/1y/Xj9h/2c/bj93f0G/i/+W/6H/rb+5v4X/0X/dP+h/87/+P8gAEYAaQCIAKQAvADRAOUA9gADARIBHAEkASoBLQEtASoBJQEeARcBDgEGAf0A8gDnANoAzAC/ALIA6f8=');
        audio.volume = 0.2;
        audio.play().catch(e => console.log('Audio play prevented by browser'));
      } catch (error) {
        console.log('Audio playback not supported');
      }
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSkip = () => {
    handleNext();
  };
  
  const handleSubmit = () => {
    if (!farmContext?.id) {
      toast.error("No farm selected", { description: "Cannot create a field without a farm." });
      return;
    }
    
    // Sanitize field data before submission
    const sanitizedData = sanitizeFieldData(fieldData);
    
    // The useCreateField hook handles the rest (user, etc.)
    createField({
      ...sanitizedData,
      farm_id: farmContext.id,
    }, {
      onSuccess: (createdField) => {
        // Clear session storage after successful submission
        clearSessionData();
        
        // Show success message
        toast.success("Field added successfully", {
          description: `${sanitizedData.name} has been added to your farm.`
        });
        
        if (onSuccess) {
          onSuccess(createdField);
        } else {
          navigate(`/fields/${createdField.id}`);
        }
      },
      onError: (error) => {
        toast.error("Failed to add field", {
          description: error.message
        });
        
        // If offline, still consider it a success and clear session
        if (!isOnlineStatus) {
          clearSessionData();
          
          if (onSuccess && fieldData) {
            // Create a mock field for offline mode
            const mockField: Field = {
              id: `offline-${Date.now()}`,
              name: sanitizedData.name || 'Unnamed Field',
              user_id: user?.id || 'offline-user',
              farm_id: farmContext.id,
              size: sanitizedData.size || 1,
              size_unit: sanitizedData.size_unit || 'hectares',
              boundary: sanitizedData.boundary,
              location_description: sanitizedData.location_description,
              soil_type: sanitizedData.soil_type,
              irrigation_type: sanitizedData.irrigation_type,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              offline_id: `offline-${Date.now()}`,
              is_synced: false
            };
            
            onSuccess(mockField);
          }
        }
      }
    });
  };
  
  // Validate field data before proceeding to next step
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: // Field name
        if (!fieldData.name || fieldData.name.trim().length < 2) {
          toast.warning("Please enter a valid field name", {
            description: "Field name must be at least 2 characters"
          });
          return false;
        }
        return true;
        
      case 2: // Field mapping
        // This step has its own validation in FieldMapperStep
        return true;
        
      case 3: // Field location
        if (!fieldData.boundary && !fieldData.location) {
          toast.warning("Missing field location", {
            description: "Please define your field location on the map"
          });
          return false;
        }
        return true;
        
      case 4: // Crop type
        // Crop type is optional, so always valid
        return true;
        
      case 5: // Field size
        if (fieldData.size !== undefined && (isNaN(fieldData.size) || fieldData.size <= 0)) {
          toast.warning("Invalid field size", {
            description: "Please enter a valid field size greater than zero"
          });
          return false;
        }
        return true;
        
      case 6: // Planting date
        // Planting date is optional, so always valid
        return true;
        
      default:
        return true;
    }
  };
  
  // Animation variants for page transitions
  const variants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };
  
  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-12 w-12 relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground text-sm">Preparing field creation...</p>
      </div>
    );
  }
  
  // If gated, render nothing (navigation handled above)
  if (isGated) return null;

  return (
    <>
      <div className="space-y-6">
        {/* Online/Offline indicator */}
        <OfflineStatusIndicator isOnline={isOnlineStatus} />
        
        {/* Progress indicator */}
        <div className="flex justify-center items-center space-x-2 mb-6">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <motion.div 
              key={idx}
              className={`rounded-full ${idx < currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} 
                         ${idx === currentStep - 1 ? 'w-2.5 h-2.5' : 'w-2 h-2'}`}
              initial={{ scale: idx === currentStep - 1 ? 0.8 : 1 }}
              animate={{ scale: idx === currentStep - 1 ? 1.2 : 1 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        
        {/* Current step indicator text */}
        <div className="text-center text-sm text-muted-foreground">
          <span className="font-medium">Step {currentStep}</span> of {totalSteps}
        </div>
        
        {/* Farm context indicator */}
        {farmContext && (
          <div className="text-center text-xs text-muted-foreground">
            Adding field to farm: <span className="font-medium">{farmContext.name}</span>
            {farmContext.id.startsWith('temp-') && (
              <span className="ml-1 text-amber-500">(Temporary)</span>
            )}
          </div>
        )}
        
        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="min-h-[30vh]"
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
                initialBoundary={fieldData.boundary}
                initialName={fieldData.name}
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
                isSubmitting={isSubmitting}
                onSkip={() => handleSubmit()}
                isOffline={!isOnlineStatus}
              />
            )}
            
            {currentStep === totalSteps + 1 && (
              <motion.div 
                className="text-center py-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
              >
                <motion.div 
                  className="mx-auto w-16 h-16 mb-4 bg-primary/20 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <CheckCircle className="h-10 w-10 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Success!</h2>
                <p className="text-muted-foreground">
                  Your field has been added successfully.
                </p>
                {!isOnlineStatus && (
                  <p className="text-amber-500 text-sm mt-2">
                    Your field will be synced when you're back online.
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}