/**
 * 🔥💪 DISEASE DETECTION RESULTS - INFINITY GOD MODE ACTIVATED!
 * Production-ready results display with actionable insights
 * Built for 100 million African farmers with REAL value!
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Leaf, 
  MapPin, 
  Calendar,
  TrendingDown,
  TrendingUp,
  Shield,
  Zap,
  Download,
  Share2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Phone,
  Store,
  Truck,
  AlertCircle,
  Info,
  Target,
  Activity
} from 'lucide-react';

// 🚀 PRODUCTION-READY COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

// 🔥 INFINITY IQ HOOKS AND SERVICES
import { DiseaseDetectionResult } from '@/agents/CropDiseaseOracle';
import { useErrorHandler } from '@/utils/errorHandling';
import { PageErrorBoundary, WidgetErrorBoundary } from '@/components/error/EnhancedErrorBoundary';

interface DiseaseDetectionResultsProps {
  result: DiseaseDetectionResult;
  onSaveToHistory?: () => void;
  onShareResult?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

interface LocalSupplier {
  name: string;
  contact: string;
  location: string;
  products: string[];
  distance_km?: number;
  rating?: number;
}

/**
 * 🔥 INFINITY GOD MODE DISEASE DETECTION RESULTS
 * Comprehensive results display with actionable farmer insights
 */
