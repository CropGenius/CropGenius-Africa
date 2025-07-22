/**
 * 🌾 CROPGENIUS – CROP RECOMMENDATION SKELETON
 * -------------------------------------------------------------
 * Beautiful loading skeleton for crop recommendations
 * - Matches the actual component structure
 * - Smooth animations and realistic proportions
 * - Accessible and responsive design
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CropRecommendationSkeletonProps {
  count?: number;
  className?: string;
}

const CropRecommendationSkeleton: React.FC<CropRecommendationSkeletonProps> = ({
  count = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`} data-testid="crop-recommendation-skeleton">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-20 rounded" />
      </div>

      {/* Recommendations grid skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16 rounded" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* AI Reasoning skeleton */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Skeleton className="h-4 w-4 rounded mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              </div>

              {/* Growing conditions skeleton */}
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>

              {/* Market data skeleton */}
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-14" />
                </div>
              </div>

              {/* Disease risk skeleton */}
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <Skeleton className="h-3 w-32" />
              </div>

              {/* Expected yield skeleton */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>

              {/* Companion plants skeleton */}
              <div className="pt-3 border-t border-gray-100">
                <Skeleton className="h-3 w-28 mb-2" />
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-16 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Planting window skeleton */}
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-center pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-80" />
        </div>
      </div>
    </div>
  );
};

export default CropRecommendationSkeleton;
export { CropRecommendationSkeleton };