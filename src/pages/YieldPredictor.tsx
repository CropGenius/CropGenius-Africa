import { useState } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Zap, RefreshCcw, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { yieldPredictorOracle, YieldPredictionInput, YieldPredictionResult } from "@/agents/YieldPredictorOracle";
import { weatherService } from "@/services/UnifiedWeatherService";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  cropType: z.string().min(1, "Crop type is required"),
  farmSize: z.string().min(1, "Farm size is required"),
  soilType: z.string().min(1, "Soil type is required"),
  plantingDate: z.string().min(1, "Planting date is required"),
  expectedRainfall: z.string().min(1, "Expected rainfall is required"),
  fertilizerUse: z.enum(["none", "organic", "synthetic", "hybrid"]),
  previousYield: z.string().optional(),
});

const YieldPredictor = () => {
  const [predictionData, setPredictionData] = useState<YieldPredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: "",
      farmSize: "",
      soilType: "",
      plantingDate: "",
      expectedRainfall: "moderate",
      fertilizerUse: "organic",
      previousYield: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsAnalyzing(true);

    try {
      // Get user's location for better AI context
      let location = { lat: -1.2921, lng: 36.8219, country: 'Kenya' }; // Default to Nairobi

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true
            });
          });

          location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            country: 'Kenya' // Could be enhanced with reverse geocoding
          };

          toast.success("Location detected", {
            description: "Using your GPS coordinates for more accurate predictions!",
          });
        } catch (geoError) {
          console.log('Geolocation failed, using default location:', geoError);
          toast.info("Using default location", {
            description: "Enable location access for more accurate predictions",
          });
        }
      }

      // Get current weather data for better AI context
      const weatherData = await weatherService.getWeatherByCoordinates(location.lat, location.lng);

      // Try to get existing field data from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      let fieldData = null;
      if (user) {
        const { data: fields } = await supabase
          .from('fields')
          .select('*')
          .eq('user_id', user.id)
          .limit(1);
        fieldData = fields?.[0] || null;
      }

      const farmData: YieldPredictionInput = {
        fieldId: fieldData?.id || `field-${Date.now()}`,
        cropType: data.cropType,
        farmSize: parseFloat(data.farmSize),
        plantingDate: new Date(data.plantingDate),
        location,
        soilType: data.soilType,
        expectedRainfall: data.expectedRainfall,
        fertilizerUse: data.fertilizerUse,
        previousYield: data.previousYield ? parseFloat(data.previousYield) : undefined,
        // Enhanced context for better AI predictions
        weatherContext: {
          currentTemp: weatherData.current.temperature,
          humidity: weatherData.current.humidity,
          condition: weatherData.current.condition,
          forecast: weatherData.forecast.slice(0, 5), // Next 5 days
        },
        fieldContext: fieldData ? {
          fieldName: fieldData.name,
          totalArea: fieldData.size_hectares,
          soilPh: fieldData.soil_ph,
          elevation: fieldData.elevation,
        } : undefined,
      };

      const result = await yieldPredictorOracle.generateYieldPrediction(farmData);
      setPredictionData(result);

      toast.success("AI Analysis Complete", {
        description: "Real AI predictions generated successfully using Gemini 2.5 Flash!",
      });
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error("Prediction Failed", {
        description: error instanceof Error ? error.message : "Unable to generate predictions. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Layout>
      <div className="p-5 pb-20">
        <h1 className="text-2xl font-bold mb-5">AI Yield Predictor</h1>

        {!predictionData ? (
          <Card className="mb-5">
            <CardHeader>
              <CardTitle className="text-lg">Enter Your Farm Details</CardTitle>
              <CardDescription>
                Our AI will analyze your data and predict your crop yield using Gemini 2.5 Flash
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cropType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Crop Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select crop type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Maize">Maize</SelectItem>
                              <SelectItem value="Tomatoes">Tomatoes</SelectItem>
                              <SelectItem value="Cassava">Cassava</SelectItem>
                              <SelectItem value="Rice">Rice</SelectItem>
                              <SelectItem value="Beans">Beans</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="farmSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Size (hectares)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="e.g., 5.5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="soilType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Soil Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select soil type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Clay">Clay</SelectItem>
                              <SelectItem value="Sandy">Sandy</SelectItem>
                              <SelectItem value="Loam">Loam</SelectItem>
                              <SelectItem value="Clay Loam">Clay Loam</SelectItem>
                              <SelectItem value="Sandy Loam">Sandy Loam</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="plantingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Planting Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expectedRainfall"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Rainfall</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select expected rainfall" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low (Below Average)</SelectItem>
                              <SelectItem value="moderate">Moderate (Average)</SelectItem>
                              <SelectItem value="high">High (Above Average)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fertilizerUse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fertilizer Use</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select fertilizer type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="organic">Organic Only</SelectItem>
                              <SelectItem value="synthetic">Synthetic Only</SelectItem>
                              <SelectItem value="hybrid">Hybrid Approach</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="previousYield"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Yield (tons) - Optional</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 25.5"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            If you've grown this crop before
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Your Farm with AI...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Predict My Crop Yield
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">AI Yield Prediction Results</CardTitle>
                    <CardDescription>Real AI analysis powered by Gemini 2.5 Flash</CardDescription>
                  </div>
                  <Badge className="bg-green-700">
                    {Math.round(predictionData.confidenceScore)}% Confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Predicted Yield</div>
                    <div className="text-2xl font-bold">
                      {Math.round(predictionData.predictedYieldKgPerHa).toLocaleString()} kg/ha
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Estimated Revenue</div>
                    <div className="text-2xl font-bold">
                      ${Math.round(predictionData.economicImpact.estimatedRevenue).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-500">Harvest Date</div>
                    <div className="flex items-center text-sm font-medium">
                      <Calendar className="h-4 w-4 mr-1 text-green-700" />
                      {new Date(predictionData.harvestDateEstimate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Key Factors */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Key Impact Factors</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-2 rounded text-center">
                      <div className="text-xs text-gray-500">Weather</div>
                      <div className="font-medium">{predictionData.keyFactors.weatherImpact}</div>
                    </div>
                    <div className="bg-white p-2 rounded text-center">
                      <div className="text-xs text-gray-500">Soil</div>
                      <div className="font-medium">{predictionData.keyFactors.soilImpact}</div>
                    </div>
                    <div className="bg-white p-2 rounded text-center">
                      <div className="text-xs text-gray-500">Management</div>
                      <div className="font-medium">{predictionData.keyFactors.managementImpact}</div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">AI Recommendations</h4>
                  <div className="space-y-2">
                    {predictionData.recommendations.map((rec, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg text-sm">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Factors */}
                {predictionData.riskFactors.length > 0 && (
                  <div className="mb-4">
                    <div className="font-medium text-gray-700 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                      Risk Factors
                    </div>
                    <div className="space-y-2">
                      {predictionData.riskFactors.map((risk, index) => (
                        <div key={index} className="bg-amber-50 p-3 rounded-lg text-sm">
                          {risk}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setPredictionData(null)}
                >
                  Start New Prediction
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default YieldPredictor;