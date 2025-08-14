/**
 * 🌾 CROPGENIUS - CROP CARD COMPONENT
 * ===================================
 * Displays individual crop records with actions
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Leaf, Calendar, Trash2, Edit } from 'lucide-react';
import { CropRecord, getCropTypeInfo, getCropStatusInfo, getDaysUntilHarvest } from '@/services/cropService';

interface CropCardProps {
  crop: CropRecord;
  onDelete?: (crop: CropRecord) => void;
  onEdit?: (crop: CropRecord) => void;
}

export const CropCard: React.FC<CropCardProps> = ({ crop, onDelete, onEdit }) => {
  const cropInfo = getCropTypeInfo(crop.crop_type);
  const statusInfo = getCropStatusInfo(crop.status);
  const daysUntilHarvest = getDaysUntilHarvest(crop.expected_harvest_date);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{cropInfo.icon}</span>
              <h3 className="font-medium">{cropInfo.label}</h3>
              <Badge className={statusInfo.color}>
                {statusInfo.label}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>Area: {crop.area_planted} ha</div>
              <div>
                {crop.status === 'growing' && daysUntilHarvest > 0 && (
                  <>Harvest in: {daysUntilHarvest} days</>
                )}
                {crop.status === 'harvested' && crop.actual_yield && (
                  <>Yield: {crop.actual_yield} kg</>
                )}
              </div>
              <div>
                <Calendar className="h-3 w-3 inline mr-1" />
                Planted: {new Date(crop.planting_date).toLocaleDateString()}
              </div>
              <div>
                Expected: {new Date(crop.expected_harvest_date).toLocaleDateString()}
              </div>
            </div>
            
            {crop.notes && (
              <p className="text-sm text-muted-foreground mt-2">{crop.notes}</p>
            )}
          </div>
          
          <div className="flex gap-1 ml-4">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(crop)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={() => onDelete(crop)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};