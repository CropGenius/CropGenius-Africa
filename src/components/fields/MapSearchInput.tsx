
import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, MapPin, X, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useErrorLogging } from '@/hooks/use-error-logging';
import { toast } from 'sonner';

interface MapSearchInputProps {
  onSearch: (query: string) => void;
  onLocationSelect?: (location: { lat: number; lng: number; name: string }) => void;
  isSearching?: boolean;
  className?: string;
  placeholder?: string;
  recentSearches?: Array<{ name: string; lat: number; lng: number }>;
}

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function MapSearchInput({
  onSearch,
  onLocationSelect,
  isSearching = false,
  className = '',
  placeholder = 'Search for your location or village',
  recentSearches = []
}: MapSearchInputProps) {
  const { logError, trackOperation } = useErrorLogging('MapSearchInput');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecent, setShowRecent] = useState(false);
  const [localRecentSearches, setLocalRecentSearches] = useState<Array<{ name: string; lat: number; lng: number }>>(recentSearches);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem('mapRecentSearches');
      if (savedSearches) {
        const parsed = JSON.parse(savedSearches);
        if (Array.isArray(parsed)) {
          setLocalRecentSearches(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRecent(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Implement actual search functionality
  const performSearch = trackOperation('performSearch', async (query: string) => {
    setError(null);
    
    if (!query.trim()) {
      return;
    }
    
    if (!MAPBOX_ACCESS_TOKEN) {
      setError('Mapbox API key not configured');
      return;
    }
    
    try {
      // Call Mapbox Geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=place,locality,neighborhood,address`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const location = data.features[0];
        const coordinates = location.geometry.coordinates;
        const locationName = location.place_name;
        
        // Save to recent searches
        const newLocation = {
          name: locationName,
          lng: coordinates[0],
          lat: coordinates[1]
        };
        
        // Add to recent searches and remove duplicates
        const updatedSearches = [
          newLocation,
          ...localRecentSearches.filter(item => item.name !== locationName)
        ].slice(0, 5); // Keep only 5 most recent
        
        setLocalRecentSearches(updatedSearches);
        
        // Save to localStorage
        try {
          localStorage.setItem('mapRecentSearches', JSON.stringify(updatedSearches));
        } catch (error) {
          console.error('Failed to save recent searches:', error);
        }
        
        // Call the onLocationSelect callback
        if (onLocationSelect) {
          onLocationSelect(newLocation);
        }
      } else {
        toast.warning('No locations found', {
          description: `Could not find "${query}". Try a different search term.`
        });
      }
    } catch (error) {
      logError(error as Error, { context: 'geocoding' });
      setError('Search failed. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      performSearch(searchTerm.trim());
    }
  };

  const handleRecentSelect = (recent: { name: string; lat: number; lng: number }) => {
    if (onLocationSelect) {
      onLocationSelect(recent);
    }
    setSearchTerm(recent.name);
    setShowRecent(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    setError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setError(null);
            if (e.target.value.length > 0) {
              setShowRecent(true);
            } else {
              setShowRecent(false);
            }
          }}
          onFocus={() => localRecentSearches.length > 0 && setShowRecent(true)}
          placeholder={placeholder}
          className={`pr-16 pl-10 ${error ? 'border-red-500' : ''}`}
          disabled={isSearching}
          aria-label="Search location"
        />
        <MapPin className="absolute left-3 h-4 w-4 text-muted-foreground" />
        
        {searchTerm && (
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="absolute right-8 h-7 w-7 p-0"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear</span>
          </Button>
        )}
        
        <Button 
          type="submit" 
          size="sm" 
          variant="ghost" 
          className="absolute right-0 h-full px-3 text-muted-foreground hover:text-foreground"
          disabled={isSearching || !searchTerm.trim()}
          aria-label="Search"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="sr-only">Search</span>
        </Button>
      </div>
      
      {error && (
        <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
      
      {showRecent && localRecentSearches.length > 0 && (
        <div 
          ref={dropdownRef} 
          className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
          aria-label="Recent searches"
        >
          <div className="p-1 text-xs text-muted-foreground">Recent searches</div>
          {localRecentSearches.map((recent, index) => (
            <div 
              key={index}
              className="p-2 hover:bg-accent cursor-pointer flex items-center gap-2 text-sm"
              onClick={() => handleRecentSelect(recent)}
              role="option"
              aria-selected="false"
            >
              <MapPin className="h-3 w-3 text-muted-foreground" />
              {recent.name}
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
