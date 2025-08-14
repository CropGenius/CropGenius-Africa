import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthContext } from '@/providers/AuthProvider';
import { RefreshCw, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
    location: '',
    farmSize: '',
    farmType: '',
    experienceLevel: '',
    primaryCrops: [],
    goals: []
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Save user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: formData.fullName,
          location: formData.location,
          farm_size: parseFloat(formData.farmSize) || null,
          farm_type: formData.farmType,
          experience_level: formData.experienceLevel,
          primary_crops: formData.primaryCrops,
          onboarding_completed: true
        });

      if (profileError) throw profileError;

      // Save onboarding completion
      const { error: onboardingError } = await supabase
        .from('onboarding')
        .upsert({
          user_id: user.id,
          step: 4,
          completed: true,
          data: formData
        });

      if (onboardingError) throw onboardingError;

      toast.success('Welcome to CropGenius! 🌾');
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-green-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="w-full max-w-2xl shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🌾</span>
              </div>
              <CardTitle className="text-3xl text-green-600 mb-2">Welcome to CropGenius!</CardTitle>
              <p className="text-gray-600">Let's get your farm set up in just a few steps</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-sm font-medium">Farm Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="City, Country"
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleNext} 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                disabled={!formData.fullName.trim()}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card className="w-full max-w-2xl shadow-xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-green-600">Tell us about your farm</CardTitle>
              <p className="text-gray-600">This helps us provide better recommendations</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="farmSize" className="text-sm font-medium">Farm Size (hectares)</Label>
                <Input
                  id="farmSize"
                  type="number"
                  value={formData.farmSize}
                  onChange={(e) => setFormData({...formData, farmSize: e.target.value})}
                  placeholder="e.g., 5.5"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="farmType" className="text-sm font-medium">Farm Type</Label>
                <Select onValueChange={(value) => setFormData({...formData, farmType: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select farm type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crop">Crop Farming</SelectItem>
                    <SelectItem value="livestock">Livestock</SelectItem>
                    <SelectItem value="mixed">Mixed Farming</SelectItem>
                    <SelectItem value="organic">Organic Farming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleNext} 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                disabled={!formData.farmType}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card className="w-full max-w-2xl shadow-xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-green-600">Your farming experience</CardTitle>
              <p className="text-gray-600">Help us tailor content to your level</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Experience Level</Label>
                <Select onValueChange={(value) => setFormData({...formData, experienceLevel: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (3-10 years)</SelectItem>
                    <SelectItem value="advanced">Advanced (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Primary Crops (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {['Maize', 'Rice', 'Wheat', 'Soybeans', 'Tomatoes', 'Potatoes', 'Cassava', 'Yam'].map((crop) => (
                    <div key={crop} className="flex items-center space-x-2">
                      <Checkbox
                        id={crop}
                        checked={formData.primaryCrops.includes(crop)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              primaryCrops: [...formData.primaryCrops, crop]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              primaryCrops: formData.primaryCrops.filter(c => c !== crop)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={crop} className="text-sm">{crop}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                onClick={handleNext} 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                disabled={!formData.experienceLevel}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        );
      case 4:
        return (
          <Card className="w-full max-w-2xl shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🎉</span>
              </div>
              <CardTitle className="text-2xl text-green-600">Almost done!</CardTitle>
              <p className="text-gray-600">What are your main goals with CropGenius?</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Goals (select all that apply)</Label>
                <div className="grid grid-cols-1 gap-3 mt-3">
                  {[
                    'Increase crop yield',
                    'Reduce farming costs',
                    'Monitor crop health',
                    'Weather forecasting',
                    'Market price tracking',
                    'Learn new techniques'
                  ].map((goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={formData.goals.includes(goal)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              goals: [...formData.goals, goal]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              goals: formData.goals.filter(g => g !== goal)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={goal} className="text-sm">{goal}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                onClick={handleNext} 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Setting up your account...
                  </>
                ) : (
                  <>
                    Complete Setup <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600">
            Step {currentStep} of 4
          </p>
        </div>
        {renderStep()}
      </div>
    </div>
  );
}