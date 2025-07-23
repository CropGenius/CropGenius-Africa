/**
 * 🔥💪 SYSTEM HEALTH PANEL - INFINITY GOD MODE ACTIVATED!
 * REAL system health monitoring with REAL-TIME updates
 * Built for 100 million African farmers with military-grade reliability!
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  HardDrive, 
  Lock, 
  RefreshCw, 
  Server, 
  Zap,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Cloud,
  TrendingUp
} from 'lucide-react';

// 🚀 PRODUCTION-READY COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// 🔥 MISSION CONTROL TYPES
import { SystemHealth, Incident, ComponentStatus } from '@/services/missionControlApi';

interface SystemHealthPanelProps {
  systemHealth: SystemHealth | null;
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
  onCreateIncident: (incident: Omit<Incident, 'id' | 'created_at' | 'updated_at'>) => Promise<Incident | null>;
  onUpdateIncident: (incidentId: string, updates: Partial<Incident>) => Promise<boolean>;
}

/**
 * 🔥 INFINITY GOD MODE SYSTEM HEALTH PANEL
 * Real-time system health monitoring with incident management
 */
export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({
  systemHealth,
  isLoading,
  error,
  onRefresh,
  onCreateIncident,
  onUpdateIncident
}) => {
  // 🚀 STATE MANAGEMENT
  const [showCreateIncident, setShowCreateIncident] = useState(false);
  const [newIncident, setNewIncident] = useState<{
    title: string;
    description: string;
    status: Incident['status'];
    impact: Incident['impact'];
    affected_components: string[];
  }>({
    title: '',
    description: '',
    status: 'investigating',
    impact: 'minor',
    affected_components: []
  });
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);

  // 🔥 GET STATUS COLOR
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'maintenance': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'outage': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 🚀 GET INCIDENT STATUS COLOR
  const getIncidentStatusColor = (status: Incident['status']) => {
    switch (status) {
      case 'investigating': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'identified': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'monitoring': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 🔥 GET INCIDENT IMPACT COLOR
  const getIncidentImpactColor = (impact: Incident['impact']) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'major': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'minor': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'none': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 🚀 GET COMPONENT ICON
  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'api': return <Server className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'storage': return <HardDrive className="h-4 w-4" />;
      case 'auth': return <Lock className="h-4 w-4" />;
      case 'ai_services': return <Zap className="h-4 w-4" />;
      case 'weather_services': return <Cloud className="h-4 w-4" />;
      case 'market_services': return <TrendingUp className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  // 🔥 FORMAT DATE
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 🚀 HANDLE CREATE INCIDENT
  const handleCreateIncident = async () => {
    if (!newIncident.title || !newIncident.description || newIncident.affected_components.length === 0) {
      return;
    }

    await onCreateIncident(newIncident);
    setShowCreateIncident(false);
    setNewIncident({
      title: '',
      description: '',
      status: 'investigating',
      impact: 'minor',
      affected_components: []
    });
  };

  // 🔥 HANDLE UPDATE INCIDENT STATUS
  const handleUpdateIncidentStatus = async (incidentId: string, status: Incident['status']) => {
    await onUpdateIncident(incidentId, { status });
  };

  // 🚀 TOGGLE COMPONENT SELECTION
  const toggleComponentSelection = (component: string) => {
    setNewIncident(prev => {
      const isSelected = prev.affected_components.includes(component);
      return {
        ...prev,
        affected_components: isSelected
          ? prev.affected_components.filter(c => c !== component)
          : [...prev.affected_components, component]
      };
    });
  };

  // 🔥 LOADING STATE
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading system health data...</p>
        </CardContent>
      </Card>
    );
  }

  // 🚀 ERROR STATE
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error loading system health</AlertTitle>
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

  // 🔥 NO DATA STATE
  if (!systemHealth) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No system health data available</p>
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
      {/* 🚀 SYSTEM STATUS OVERVIEW */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">System Health</CardTitle>
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
          <CardDescription>
            Last updated: {formatDate(systemHealth.last_updated)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">System Status</h3>
                <Badge 
                  variant="outline" 
                  className={getStatusColor(systemHealth.status)}
                >
                  {systemHealth.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-sm font-medium">Uptime</p>
                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                  {systemHealth.performance.uptime_percentage.toFixed(2)}%
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">API Latency</p>
                <Badge variant="outline">
                  {systemHealth.performance.api_latency_ms}ms
                </Badge>
              </div>
            </div>
          </div>

          {/* Component Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(systemHealth.components).map(([key, component]) => (
              <div key={key} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getComponentIcon(key)}
                    <h4 className="font-medium capitalize">{key.replace('_', ' ')}</h4>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(component.status)}
                  >
                    {component.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                    <span>Uptime</span>
                    <span>{component.uptime_percentage.toFixed(2)}%</span>
                  </div>
                  <Progress value={component.uptime_percentage} className="h-1" />
                </div>
                {component.message && (
                  <p className="text-xs text-muted-foreground mt-2">{component.message}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 🔥 ACTIVE INCIDENTS */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Active Incidents</CardTitle>
            <Dialog open={showCreateIncident} onOpenChange={setShowCreateIncident}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Incident
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Incident</DialogTitle>
                  <DialogDescription>
                    Report a new system incident to track and manage resolution.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newIncident.title}
                      onChange={(e) => setNewIncident(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief description of the incident"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newIncident.description}
                      onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed description of the incident"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newIncident.status}
                        onValueChange={(value: Incident['status']) => 
                          setNewIncident(prev => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="identified">Identified</SelectItem>
                          <SelectItem value="monitoring">Monitoring</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="impact">Impact</Label>
                      <Select
                        value={newIncident.impact}
                        onValueChange={(value: Incident['impact']) => 
                          setNewIncident(prev => ({ ...prev, impact: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="minor">Minor</SelectItem>
                          <SelectItem value="major">Major</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Affected Components</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.keys(systemHealth.components).map(component => (
                        <div
                          key={component}
                          className={`p-2 border rounded cursor-pointer transition-colors ${
                            newIncident.affected_components.includes(component)
                              ? 'bg-blue-50 border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => toggleComponentSelection(component)}
                        >
                          <div className="flex items-center space-x-2">
                            {getComponentIcon(component)}
                            <span className="text-sm capitalize">{component.replace('_', ' ')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateIncident(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateIncident}>
                    Create Incident
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            {systemHealth.incidents.filter(i => i.status !== 'resolved').length} active incidents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {systemHealth.incidents.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">All Systems Operational</h3>
              <p className="text-muted-foreground">No incidents reported</p>
            </div>
          ) : (
            <div className="space-y-4">
              {systemHealth.incidents
                .sort((a, b) => {
                  // Sort by status (unresolved first) then by date (newest first)
                  if (a.status === 'resolved' && b.status !== 'resolved') return 1;
                  if (a.status !== 'resolved' && b.status === 'resolved') return -1;
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                })
                .map(incident => (
                  <Collapsible 
                    key={incident.id} 
                    open={expandedIncident === incident.id}
                    onOpenChange={() => setExpandedIncident(expandedIncident === incident.id ? null : incident.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        incident.status !== 'resolved' ? 'border-yellow-200 bg-yellow-50/50' : ''
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {incident.status === 'resolved' ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            )}
                            <div>
                              <h4 className="font-medium">{incident.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(incident.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={getIncidentStatusColor(incident.status)}
                            >
                              {incident.status.toUpperCase()}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={getIncidentImpactColor(incident.impact)}
                            >
                              {incident.impact.toUpperCase()}
                            </Badge>
                            {expandedIncident === incident.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 border-x border-b rounded-b-lg">
                        <p className="mb-4">{incident.description}</p>
                        
                        <div className="mb-4">
                          <h5 className="text-sm font-medium mb-2">Affected Components</h5>
                          <div className="flex flex-wrap gap-2">
                            {incident.affected_components.map(component => (
                              <Badge key={component} variant="outline">
                                {getComponentIcon(component)}
                                <span className="ml-1 capitalize">{component.replace('_', ' ')}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {incident.status === 'resolved' && incident.resolved_at && (
                              <span>Resolved at: {formatDate(incident.resolved_at)}</span>
                            )}
                          </div>
                          {incident.status !== 'resolved' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateIncidentStatus(incident.id, 'monitoring')}
                              >
                                Mark as Monitoring
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateIncidentStatus(incident.id, 'resolved')}
                              >
                                Mark as Resolved
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};