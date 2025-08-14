/**
 * 🚨 ALERT DASHBOARD - COMPREHENSIVE ALERT MANAGEMENT
 * Beautiful dashboard for managing all agricultural alerts
 * LIQUID GLASS PERFECTION for 100 million farmers
 */

import React, { useState } from 'react';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { AgriculturalAlertNotification } from './AgriculturalAlertNotification';
import { AgriculturalAlert } from '@/services/AlertSystem';
import { Button } from '@/components/ui/button';
import { Filter, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface AlertDashboardProps {
  alerts: AgriculturalAlert[];
  onRefresh?: () => void;
}

export const AlertDashboard: React.FC<AlertDashboardProps> = ({
  alerts,
  onRefresh
}) => {
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'disease' | 'weather' | 'irrigation' | 'pest'>('all');

  // Filter alerts based on selected filters
  const filteredAlerts = alerts.filter(alert => {
    const typeMatch = filterType === 'all' || 
      (filterType === 'critical' && alert.urgencyLevel >= 4) ||
      (filterType === 'high' && alert.urgencyLevel === 3) ||
      (filterType === 'medium' && alert.urgencyLevel === 2) ||
      (filterType === 'low' && alert.urgencyLevel === 1);
    
    const categoryMatch = filterCategory === 'all' || alert.type === filterCategory;
    
    return typeMatch && categoryMatch;
  });

  // Get alert statistics
  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.urgencyLevel >= 4).length,
    high: alerts.filter(a => a.urgencyLevel === 3).length,
    medium: alerts.filter(a => a.urgencyLevel === 2).length,
    low: alerts.filter(a => a.urgencyLevel === 1).length
  };

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      <LiquidGlassCard
        draggable={false}
        className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 border border-blue-200/30"
        borderRadius="24px"
        glowIntensity="md"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-blue-600" />
              Agricultural Alerts
            </h2>
            {onRefresh && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRefresh}
                className="bg-white/20 hover:bg-white/30 border-white/30"
              >
                Refresh
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-white/20 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-600">Total Alerts</div>
            </div>
            <div className="text-center p-3 bg-red-100/50 rounded-xl">
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
              <div className="text-xs text-red-600">Critical</div>
            </div>
            <div className="text-center p-3 bg-orange-100/50 rounded-xl">
              <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
              <div className="text-xs text-orange-600">High</div>
            </div>
            <div className="text-center p-3 bg-yellow-100/50 rounded-xl">
              <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
              <div className="text-xs text-yellow-600">Medium</div>
            </div>
            <div className="text-center p-3 bg-green-100/50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{stats.low}</div>
              <div className="text-xs text-green-600">Low</div>
            </div>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Filters */}
      <LiquidGlassCard
        draggable={false}
        className="bg-gradient-to-br from-gray-50/80 to-white/80 border border-gray-200/30"
        borderRadius="20px"
        glowIntensity="sm"
      >
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <div className="flex flex-wrap gap-2">
              {/* Priority Filter */}
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-1 text-sm bg-white/50 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Category Filter */}
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="px-3 py-1 text-sm bg-white/50 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Categories</option>
                <option value="disease">Disease</option>
                <option value="weather">Weather</option>
                <option value="irrigation">Irrigation</option>
                <option value="pest">Pest</option>
              </select>
            </div>
            <div className="text-sm text-gray-600 ml-auto">
              Showing {filteredAlerts.length} of {alerts.length} alerts
            </div>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Alert List */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <AgriculturalAlertNotification
              key={alert.id}
              alert={alert}
              onDismiss={() => {
                console.log('Alert dismissed:', alert.id);
                // Implement dismissal logic
              }}
            />
          ))
        ) : (
          <LiquidGlassCard
            draggable={false}
            className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 border border-green-200/30"
            borderRadius="20px"
            glowIntensity="sm"
          >
            <div className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                No Alerts Found
              </h3>
              <p className="text-sm text-green-600">
                {filterType === 'all' && filterCategory === 'all' 
                  ? "Great news! No agricultural alerts at this time. Your crops are in optimal conditions."
                  : "No alerts match your current filters. Try adjusting the filter criteria."
                }
              </p>
            </div>
          </LiquidGlassCard>
        )}
      </div>

      {/* Quick Actions */}
      {filteredAlerts.length > 0 && (
        <LiquidGlassCard
          draggable={false}
          className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 border border-purple-200/30"
          borderRadius="20px"
          glowIntensity="sm"
        >
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  const criticalAlerts = alerts.filter(a => a.urgencyLevel >= 4);
                  console.log('Addressing critical alerts:', criticalAlerts);
                }}
              >
                Address Critical ({stats.critical})
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="bg-white/20 hover:bg-white/30 border-white/30"
                onClick={() => {
                  const diseaseAlerts = alerts.filter(a => a.type === 'disease');
                  console.log('Disease prevention actions:', diseaseAlerts);
                }}
              >
                Disease Prevention
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="bg-white/20 hover:bg-white/30 border-white/30"
                onClick={() => {
                  const weatherAlerts = alerts.filter(a => a.type === 'weather');
                  console.log('Weather protection actions:', weatherAlerts);
                }}
              >
                Weather Protection
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="bg-white/20 hover:bg-white/30 border-white/30"
                onClick={() => {
                  const irrigationAlerts = alerts.filter(a => a.type === 'irrigation');
                  console.log('Irrigation actions:', irrigationAlerts);
                }}
              >
                Irrigation Check
              </Button>
            </div>
          </div>
        </LiquidGlassCard>
      )}
    </div>
  );
};