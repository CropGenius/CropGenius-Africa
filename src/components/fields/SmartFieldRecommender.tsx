
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, Lightbulb, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Coordinates } from '@/types/field';
import { useErrorLogging } from '@/hooks/use-error-logging';

interface SmartFieldRecommenderProps {
  coordinates: Coordinates[];
  locationName: string;
  area: number;
  onClose: () => void;
  onGetTips: () => void;
}

export default function SmartFieldRecommender({
  coordinates,
  locationName,
  area,
  onClose,
  onGetTips
}: SmartFieldRecommenderProps) {
  const { trackOperation } = useErrorLogging('SmartFieldRecommender');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendedCrop, setRecommendedCrop] = useState<string | null>(null);
  const [isEstimate, setIsEstimate] = useState(false);

  // Get the center point of the field
  const getCenterPoint = () => {
    if (coordinates.length === 0) return null;
    
    const sumLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0);
    const sumLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0);
    
    return {
      lat: sumLat / coordinates.length,
      lng: sumLng / coordinates.length
    };
  };
  
  // Get crop recommendation from AI service
  useEffect(() => {
    const fetchRecommendation = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const center = getCenterPoint();
        if (!center) {
          throw new Error("Invalid field coordinates");
        }
        
        // Try to get recommendation from AI service
        try {
          // In production, this would be a real API call
          // const response = await fetch('https://api.cropgenius.ai/recommendations', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ coordinates, area, locationName })
          // });
          // 
          // if (!response.ok) throw new Error('AI service unavailable');
          // const data = await response.json();
          // setRecommendedCrop(data.recommendedCrop);
          // setIsEstimate(false);
          
          // Simulate API call for demo
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Use fallback logic but mark as estimate
          const lat = center.lat;
          const lng = center.lng;
          
          let crop;
          if (lat > 10) {
            crop = "cassava";
          } else if (lng > 30) {
            crop = "coffee";
          } else if (area > 5) {
            crop = "wheat";
          } else {
            crop = "maize";
          }
          
          setRecommendedCrop(crop);
          setIsEstimate(true); // Mark as estimate since we're not using real AI
          
        } catch (apiError) {
          console.error("AI service error:", apiError);
          // Fallback to basic recommendation
          setRecommendedCrop("maize");
          setIsEstimate(true);
          setError("AI service unavailable. Using estimated recommendation.");
        }
      } catch (error) {
        console.error("Recommendation error:", error);
        setError("Could not generate recommendation");
        setRecommendedCrop("maize");
        setIsEstimate(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendation();
  }, [coordinates, area, locationName])
  
  return (
    <Card className="border-primary/20 shadow-lg animate-in slide-in-from-bottom duration-300">
      <CardHeader className="bg-primary-50 dark:bg-primary-900/30 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sprout className="h-5 w-5 text-primary" />
          {isEstimate ? 'Crop Recommendation' : 'AI Crop Recommendation'}
          {isEstimate && (
            <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 px-2 py-0.5 rounded-full">
              Estimate
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {isEstimate 
            ? 'Based on your field location and characteristics' 
            : 'Based on advanced soil and weather analysis for your field'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 pb-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-12 w-12 relative animate-spin mb-4">
              <Sprout className="h-12 w-12 text-primary" />
            </div>
            <p className="text-muted-foreground">Analyzing your field data...</p>
          </div>
        ) : error ? (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md">
            <p className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              We're showing you our best estimate based on your field location.
            </p>
          </div>
        ) : recommendedCrop ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  Based on your field location in <span className="font-semibold">{locationName}</span>,{" "}
                  <span className="text-primary font-bold">{recommendedCrop}</span> is the optimal crop to plant.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isEstimate 
                    ? 'This recommendation is based on your field location and size.'
                    : 'Our AI analyzed soil conditions, local climate patterns, and upcoming weather for this recommendation.'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 my-3">
              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                <div className="text-xs text-muted-foreground">Expected Yield</div>
                <div className="font-medium">High (8.2 tons/ha)</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                <div className="text-xs text-muted-foreground">Water Needs</div>
                <div className="font-medium">Medium</div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p>No recommendation available for this field.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ThumbsDown className="h-4 w-4 mr-1" />
            Dismiss
          </Button>
          <Button variant="outline" size="sm" onClick={onGetTips}>
            <ThumbsUp className="h-4 w-4 mr-1" />
            Useful
          </Button>
        </div>
        <Button onClick={onGetTips} size="sm">
          Get Growing Tips
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