export const DiseaseDetectionResults: React.FC<DiseaseDetectionResultsProps> = ({
  result,
  onSaveToHistory,
  onShareResult,
  onViewDetails,
  className = ''
}) => {
  const { handleError } = useErrorHandler();
  
  // 🚀 STATE MANAGEMENT
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    symptoms: false,
    treatment: false,
    prevention: false,
    suppliers: false
  });
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  // 🔥 TOGGLE SECTION EXPANSION
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // 🚀 GET SEVERITY COLOR
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 🔥 GET CONFIDENCE COLOR
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // 🚀 GET SPREAD RISK COLOR
  const getSpreadRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 🔥 FORMAT CURRENCY
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 🚀 HANDLE EXPORT
  const handleExport = useCallback(async () => {
    try {
      const reportData = {
        detection_date: new Date().toISOString(),
        crop_type: result.crop_type,
        disease_name: result.disease_name,
        scientific_name: result.scientific_name,
        confidence: result.confidence,
        severity: result.severity,
        affected_area: result.affected_area_percentage,
        symptoms: result.symptoms,
        immediate_actions: result.immediate_actions,
        economic_impact: result.economic_impact,
        recovery_timeline: result.recovery_timeline
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `disease-detection-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Report exported successfully!');
    } catch (error) {
      handleError(error as Error, { 
        component: 'DiseaseDetectionResults',
        operation: 'handleExport' 
      });
      toast.error('Failed to export report');
    }
  }, [result, handleError]);

  return (
    <PageErrorBoundary errorBoundaryId="disease-detection-results">
      <div className={`space-y-6 ${className}`}>
        
        {/* 🔥 HEADER OVERVIEW */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{result.disease_name}</CardTitle>
                    {result.scientific_name && (
                      <CardDescription className="italic text-base">
                        {result.scientific_name}
                      </CardDescription>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Badge className={getConfidenceColor(result.confidence)} variant="outline">
                    <Target className="h-3 w-3 mr-1" />
                    {result.confidence}% Confidence
                  </Badge>
                  <Badge className={getSeverityColor(result.severity)} variant="outline">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {result.severity.toUpperCase()} Severity
                  </Badge>
                  <Badge className={getSpreadRiskColor(result.spread_risk)} variant="outline">
                    <Activity className="h-3 w-3 mr-1" />
                    {result.spread_risk.toUpperCase()} Spread Risk
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleExport}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  onClick={onShareResult}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 🚀 CRITICAL ALERTS */}
        {result.severity === 'high' || result.severity === 'critical' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Urgent Action Required!</AlertTitle>
            <AlertDescription>
              This is a {result.severity} severity disease that requires immediate attention to prevent crop loss.
              {result.spread_risk === 'high' && ' High risk of spreading to other plants.'}
            </AlertDescription>
          </Alert>
        )}

        {/* 🔥 MAIN CONTENT TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="treatment">Treatment</TabsTrigger>
            <TabsTrigger value="economic">Economic</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>

          {/* 🚀 OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-4">
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Affected Area</p>
                      <p className="text-2xl font-bold">{result.affected_area_percentage}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Recovery Time</p>
                      <p className="text-2xl font-bold">{result.recovery_timeline}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Yield Loss</p>
                      <p className="text-2xl font-bold">{result.economic_impact.yield_loss_percentage}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Symptoms */}
            <Card>
              <Collapsible 
                open={expandedSections.symptoms} 
                onOpenChange={() => toggleSection('symptoms')}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-600" />
                        Symptoms Identified
                      </CardTitle>
                      {expandedSections.symptoms ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.symptoms.map((symptom, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Location Info */}
            {result.location && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Detection Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Coordinates</p>
                      <p>{result.location.lat.toFixed(4)}, {result.location.lng.toFixed(4)}</p>
                    </div>
                    {result.location.country && (
                      <div>
                        <p className="font-medium text-muted-foreground">Country</p>
                        <p>{result.location.country}</p>
                      </div>
                    )}
                    {result.location.region && (
                      <div>
                        <p className="font-medium text-muted-foreground">Region</p>
                        <p>{result.location.region}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-muted-foreground">Detection Date</p>
                      <p>{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 🔥 TREATMENT TAB */}
          <TabsContent value="treatment" className="space-y-4">
            
            {/* Immediate Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-red-600" />
                  Immediate Actions Required
                </CardTitle>
                <CardDescription>
                  Take these actions within the next 24-48 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.immediate_actions.map((action, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm font-medium">{action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Organic Solutions */}
            {result.organic_solutions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    Organic Solutions
                  </CardTitle>
                  <CardDescription>
                    Natural and environmentally friendly treatments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.organic_solutions.map((solution, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{solution}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Inorganic Solutions */}
            {result.inorganic_solutions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Chemical Treatments
                  </CardTitle>
                  <CardDescription>
                    Chemical solutions for severe cases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.inorganic_solutions.map((solution, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{solution}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Preventive Measures */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Prevention for Future
                </CardTitle>
                <CardDescription>
                  Prevent this disease from occurring again
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.preventive_measures.map((measure, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{measure}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 🚀 ECONOMIC TAB */}
          <TabsContent value="economic" className="space-y-4">
            
            {/* Economic Impact Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Potential Revenue Loss</p>
                      <p className="text-3xl font-bold text-red-600">
                        {formatCurrency(result.economic_impact.revenue_loss_usd)}
                      </p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Treatment Cost</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {formatCurrency(result.economic_impact.treatment_cost_usd)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost-Benefit Analysis */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Cost-Benefit Analysis</CardTitle>
                <CardDescription>
                  Financial impact of treating vs. not treating
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <p className="font-medium text-green-800">Savings from Treatment</p>
                      <p className="text-sm text-green-600">Revenue loss prevented</p>
                    </div>
                    <p className="text-2xl font-bold text-green-800">
                      {formatCurrency(result.economic_impact.revenue_loss_usd - result.economic_impact.treatment_cost_usd)}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      ROI: {(((result.economic_impact.revenue_loss_usd - result.economic_impact.treatment_cost_usd) / result.economic_impact.treatment_cost_usd) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Impact */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  Recovery Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Expected Recovery Time</span>
                    <Badge variant="outline">{result.recovery_timeline}</Badge>
                  </div>
                  <Progress value={25} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    Early treatment can reduce recovery time by up to 50%
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 🔥 SUPPLIERS TAB */}
          <TabsContent value="suppliers" className="space-y-4">
            
            {/* Recommended Products */}
            {result.recommended_products.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Store className="h-5 w-5 text-green-600" />
                    Recommended Products
                  </CardTitle>
                  <CardDescription>
                    Products specifically effective for this disease
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.recommended_products.map((product, index) => (
                      <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <p className="font-medium text-sm">{product}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Local Suppliers */}
            {result.local_suppliers.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    Local Suppliers
                  </CardTitle>
                  <CardDescription>
                    Nearby suppliers for treatment products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.local_suppliers.map((supplier, index) => {
                      const supplierData = supplier as LocalSupplier;
                      return (
                        <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <h4 className="font-medium">{supplierData.name}</h4>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{supplierData.location}</span>
                                </div>
                                {supplierData.distance_km && (
                                  <div className="flex items-center space-x-1">
                                    <Truck className="h-3 w-3" />
                                    <span>{supplierData.distance_km}km away</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {supplierData.products.slice(0, 3).map((product, pIndex) => (
                                  <Badge key={pIndex} variant="outline" className="text-xs">
                                    {product}
                                  </Badge>
                                ))}
                                {supplierData.products.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{supplierData.products.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              {supplierData.rating && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  ⭐ {supplierData.rating}/5
                                </Badge>
                              )}
                              <Button size="sm" variant="outline" className="gap-2">
                                <Phone className="h-3 w-3" />
                                Contact
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Emergency Contacts */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-red-600" />
                  Emergency Agricultural Support
                </CardTitle>
                <CardDescription>
                  Contact agricultural extension officers for urgent help
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-medium text-red-800">Agricultural Extension Hotline</p>
                    <p className="text-sm text-red-600">Call for immediate expert advice</p>
                    <Button size="sm" className="mt-2 gap-2" variant="outline">
                      <Phone className="h-3 w-3" />
                      Call Now
                    </Button>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium text-blue-800">Local Agricultural Office</p>
                    <p className="text-sm text-blue-600">Visit for in-person consultation</p>
                    <Button size="sm" className="mt-2 gap-2" variant="outline">
                      <ExternalLink className="h-3 w-3" />
                      Find Location
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 🚀 ACTION BUTTONS */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <Button onClick={onSaveToHistory} className="gap-2">
                <Download className="h-4 w-4" />
                Save to History
              </Button>
              <Button onClick={onViewDetails} variant="outline" className="gap-2">
                <Eye className="h-4 w-4" />
                View Full Details
              </Button>
              <Button onClick={onShareResult} variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share with Expert
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageErrorBoundary>
  );
};

export default DiseaseDetectionResults;