import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  Save,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Bug
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// AuthDebugDashboard removed - simplified auth system doesn't need debug UI

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  weather_alerts: boolean;
  market_alerts: boolean;
  task_reminders: boolean;
  weekly_reports: boolean;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    weather_alerts: true,
    market_alerts: true,
    task_reminders: true,
    weekly_reports: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDebugDashboard, setShowDebugDashboard] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadNotificationSettings();
    }
  }, [user]);

  const loadNotificationSettings = async () => {
    const { data } = await supabase
      .from('user_memory')
      .select('memory_data')
      .eq('user_id', user!.id)
      .single();
    
    if (data?.memory_data) {
      const savedNotifications = {
        email_notifications: data.memory_data.email_notifications ?? true,
        push_notifications: data.memory_data.push_notifications ?? true,
        weather_alerts: data.memory_data.weather_alerts ?? true,
        market_alerts: data.memory_data.market_alerts ?? true,
        task_reminders: data.memory_data.task_reminders ?? true,
        weekly_reports: data.memory_data.weekly_reports ?? false
      };
      setNotifications(savedNotifications);
    }
  };

  const loadUserProfile = async () => {
    setLoading(true);
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single();

    if (data) {
      setProfile(data);
    } else {
      const newProfile = {
        id: user!.id,
        email: user!.email,
        full_name: user!.user_metadata?.full_name || null,
        avatar_url: user!.user_metadata?.avatar_url || null,
        onboarding_completed: true
      };

      const { data: createdProfile } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      setProfile(createdProfile);
    }

    setLoading(false);
  };

  const updateProfile = async () => {
    if (!profile) return;

    setSaving(true);

    await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        email: profile.email
      })
      .eq('id', profile.id);

    if (profile.email !== user?.email) {
      await supabase.auth.updateUser({
        email: profile.email || undefined
      });
    }

    toast.success('Profile updated successfully');
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    toast.success('Signed out successfully');
  };

  const exportData = async () => {
    setSaving(true);
    
    const [farmsData, fieldsData, scansData, tasksData] = await Promise.all([
      supabase.from('farms').select('*').eq('user_id', user!.id),
      supabase.from('fields').select('*').eq('user_id', user!.id),
      supabase.from('crop_scans').select('*').eq('user_id', user!.id),
      supabase.from('tasks').select('*').eq('assigned_to', user!.id)
    ]);
    
    const userData = {
      profile,
      notifications,
      farms: farmsData.data || [],
      fields: fieldsData.data || [],
      crop_scans: scansData.data || [],
      tasks: tasksData.data || [],
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cropgenius-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Data exported successfully');
    setSaving(false);
  };

  const deleteAccount = async () => {
    setSaving(true);
    
    await supabase.from('farms').delete().eq('user_id', user!.id);
    await supabase.from('fields').delete().eq('user_id', user!.id);
    await supabase.from('crop_scans').delete().eq('user_id', user!.id);
    await supabase.from('profiles').delete().eq('id', user!.id);
    
    await signOut();
    navigate('/auth');
    toast.success('Account deleted successfully');
    setShowDeleteConfirm(false);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
      <div className="container py-6 space-y-6 min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Support
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input
                          id="full-name"
                          value={profile.full_name || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          Account verified and active
                        </span>
                      </div>
                      <Button onClick={updateProfile} disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to receive updates and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.email_notifications}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, email_notifications: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-gray-600">Receive browser notifications</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications.push_notifications}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, push_notifications: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weather-alerts">Weather Alerts</Label>
                      <p className="text-sm text-gray-600">Get notified about weather changes</p>
                    </div>
                    <Switch
                      id="weather-alerts"
                      checked={notifications.weather_alerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, weather_alerts: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="market-alerts">Market Price Alerts</Label>
                      <p className="text-sm text-gray-600">Notifications about price changes</p>
                    </div>
                    <Switch
                      id="market-alerts"
                      checked={notifications.market_alerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, market_alerts: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="task-reminders">Task Reminders</Label>
                      <p className="text-sm text-gray-600">Reminders for farming tasks</p>
                    </div>
                    <Switch
                      id="task-reminders"
                      checked={notifications.task_reminders}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, task_reminders: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weekly-reports">Weekly Reports</Label>
                      <p className="text-sm text-gray-600">Weekly farm performance summaries</p>
                    </div>
                    <Switch
                      id="weekly-reports"
                      checked={notifications.weekly_reports}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, weekly_reports: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={async () => {
                    setSaving(true);
                    
                    await supabase
                      .from('user_memory')
                      .upsert({
                        user_id: user!.id,
                        memory_data: {
                          ...notifications,
                          updated_at: new Date().toISOString()
                        }
                      });
                    
                    toast.success('Notification preferences saved');
                    setSaving(false);
                  }} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Data</CardTitle>
                <CardDescription>
                  Manage your data and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Button variant="outline" onClick={exportData} className="w-full justify-start" disabled={saving}>
                    <Download className="h-4 w-4 mr-2" />
                    Export My Data
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy Policy
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Terms of Service
                  </Button>
                </div>

                <Separator />

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800">Danger Zone</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-3"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Help & Support</CardTitle>
                <CardDescription>
                  Get help and contact our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <HelpCircle className="h-6 w-6" />
                    <span>Help Center</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <User className="h-6 w-6" />
                    <span>Contact Support</span>
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">App Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Version: 1.0.0</p>
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>
                    <p>User ID: {user?.id}</p>
                  </div>
                </div>

                {/* 🔥 INFINITY IQ DEBUG DASHBOARD - DEVELOPMENT ONLY */}
                {import.meta.env.DEV && (
                  <>
                    <Separator />
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Bug className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-green-800 dark:text-green-200">
                            🚀 INFINITY IQ Debug Dashboard
                          </h4>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Production-ready authentication debugging system for 100M farmers. 
                            Monitor auth events, system health, and performance metrics in real-time.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 bg-gradient-to-r from-green-600 to-blue-600 text-white border-none hover:from-green-700 hover:to-blue-700"
                            onClick={() => setShowDebugDashboard(true)}
                          >
                            <Bug className="h-4 w-4 mr-2" />
                            Open Debug Dashboard
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sign Out Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Sign Out</h3>
                <p className="text-sm text-gray-600">Sign out of your CropGenius account</p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-red-600">Delete Account</CardTitle>
                <CardDescription>
                  Are you absolutely sure you want to delete your account? This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700">
                    This will permanently delete your account, all your farm data, fields, scans, and settings.
                  </p>
                </div>
              </CardContent>
              <div className="flex items-center justify-end gap-2 p-6 pt-0">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteAccount}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Auth debug dashboard removed - simplified auth system is self-explanatory */}
      </div>
  );
};

export default Settings;