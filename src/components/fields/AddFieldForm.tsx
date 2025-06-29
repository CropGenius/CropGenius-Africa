import React, { useState, useEffect, lazy, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Field } from "@/types/field";
import { useErrorLogging } from '@/hooks/use-error-logging';
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { FieldFormProps } from "./types";
import { Database } from "@/types/supabase";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Lazy load to keep mapbox-gl out of initial chunks
const MapboxFieldMap = lazy(() => import("./MapboxFieldMap"));

const formSchema = z.object({
  name: z.string().min(2, "Field name must be at least 2 characters"),
  size: z.coerce.number().positive("Size must be a positive number").optional(),
  size_unit: z.string().default("hectares"),
  location_description: z.string().optional(),
  soil_type: z.string().optional(),
  irrigation_type: z.string().optional(),
  boundary: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddFieldForm({ 
  onSuccess, 
  onCancel, 
  defaultLocation,
  farms 
}: FieldFormProps) {
  const { logError, logSuccess, trackOperation } = useErrorLogging('AddFieldForm');
  const navigate = useNavigate();
  const { user, farmId } = useAuth();
  const [boundary, setBoundary] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldLocation, setFieldLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      size: undefined,
      size_unit: "hectares",
      location_description: "",
      soil_type: "",
      irrigation_type: "",
      boundary: undefined,
    },
  });

  useEffect(() => {
    form.setValue("boundary", boundary);
  }, [boundary, form]);

  const handleLocationChange = (location: { lat: number; lng: number }) => {
    setFieldLocation(location);
    if (!form.getValues("name")) {
      fetchLocationName(location.lng, location.lat);
    }
  };

  const fetchLocationName = trackOperation('fetchLocationName', async (lng: number, lat: number) => {
    try {
      console.log(`🔍 [AddFieldForm] Reverse geocoding location: ${lng}, ${lat}`);
      
      if (!MAPBOX_ACCESS_TOKEN) {
        console.error("❌ [AddFieldForm] Missing Mapbox access token for reverse geocoding");
        toast.error("Could not determine location name", { 
          description: "Mapbox access token is missing"
        });
        return;
      }
      
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=place,locality,neighborhood,address`);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const placeName = data.features[0].place_name?.split(',')[0] || 'Unknown location';
        setSearchedLocation(placeName);
        console.log(`✅ [AddFieldForm] Location name found: ${placeName}`);
        
        const suggestedName = `${placeName} Field`;
        if (!form.getValues("name")) {
          form.setValue("name", suggestedName);
        }
      }
    } catch (error) {
      logError(error as Error, { context: 'reverseGeocoding' });
      toast.error("Could not determine location name", { 
        description: "Check your internet connection"
      });
    }
  });

  const onSubmit = trackOperation('submitField', async (values: FormValues) => {
    try {
      console.log("📝 [AddFieldForm] Creating field with values:", values);
      
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      if (!farmId) {
        throw new Error("No farm selected");
      }
      
      if (!boundary) {
        toast.warning("Please draw your field boundary on the map");
        return;
      }
      
      setIsSubmitting(true);
      
      const fieldData: Database["public"]["Tables"]["fields"]["Insert"] = {
        name: values.name,
        size: values.size,
        size_unit: values.size_unit,
        location_description: values.location_description,
        soil_type: values.soil_type,
        irrigation_type: values.irrigation_type,
        boundary: boundary,
        user_id: user.id,
        farm_id: farmId
      };
      
      console.log("💾 [AddFieldForm] Inserting field data:", fieldData);
      
      const { data, error } = await supabase
        .from("fields")
        .insert(fieldData)
        .select()
        .single();
      
      if (error) {
        console.error("❌ [AddFieldForm] Error creating field:", error);
        throw error;
      }
      
      console.log("✅ [AddFieldForm] Field created successfully:", data);
      logSuccess('field_created', { field_id: data.id });
      
      toast.success("Field added successfully", {
        description: `${values.name} has been added to your farm`
      });
      
      if (onSuccess && data) {
        // Convert to Field type for compatibility with onSuccess callback
        const fieldResult: Field = {
          id: data.id,
          user_id: data.user_id,
          farm_id: data.farm_id || "",
          name: data.name,
          size: data.size || 0,
          size_unit: data.size_unit || "hectares",
          boundary: data.boundary,
          location_description: data.location_description || "",
          soil_type: data.soil_type || "",
          irrigation_type: data.irrigation_type || "",
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
          is_shared: data.is_shared || false,
          shared_with: data.shared_with || [],
          offline_id: data.id,
          is_synced: true
        };
        
        onSuccess(fieldResult);
      } else {
        navigate("/fields");
      }
    } catch (error: any) {
      console.error("❌ [AddFieldForm] Error creating field:", error);
      logError(error, { context: 'fieldCreation' });
      toast.error("Failed to add field", {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <ErrorBoundary>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 md:gap-8">
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary-50 dark:bg-primary-900/20 border-b">
                <h3 className="text-lg font-medium">Field Map</h3>
                <CardDescription>Search for your location and draw your field boundary</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[350px] md:h-[450px] w-full">
                  <Suspense fallback={<div>Loading map...</div>}>
                    <MapboxFieldMap 
                      onBoundaryChange={setBoundary}
                      onLocationChange={handleLocationChange}
                      defaultLocation={defaultLocation}
                    />
                  </Suspense>
                </div>
              </CardContent>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">
                  {searchedLocation ? (
                    <span>Location: <strong>{searchedLocation}</strong></span>
                  ) : (
                    "Search for your village or location above, then draw your field boundaries"
                  )}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Field Information</h3>
                <CardDescription>Basic details about your field</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. North Field" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Field size" 
                            {...field}
                            value={field.value === undefined ? '' : field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="size_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hectares">Hectares</SelectItem>
                            <SelectItem value="acres">Acres</SelectItem>
                            <SelectItem value="square_meters">Square Meters</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="location_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Description (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Near the river" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="soil_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Soil Type (optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select soil type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="clay">Clay</SelectItem>
                            <SelectItem value="sandy">Sandy</SelectItem>
                            <SelectItem value="loamy">Loamy</SelectItem>
                            <SelectItem value="silty">Silty</SelectItem>
                            <SelectItem value="peaty">Peaty</SelectItem>
                            <SelectItem value="chalky">Chalky</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="irrigation_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Irrigation Type (optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select irrigation type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="drip">Drip Irrigation</SelectItem>
                            <SelectItem value="sprinkler">Sprinkler System</SelectItem>
                            <SelectItem value="flood">Flood Irrigation</SelectItem>
                            <SelectItem value="center_pivot">Center Pivot</SelectItem>
                            <SelectItem value="rainfed">Rainfed (No Irrigation)</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <CardFooter className="px-0 pb-0 flex gap-3">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Adding Field..." : "Add Field"}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </CardFooter>
          </div>
        </form>
      </Form>
    </ErrorBoundary>
  );
}
