import React, { useState, useEffect, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from '@/integrations/supabase/client';
import { Field, FieldCrop, FieldHistory, Boundary } from "@/types/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getFieldById, deleteField } from "@/services/fieldService";
import { useCrops, useDeleteCrop } from "@/hooks/useCrops";
import { CropCard } from "@/components/crops/CropCard";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, MapPin, Trash2, Edit, ArrowLeft, Calendar, Droplets, Tractor, Leaf, History, Check, AlertCircle, RefreshCw, Zap } from "lucide-react";
import { analyzeField, getFieldRecommendations, checkFieldRisks } from "@/services/fieldAIService";
import SatelliteImageryDisplay from "@/components/SatelliteImageryDisplay";

// Lazy load FieldMap so leaflet isn't fetched unless the user opens a field
const FieldMap = lazy(() => import("@/components/fields/FieldMap"));

const parseWkt = (wkt: string): Boundary | null => {
  if (!wkt || !wkt.toUpperCase().startsWith('POLYGON')) return null;
  try {
    const coordPairs = wkt.match(/\(([^)]+)\)/)?.[1].split(',').map(s => s.trim());
    if (!coordPairs) return null;

    const coordinates = coordPairs.map(pair => {
      const [lng, lat] = pair.split(' ').map(Number);
      return { lng, lat };
    });

    return {
      type: 'polygon',
      coordinates,
    };
  } catch (e) {
    console.error('Failed to parse WKT string:', e);
    return null;
  }
};

const FieldDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [field, setField] = useState<Field | null>(null);
  const [history, setHistory] = useState<FieldHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [farmName, setFarmName] = useState<string | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [risks, setRisks] = useState<any>({ hasRisks: false, risks: [] });
  const [loadingRisks, setLoadingRisks] = useState(false);

  // Use the new crop hooks
  const { data: crops = [], isLoading: cropsLoading } = useCrops(id);
  const deleteCropMutation = useDeleteCrop();

  useEffect(() => {
    if (id) {
      loadField();
    }
  }, [id]);

  const loadAIInsights = async (fieldId: string) => {
    setLoadingInsights(true);
    
    try {
      console.log(`🧠 Loading AI insights for field ${fieldId}...`);
      
      // Call GEMINI-2.5-FLASH directly - EXACTLY like AI Crop Scanner
      const [recommendations, fieldRisks] = await Promise.all([
        getFieldRecommendations(fieldId),
        checkFieldRisks(fieldId)
      ]);
      
      setInsights(recommendations);
      setRisks(fieldRisks);
      
      console.log('✅ AI insights loaded successfully:', {
        recommendations: recommendations.length,
        risks: fieldRisks.risks.length
      });
      
      toast.success("AI Analysis Complete", {
        description: `Generated ${recommendations.length} recommendations for your field`
      });
      
    } catch (error) {
      console.error("❌ Failed to load AI insights:", error);
      toast.error("AI Analysis Failed", {
        description: "Unable to generate field insights. Please try again."
      });
    } finally {
      setLoadingInsights(false);
    }
  };

  const loadField = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Get field data
      const { data, error } = await getFieldById(id);
      
      if (error || !data) {
        toast.error("Error", {
          description: error || "Field not found",
        });
        navigate("/fields");
        return;
      }
      
            if (data.boundary && typeof data.boundary === 'string') {
        data.boundary = parseWkt(data.boundary);
      }
      setField(data);
      
      // Get farm name if field belongs to a farm
      if (data.farm_id) {
        const { data: farmData } = await supabase
          .from('farms')
          .select('name')
          .eq('id', data.farm_id)
          .single();
          
        if (farmData) {
          setFarmName(farmData.name);
        }
      }
      
      // Crops are now loaded via useCrops hook
      
      // Get field history
      const { data: historyData } = await supabase
        .from('field_history')
        .select('*')
        .eq('field_id', id)
        .order('date', { ascending: false });
        
      setHistory(historyData || []);
      
      if (data) {
        loadAIInsights(data.id);
      }
    } catch (err) {
      console.error("Error loading field:", err);
      toast.error("Error", {
        description: "Failed to load field data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!field) return;
    
    try {
      setDeleting(true);
      const { error } = await deleteField(field.id);
      
      if (error) {
        throw new Error(error);
      }
      
      toast.success("Field deleted", {
        description: "The field has been successfully deleted",
      });
      
      navigate("/fields");
    } catch (err) {
      console.error("Error deleting field:", err);
      toast.error("Error", {
        description: "Failed to delete field",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const renderFieldDetailsSection = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{field?.name}</CardTitle>
            <CardDescription>
              {farmName ? `Part of ${farmName}` : "Independent Field"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/fields/${field?.id}/edit`}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </a>
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Field Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Size:</div>
                <div>{field?.size} {field?.size_unit}</div>
                
                <div className="text-muted-foreground">Soil Type:</div>
                <div>{field?.soil_type || "Not specified"}</div>
                
                <div className="text-muted-foreground">Irrigation:</div>
                <div>{field?.irrigation_type || "Not specified"}</div>
                
                <div className="text-muted-foreground">Location:</div>
                <div>{field?.location_description || "No description"}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Current Crops</h3>
              {crops.length > 0 ? (
                <div className="space-y-2">
                  {crops.filter(crop => crop.status === 'growing').slice(0, 3).map(crop => (
                    <div key={crop.id} className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{crop.crop_type}</span>
                      <Badge variant="outline" className="text-xs">
                        {crop.area_planted} ha
                      </Badge>
                    </div>
                  ))}
                  {crops.filter(crop => crop.status === 'growing').length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{crops.filter(crop => crop.status === 'growing').length - 3} more crops
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No active crops recorded
                </div>
              )}
            </div>
            

          </div>
          

        </div>
        
        <Separator />
        
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate("/fields")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Fields
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/fields/${field?.id}/crops/add`}>
                <Leaf className="h-4 w-4 mr-1" />
                Add Crop
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/farm-planning">
                <Calendar className="h-4 w-4 mr-1" />
                Log Activity
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAIInsightsSection = () => (
    <Card className="mt-6 border-2 border-green-100 bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-600 animate-pulse" />
          🧠 AI Field Insights
        </CardTitle>
        <CardDescription className="text-green-700">
          CROPGenius AI analysis and recommendations for your field
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingInsights ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <div className="text-center">
              <p className="text-sm font-medium text-green-700">🤖 CropGenius Analyzing Your Field...</p>
              <p className="text-xs text-green-600 mt-1">Connecting to CropGenius AI • Satellite Data • Weather Systems</p>
            </div>
          </div>
        ) : (
          <>
            {insights.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-white/70 rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="text-green-600">🎯</span> AI Recommendations:
                  </h3>
                  <ul className="space-y-3">
                    {insights.map((insight, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700 leading-relaxed">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {risks.hasRisks && (
                  <div className="bg-white/70 rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <span className="text-orange-600">⚠️</span> Risk Assessment:
                    </h3>
                    {loadingRisks ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {risks.risks.map((risk: any, i: number) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-white/50 border rounded-md">
                            <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                              risk.likelihood === 'high' ? 'text-red-500' : 
                              risk.likelihood === 'medium' ? 'text-orange-500' : 'text-green-500'
                            }`} />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-800">{risk.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{risk.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                <div className="mb-4">
                  <Zap className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-medium">🤖 AI Analysis Ready</p>
                  <p className="text-xs mt-1">Click below to get personalized field insights</p>
                </div>
              </div>
            )}
            
            <Button 
              variant="default" 
              size="sm" 
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-medium"
              onClick={() => loadAIInsights(field?.id || '')}
              disabled={!field || loadingInsights}
            >
              {loadingInsights ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  🧠 AI Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  🚀 Get AI Field Analysis
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2"
            onClick={() => navigate("/fields")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Fields
          </Button>
          <h1 className="text-2xl font-bold">{field?.name || "Field Details"}</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {renderFieldDetailsSection()}
            {renderAIInsightsSection()}
            
            <Tabs defaultValue="crops" className="mt-6">
              <TabsList>
                <TabsTrigger value="crops">Crops</TabsTrigger>
                <TabsTrigger value="satellite">🛰️ Satellite Intelligence</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="crops" className="mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Field Crops</CardTitle>
                      <Button size="sm" asChild>
                        <a href={`/fields/${field?.id}/crops/add`}>
                          <Leaf className="h-4 w-4 mr-1" />
                          Add Crop
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {cropsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : crops.length > 0 ? (
                      <div className="space-y-4">
                        {crops.map(crop => (
                          <CropCard
                            key={crop.id}
                            crop={crop}
                            onDelete={(crop) => {
                              if (confirm('Are you sure you want to delete this crop?')) {
                                deleteCropMutation.mutate(crop.id!);
                              }
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Leaf className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <h3 className="text-lg font-medium mb-1">No Crops Added Yet</h3>
                        <p className="mb-4">Start tracking your crops to get insights and recommendations</p>
                        <Button asChild>
                          <a href={`/fields/${field?.id}/crops/add`}>
                            Add Your First Crop
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="satellite" className="mt-4">
                <SatelliteImageryDisplay 
                  fieldCoordinates={field?.boundary?.coordinates?.map(coord => ({ lat: coord.lat, lng: coord.lng }))}
                  fieldId={field?.id}
                />
              </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Field History</CardTitle>
                      <Button size="sm" asChild>
                        <a href="/farm-planning">
                          <Calendar className="h-4 w-4 mr-1" />
                          Log Activity
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {history.length > 0 ? (
                      <div className="space-y-1">
                        {history.map(event => (
                          <div key={event.id} className="flex py-3 border-b last:border-0">
                            <div className="w-24 shrink-0 text-sm">
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {event.event_type}
                                </Badge>
                                <h4 className="text-sm font-medium">{event.description}</h4>
                              </div>
                              {event.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {event.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <h3 className="text-lg font-medium mb-1">No History Recorded</h3>
                        <p className="mb-4">Track activities like planting, treatments, and inspections</p>
                        <Button asChild>
                          <a href={`/fields/${field?.id}/history/add`}>
                            Log Your First Activity
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this field and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default FieldDetail;
