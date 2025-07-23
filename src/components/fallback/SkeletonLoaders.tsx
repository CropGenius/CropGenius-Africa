/**
 * 🎭 SKELETON LOADERS
 * -------------------------------------------------------------
 * Comprehensive skeleton loading components for all CropGenius features
 * - Intelligent loading states that match actual content
 * - Smooth animations and transitions
 * - Responsive design patterns
 * - Accessibility compliant
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

/**
 * Weather Dashboard Skeleton
 */
export const WeatherDashboardSkeleton: React.FC<SkeletonProps> = ({ 
  className = "", 
  animate = true 
}) => {
  const MotionDiv = animate ? motion.div : 'div';
  
  return (
    <MotionDiv 
      className={`space-y-6 ${className}`}
      initial={animate ? { opacity: 0 } : undefined}
      animate={animate ? { opacity: 1 } : undefined}
      transition={animate ? { duration: 0.5 } : undefined}
    >
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-60" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Weather Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Forecast Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6 text-center">
              <Skeleton className="h-4 w-16 mx-auto mb-2" />
              <Skeleton className="h-6 w-6 mx-auto mb-3 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-20 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
                <Skeleton className="h-3 w-14 mx-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </MotionDiv>
  );
};

/**
 * Field Dashboard Skeleton
 */
export const FieldDashboardSkeleton: React.FC<SkeletonProps> = ({ 
  className = "", 
  animate = true 
}) => {
  const MotionDiv = animate ? motion.div : 'div';
  
  return (
    <MotionDiv 
      className={`space-y-6 ${className}`}
      initial={animate ? { opacity: 0 } : undefined}
      animate={animate ? { opacity: 1 } : undefined}
      transition={animate ? { duration: 0.5 } : undefined}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Field List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  );
};

/**
 * Disease Detection Skeleton
 */
export const DiseaseDetectionSkeleton: React.FC<SkeletonProps> = ({ 
  className = "", 
  animate = true 
}) => {
  const MotionDiv = animate ? motion.div : 'div';
  
  return (
    <MotionDiv 
      className={`space-y-6 ${className}`}
      initial={animate ? { opacity: 0 } : undefined}
      animate={animate ? { opacity: 1 } : undefined}
      transition={animate ? { duration: 0.5 } : undefined}
    >
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-60" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </CardHeader>
      </Card>

      {/* Crop Selection */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>

      {/* Camera Section */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
          
          {/* Camera Preview */}
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  );
};

/**
 * Map Component Skeleton
 */
export const MapSkeleton: React.FC<SkeletonProps> = ({ 
  className = "", 
  animate = true 
}) => {
  const MotionDiv = animate ? motion.div : 'div';
  
  return (
    <MotionDiv 
      className={`relative w-full h-full min-h-[400px] ${className}`}
      initial={animate ? { opacity: 0 } : undefined}
      animate={animate ? { opacity: 1 } : undefined}
      transition={animate ? { duration: 0.5 } : undefined}
    >
      <Skeleton className="w-full h-full rounded-lg" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      
      {/* Drawing Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 bg-white/80 p-2 rounded-lg">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
      
      {/* Status Indicator */}
      <div className="absolute bottom-2 left-2">
        <Skeleton className="h-6 w-32 rounded-full" />
      </div>
    </MotionDiv>
  );
};

/**
 * Chat Interface Skeleton
 */
export const ChatSkeleton: React.FC<SkeletonProps> = ({ 
  className = "", 
  animate = true 
}) => {
  const MotionDiv = animate ? motion.div : 'div';
  
  return (
    <MotionDiv 
      className={`space-y-4 ${className}`}
      initial={animate ? { opacity: 0 } : undefined}
      animate={animate ? { opacity: 1 } : undefined}
      transition={animate ? { duration: 0.5 } : undefined}
    >
      {/* Chat Messages */}
      <div className="space-y-4">
        {/* User Message */}
        <div className="flex justify-end">
          <div className="max-w-xs space-y-2">
            <Skeleton className="h-4 w-32 ml-auto" />
            <div className="bg-blue-50 p-3 rounded-lg">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
        
        {/* AI Response */}
        <div className="flex justify-start">
          <div className="flex space-x-3 max-w-md">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Another User Message */}
        <div className="flex justify-end">
          <div className="max-w-xs">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
        
        {/* AI Typing Indicator */}
        <div className="flex justify-start">
          <div className="flex space-x-3 max-w-md">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex space-x-1">
                <Skeleton className="h-2 w-2 rounded-full animate-pulse" />
                <Skeleton className="h-2 w-2 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <Skeleton className="h-2 w-2 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Input Area */}
      <div className="border-t pt-4">
        <div className="flex space-x-2">
          <Skeleton className="flex-1 h-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
    </MotionDiv>
  );
};

