/**
 * 🌾 INFINITY-LEVEL DiseaseGallery Component
 * 
 * PRODUCTION-READY disease reference gallery for 100 million African farmers! 🚀
 * Features:
 * - Real-time disease database from Supabase
 * - Advanced filtering and search
 * - Offline-first with caching
 * - Mobile-optimized UI
 * - Accessibility compliant
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useDiseaseGallery } from '@/hooks/use-disease-gallery';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

export default function DiseaseGallery() {
  const { diseaseGallery, isLoading, error, filterGallery, searchGallery, refreshGallery } = useDiseaseGallery();
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Handle search input changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchGallery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchGallery]);

  const handleSelectDisease = (disease) => {
    setSelectedDisease(disease);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    if (selectedDisease && currentImageIndex < selectedDisease.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (selectedDisease && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleFilterChange = (cropType) => {
    filterGallery(cropType);
  };

  const handleRetry = async () => {
    toast({
      title: "Retrying",
      description: "Attempting to reload disease gallery",
    });
    await refreshGallery();
  };

  // Handle image loading errors
  const handleImageError = (event) => {
    event.target.src = '/images/fallback-image.jpg';
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="loading-spinner">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="pb-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading disease gallery</AlertTitle>
        <AlertDescription>
          {error.message}
          <Button variant="outline" size="sm" className="ml-2" onClick={handleRetry}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Render empty state
  if (diseaseGallery.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">No diseases found</h2>
        <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
        <Button onClick={() => {
          filterGallery('');
          setSearchQuery('');
        }}>
          Clear filters
        </Button>
      </div>
    );
  }

  // Get unique crop types for filter
  const cropTypes = [...new Set(diseaseGallery.map(disease => disease.crop_type))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" role="heading" aria-level="1">Disease Reference Gallery</h1>
          <p className="text-muted-foreground">Learn about common crop diseases, symptoms, and treatments</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search diseases..."
              className="pl-8 w-full sm:w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search diseases"
            />
          </div>
          <Select onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by crop">
              <SelectValue placeholder="Filter by crop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All crops</SelectItem>
              {cropTypes.map((cropType) => (
                <SelectItem key={cropType} value={cropType}>
                  {cropType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refreshGallery()} aria-label="Refresh gallery">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw mr-1">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {diseaseGallery.map((disease) => (
          <Card 
            key={disease.id} 
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => handleSelectDisease(disease)}
            data-testid="disease-card"
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={disease.images[0]?.url || '/images/fallback-image.jpg'} 
                alt={`${disease.name} disease on ${disease.crop_type}`} 
                className="object-cover w-full h-full"
                loading="lazy"
                onError={handleImageError}
              />
              <Badge className="absolute top-2 right-2">{disease.crop_type}</Badge>
            </div>
            <CardHeader className="pb-2">
              <CardTitle role="heading" aria-level="2">{disease.name}</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{disease.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDisease && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl" role="heading" aria-level="2">{selectedDisease.name}</CardTitle>
                <CardDescription>Affects {selectedDisease.crop_type} crops</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedDisease(null)}
                aria-label="Close disease details"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-video relative overflow-hidden mb-6 rounded-md">
              <img 
                src={selectedDisease.images[currentImageIndex]?.url || '/images/fallback-image.jpg'} 
                alt={`${selectedDisease.name} image ${currentImageIndex + 1}`} 
                className="object-cover w-full h-full"
                onError={handleImageError}
              />
              <div className="absolute bottom-2 right-2 bg-background/80 rounded-full px-2 py-1 text-xs">
                {currentImageIndex + 1}/{selectedDisease.images.length}
              </div>
              {selectedDisease.images.length > 1 && (
                <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center px-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="bg-background/80 rounded-full" 
                    onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                    disabled={currentImageIndex === 0}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="bg-background/80 rounded-full" 
                    onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                    disabled={currentImageIndex === selectedDisease.images.length - 1}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <Tabs defaultValue="description">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
                <TabsTrigger value="treatment">Treatment</TabsTrigger>
                <TabsTrigger value="prevention">Prevention</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="p-4 border rounded-md">
                <p>{selectedDisease.description}</p>
              </TabsContent>
              <TabsContent value="symptoms" className="p-4 border rounded-md">
                <p>{selectedDisease.symptoms}</p>
              </TabsContent>
              <TabsContent value="treatment" className="p-4 border rounded-md">
                <p>{selectedDisease.treatment}</p>
              </TabsContent>
              <TabsContent value="prevention" className="p-4 border rounded-md">
                <p>{selectedDisease.prevention}</p>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Add to Detection History</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}