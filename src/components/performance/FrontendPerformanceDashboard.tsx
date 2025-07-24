/**
 * 🚀💪 INFINITY GOD MODE FRONTEND PERFORMANCE DASHBOARD
 * -------------------------------------------------------------
 * PRODUCTION-READY performance monitoring dashboard
 * Built for 100 million African farmers with military-grade precision!
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  Clock,
  Memory,
  Gauge,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Download,
  Play,
  Pause,
  RotateCcw,
  Monitor,
  Smartphone,
  Wifi,
  HardDrive,
  Cpu,
  Eye,
  MousePointer,
  Layers
} from 'lucide-react';

// 🚀 PRODUCTION-READY COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// 🔥 HOOKS AND SERVICES
import { useFrontendPerformance } from '@/hooks/useFrontendPerformance';
import { PageErrorBoundary } from '@/components/error/EnhancedErrorBoundary';

/**
 * 🔥 INFINITY GOD MODE FRONTEND PERFORMANCE DASHBOARD
 */
export const FrontendPerformanceDashboard: React.FC = () => {
  const {
    metrics,
    isLoading,
    error,
    summary,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearData,
    refreshMetrics,
    exportMetrics
  } = useFrontendPerformance();

  const [activeTab, setActiveTab] = useState('overview');

  // 🚀 GET PERFORMANCE SCORE COLOR
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // 🔥 GET CORE WEB VITALS STATUS
  const getCoreWebVitalsStatus = (metric: string, value: number) => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      tti: { good: 3800, poor: 7300 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  // 🚀 FORMAT BYTES
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 🔥 FORMAT TIME
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Performance Monitoring Error</AlertTitle>
        <AlertDescription>
          {error.message}
          <Button onClick={refreshMetrics} variant="outline" size="sm" className="mt-2">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <PageErrorBoundary errorBoundaryId="frontend-performance-dashboard">
      <div className="space-y-6">
        
        {/* 🔥 HEADER */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Frontend Performance</CardTitle>
                  <CardDescription>
                    Real-time React performance monitoring and optimization
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={isMonitoring ? stopMonitoring : startMonitoring}
                  variant={isMonitoring ? "destructive" : "default"}
                  size="sm"
                  className="gap-2"
                >
                  {isMonitoring ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Stop Monitoring
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Monitoring
                    </>
                  )}
                </Button>
                
                <Button onClick={clearData} variant="outline" size="sm" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Clear Data
                </Button>
                
                <Button onClick={exportMetrics} variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 🚀 PERFORMANCE SCORE OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Performance Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(summary.score).split(' ')[0]}`}>
                    {summary.score}
                  </p>
                  <p className="text-xs text-muted-foreground">out of 100</p>
                </div>
                <Gauge className={`h-8 w-8 ${getScoreColor(summary.score).split(' ')[0]}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Issues Found</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {summary.issues.length}
                  </p>
                  <p className="text-xs text-muted-foreground">performance issues</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Render Time</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {metrics?.averageRenderTime.toFixed(1) || '0'}
                  </p>
                  <p className="text-xs text-muted-foreground">milliseconds</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Memory Usage</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {metrics ? formatBytes(metrics.memoryUsage.usedJSHeapSize) : '0 B'}
                  </p>
                  <p className="text-xs text-muted-foreground">JS heap size</p>
                </div>
                <Memory className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🔥 PERFORMANCE ISSUES ALERT */}
        {summary.issues.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Performance Issues Detected</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {summary.issues.slice(0, 3).map((issue, index) => (
                  <li key={index} className="text-sm">{issue}</li>
                ))}
                {summary.issues.length > 3 && (
                  <li className="text-sm">...and {summary.issues.length - 3} more issues</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* 🚀 DETAILED METRICS TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
          </TabsList>

          {/* 🔥 OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-300 rounded w-1/2" />
                        <div className="h-8 bg-gray-300 rounded w-1/3" />
                        <div className="h-3 bg-gray-300 rounded w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bundle Size */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HardDrive className="h-5 w-5 text-blue-600" />
                      Bundle Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Size</span>
                        <Badge variant="outline">
                          {metrics ? formatBytes(metrics.bundleSize.totalSize) : '0 B'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">JavaScript</span>
                        <Badge variant="outline">
                          {metrics ? formatBytes(metrics.bundleSize.jsSize) : '0 B'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">CSS</span>
                        <Badge variant="outline">
                          {metrics ? formatBytes(metrics.bundleSize.cssSize) : '0 B'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Images</span>
                        <Badge variant="outline">
                          {metrics ? formatBytes(metrics.bundleSize.imageSize) : '0 B'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Experience */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MousePointer className="h-5 w-5 text-green-600" />
                      User Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Interaction Latency</span>
                        <Badge variant="outline">
                          {metrics?.userInteractionLatency.length ? 
                            `${(metrics.userInteractionLatency.reduce((sum, i) => sum + i.latency, 0) / metrics.userInteractionLatency.length).toFixed(1)}ms` : 
                            '0ms'
                          }
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Scroll Performance</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {metrics?.scrollPerformance.smoothScrollPercentage.toFixed(1) || '100'}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Network Latency</span>
                        <Badge variant="outline">
                          {metrics ? formatTime(metrics.networkLatency) : '0ms'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Offline Capable</span>
                        <Badge variant="outline" className={
                          metrics?.offlineCapability ? 
                            'bg-green-50 text-green-700 border-green-200' : 
                            'bg-red-50 text-red-700 border-red-200'
                        }>
                          {metrics?.offlineCapability ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recommendations */}
            {summary.recommendations.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Performance Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {summary.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 🚀 CORE WEB VITALS TAB */}
          <TabsContent value="vitals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics && [
                { name: 'Largest Contentful Paint', key: 'lcp', value: metrics.largestContentfulPaint, unit: 'ms' },
                { name: 'First Input Delay', key: 'fid', value: metrics.firstInputDelay, unit: 'ms' },
                { name: 'Cumulative Layout Shift', key: 'cls', value: metrics.cumulativeLayoutShift, unit: '' },
                { name: 'First Contentful Paint', key: 'fcp', value: metrics.firstContentfulPaint, unit: 'ms' },
                { name: 'Time to Interactive', key: 'tti', value: metrics.timeToInteractive, unit: 'ms' }
              ].map((vital) => {
                const status = getCoreWebVitalsStatus(vital.key, vital.value);
                const statusColor = status === 'good' ? 'text-green-600 bg-green-50 border-green-200' :
                                  status === 'needs-improvement' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                                  'text-red-600 bg-red-50 border-red-200';

                return (
                  <Card key={vital.key}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{vital.name}</h4>
                          <Badge variant="outline" className={statusColor}>
                            {status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold">
                          {vital.value.toFixed(vital.key === 'cls' ? 3 : 0)}{vital.unit}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* 🔥 COMPONENTS TAB */}
          <TabsContent value="components" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Component Performance</CardTitle>
                <CardDescription>
                  Render times and performance metrics for React components
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics?.slowestComponents.length ? (
                  <div className="space-y-3">
                    {metrics.slowestComponents.map((component, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Layers className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm">{component.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {component.renderCount} renders
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={
                            component.averageRenderTime > 16 ? 'bg-red-50 text-red-700 border-red-200' :
                            component.averageRenderTime > 8 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-green-50 text-green-700 border-green-200'
                          }>
                            {component.averageRenderTime.toFixed(1)}ms
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Component Data</h3>
                    <p className="text-muted-foreground">
                      Component performance data will appear here once monitoring is active
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 🚀 RESOURCES TAB */}
          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Resource Loading</CardTitle>
                <CardDescription>
                  Analysis of resource loading performance and optimization opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics?.resourceLoadTimes.length ? (
                  <div className="space-y-3">
                    {metrics.resourceLoadTimes
                      .sort((a, b) => b.loadTime - a.loadTime)
                      .slice(0, 10)
                      .map((resource, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full bg-blue-600" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">
                                {resource.name.split('/').pop() || resource.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {resource.type} • {formatBytes(resource.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {resource.cached && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                Cached
                              </Badge>
                            )}
                            <Badge variant="outline" className={
                              resource.loadTime > 1000 ? 'bg-red-50 text-red-700 border-red-200' :
                              resource.loadTime > 500 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-green-50 text-green-700 border-green-200'
                            }>
                              {formatTime(resource.loadTime)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HardDrive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Resource Data</h3>
                    <p className="text-muted-foreground">
                      Resource loading data will appear here once monitoring is active
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 🔥 MEMORY TAB */}
          <TabsContent value="memory" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Memory className="h-5 w-5 text-purple-600" />
                    Memory Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics?.memoryUsage ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Used JS Heap</span>
                          <span>{formatBytes(metrics.memoryUsage.usedJSHeapSize)}</span>
                        </div>
                        <Progress 
                          value={(metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.jsHeapSizeLimit) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total JS Heap</span>
                          <span>{formatBytes(metrics.memoryUsage.totalJSHeapSize)}</span>
                        </div>
                        <Progress 
                          value={(metrics.memoryUsage.totalJSHeapSize / metrics.memoryUsage.jsHeapSizeLimit) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-medium">Heap Limit</span>
                        <Badge variant="outline">
                          {formatBytes(metrics.memoryUsage.jsHeapSizeLimit)}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Memory data not available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Memory Leaks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics?.memoryUsage.memoryLeaks.length ? (
                    <div className="space-y-3">
                      {metrics.memoryUsage.memoryLeaks.map((leak, index) => (
                        <div key={index} className="p-3 border rounded-lg bg-red-50 border-red-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm text-red-800">{leak.component}</p>
                              <p className="text-xs text-red-600">
                                {formatBytes(leak.size)} • {leak.detected.toLocaleTimeString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                              {leak.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-green-700">No memory leaks detected</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageErrorBoundary>
  );
};