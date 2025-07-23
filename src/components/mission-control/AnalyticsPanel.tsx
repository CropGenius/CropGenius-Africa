/**
 * 🔥💪 ANALYTICS PANEL - INFINITY GOD MODE ACTIVATED!
 * REAL analytics with REAL Supabase integration
 * Built for 100 million African farmers with military-grade data visualization!
 */

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  RefreshCw, 
  AlertTriangle,
  Calendar,
  Scan,
  MessageSquare,
  CloudRain,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';

// 🚀 PRODUCTION-READY COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// 🔥 MISSION CONTROL TYPES
import { SystemAnalytics } from '@/services/missionControlApi';

// 🚀 CHART COMPONENTS
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from 'recharts';

interface AnalyticsPanelProps {
  analytics: SystemAnalytics | null;
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
  userGrowthData: any[];
  featureUsageData: any[];
  period: 'day' | 'week' | 'month' | 'year';
  setPeriod: (period: 'day' | 'week' | 'month' | 'year') => void;
}

/**
 * 🔥 INFINITY GOD MODE ANALYTICS PANEL
 * Real-time analytics with military-grade data visualization
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
  // 🚀 CHART COLORS
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // 🔥 FORMAT NUMBER
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: num > 1000 ? 'compact' : 'standard',
      maximumFractionDigits: 1
    }).format(num);
  };

  // 🚀 LOADING STATE
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </CardContent>
      </Card>
    );
  }

  // 🔥 ERROR STATE
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

  // 🚀 NO DATA STATE
  if (!analytics) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No analytics data available</p>
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🚀 ANALYTICS HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <Badge variant="outline" className="ml-2">
            Real-time
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
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
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* 🔥 USER GROWTH CHART */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Growth
          </CardTitle>
          <CardDescription>
            New user registrations and total user count over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={userGrowthData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total_users"
                  name="Total Users"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
                <Area
                  type="monotone"
                  dataKey="new_users"
                  name="New Users"
                  stroke="#82ca9d"
                  fillOpacity={1}
                  fill="url(#colorNewUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 🚀 FEATURE USAGE STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature Usage Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Feature Usage
            </CardTitle>
            <CardDescription>
              Usage statistics across platform features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={featureUsageData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="disease_scans" name="Disease Scans" fill="#FF8042" />
                  <Bar dataKey="chat_conversations" name="AI Chats" fill="#8884d8" />
                  <Bar dataKey="disease_detections" name="Disease Detections" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Disease Detection Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Disease Detection
            </CardTitle>
            <CardDescription>
              Most detected crop diseases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.feature_usage.disease_detection.most_detected}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="disease"
                    label={({ disease, percent }) => `${disease}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics.feature_usage.disease_detection.most_detected.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🔥 USER METRICS AND ERROR METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Metrics
            </CardTitle>
            <CardDescription>
              User distribution and engagement statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.user_metrics.total_users)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Active Users</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.user_metrics.active_users)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Retention</p>
                  <p className="text-2xl font-bold">{analytics.user_metrics.user_retention.toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-2">Top Countries</h4>
                <div className="space-y-2">
                  {analytics.user_metrics.countries.map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <p className="text-sm">{country.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ 
                              width: `${(country.count / analytics.user_metrics.total_users) * 100}%` 
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(country.count)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Metrics
            </CardTitle>
            <CardDescription>
              System errors and performance issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Errors</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.error_metrics.total_errors)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Error Rate</p>
                  <p className="text-2xl font-bold">{analytics.error_metrics.error_rate.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Avg Response</p>
                  <p className="text-2xl font-bold">{analytics.performance_metrics.average_response_time}ms</p>
                </div>
              </div>
              
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-2">Top Errors</h4>
                <div className="space-y-2">
                  {analytics.error_metrics.top_errors.map((error, index) => (
                    <div key={index} className="p-2 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{error.message}</p>
                        <Badge variant="outline">{error.component}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full" 
                            style={{ 
                              width: `${(error.count / analytics.error_metrics.total_errors) * 100}%` 
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatNumber(error.count)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};