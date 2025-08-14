import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ZeroFrictionFieldCreator: React.FC = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const createInstantField = async () => {
    setIsCreating(true);
    
    try {
      // Get current location automatically
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Create automatic field boundary (100m x 100m square)
        const boundaryWkt = `POLYGON((${longitude - 0.0005} ${latitude - 0.0005}, ${longitude + 0.0005} ${latitude - 0.0005}, ${longitude + 0.0005} ${latitude + 0.0005}, ${longitude - 0.0005} ${latitude + 0.0005}, ${longitude - 0.0005} ${latitude - 0.0005}))`;
        
        const fieldData = {
          name: `My Field ${new Date().toLocaleDateString()}`,
          size: 1,
          size_unit: 'hectares',
          location_description: 'Auto-detected location',
          boundary: boundaryWkt,
          crop_type: 'mixed',
          season: new Date().getFullYear().toString(),
          user_id: `guest_${Date.now()}`,
          farm_id: `farm_${Date.now()}`,
          created_at: new Date().toISOString()
        };
        
        const { data, insertError } = await supabase.from('fields').insert(fieldData).select().single();
        
        if (insertError) throw insertError;
        
        toast.success('Field created automatically!');
        navigate('/fields');
      }, async (error) => {
        // Fallback: create field with default coordinates if geolocation fails
        const fallbackBoundary = 'POLYGON((36.8219 -1.2921, 36.8229 -1.2921, 36.8229 -1.2911, 36.8219 -1.2911, 36.8219 -1.2921))';
        
        const fieldData = {
          name: `Field ${new Date().toLocaleDateString()}`,
          size: 1,
          size_unit: 'hectares',
          location_description: 'Nairobi, Kenya',
          boundary: fallbackBoundary,
          crop_type: 'mixed',
          season: new Date().getFullYear().toString(),
          user_id: `guest_${Date.now()}`,
          farm_id: `farm_${Date.now()}`,
          created_at: new Date().toISOString()
        };
        
        const { data, insertError } = await supabase.from('fields').insert(fieldData).select().single();
        
        if (insertError) throw insertError;
        
        toast.success('Field created with default location!');
        navigate('/fields');
      });
    } catch (error: any) {
      toast.error('Failed to create field');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button 
      onClick={createInstantField}
      disabled={isCreating}
      className="w-full bg-green-600 hover:bg-green-700 text-white"
    >
      {isCreating ? 'Creating Field...' : 'Create Field Instantly'}
    </Button>
  );
};