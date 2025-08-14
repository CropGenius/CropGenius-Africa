
import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, MapPin, X, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { toast } from 'sonner';

interface MapSearchInputProps {
  onSearch: (query: string) => void;
  onLocationSelect?: (location: { 
    lat: number; 
    lng: number; 
    name: string;
    bbox?: [number, number, number, number];
    place_type?: string[];
    relevance?: number;
  }) => void;
  isSearching?: boolean;
  isNavigating?: boolean;
  className?: string;
  placeholder?: string;
  recentSearches?: Array<{ name: string; lat: number; lng: number }>;
  disabled?: boolean;
}

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function MapSearchInput({
  onSearch,
  onLocationSelect,
  isSearching = false,
  isNavigating = false,
  className = '',
  placeholder = 'Search for your location or village',
  recentSearches = [],
  disabled = false
}: MapSearchInputProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [showRecent, setShowRecent] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; lat: number; lng: number; place_type?: string[] }>>([]);
  const [localRecentSearches, setLocalRecentSearches] = useState<Array<{ name: string; lat: number; lng: number }>>(recentSearches);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // 🚀 INFINITY GOD MODE LIVE SUGGESTIONS
  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    if (!MAPBOX_ACCESS_TOKEN) {
      return;
    }
    
    try {
      console.log(`🔍 [MapSearchInput] Fetching suggestions for: "${query}"`);
      
      // Call Mapbox Geocoding API for suggestions
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=place,locality,neighborhood,address,poi&limit=5&country=ke,ug,tz,et,ng,gh,rw,bi`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const suggestionList = data.features.map((location: any) => ({
          name: location.place_name,
          lng: location.geometry.coordinates[0],
          lat: location.geometry.coordinates[1],
          place_type: location.place_type,
          relevance: location.relevance
        }));
        
        setSuggestions(suggestionList);
        setShowSuggestions(true);
        setShowRecent(false);
        
        console.log(`✅ [MapSearchInput] Found ${suggestionList.length} suggestions`);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('❌ [MapSearchInput] Suggestions failed:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 🚀 INFINITY GOD MODE SEARCH FUNCTIONALITY
  const performSearch = async (query: string) => {
    setError(null);
    
    if (!query.trim()) {
      return;
    }
    
    if (!MAPBOX_ACCESS_TOKEN) {
      setError('Mapbox API key not configured');
      return;
    }
    
    try {
      console.log(`🔍 [MapSearchInput] Searching for: "${query}"`);
      
      // Call Mapbox Geocoding API with enhanced parameters
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=place,locality,neighborhood,address,poi&limit=1&country=ke,ug,tz,et,ng,gh,rw,bi`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const location = data.features[0];
        const coordinates = location.geometry.coordinates;
        const locationName = location.place_name;
        
        // Create enhanced location object
        const newLocation = {
          name: locationName,
          lng: coordinates[0],
          lat: coordinates[1],
          bbox: location.bbox,
          place_type: location.place_type,
          relevance: location.relevance
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

        console.log(`✅ [MapSearchInput] Found location: ${locationName}`);
      } else {
        toast.warning('No locations found', {
          description: `Could not find "${query}". Try a different search term.`
        });
      }
    } catch (error) {
      console.error('❌ [MapSearchInput] Search failed:', error);
      setError('Search failed. Please try again.');
      
      toast.error('Search failed', {
        description: 'Please check your internet connection and try again.'
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      performSearch(searchTerm.trim());
      setShowSuggestions(false);
      setShowRecent(false);
    }
  };

  const handleRecentSelect = (recent: { name: string; lat: number; lng: number }) => {
    if (onLocationSelect) {
      onLocationSelect(recent);
    }
    setSearchTerm(recent.name);
    setShowRecent(false);
    setShowSuggestions(false);
  };

  const handleSuggestionSelect = (suggestion: { name: string; lat: number; lng: number; place_type?: string[] }) => {
    if (onLocationSelect) {
      onLocationSelect({
        ...suggestion,
        bbox: undefined,
        relevance: undefined
      });
    }
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    setShowRecent(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    setError(null);
    setShowSuggestions(false);
    setShowRecent(false);
    setSuggestions([]);
    
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
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
            const value = e.target.value;
            setSearchTerm(value);
            setError(null);
            
            // Clear previous timeout
            if (searchTimeoutRef.current) {
              clearTimeout(searchTimeoutRef.current);
            }
            
            if (value.length > 0) {
              // Show recent searches immediately if no typing for a moment
              if (value.length < 2) {
                setShowRecent(localRecentSearches.length > 0);
                setShowSuggestions(false);
              } else {
                // Debounce suggestions API call
                searchTimeoutRef.current = setTimeout(() => {
                  fetchSuggestions(value);
                }, 300);
                setShowRecent(false);
              }
            } else {
              setShowRecent(false);
              setShowSuggestions(false);
              setSuggestions([]);
            }
          }}
          onFocus={() => {
            if (searchTerm.length === 0 && localRecentSearches.length > 0) {
              setShowRecent(true);
            } else if (searchTerm.length >= 2) {
              fetchSuggestions(searchTerm);
            }
          }}
          placeholder={isNavigating ? 'Navigating to location...' : placeholder}
          className={`pr-16 pl-10 ${error ? 'border-red-500' : ''} ${isNavigating ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
          disabled={isSearching || isNavigating || disabled}
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
          disabled={isSearching || isNavigating || !searchTerm.trim() || disabled}
          aria-label="Search"
        >
          {isSearching || isNavigating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="sr-only">{isNavigating ? 'Navigating' : 'Search'}</span>
        </Button>
      </div>
      
      {error && (
        <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
      
      {/* 🔥 LIVE SEARCH SUGGESTIONS DROPDOWN */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={dropdownRef} 
          className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
          aria-label="Location suggestions"
        >
          <div className="p-2 text-xs text-muted-foreground font-medium">Suggested locations</div>
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              className="p-2 hover:bg-accent cursor-pointer flex items-center gap-2 text-sm border-b border-border/50 last:border-b-0"
              onClick={() => handleSuggestionSelect(suggestion)}
              role="option"
              aria-selected="false"
            >
              <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{suggestion.name}</div>
                {suggestion.place_type && (
                  <div className="text-xs text-muted-foreground">
                    {suggestion.place_type.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📋 RECENT SEARCHES DROPDOWN */}
      {showRecent && localRecentSearches.length > 0 && !showSuggestions && (
        <div 
          ref={dropdownRef} 
          className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
          aria-label="Recent searches"
        >
          <div className="p-2 text-xs text-muted-foreground font-medium">Recent searches</div>
          {localRecentSearches.map((recent, index) => (
            <div 
              key={index}
              className="p-2 hover:bg-accent cursor-pointer flex items-center gap-2 text-sm"
              onClick={() => handleRecentSelect(recent)}
              role="option"
              aria-selected="false"
            >
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="truncate">{recent.name}</span>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
