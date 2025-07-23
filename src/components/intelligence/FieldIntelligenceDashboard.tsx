/**
 * 🛰️ FIELD INTELLIGENCE DASHBOARD - SATELLITE SUPERINTELLIGENCE UI
 * Real-time field intelligence visualization with glassmorphism magic
 * INFINITY IQ DESIGN - Clean, responsive, production-ready
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Satellite,
    Activity,
    Droplets,
    AlertTriangle,
    TrendingUp,
    MapPin,
    Zap,
    Target,
    RefreshCw,
    Star,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';
import { useFieldIntelligence, useFieldIntelligenceSummary, useFieldRecommendations } from '@/hooks/useFieldIntelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface FieldIntelligenceDashboardProps {
    fieldId: string;
    className?: string;
}

/**
 * FIELD INTELLIGENCE DASHBOARD - Main component
 */
export function FieldIntelligenceDashboard({ fieldId, className = '' }: FieldIntelligenceDashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');

    const intelligence = useFieldIntelligence({
        fieldId,
        autoRefresh: true,
        refreshInterval: 30000, // 30 seconds
        priority: 'medium'
    });

    const summary = useFieldIntelligenceSummary(fieldId);
    const recommendations = useFieldRecommendations(fieldId);

    if (!fieldId) {
        return (
            <Card className="w-full">
                <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center text-muted-foreground">
                        <Satellite className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a field to view intelligence analysis</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header with Real-time Status */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Satellite className="h-8 w-8 text-blue-600" />
                        {intelligence.state.isAnalyzing && (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-1 -right-1"
                            >
                                <RefreshCw className="h-4 w-4 text-blue-500" />
                            </motion.div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Field Intelligence</h2>
                        <p className="text-sm text-muted-foreground">
                            {intelligence.state.lastUpdated
                                ? `Last updated: ${intelligence.state.lastUpdated.toLocaleTimeString()}`
                                : 'Initializing satellite analysis...'
                            }
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Badge variant={summary.isHealthy ? 'default' : summary.needsAttention ? 'destructive' : 'secondary'}>
                        {summary.isHealthy ? 'Healthy' : summary.needsAttention ? 'Needs Attention' : 'Monitoring'}
                    </Badge>
                    <Button
                        onClick={intelligence.analyzeField}
                        disabled={intelligence.state.isAnalyzing}
                        size="sm"
                        variant="outline"
                    >
                        {intelligence.state.isAnalyzing ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Satellite className="h-4 w-4 mr-2" />
                        )}
                        Analyze
                    </Button>
                </div>
            </motion.div>

            {/* Critical Alerts Banner */}
            <AnimatePresence>
                {intelligence.criticalAlerts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card className="border-red-200 bg-red-50/50 backdrop-blur-sm">
                            <CardContent className="pt-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <span className="font-semibold text-red-800">Critical Alerts</span>
                                </div>
                                <div className="space-y-2">
                                    {intelligence.criticalAlerts.map((alert: any, index: number) => (
                                        <div key={index} className="text-sm text-red-700 bg-white/50 rounded p-2">
                                            {alert.message}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Dashboard Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md border border-white/20">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="recommendations">Actions</TabsTrigger>
                    <TabsTrigger value="precision">Precision</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <HealthScoreCard
                            score={summary.healthScore}
                            isLoading={summary.isLoading}
                        />
                        <NDVICard
                            value={summary.ndviValue}
                            isLoading={summary.isLoading}
                        />
                        <MoistureStressCard
                            level={summary.moistureStress}
                            isLoading={summary.isLoading}
                        />
                        <ConfidenceCard
                            confidence={summary.confidence}
                            isLoading={summary.isLoading}
                        />
                    </div>

                    {/* Quick Insights */}
                    <Card className="glass-morphism">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Activity className="h-5 w-5" />
                                <span>Quick Insights</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {intelligence.fieldAnalysis?.problemAreas.length || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Problem Areas</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {intelligence.fieldAnalysis?.yieldPrediction?.toFixed(1) || '0.0'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Tonnes/Ha Predicted</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {intelligence.variableRateZones.length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Precision Zones</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analysis Tab */}
                <TabsContent value="analysis" className="space-y-4">
                    <SatelliteAnalysisCard intelligence={intelligence} />
                    <VegetationIndicesCard intelligence={intelligence} />
                    <ProblemAreasCard intelligence={intelligence} />
                </TabsContent>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="space-y-4">
                    <RecommendationsCard recommendations={recommendations} intelligence={intelligence} />
                </TabsContent>

                {/* Precision Agriculture Tab */}
                <TabsContent value="precision" className="space-y-4">
                    <PrecisionAgricultureCard intelligence={intelligence} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

/**
 * HEALTH SCORE CARD - Field health visualization
 */
function HealthScoreCard({ score, isLoading }: { score: number; isLoading: boolean }) {
    const percentage = Math.round(score * 100);
    const color = score > 0.7 ? 'text-green-600' : score > 0.4 ? 'text-yellow-600' : 'text-red-600';

    return (
        <Card className="glass-morphism">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                        {isLoading ? (
                            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1" />
                        ) : (
                            <p className={`text-2xl font-bold ${color}`}>{percentage}%</p>
                        )}
                    </div>
                    <Activity className={`h-8 w-8 ${color}`} />
                </div>
                {!isLoading && (
                    <Progress value={percentage} className="mt-3" />
                )}
            </CardContent>
        </Card>
    );
}

/**
 * NDVI CARD - Vegetation index display
 */
function NDVICard({ value, isLoading }: { value: number; isLoading: boolean }) {
    const color = value > 0.6 ? 'text-green-600' : value > 0.3 ? 'text-yellow-600' : 'text-red-600';

    return (
        <Card className="glass-morphism">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">NDVI</p>
                        {isLoading ? (
                            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1" />
                        ) : (
                            <p className={`text-2xl font-bold ${color}`}>{value.toFixed(2)}</p>
                        )}
                    </div>
                    <TrendingUp className={`h-8 w-8 ${color}`} />
                </div>
                {!isLoading && (
                    <div className="mt-2 text-xs text-muted-foreground">
                        {value > 0.6 ? 'Excellent' : value > 0.3 ? 'Moderate' : 'Poor'} vegetation
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * MOISTURE STRESS CARD - Water stress indicator
 */
function MoistureStressCard({ level, isLoading }: { level: string; isLoading: boolean }) {
    const getColor = (level: string) => {
        switch (level) {
            case 'low': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'high': return 'text-orange-600';
            case 'critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <Card className="glass-morphism">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Water Stress</p>
                        {isLoading ? (
                            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-1" />
                        ) : (
                            <p className={`text-lg font-bold capitalize ${getColor(level)}`}>{level}</p>
                        )}
                    </div>
                    <Droplets className={`h-8 w-8 ${getColor(level)}`} />
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * CONFIDENCE CARD - AI confidence display
 */
function ConfidenceCard({ confidence, isLoading }: { confidence: number; isLoading: boolean }) {
    const percentage = Math.round(confidence * 100);
    const color = confidence > 0.8 ? 'text-green-600' : confidence > 0.6 ? 'text-yellow-600' : 'text-red-600';

    return (
        <Card className="glass-morphism">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">AI Confidence</p>
                        {isLoading ? (
                            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1" />
                        ) : (
                            <p className={`text-2xl font-bold ${color}`}>{percentage}%</p>
                        )}
                    </div>
                    <Star className={`h-8 w-8 ${color}`} />
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * SATELLITE ANALYSIS CARD - Detailed analysis display
 */
function SatelliteAnalysisCard({ intelligence }: { intelligence: any }) {
    const { fieldAnalysis } = intelligence;

    if (!fieldAnalysis) {
        return (
            <Card className="glass-morphism">
                <CardContent className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">No analysis data available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass-morphism">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Satellite className="h-5 w-5" />
                    <span>Satellite Analysis</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/50 rounded-lg">
                        <div className="text-lg font-semibold text-green-600">
                            {fieldAnalysis.vegetationIndices.ndvi.toFixed(3)}
                        </div>
                        <div className="text-sm text-muted-foreground">NDVI</div>
                    </div>
                    <div className="text-center p-4 bg-white/50 rounded-lg">
                        <div className="text-lg font-semibold text-blue-600">
                            {fieldAnalysis.vegetationIndices.evi.toFixed(3)}
                        </div>
                        <div className="text-sm text-muted-foreground">EVI</div>
                    </div>
                    <div className="text-center p-4 bg-white/50 rounded-lg">
                        <div className="text-lg font-semibold text-purple-600">
                            {fieldAnalysis.vegetationIndices.savi.toFixed(3)}
                        </div>
                        <div className="text-sm text-muted-foreground">SAVI</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="font-medium">Analysis Summary</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <p>• Field coordinates: {fieldAnalysis.coordinates.length} points mapped</p>
                        <p>• Moisture stress level: {fieldAnalysis.moistureStress}</p>
                        <p>• Yield prediction: {fieldAnalysis.yieldPrediction.toFixed(1)} tonnes/hectare</p>
                        <p>• Problem areas detected: {fieldAnalysis.problemAreas.length}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * VEGETATION INDICES CARD - Detailed vegetation metrics
 */
function VegetationIndicesCard({ intelligence }: { intelligence: any }) {
    const { fieldAnalysis } = intelligence;

    if (!fieldAnalysis?.vegetationIndices) return null;

    const indices = [
        { name: 'NDVI', value: fieldAnalysis.vegetationIndices.ndvi, description: 'Normalized Difference Vegetation Index' },
        { name: 'EVI', value: fieldAnalysis.vegetationIndices.evi, description: 'Enhanced Vegetation Index' },
        { name: 'SAVI', value: fieldAnalysis.vegetationIndices.savi, description: 'Soil Adjusted Vegetation Index' }
    ];

    return (
        <Card className="glass-morphism">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Vegetation Indices</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {indices.map((index) => (
                        <div key={index.name} className="flex items-center justify-between p-3 bg-white/30 rounded-lg">
                            <div>
                                <div className="font-medium">{index.name}</div>
                                <div className="text-sm text-muted-foreground">{index.description}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold">{index.value.toFixed(3)}</div>
                                <Progress value={index.value * 100} className="w-20 mt-1" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * PROBLEM AREAS CARD - Issue identification
 */
function ProblemAreasCard({ intelligence }: { intelligence: any }) {
    const { fieldAnalysis } = intelligence;

    if (!fieldAnalysis?.problemAreas?.length) {
        return (
            <Card className="glass-morphism">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5" />
                        <span>Problem Areas</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No problem areas detected</p>
                        <p className="text-sm">Your field is looking healthy!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass-morphism">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Problem Areas ({fieldAnalysis.problemAreas.length})</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {fieldAnalysis.problemAreas.map((area: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/30 rounded-lg">
                            <div>
                                <div className="font-medium">{area.issue}</div>
                                <div className="text-sm text-muted-foreground">
                                    Lat: {area.lat.toFixed(4)}, Lng: {area.lng.toFixed(4)}
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant={area.ndvi < 0.3 ? 'destructive' : 'secondary'}>
                                    NDVI: {area.ndvi.toFixed(2)}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * RECOMMENDATIONS CARD - Actionable insights
 */
function RecommendationsCard({ recommendations, intelligence }: { recommendations: any; intelligence: any }) {
    const [feedbackStates, setFeedbackStates] = useState<Record<string, { rating: number; implemented: boolean }>>({});

    const handleFeedback = async (recommendationId: string, rating: number, implemented: boolean) => {
        try {
            await intelligence.provideFeedback(recommendationId, rating, implemented);
            setFeedbackStates(prev => ({
                ...prev,
                [recommendationId]: { rating, implemented }
            }));
        } catch (error) {
            toast.error('Failed to submit feedback');
        }
    };

    if (!recommendations.recommendations.length) {
        return (
            <Card className="glass-morphism">
                <CardContent className="text-center py-8">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No recommendations available</p>
                    <p className="text-sm text-muted-foreground">Run field analysis to get actionable insights</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {recommendations.recommendations.map((rec: any, index: number) => (
                <Card key={rec.id} className="glass-morphism">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                            <Badge variant={
                                rec.priority === 'critical' ? 'destructive' :
                                    rec.priority === 'high' ? 'default' :
                                        rec.priority === 'medium' ? 'secondary' : 'outline'
                            }>
                                {rec.priority}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">{rec.description}</p>

                        <div className="space-y-2">
                            <h4 className="font-medium">Action Steps:</h4>
                            {rec.actions.map((action: any, actionIndex: number) => (
                                <div key={actionIndex} className="flex items-start space-x-3 p-2 bg-white/30 rounded">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                                        {actionIndex + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{action.step}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Timeframe: {action.timeframe}
                                            {action.cost && ` • Cost: $${action.cost}`}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="text-sm">
                                <span className="text-muted-foreground">Expected outcome: </span>
                                <span className="font-medium">{rec.expectedOutcome}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleFeedback(rec.id, 5, true)}
                                    disabled={!!feedbackStates[rec.id]}
                                >
                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                    Helpful
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleFeedback(rec.id, 2, false)}
                                    disabled={!!feedbackStates[rec.id]}
                                >
                                    <ThumbsDown className="h-4 w-4 mr-1" />
                                    Not Helpful
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

/**
 * PRECISION AGRICULTURE CARD - Variable rate zones and precision insights
 */
function PrecisionAgricultureCard({ intelligence }: { intelligence: any }) {
    const { precisionAgriculture } = intelligence;

    if (!precisionAgriculture) {
        return (
            <Card className="glass-morphism">
                <CardContent className="text-center py-8">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Precision agriculture data not available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Variable Rate Zones */}
            <Card className="glass-morphism">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>Variable Rate Zones ({intelligence.variableRateZones.length})</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {intelligence.variableRateZones.length > 0 ? (
                        <div className="space-y-3">
                            {intelligence.variableRateZones.map((zone: any, index: number) => (
                                <div key={index} className="p-3 bg-white/30 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium capitalize">{zone.recommendation_type}</span>
                                        <Badge variant="outline">
                                            {(zone.application_rate * 100).toFixed(0)}% rate
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        NDVI: {zone.ndvi_value.toFixed(2)} •
                                        Savings potential: {(zone.savings_potential * 100).toFixed(0)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-4">
                            <p>No variable rate zones identified</p>
                            <p className="text-sm">Field appears uniform</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Precision Recommendations */}
            <Card className="glass-morphism">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Zap className="h-5 w-5" />
                        <span>Precision Recommendations</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {precisionAgriculture.recommendations?.length > 0 ? (
                        <div className="space-y-2">
                            {precisionAgriculture.recommendations.map((rec: string, index: number) => (
                                <div key={index} className="p-2 bg-white/30 rounded text-sm">
                                    {rec}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">
                            No precision agriculture recommendations available
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default FieldIntelligenceDashboard;