import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useFieldIntel } from "@/hooks/useFieldIntel";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Thermometer } from "lucide-react";

interface Props {
  field: {
    id: string;
    name: string;
    crop_type: string;
  };
}

const FieldCard: React.FC<Props> = ({ field }) => {
  const navigate = useNavigate();
  const { data: intel, isLoading, error } = useFieldIntel(field.id);

  const handleNavigate = () => {
    navigate(`/fields/${field.id}`);
  };

  const healthColor = () => {
    if (!intel || intel.satellite_health === null) return 'text-gray-500';
    if (intel.satellite_health >= 80) return 'text-green-500';
    if (intel.satellite_health >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={handleNavigate}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="truncate pr-2">{field.name || "Unnamed Field"}</span>
          {field.crop_type && (
            <Badge variant="secondary" className="capitalize">
              {field.crop_type}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        )}
        {error && (
            <div className="flex items-center space-x-2 text-red-500">
                <AlertCircle className="h-5 w-5" />
                <span>Error</span>
            </div>
        )}
        {intel && (
          <div className="flex items-center space-x-2">
            <Thermometer className={`h-5 w-5 ${healthColor()}`} />
            <span className={`font-medium ${healthColor()}`}>{intel.satellite_health}% Health</span>
          </div>
        )}
        {intel?.last_scanned && (
            <p className="text-xs text-gray-500 mt-2">
                Last scanned: {new Date(intel.last_scanned).toLocaleDateString()}
            </p>
        )}
      </CardContent>
    </Card>
  );
};

export default FieldCard;
