/**
 * 🔥💪 MISSION CONTROL DASHBOARD - INFINITY GOD MODE ACTIVATED!
 * REAL production-ready admin dashboard with REAL Supabase integration
 * Built for 100 million African farmers with military-grade security!
 */

import React, { useState } from 'react';
import { 
  Users, 
  RefreshCw, 
  Leaf,
  Map,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Database,
  Server,
  Zap,
  Shield,
  BarChart3,
  Clock,
  Globe,
  MessageSquare,
  Scan,
  Plus,
  Settings
} from 'lucide-react';
import { useMissionControl } from '@/hooks/useMissionControl';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { SystemHealthPanel } from '@/components/mission-control/SystemHealthPanel';
import { UserManagementPanel } from '@/components/mission-control/UserManagementPanel';
import { AnalyticsPanel } from '@/components/mission-control/AnalyticsPanel';
import { AdminActionsPanel } from '@/components/mission-control/AdminActionsPanel';

/**
 * 🔥 INFINITY GOD MODE MISSION CONTROL DASHBOARD
 * Real mission control with military-grade security
 */
const MissionControlDashboard: React.FC = () => {
  const {
    users,
    systemHealth,
    analytics,
    adminActions
  } = useMissionControl();
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // 🚀 GET STATUS COLOR
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'maintenance': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'outage': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };
  
  // 🔥 HANDLE REFRESH ALL
  const handleRefreshAll = async () => {
    await Promise.all([
      users.refetch(),
      systemHealth.refetch(),
      analytics.refetch(),
      adminActions.refetch()
    ]);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 🚀 MISSION CONTROL HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              🔥 Mission Control Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time system monitoring for 100 million African farmers
            </p>
          </div>
          <Button 
            onClick={handleRefreshAll}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh All
          </Button>
        </div>

        {/* 🔥 SYSTEM STATUS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* System Health */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              {systemHealth.isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {systemHealth.data?.status?.toUpperCase() || 'UNKNOWN'}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(systemHealth.data?.status || 'unknown')}
                  >
                    {systemHealth.data?.performance?.uptime_percentage?.toFixed(2) || '0'}% Uptime
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Users */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              {analytics.isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {analytics.data?.user_metrics?.total_users?.toLocaleString() || '0'}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +{analytics.data?.user_metrics?.new_users_today || 0} today
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              {analytics.isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {analytics.data?.user_metrics?.active_users?.toLocaleString() || '0'}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {analytics.data?.user_metrics?.user_retention || 0}% retention
                    </Badge>
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
              {analytics.isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {analytics.data?.feature_usage?.disease_detection?.total_scans?.toLocaleString() || '0'}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    {analytics.data?.feature_usage?.disease_detection?.daily_average || 0}/day avg
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 🔥 MAIN DASHBOARD TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Server className="h-4 w-4" />
              System Health
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <Settings className="h-4 w-4" />
              Admin Actions
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <AnalyticsPanel
              analytics={analytics.data}
              isLoading={analytics.isLoading}
              error={analytics.error}
              onRefresh={analytics.refetch}
              userGrowthData={analytics.userGrowthData}
              featureUsageData={analytics.featureUsageData}
              period={analytics.period}
              setPeriod={analytics.setPeriod}
            />
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="system" className="space-y-6">
            <SystemHealthPanel
              systemHealth={systemHealth.data}
              isLoading={systemHealth.isLoading}
              error={systemHealth.error}
              onRefresh={systemHealth.refetch}
              onCreateIncident={systemHealth.createIncident}
              onUpdateIncident={systemHealth.updateIncident}
            />
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserManagementPanel
              users={users.data}
              count={users.count}
              isLoading={users.isLoading}
              error={users.error}
              onRefresh={users.refetch}
              getUser={users.getUser}
              updateUser={users.updateUser}
              deleteUser={users.deleteUser}
              options={users.options}
              setOptions={users.setOptions}
            />
          </TabsContent>

          {/* Admin Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <AdminActionsPanel
              actions={adminActions.data}
              count={adminActions.count}
              isLoading={adminActions.isLoading}
              error={adminActions.error}
              onRefresh={adminActions.refetch}
              performAction={adminActions.performAction}
              options={adminActions.options}
              setOptions={adminActions.setOptions}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MissionControlDashboard;