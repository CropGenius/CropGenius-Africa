import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuthContext as useAuth } from '@/providers/SimpleAuthProvider';
import { toast } from 'sonner';

interface QuickAddFieldProps {
  onSuccess?: (field: any) => void;
  onCancel?: () => void;
}

const QuickAddField: React.FC<QuickAddFieldProps> = ({ onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error("Please log in to add a field");
      return;
    }

    if (!name || !lat || !lng) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create a simple field with coordinates
      const fieldData = {
        name: name,
        user_id: user.id,
        farm_id: user.id, // Use user ID as farm ID for now
        boundary: `POLYGON((${parseFloat(lng)} ${parseFloat(lat)}, ${parseFloat(lng)+0.001} ${parseFloat(lat)}, ${parseFloat(lng)+0.001} ${parseFloat(lat)+0.001}, ${parseFloat(lng)} ${parseFloat(lat)+0.001}, ${parseFloat(lng)} ${parseFloat(lat)}))`,
        location_description: `Manual coordinates: ${lat}, ${lng}`,
        size: 1,
        size_unit: 'hectares'
      };

      const { data, error } = await supabase.from('fields').insert(fieldData).select().single();
      
      if (error) {
        console.error('Field creation error:', error);
        toast.error("Failed to create field: " + error.message);
        return;
      }

      toast.success("Field created successfully!");
      
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Error creating field: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Field Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., North Field"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="-1.2921"
                type="number"
                step="0.0001"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="36.8219"
                type="number"
                step="0.0001"
                required
              />
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Enter your farm's approximate coordinates. You can find these on Google Maps by right-clicking your location.
          </div>
          
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Adding..." : "Add Field"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuickAddField;
export { QuickAddField };