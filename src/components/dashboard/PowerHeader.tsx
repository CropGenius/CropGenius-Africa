import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Thermometer, Cloud, CheckCircle, AlertTriangle } from 'lucide-react';

interface PowerHeaderProps {
  location: string;
  temperature: number;
  weatherCondition: string;
  farmScore: number;
  synced: boolean;
}

export default function PowerHeader({ 
  location, 
  temperature, 
  weatherCondition, 
  farmScore, 
  synced 
}: PowerHeaderProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="mb-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          {/* Location & Weather - Mobile Optimized */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">            
            <div className="flex items-center space-x-1.5 min-w-0">              <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="font-medium text-gray-900 text-sm truncate">{location}</span>
            </div>
            
            <div className="flex items-center space-x-1.5">              <Thermometer className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">{temperature}°C</span>
            </div>
            
            <div className="flex items-center space-x-1.5 w-full sm:w-auto">              <Cloud className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700 text-sm truncate">{weatherCondition}</span>
            </div>
          </div>

          {/* Farm Score & Sync Status - Mobile Optimized */}
          <div className="flex items-center justify-between gap-4">            
            <div className="flex items-center space-x-2">              <span className="text-xs text-gray-600">Health</span>
              <Badge className={`${getScoreBadgeColor(farmScore)} font-bold px-2 py-0.5 text-sm`}>
                {farmScore}%
              </Badge>
            </div>
            
            <div className="flex items-center space-x-1.5">              {synced ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Synced</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-xs text-yellow-600 font-medium">Syncing...</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
