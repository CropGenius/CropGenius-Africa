/**
 * 🌾 CROPGENIUS - ADD CROP PAGE
 * ==============================
 * INFINITY-LEVEL crop creation page
 * Built for 100 million African farmers! 🚀
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { AddCropForm } from '@/components/crops/AddCropForm';
import { useQuery } from '@tanstack/react-query';
import { getFieldById } from '@/services/fieldService';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AddCrop: React.FC = () => {
  const { id: fieldId } = useParams<{ id: string }>();

  // Fetch field data to get field name
  const { data: field, isLoading, error } = useQuery({
    queryKey: ['field', fieldId],
    queryFn: () => getFieldById(fieldId!),
    enabled: !!fieldId,
  });

  if (!fieldId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid field ID. Please navigate from a valid field page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-muted-foreground">Loading field information...</p>
        </div>
      </div>
    );
  }

  if (error || !field?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load field information. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AddCropForm 
        fieldId={fieldId} 
        fieldName={field.data.name}
      />
    </div>
  );
};

export default AddCrop;