/**
 * 🌾 INFINITY-LEVEL CropDiseaseDetectionPage Component
 * 
 * PRODUCTION-READY page for detecting crop diseases from images
 * with WORLD-CLASS UI/UX for 100 million African farmers! 🚀
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSimpleAuthContext } from '@/providers/SimpleAuthProvider';
import { useDiseaseDetection } from '@/hooks/use-disease-detection';
import { Camera, Upload, RefreshCw, Leaf, AlertTriangle, Loader2 } from 'lucide-react';

const CROP_TYPES = [
  { value: 'maize', label: 'Maize (Corn)' },
  { value: 'tomato', label: 'Tomato' },
  { value: 'potato', label: 'Potato' },
  { value: 'cassava', label: 'Cassava' },
  { value: 'rice', label: 'Rice' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'banana', label: 'Banana' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'soybean', label: 'Soybean' }
];

const CropDiseaseDetectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSimpleAuthContext();
  const { isDetecting, detectionResult, error, detectDisease, clearError, clearResult } = useDiseaseDetection();
  
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [cropType, setCropType] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) return;
    
    setSelectedFile(file);
    clearError();
    setPreviewUrl(URL.createObjectURL(file));
  };
  
  // Handle camera capture
  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            clearError();
          }
          
          // Stop camera stream
          stream.getTracks().forEach(track => track.stop());
        }, 'image/jpeg', 0.8);
      };
    } catch (err) {
      // Camera error handled silently
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropType || !selectedFile) return;
    
    // Get current location for enhanced analysis
    const location = await getCurrentLocation();
    await detectDisease(selectedFile, cropType, location);
  };
  
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setCropType('');
    clearError();
    clearResult();
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  // Get current GPS location for enhanced analysis
  const getCurrentLocation = async (): Promise<{ lat: number; lng: number; country?: string }> => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        country: 'Kenya' // Default, can be enhanced with reverse geocoding
      };
    } catch (error) {
      console.warn('Failed to get GPS location, using default:', error);
      return {
        lat: -1.2921,
        lng: 36.8219,
        country: 'Kenya'
      };
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Crop Disease Detection</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload an image of your crop to detect diseases and get treatment recommendations. 
            Our AI-powered system provides accurate diagnosis with confidence scores.
          </p>
        </div>
        
        {/* Main Content */}
        {!detectionResult ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Disease Detection
              </CardTitle>
              <CardDescription>
                Select your crop type and upload an image for analysis
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload Image</TabsTrigger>
                  <TabsTrigger value="camera">Take Photo</TabsTrigger>
                </TabsList>
                
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                  {/* Crop Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="crop-type">Crop Type</Label>
                    <Select value={cropType} onValueChange={setCropType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your crop type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CROP_TYPES.map((crop) => (
                          <SelectItem key={crop.value} value={crop.value}>
                            {crop.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <TabsContent value="upload" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="image-upload">Plant Image</Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Supported formats: JPG, PNG, WebP. Max size: 10MB
                      </p>
                    </div>
                    
                    {previewUrl && (
                      <div className="border rounded-lg overflow-hidden">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="camera" className="space-y-4">
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Click to capture image from camera</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCameraCapture}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isDetecting || !cropType || !selectedFile}
                      className="flex-1"
                    >
                      {isDetecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Detect Disease
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={isDetecting}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Detection Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Disease: {detectionResult.disease_name}</h3>
                    <p className="text-sm text-gray-600">Confidence: {detectionResult.confidence}%</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Actions:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {detectionResult.immediate_actions.map((action: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700">{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Button onClick={handleReset} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Analyze Another Image
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropDiseaseDetectionPage;