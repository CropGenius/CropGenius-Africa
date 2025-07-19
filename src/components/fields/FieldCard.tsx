import React, { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Database } from "@/types/supabase";

// Extend the Database type to include health metrics
interface FieldWithHealth extends Database["public"]["Tables"]["fields"]["Row"] {
  health_index?: number;
  health_score?: number;
}

interface Props {
  field: FieldWithHealth;
  onLiveView?: (fieldId: string) => void;
  isLoading?: boolean;
}

const FieldCard: React.FC<Props> = ({ field, onLiveView, isLoading = false }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const handleNavigate = useCallback(() => {
    if (isLoading || !field.id) return;
    navigate(`/fields/${field.id}`);
  }, [navigate, field.id, isLoading]);

  const handleLiveView = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!onLiveView || !field.id) return;
      
      try {
        setIsViewLoading(true);
        setError(null);
        await onLiveView(field.id);
      } catch (err) {
        console.error("Error in live view:", err);
        setError("Could not load live view");
      } finally {
        setIsViewLoading(false);
      }
    },
    [onLiveView, field.id]
  );

  // Get health value with proper typing
  const health = field.health_index ?? field.health_score ?? null;
  
  // Handle missing field data
  if (!field || !field.id) {
    return (
      <Card className="border-dashed border-gray-300 dark:border-gray-700">
        <CardContent className="p-6 flex flex-col items-center justify-center text-muted-foreground">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>Field data unavailable</p>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="border-dashed border-gray-300 dark:border-gray-700">
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading field data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition" onClick={handleNavigate}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          <span>{field.name || "Unnamed Field"}</span>
          {field.crop_type && (
            <Badge variant="secondary" className="capitalize">
              {field.crop_type}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {health !== null && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Health Index</p>
            <Progress 
              value={Number(health)} 
              className="h-2" 
              aria-label={`Field health: ${health}%`}
            />
            <p className="text-xs font-medium">{health}%</p>
          </div>
        )}
        {error && (
          <div className="text-xs text-red-500 flex items-center gap-1 mb-2">
            <AlertCircle className="h-3 w-3" /> {error}
          </div>
        )}
        <Button
          size="sm"
          variant="outline"
          className="w-full flex items-center gap-1"
          onClick={handleLiveView}
          disabled={isViewLoading}
          aria-label="View field live data"
        >
          {isViewLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" /> Live View
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FieldCard;
