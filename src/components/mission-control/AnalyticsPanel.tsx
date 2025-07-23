/**
 * 🔥💪 ANALYTICS PANEL - INFINITY GOD MODE ACTIVATED!
 * REAL analytics with REAL-TIME charts and insights
 * Built for 100 million African farmers with military-grade analytics!
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Activity,
  Globe,
  MessageSquare,
  Scan,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

// 🚀 PRODUCTION-READY COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// 🔥 MISSION CONTROL TYPES
import { SystemAnalytics } from '@/services/missionControlApi';

interface AnalyticsPanelProps {
  analytics: SystemAnalytics | null;
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => Promise<void>;
  userGrowthData: any[];
  featureUsageData: any[];
  period: 'day' | 'week' | 'month' | 'year';
  setPeriod: (period: 'day' | 'week' | 'month' | 'year') => void;
}

/**
 * 🔥 INFINITY GOD MODE ANALYTICS PANEL
 * Real-time analytics with military-grade insights
 */
export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  analytics,
  isLoading,
  error,
  onRefresh,
  userGrowthData,
  featureUsageData,
  period,
  setPeriod
}) => {
  // 🚀 STATE MANAGEMENT
  const [activeMetric, setActiveMetric] = useState('users');

  // 🔥 FORMAT NUMBER
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // 🚀 GET TREND COLOR
  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // 🔥 GET TREND ICON
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4" />;
    if (value < 0) return <TrendingDown className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  // 🚀 ERROR STATE
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error loading analytics</AlertTitle>
        <AlertDescription>
          {error.message}
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🚀 ANALYTICS HEADER */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">System Analytics</CardTitle>
              <CardDescription>
                Real-time insights into CropGenius platform performance
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[120px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={onRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 🔥 KEY METRICS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {formatNumber(analytics?.user_metrics?.total_users || 0)}
                </div>
                <div className={`flex items-center text-sm ${getTrendColor(analytics?.user_metrics?.growth_rate || 0)}`}>
                  {getTrendIcon(analytics?.user_metrics?.growth_rate || 0)}
                  <span className="ml-1">
                    {analytics?.user_metrics?.growth_rate?.toFixed(1) || 0}% growth
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {formatNumber(analytics?.user_metrics?.active_users || 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {analytics?.user_metrics?.user_retention?.toFixed(1) || 0}% retention
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disease Scans */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Disease Scans</CardTitle>
              <Scan className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {formatNumber(analytics?.feature_usage?.disease_detection?.total_scans || 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {analytics?.feature_usage?.disease_detection?.daily_average?.toFixed(1) || 0}/day avg
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Conversations */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">AI Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {formatNumber(analytics?.feature_usage?.ai_assistant?.total_conversations || 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {analytics?.feature_usage?.ai_assistant?.average_conversation_length?.toFixed(1) || 0} msgs/conv
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 🚀 DETAILED ANALYTICS TABS */}
      <Tabs value={activeMetric} onValueChange={setActiveMetric} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* User Analytics Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>New Users Today</span>
                      <Badge variant="outline">
                        +{analytics?.user_metrics?.new_users_today || 0}
                      </Badge>
                    </div>
                    {/* Simple chart representation */}
                    <div className="space-y-2">
                      {userGrowthData.slice(-7).map((data, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-16 text-xs text-muted-foreground">
                            {data.period}
                          </div>
                          <div className="flex-1">
                            <Progress 
                              value={(data.new_users / Math.max(...userGrowthData.map(d => d.new_users))) * 100} 
                              className="h-2"
                            />
                          </div>
                          <div className="w-12 text-xs text-right">
                            {data.new_users}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Retention */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Retention</CardTitle>
                <CardDescription>User engagement and retention metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">30-day retention</span>
                        <span className="text-sm font-medium">
                          {analytics?.user_metrics?.user_retention?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <Progress 
                        value={analytics?.user_metrics?.user_retention || 0} 
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Active users</span>
                        <span className="text-sm font-medium">
                          {formatNumber(analytics?.user_metrics?.active_users || 0)}
                        </span>
                      </div>
                      <Progress 
                        value={(analytics?.user_metrics?.active_users || 0) / (analytics?.user_metrics?.total_users || 1) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Feature Usage Tab */}
        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Detected Diseases */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Detected Diseases</CardTitle>
                <CardDescription>Most commonly detected crop diseases</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analytics?.feature_usage?.disease_detection?.most_detected?.map((disease, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{disease.disease}</span>
                        <Badge variant="outline">{disease.count}</Badge>
                      </div>
                    )) || (
                      <p className="text-sm text-muted-foreground">No disease data available</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feature Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Feature Usage Trends</CardTitle>
                <CardDescription>Usage patterns across different features</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {featureUsageData.slice(-7).map((data, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>{data.period}</span>
                          <span>{data.disease_scans + data.ai_interactions + data.chat_messages} total</span>
                        </div>
                        <div className="flex space-x-1 h-2">
                          <div 
                            className="bg-orange-500 rounded-sm"
                            style={{ 
                              width: `${(data.disease_scans / (data.disease_scans + data.ai_interactions + data.chat_messages)) * 100}%` 
                            }}
                          />
                          <div 
                            className="bg-blue-500 rounded-sm"
                            style={{ 
                              width: `${(data.ai_interactions / (data.disease_scans + data.ai_interactions + data.chat_messages)) * 100}%` 
                            }}
                          />
                          <div 
                            className="bg-purple-500 rounded-sm"
                            style={{ 
                              width: `${(data.chat_messages / (data.disease_scans + data.ai_interactions + data.chat_messages)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-center space-x-4 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-sm mr-1" />
                        Disease Scans
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1" />
                        AI Interactions
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-sm mr-1" />
                        Chat Messages
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Distribution by Country</CardTitle>
              <CardDescription>Geographic distribution of CropGenius users</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics?.user_metrics?.countries?.map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{country.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={(country.count / (analytics?.user_metrics?.total_users || 1)) * 100} 
                          className="w-20 h-2"
                        />
                        <Badge variant="outline">{country.count}</Badge>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">No geographic data available</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Performance</CardTitle>
                <CardDescription>API response times and system health</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Average Response Time</span>
                        <span className="font-medium">
                          {analytics?.performance_metrics?.average_response_time || 0}ms
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((analytics?.performance_metrics?.average_response_time || 0) / 1000 * 100, 100)} 
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>P95 Response Time</span>
                        <span className="font-medium">
                          {analytics?.performance_metrics?.p95_response_time || 0}ms
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((analytics?.performance_metrics?.p95_response_time || 0) / 1000 * 100, 100)} 
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>P99 Response Time</span>
                        <span className="font-medium">
                          {analytics?.performance_metrics?.p99_response_time || 0}ms
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((analytics?.performance_metrics?.p99_response_time || 0) / 1000 * 100, 100)} 
                        className="h-2"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Error Metrics</CardTitle>
                <CardDescription>System errors and failure rates</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Error Rate</span>
                      <Badge 
                        variant="outline" 
                        className={(analytics?.error_metrics?.error_rate || 0) > 5 
                          ? 'text-red-600 bg-red-50 border-red-200' 
                          : 'text-green-600 bg-green-50 border-green-200'
                        }
                      >
                        {analytics?.error_metrics?.error_rate?.toFixed(2) || 0}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Top Errors</span>
                      {analytics?.error_metrics?.top_errors?.map((error, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="truncate flex-1 mr-2">{error.message}</span>
                          <Badge variant="outline" size="sm">{error.count}</Badge>
                        </div>
                      )) || (
                        <p className="text-xs text-muted-foreground">No error data available</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};