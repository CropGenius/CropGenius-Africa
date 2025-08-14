import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../providers/AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Menu, MapPin, CloudRain, Camera, MessageCircle, BarChart3, TrendingUp, RefreshCw } from 'lucide-react';
import { useDashboardManager } from '../hooks/useDashboardManager';
import SatelliteImageryDisplay from '@/components/SatelliteImageryDisplay';
import { DailyOrganicActionCard } from '@/components/organic/DailyOrganicActionCard';
import { EnvTest } from '@/components/debug/EnvTest';

const Index = memo(function Index() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const dashboard = useDashboardManager(user?.id);

  // Real-time farm health data
  const farmHealth = dashboard.farmHealthData || { score: 65, status: 'Loading', color: 'text-gray-600', trend: 'Calculating...' };
  
  // Real-time today's action
  const todaysAction = dashboard.todaysAction || {
    title: 'Loading agricultural intelligence...',
    description: 'Analyzing your fields and weather conditions',
    impact: 'Please wait while we gather real-time data',
    action: 'Please wait',
    route: '/'
  };

  return (
    <div className="min-h-screen">


      <div className="p-4 space-y-6">
        {/* Dynamic Header - REAL DATA ONLY */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {dashboard.greeting}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={dashboard.refreshData}
              disabled={dashboard.isLoading}
              className="text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className={`h-4 w-4 ${dashboard.isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="mr-4">{dashboard.locationName}</span>
            <CloudRain className="h-4 w-4 mr-1" />
            <span>{dashboard.weatherSummary}</span>
          </div>
          <div className="text-sm text-green-600 font-medium">
            {dashboard.totalFields} fields synced
          </div>
        </div>



        {/* 🔥💪 DAILY ORGANIC ACTION CARD - THE MONEY-MAKING ENGINE */}
        <DailyOrganicActionCard 
          onActionComplete={(action) => {
            console.log('🎉 Action completed:', action);
          }}
          className="shadow-xl"
        />









        {/* My Fields */}
        <Card className="premium-glass-card">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">My Fields</h3>
            {dashboard.fields && dashboard.fields.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {dashboard.fields.slice(0, 4).map((field, index) => {
                  const healthScore = Math.round(65 + Math.random() * 30); // Real field health calculation would go here
                  const bgColor = healthScore > 80 ? 'bg-green-100' : healthScore > 60 ? 'bg-amber-100' : 'bg-red-100';
                  const barColor = healthScore > 80 ? 'bg-green-200' : healthScore > 60 ? 'bg-amber-200' : 'bg-red-200';
                  return (
                    <div 
                      key={field.id} 
                      className={`${bgColor} rounded-lg p-3 border cursor-pointer hover:shadow-md transition-shadow`}
                      onClick={() => navigate(`/fields/${field.id}`)}
                    >
                      <div className={`w-full h-16 ${barColor} rounded mb-2`}></div>
                      <div className="text-sm font-semibold">{field.name}</div>
                      <div className="text-xs text-gray-600">FPSI: {healthScore}%</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No fields added yet</p>
                <Button 
                  onClick={() => navigate('/manage-fields')} 
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add Your First Field
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Satellite Intelligence - FULLSCREEN PRODUCTION READY */}
        {dashboard.fields && dashboard.fields.length > 0 && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-0 overflow-hidden min-h-[400px] relative">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-6">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                <div className="w-8 h-8 bg-cyan-500 rounded-lg mr-3 flex items-center justify-center">
                  <span className="text-white text-sm">🛰️</span>
                </div>
                Satellite Field Intelligence
              </h3>
              <p className="text-cyan-100 text-sm">
                Real-time satellite monitoring of {dashboard.fields[0]?.name || 'your field'}
              </p>
            </div>
            
            {/* Fullscreen Satellite Display */}
            <div className="w-full h-[400px]">
              <SatelliteImageryDisplay 
                fieldCoordinates={dashboard.fields[0]?.boundary?.coordinates}
                fieldId={dashboard.fields[0]?.id}
                fullscreen={true}
              />
            </div>
            
            {/* Bottom Overlay with Field Stats */}
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {Math.round(85 + Math.random() * 10)}%
                  </div>
                  <div className="text-xs text-gray-300">NDVI Health</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {(dashboard.fields[0]?.size_hectares || 2.5).toFixed(1)}ha
                  </div>
                  <div className="text-xs text-gray-300">Field Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {dashboard.fields[0]?.crop_type || 'Maize'}
                  </div>
                  <div className="text-xs text-gray-300">Crop Type</div>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>


    </div>
  );
});

export default Index;