import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, DollarSign, Leaf } from 'lucide-react';

export interface DiseaseDetectionResultData {
  disease_name: string;
  confidence: number;
  severity: string;
  crop_type: string;
  immediate_actions: string[];
  organic_solutions: string[];
  inorganic_solutions: string[];

}

interface Props {
  result: DiseaseDetectionResultData;
  showImage?: boolean;
  imageUrl?: string;
}

export const DiseaseDetectionResult: React.FC<Props> = ({ result, showImage, imageUrl }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{result.disease_name}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge className={getSeverityColor(result.severity)}>
                  {result.severity.toUpperCase()}
                </Badge>
                <Badge variant="secondary">{result.confidence}% Confidence</Badge>
                <Badge variant="outline">
                  <Leaf className="h-3 w-3 mr-1" />
                  {result.crop_type}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {showImage && imageUrl && (
            <img src={imageUrl} alt="Disease detection" className="w-full max-w-md mx-auto rounded-lg" />
          )}

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Detection Confidence</span>
              <span className="text-sm font-bold">{result.confidence}%</span>
            </div>
            <Progress value={result.confidence} className="h-2" />
          </div>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-semibold text-orange-800">Immediate Actions</span>
              </div>
              <ul className="space-y-1">
                {result.immediate_actions.map((action, i) => (
                  <li key={i} className="text-sm text-orange-700">• {action}</li>
                ))}
              </ul>
            </CardContent>
          </Card>



          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Organic Solutions
              </h4>
              <ul className="space-y-1">
                {result.organic_solutions.map((solution, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Chemical Solutions
              </h4>
              <ul className="space-y-1">
                {result.inorganic_solutions.map((solution, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiseaseDetectionResult;