/**
 * 🔥💪 DISEASE DETECTION PAGE - INFINITY GOD MODE ACTIVATED!
 * Complete disease detection system with REAL AI and REAL security
 * Built for 100 million African farmers - NO FRAUD, ONLY VALUE!
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Microscope,
    History,
    BarChart3,
    Settings,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    Download,
    RefreshCw,
    Filter,
    Search,
    Eye,
    Trash2,
    Edit,
    Share2,
    Plus,
    Camera,
    Upload,
    Zap
} from 'lucide-react';

// 🚀 PRODUCTION-READY COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

// 🔥 DISEASE DETECTION COMPONENTS
import DiseaseDetectionCamera from '@/components/disease/DiseaseDetectionCamera';
import DiseaseDetectionResults from '@/components/disease/DiseaseDetectionResults';

// 🚀 INFINITY IQ HOOKS AND SERVICES
import { useDiseaseDetection } from '@/hooks/useDiseaseDetection';
import { useAuthContext } from '@/providers/AuthProvider';
import { useErrorHandler } from '@/utils/errorHandling';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { PageErrorBoundary, WidgetErrorBoundary } from '@/components/error/EnhancedErrorBoundary';
import { OfflineWrapper } from '@/components/offline/OfflineWrapper';

/**
 * 🔥 INFINITY GOD MODE DISEASE DETECTION PAGE
 * Complete disease detection system with military-grade security
 */
const DiseaseDetection: React.FC = () => {
    const { user } = useAuthContext();
    const { handleError } = useErrorHandler();
    const { isOnline } = useOfflineStatus();

    // 🚀 DISEASE DETECTION HOOK
    const {
        isDetecting,
        detectionResult,
        detectionHistory,
        detectionStats,
        error,
        detectDisease,
        saveToHistory,
        loadHistory,
        deleteDetection,
        updateDetectionStatus,
        exportHistory,
        clearError,
        clearResult,
        refreshData
    } = useDiseaseDetection();

    // 🔥 STATE MANAGEMENT
    const [activeTab, setActiveTab] = useState('detect');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [cropFilter, setCropFilter] = useState<string>('all');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [selectedDetection, setSelectedDetection] = useState<string | null>(null);

    // 🚀 LOAD DATA ON MOUNT
    useEffect(() => {
        if (user) {
            refreshData();
        }
    }, [user, refreshData]);

    // 🔥 FILTER DETECTION HISTORY
    const filteredHistory = detectionHistory.filter(detection => {
        const matchesSearch = searchQuery === '' ||
            detection.disease_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            detection.crop_type.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || detection.status === statusFilter;
        const matchesCrop = cropFilter === 'all' || detection.crop_type === cropFilter;

        return matchesSearch && matchesStatus && matchesCrop;
    });

    // 🚀 GET UNIQUE CROP TYPES
    const uniqueCrops = Array.from(new Set(detectionHistory.map(d => d.crop_type)));

    // 🔥 HANDLE DETECTION COMPLETE
    const handleDetectionComplete = async (result: any) => {
        try {
            // Auto-save to history
            const saveResult = await saveToHistory(result);
            if (saveResult.success) {
                setActiveTab('results');
            }
        } catch (error) {
            handleError(error as Error, {
                component: 'DiseaseDetection',
                operation: 'handleDetectionComplete'
            });
        }
    };

    // 🚀 HANDLE DELETE DETECTION
    const handleDeleteDetection = async (id: string) => {
        try {
            const result = await deleteDetection(id);
            if (result.success) {
                setShowDeleteConfirm(null);
                toast.success('Detection deleted successfully');
            } else {
                toast.error(result.error || 'Failed to delete detection');
            }
        } catch (error) {
            handleError(error as Error, {
                component: 'DiseaseDetection',
                operation: 'handleDeleteDetection',
                detectionId: id
            });
        }
    };

    // 🔥 HANDLE STATUS UPDATE
    const handleStatusUpdate = async (id: string, status: 'pending' | 'confirmed' | 'treated') => {
        try {
            const result = await updateDetectionStatus(id, status);
            if (!result.success) {
                toast.error(result.error || 'Failed to update status');
            }
        } catch (error) {
            handleError(error as Error, {
                component: 'DiseaseDetection',
                operation: 'handleStatusUpdate',
                detectionId: id,
                status
            });
        }
    };

    // 🚀 HANDLE EXPORT
    const handleExport = async (format: 'csv' | 'json') => {
        try {
            const result = await exportHistory(format);
            if (!result.success) {
                toast.error(result.error || 'Export failed');
            }
        } catch (error) {
            handleError(error as Error, {
                component: 'DiseaseDetection',
                operation: 'handleExport',
                format
            });
        }
    };

    // 🔥 GET STATUS COLOR
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'treated': return 'text-green-600 bg-green-50 border-green-200';
            case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    // 🚀 FORMAT DATE
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <PageErrorBoundary errorBoundaryId="disease-detection-page">
            <div className="container py-6 space-y-6">

                {/* 🔥 HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <Microscope className="h-6 w-6 text-white" />
                            </div>
                            Disease Detection
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            AI-powered crop disease detection and management
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 mt-4 md:mt-0">
                        <Button
                            onClick={() => refreshData()}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                        <Button
                            onClick={() => handleExport('csv')}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* 🚀 STATISTICS CARDS */}
                {detectionStats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-2">
                                    <Microscope className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Detections</p>
                                        <p className="text-2xl font-bold">{detectionStats.total_detections}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                        <p className="text-2xl font-bold">{detectionStats.pending_detections}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Treated</p>
                                        <p className="text-2xl font-bold">{detectionStats.treated_detections}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                                        <p className="text-2xl font-bold">{detectionStats.avg_confidence}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 🔥 ERROR DISPLAY */}
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error}
                            <Button
                                onClick={clearError}
                                variant="outline"
                                size="sm"
                                className="mt-2"
                            >
                                Dismiss
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* 🚀 MAIN CONTENT TABS */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="detect" className="gap-2">
                            <Camera className="h-4 w-4" />
                            Detect Disease
                        </TabsTrigger>
                        <TabsTrigger value="results" className="gap-2">
                            <Eye className="h-4 w-4" />
                            Results
                        </TabsTrigger>
                        <TabsTrigger value="history" className="gap-2">
                            <History className="h-4 w-4" />
                            History
                        </TabsTrigger>
                    </TabsList>

                    {/* 🔥 DETECT TAB */}
                    <TabsContent value="detect" className="mt-6">
                        <OfflineWrapper
                            fallback={
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Offline Mode</AlertTitle>
                                    <AlertDescription>
                                        Disease detection requires an internet connection. Please connect to continue.
                                    </AlertDescription>
                                </Alert>
                            }
                        >
                            <WidgetErrorBoundary errorBoundaryId="disease-detection-camera">
                                <DiseaseDetectionCamera
                                    onDetectionComplete={handleDetectionComplete}
                                    onError={(error) => toast.error('Detection Error', { description: error })}
                                />
                            </WidgetErrorBoundary>
                        </OfflineWrapper>
                    </TabsContent>

                    {/* 🚀 RESULTS TAB */}
                    <TabsContent value="results" className="mt-6">
                        {detectionResult ? (
                            <WidgetErrorBoundary errorBoundaryId="disease-detection-results">
                                <DiseaseDetectionResults
                                    result={detectionResult}
                                    onSaveToHistory={() => saveToHistory(detectionResult)}
                                    onShareResult={() => toast.info('Share feature coming soon!')}
                                    onViewDetails={() => toast.info('Detailed view coming soon!')}
                                />
                            </WidgetErrorBoundary>
                        ) : (
                            <Card>
                                <CardContent className="pt-12 pb-12 text-center">
                                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Microscope className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium mb-2">No Detection Results</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Run a disease detection to see results here
                                    </p>
                                    <Button
                                        onClick={() => setActiveTab('detect')}
                                        className="gap-2"
                                    >
                                        <Camera className="h-4 w-4" />
                                        Start Detection
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* 🔥 HISTORY TAB */}
                    <TabsContent value="history" className="mt-6 space-y-4">

                        {/* Filters */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search diseases or crops..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>

                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full md:w-[180px]">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="treated">Treated</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={cropFilter} onValueChange={setCropFilter}>
                                        <SelectTrigger className="w-full md:w-[180px]">
                                            <SelectValue placeholder="Filter by crop" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Crops</SelectItem>
                                            {uniqueCrops.map(crop => (
                                                <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* History List */}
                        {filteredHistory.length === 0 ? (
                            <Card>
                                <CardContent className="pt-12 pb-12 text-center">
                                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <History className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium mb-2">No Detection History</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {searchQuery || statusFilter !== 'all' || cropFilter !== 'all'
                                            ? 'No detections match your current filters'
                                            : 'Start detecting diseases to build your history'}
                                    </p>
                                    <Button
                                        onClick={() => setActiveTab('detect')}
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Start First Detection
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {filteredHistory.map((detection) => (
                                    <Card key={detection.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="text-lg font-semibold">{detection.disease_name}</h3>
                                                        <Badge className={getStatusColor(detection.status)} variant="outline">
                                                            {detection.status.toUpperCase()}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {detection.confidence}% confidence
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                        <span>{detection.crop_type}</span>
                                                        <span>•</span>
                                                        <span>{formatDate(detection.created_at)}</span>
                                                        <span>•</span>
                                                        <span>{detection.severity} severity</span>
                                                    </div>

                                                    {detection.scientific_name && (
                                                        <p className="text-sm italic text-muted-foreground">
                                                            {detection.scientific_name}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Select
                                                        value={detection.status}
                                                        onValueChange={(value) => handleStatusUpdate(detection.id, value as any)}
                                                    >
                                                        <SelectTrigger className="w-[120px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                                            <SelectItem value="treated">Treated</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setSelectedDetection(detection.id)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setShowDeleteConfirm(detection.id)}
                                                        className="text-red-500 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* 🚀 DELETE CONFIRMATION DIALOG */}
                <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Detection</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this detection record? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => showDeleteConfirm && handleDeleteDetection(showDeleteConfirm)}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </PageErrorBoundary>
    );
};

export default DiseaseDetection;