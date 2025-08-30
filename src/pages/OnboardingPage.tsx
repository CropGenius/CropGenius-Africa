
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuthContext } from '@/providers/SimpleAuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const { user } = useSimpleAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    farmName: '',
    totalArea: '',
    crops: [] as string[],
    planting_date: '',
    harvest_date: '',
    primary_goal: 'increase_yield',
    primary_pain_point: 'pests',
    has_irrigation: false,
    has_machinery: false,
    has_soil_test: false,
    budget_band: 'medium',
    preferred_language: 'en',
    whatsapp_number: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('complete_onboarding', {
        p_user_id: user.id,
        farm_name: formData.farmName,
        total_area: parseFloat(formData.totalArea),
        crops: formData.crops,
        planting_date: formData.planting_date,
        harvest_date: formData.harvest_date,
        primary_goal: formData.primary_goal,
        primary_pain_point: formData.primary_pain_point,
        has_irrigation: formData.has_irrigation,
        has_machinery: formData.has_machinery,
        has_soil_test: formData.has_soil_test,
        budget_band: formData.budget_band,
        preferred_language: formData.preferred_language,
        whatsapp_number: formData.whatsapp_number
      });

      if (error) throw error;

      toast.success('Welcome to CropGenius! Your farm setup is complete! 🌾');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-4xl">🌾</span>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">Welcome to CropGenius</CardTitle>
            <p className="text-gray-600 mt-2">Let's set up your farm to get AI-powered insights</p>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farm Name
                </label>
                <Input
                  type="text"
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                  placeholder="Enter your farm name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Area (hectares)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.totalArea}
                  onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                  placeholder="e.g., 2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number (optional)
                </label>
                <Input
                  type="tel"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  placeholder="+254712345678"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 text-lg"
              >
                {loading ? 'Setting up your farm...' : 'Complete Setup'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
