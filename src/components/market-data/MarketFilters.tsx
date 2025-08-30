/**
 * Market Filters Component
 * Extracted from MarketListings.tsx to reduce complexity
 * Handles all filtering logic for market listings
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, RefreshCw } from 'lucide-react';

export interface FilterOptions {
  crops: string[];
  locations: string[];
  listingTypes: string[];
  qualities: string[];
}

export interface MarketFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cropFilter: string;
  onCropFilterChange: (crop: string) => void;
  locationFilter: string;
  onLocationFilterChange: (location: string) => void;
  listingTypeFilter: string;
  onListingTypeFilterChange: (type: string) => void;
  qualityFilter: string;
  onQualityFilterChange: (quality: string) => void;
  filterOptions: FilterOptions;
  onResetFilters: () => void;
  resultsCount: number;
}

export const MarketFilters: React.FC<MarketFiltersProps> = ({
  searchQuery,
  onSearchChange,
  cropFilter,
  onCropFilterChange,
  locationFilter,
  onLocationFilterChange,
  listingTypeFilter,
  onListingTypeFilterChange,
  qualityFilter,
  onQualityFilterChange,
  filterOptions,
  onResetFilters,
  resultsCount,
}) => {
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search crops, varieties, or sellers..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Selects */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Crop Filter */}
        <Select value={cropFilter} onValueChange={onCropFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Crops" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Crops</SelectItem>
            {filterOptions.crops.map((crop) => (
              <SelectItem key={crop} value={crop}>
                {crop}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Location Filter */}
        <Select value={locationFilter} onValueChange={onLocationFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {filterOptions.locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Listing Type Filter */}
        <Select value={listingTypeFilter} onValueChange={onListingTypeFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {filterOptions.listingTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Quality Filter */}
        <Select value={qualityFilter} onValueChange={onQualityFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Qualities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Qualities</SelectItem>
            {filterOptions.qualities.map((quality) => (
              <SelectItem key={quality} value={quality}>
                {quality}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results and Reset */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{resultsCount} listings found</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onResetFilters}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
};