/**
 * Data Table Skeleton
 */
export const DataTableSkeleton: React.FC<SkeletonProps & {
  rows?: number;
  columns?: number;
}> = ({ 
  className = "", 
  animate = true,
  rows = 5,
  columns = 4
}) => {
  const MotionDiv = animate ? motion.div : 'div';
  
  return (
    <MotionDiv 
      className={`space-y-4 ${className}`}
      initial={animate ? { opacity: 0 } : undefined}
      animate={animate ? { opacity: 1 } : undefined}
      transition={animate ? { duration: 0.5 } : undefined}
    >
      {/* Table Header */}
      <div className="border rounded-t-lg overflow-hidden">
        <div className="bg-gray-50 p-3 flex">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1 px-2">
              <Skeleton className="h-4 w-full max-w-[100px]" />
            </div>
          ))}
        </div>
        
        {/* Table Rows */}
        <div className="bg-white">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div 
              key={rowIndex} 
              className={`flex p-3 ${rowIndex < rows - 1 ? 'border-b' : ''}`}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="flex-1 px-2">
                  <Skeleton className={`h-4 w-${Math.floor(Math.random() * 40) + 20}%`} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-20" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </MotionDiv>
  );
};

/**
 * Chart Skeleton
 */
export const ChartSkeleton: React.FC<SkeletonProps & {
  height?: number;
  showLegend?: boolean;
}> = ({ 
  className = "", 
  animate = true,
  height = 300,
  showLegend = true
}) => {
  const MotionDiv = animate ? motion.div : 'div';
  
  return (
    <MotionDiv 
      className={`border rounded-lg p-4 ${className}`}
      style={{ height: `${height}px` }}
      initial={animate ? { opacity: 0 } : undefined}
      animate={animate ? { opacity: 1 } : undefined}
      transition={animate ? { duration: 0.5 } : undefined}
    >
      <div className="h-full flex flex-col">
        {/* Chart Title */}
        <Skeleton className="h-6 w-1/3 mb-4" />
        
        {/* Chart Area */}
        <div className="flex-1 flex items-end space-x-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton 
              key={i} 
              className="flex-1 rounded-t"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            />
          ))}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-3 w-8" />
          ))}
        </div>
        
        {/* Legend */}
        {showLegend && (
          <div className="flex justify-center space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        )}
      </div>
    </MotionDiv>
  );
};

/**
 * Profile/Settings Skeleton
 */
export const ProfileSkeleton: React.FC<SkeletonProps> = ({ 
  className = "", 
  animate = true 
}) => {
  const MotionDiv = animate ? motion.div : 'div';
  
  return (
    <MotionDiv 
      className={`space-y-6 ${className}`}
      initial={animate ? { opacity: 0 } : undefined}
      animate={animate ? { opacity: 1 } : undefined}
      transition={animate ? { duration: 0.5 } : undefined}
    >
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Settings Sections */}
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </MotionDiv>
  );
};

/**
 * Generic Content Skeleton
 */
export const ContentSkeleton: React.FC<SkeletonProps & {
  lines?: number;
  showImage?: boolean;
  showButton?: boolean;
}> = ({ 
  className = "", 
  animate = true,
  lines = 3,
  showImage = false,
  showButton = false
}) => {
  const MotionDiv = animate ? motion.div : 'div';
  
  return (
    <MotionDiv 
      className={`space-y-4 ${className}`}
      initial={animate ? { opacity: 0 } : undefined}
      animate={animate ? { opacity: 1 } : undefined}
      transition={animate ? { duration: 0.5 } : undefined}
    >
      {showImage && (
        <Skeleton className="w-full h-48 rounded-lg" />
      )}
      
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={`h-4 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} 
          />
        ))}
      </div>
      
      {showButton && (
        <Skeleton className="h-10 w-32 rounded-md" />
      )}
    </MotionDiv>
  );
};