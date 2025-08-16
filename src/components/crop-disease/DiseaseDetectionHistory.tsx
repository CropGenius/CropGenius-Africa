/**
 * 🌾 INFINITY-LEVEL DiseaseDetectionHistory Component
 * 
 * PRODUCTION-READY component for displaying crop disease detection history
 * with WORLD-CLASS UI/UX for 100 million African farmers! 🚀
 * 
 * Features:
 * - Real-time Supabase integration
 * - Advanced filtering and sorting
 * - Export functionality
 * - Mobile-optimized design
 * - Accessibility compliant
 * - Offline-first caching
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  Calendar, 
  Download, 
  Eye, 
  Filter, 
  Leaf, 
  MapPin, 
  RefreshCw, 
  Search, 
  Trash2,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useDiseaseDetection, DetectionHistoryItem } from '@/hooks/use-disease-detection';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DiseaseDetectionResult } from './DiseaseDetectionResult';

type SortOption = 'newest' | 'oldest' | 'confidence' | 'severity';
type FilterOption = 'all' | 'pending' | 'confirmed' | 'treated';

/**
 * INFINITY-LEVEL Disease Detection History Component
 */
export default function DiseaseDetectionHistory() {
  const { 
    detectionHistory, 
    isDetecting, 
    error, 
    deleteDetection, 
    exportDetectionHistory,
    refreshHistory 
  } = useDiseaseDetection();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedDetection, setSelectedDetection] = useState<DetectionHistoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Using sonner toast directly

  // Filter and sort history
  const filteredAndSortedHistory = useMemo(() => {
    let filtered = detectionHistory;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.disease_name.toLowerCase().includes(query) ||
        item.crop_type.toLowerCase().includes(query) ||
        item.field_name?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(item => item.status === filterBy);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'confidence':
          return b.confidence - a.confidence;
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (severityOrder[b.result_data.severity] || 0) - (severityOrder[a.result_data.severity] || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [detectionHistory, searchQuery, sortBy, filterBy]);

  // Handle delete detection
  const handleDeleteDetection = async (id: string) => {
    setIsDeleting(id);
    try {
      const result = await deleteDetection(id);
      if (result.success) {
        toast({
          title: "Detection Deleted",
          description: "Detection record has been removed from your history",
        });
      } else {
        throw new Error(result.error || 'Failed to delete detection');
      }
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: err instanceof Error ? err.message : 'Unable to delete detection',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Handle export history
  const handleExportHistory = async () => {
    setIsExporting(true);
    try {
      const result = await exportDetectionHistory();
      if (result.success) {
        toast({
          title: "Export Successful",
          description: "Your detection history has been downloaded as CSV",
        });
      } else {
        throw new Error(result.error || 'Failed to export history');
      }
    } catch (err) {
      toast({
        title: "Export Failed",
        description: err instanceof Error ? err.message : 'Unable to export history',
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refreshHistory();
      toast({
        title: "History Refreshed",
        description: "Detection history has been updated",
      });
    } catch (err) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh history",
        variant: "destructive",
      });
    }
  };

  // Get status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Confirmed' };
      case 'treated':
        return { icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Treated' };
      case 'pending':
      default:
        return { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Pending' };
    }
  };

  // Get severity configuration
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { color: 'text-red-600', bgColor: 'bg-red-100', label: 'Critical' };
      case 'high':
        return { color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'High' };
      case 'medium':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Medium' };
      case 'low':
      default:
        return { color: 'text-green-600', bgColor: 'bg-green-100', label: 'Low' };
    }
  };

  // Render loading state
  if (isDetecting && detectionHistory.length === 0) {
    return (
      <div className="space-y-6" data-testid="loading-spinner">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="space-y-4">
          {Array(5).fill(0).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading detection history</AlertTitle>
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" className="ml-2" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Render empty state
  if (detectionHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Leaf className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">No detection history found</h2>
        <p className="text-muted-foreground mb-6">Upload an image to detect crop diseases and build your history</p>
        <Button onClick={() => window.location.href = '/crop-disease-detection'}>
          <Leaf className="h-4 w-4 mr-2" />
          Start Detection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" role="heading" aria-level="1">Disease Detection History</h1>
          <p className="text-muted-foreground">
            Track your crop disease detections and treatment progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isDetecting}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isDetecting ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportHistory} 
            disabled={isExporting || detectionHistory.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search diseases, crops..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search detection history"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger aria-label="Sort by">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="confidence">Highest Confidence</SelectItem>
                <SelectItem value="severity">Highest Severity</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
              <SelectTrigger aria-label="Filter by status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="treated">Treated</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              {filteredAndSortedHistory.length} of {detectionHistory.length} records
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <div className="space-y-4">
        {filteredAndSortedHistory.map((detection) => {
          const statusConfig = getStatusConfig(detection.status);
          const severityConfig = getSeverityConfig(detection.result_data.severity);
          const StatusIcon = statusConfig.icon;

          return (
            <Card key={detection.id} className="hover:shadow-md transition-shadow" data-testid="detection-item">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Disease Image or Icon */}
                    <div className="flex-shrink-0">
                      {detection.image_url ? (
                        <img
                          src={detection.image_url}
                          alt={`${detection.disease_name} detection`}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                          <Leaf className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Detection Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{detection.disease_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              <Leaf className="h-3 w-3 mr-1" />
                              {detection.crop_type}
                            </Badge>
                            <Badge className={`${severityConfig.bgColor} ${severityConfig.color}`}>
                              {severityConfig.label} Severity
                            </Badge>
                            <Badge variant="secondary">
                              {detection.confidence}% Confidence
                            </Badge>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusConfig.bgColor}`}>
                          <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
                          <span className={`text-xs font-medium ${statusConfig.color}`} data-status={detection.status}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1" data-testid="detection-date">
                          <Calendar className="h-3 w-3" />
                          {new Date(detection.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {detection.field_name && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {detection.field_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Detection Details</DialogTitle>
                          <DialogDescription>
                            Complete analysis for {detection.disease_name} detected on {new Date(detection.created_at).toLocaleDateString()}
                          </DialogDescription>
                        </DialogHeader>
                        <DiseaseDetectionResult
                          result={detection.result_data}
                          showImage={true}
                          imageUrl={detection.image_url}
                        />
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={isDeleting === detection.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Detection Record</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this detection record? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleDeleteDetection(detection.id)}
                            disabled={isDeleting === detection.id}
                          >
                            {isDeleting === detection.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredAndSortedHistory.length === 0 && detectionHistory.length > 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No matching records found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery('');
              setFilterBy('all');
              setSortBy('newest');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}