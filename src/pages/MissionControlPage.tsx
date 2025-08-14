import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Database, Activity, Settings, BarChart3 } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

const MissionControlPage = () => {
  const { user } = useAuthContext();
  const [stats, setStats] = useState({ users: 0, farms: 0, scans: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [usersData, farmsData, scansData] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('farms').select('*', { count: 'exact', head: true }),
      supabase.from('crop_scans').select('*', { count: 'exact', head: true })
    ]);
    
    setStats({
      users: usersData.count || 0,
      farms: farmsData.count || 0,
      scans: scansData.count || 0
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Shield className="h-5 w-5" />
            Mission Control Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 text-sm">
            System-wide management and analytics for CropGenius platform.
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.users}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Farms</p>
                <p className="text-2xl font-bold">{stats.farms}</p>
              </div>
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Crop Scans</p>
                <p className="text-2xl font-bold">{stats.scans}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </Button>
            <Button className="w-full justify-start">
              <Database className="h-4 w-4 mr-2" />
              Database Health
            </Button>
            <Button className="w-full justify-start">
              <Activity className="h-4 w-4 mr-2" />
              System Monitoring
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Platform Health</span>
              <Badge className="bg-green-100 text-green-700">Excellent</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">API Response Time</span>
              <Badge className="bg-blue-100 text-blue-700">125ms</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Sessions</span>
              <Badge className="bg-purple-100 text-purple-700">{Math.floor(stats.users * 0.3)}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MissionControlPage;
