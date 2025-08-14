/**
 * 🌾 CROPGENIUS - PRODUCTION-READY ADD CROP FORM
 * ===============================================
 * INFINITY-LEVEL crop creation form with beautiful UI
 * Built for 100 million African farmers! 🚀
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useCreateCrop } from '@/hooks/useCrops';
import { CROP_TYPES, CROP_STATUS_OPTIONS, type CreateCropRecordData } from '@/services/cropService';
import { CalendarIcon, Loader2, Leaf, ArrowLeft, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AddCropFormProps {
  fieldId: string;
  fieldName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddCropForm: React.FC<AddCropFormProps> = ({
  fieldId,
  fieldName,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const createCropMutation = useCreateCrop();

  const [formData, setFormData] = useState<Partial<CreateCropRecordData>>({
    field_id: fieldId,
    crop_type: '',
    status: 'planning',
    area_planted: 0,
    expected_yield: 0,
    notes: '',
  });

  const [plantingDate, setPlantingDate] = useState<Date>();
  const [harvestDate, setHarvestDate] = useState<Date>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.crop_type) {
      newErrors.crop_type = 'Please select a crop type';
    }

    if (!plantingDate) {
      newErrors.planting_date = 'Please select a planting date';
    }

    if (!harvestDate) {
      newErrors.expected_harvest_date = 'Please select an expected harvest date';
    }

    if (plantingDate && harvestDate && plantingDate >= harvestDate) {
      newErrors.expected_harvest_date = 'Harvest date must be after planting date';
    }

    if (!formData.area_planted || formData.area_planted <= 0) {
      newErrors.area_planted = 'Please enter a valid area planted';
    }

    if (!formData.status) {
      newErrors.status = 'Please select a status';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const cropData: CreateCropRecordData = {
      field_id: fieldId,
      crop_type: formData.crop_type!,
      planting_date: plantingDate!.toISOString().split('T')[0],
      expected_harvest_date: harvestDate!.toISOString().split('T')[0],
      status: formData.status as any,
      area_planted: formData.area_planted!,
      expected_yield: formData.expected_yield || undefined,
      notes: formData.notes || undefined,
    };

    const result = await createCropMutation.mutateAsync(cropData);
    
    if (result) {
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/fields/${fieldId}`);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(`/fields/${fieldId}`);
    }
  };

  const selectedCropType = CROP_TYPES.find(crop => crop.value === formData.crop_type);
  const selectedStatus = CROP_STATUS_OPTIONS.find(status => status.value === formData.status);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            Add New Crop
          </h1>
          {fieldName && (
            <p className="text-muted-foreground">Adding crop to {fieldName}</p>
          )}
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            Crop Information
          </CardTitle>
          <CardDescription>
            Add details about your new crop to track its growth and optimize your harvest
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Crop Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="crop_type" className="text-sm font-medium">
                Crop Type *
              </Label>
              <Select
                value={formData.crop_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, crop_type: value }))}
              >
                <SelectTrigger className={cn(
                  "w-full",
                  errors.crop_type && "border-red-500"
                )}>
                  <SelectValue placeholder="Select a crop type">
                    {selectedCropType && (
                      <div className="flex items-center gap-2">
                        <span>{selectedCropType.icon}</span>
                        <span>{selectedCropType.label}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CROP_TYPES.map((crop) => (
                    <SelectItem key={crop.value} value={crop.value}>
                      <div className="flex items-center gap-2">
                        <span>{crop.icon}</span>
                        <span>{crop.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.crop_type && (
                <p className="text-sm text-red-600">{errors.crop_type}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Current Status *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger className={cn(
                  "w-full",
                  errors.status && "border-red-500"
                )}>
                  <SelectValue placeholder="Select status">
                    {selectedStatus && (
                      <Badge className={selectedStatus.color}>
                        {selectedStatus.label}
                      </Badge>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CROP_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status}</p>
              )}
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Planting Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Planting Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !plantingDate && "text-muted-foreground",
                        errors.planting_date && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {plantingDate ? format(plantingDate, "PPP") : "Select planting date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={plantingDate}
                      onSelect={setPlantingDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.planting_date && (
                  <p className="text-sm text-red-600">{errors.planting_date}</p>
                )}
              </div>

              {/* Expected Harvest Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Expected Harvest Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !harvestDate && "text-muted-foreground",
                        errors.expected_harvest_date && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {harvestDate ? format(harvestDate, "PPP") : "Select harvest date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={harvestDate}
                      onSelect={setHarvestDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.expected_harvest_date && (
                  <p className="text-sm text-red-600">{errors.expected_harvest_date}</p>
                )}
              </div>
            </div>

            {/* Area and Yield */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Area Planted */}
              <div className="space-y-2">
                <Label htmlFor="area_planted" className="text-sm font-medium">
                  Area Planted (hectares) *
                </Label>
                <Input
                  id="area_planted"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.area_planted || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    area_planted: parseFloat(e.target.value) || 0 
                  }))}
                  className={cn(errors.area_planted && "border-red-500")}
                  placeholder="e.g., 2.5"
                />
                {errors.area_planted && (
                  <p className="text-sm text-red-600">{errors.area_planted}</p>
                )}
              </div>

              {/* Expected Yield */}
              <div className="space-y-2">
                <Label htmlFor="expected_yield" className="text-sm font-medium">
                  Expected Yield (kg)
                </Label>
                <Input
                  id="expected_yield"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.expected_yield || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    expected_yield: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder="e.g., 5000"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes about this crop..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createCropMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {createCropMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Crop...
                  </>
                ) : (
                  <>
                    <Leaf className="mr-2 h-4 w-4" />
                    Add Crop
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createCropMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};