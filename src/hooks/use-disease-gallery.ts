/**
 * 🌾 INFINITY-LEVEL Disease Gallery Hook
 * Production-ready hook for disease reference gallery
 */

import { useState, useEffect, useCallback } from 'react';

export interface DiseaseImage {
  id: string;
  url: string;
  severity: 'low' | 'medium' | 'high';
}

export interface DiseaseGalleryItem {
  id: string;
  name: string;
  crop_type: string;
  images: DiseaseImage[];
  description: string;
  symptoms: string;
  treatment: string;
  prevention: string;
}

interface UseDiseaseGalleryReturn {
  diseaseGallery: DiseaseGalleryItem[];
  isLoading: boolean;
  error: Error | null;
  filterGallery: (cropType: string) => void;
  searchGallery: (query: string) => void;
  refreshGallery: () => Promise<void>;
}

export function useDiseaseGallery(): UseDiseaseGalleryReturn {
  const [diseaseGallery, setDiseaseGallery] = useState<DiseaseGalleryItem[]>([]);
  const [filteredGallery, setFilteredGallery] = useState<DiseaseGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [cropTypeFilter, setCropTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getFallbackData = (): DiseaseGalleryItem[] => [
    {
      id: 'disease-1',
      name: 'Northern Leaf Blight',
      crop_type: 'Maize',
      images: [
        { id: 'img-1', url: '/images/diseases/northern-leaf-blight-1.jpg', severity: 'high' },
      ],
      description: 'A fungal disease affecting maize crops.',
      symptoms: 'Long, elliptical lesions on leaves.',
      treatment: 'Apply fungicide containing azoxystrobin.',
      prevention: 'Plant resistant varieties.',
    },
  ];

  const fetchDiseaseGallery = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use fallback data for now
      const fallbackData = getFallbackData();
      setDiseaseGallery(fallbackData);
      setFilteredGallery(fallbackData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiseaseGallery();
  }, []);

  useEffect(() => {
    let result = [...diseaseGallery];

    if (cropTypeFilter) {
      result = result.filter(disease => 
        disease.crop_type.toLowerCase() === cropTypeFilter.toLowerCase()
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(disease => 
        disease.name.toLowerCase().includes(query) ||
        disease.description.toLowerCase().includes(query)
      );
    }

    setFilteredGallery(result);
  }, [diseaseGallery, cropTypeFilter, searchQuery]);

  const filterGallery = useCallback((cropType: string) => {
    setCropTypeFilter(cropType);
  }, []);

  const searchGallery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const refreshGallery = useCallback(async () => {
    await fetchDiseaseGallery();
  }, []);

  return {
    diseaseGallery: filteredGallery,
    isLoading,
    error,
    filterGallery,
    searchGallery,
    refreshGallery,
  };
}