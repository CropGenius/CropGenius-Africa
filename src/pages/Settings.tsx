import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  LogOut,
  Save,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Smartphone,
  Mail,
  MessageCircle,
  Clock,
  Volume2,
  VolumeX,
  Zap,
  TestTube,
  Phone,
  Check,
  X,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [whatsappCode, setWhatsappCode] = useState('');
  const [showWhatsappVerification, setShowWhatsappVerification] = useState(false);
  
  // Use the powerful notification hook
  const {
    preferences,
    isLoading: notificationsLoading,
    isPermissionGranted,
    isPushSubscribed,
    isWhatsAppVerified,
    unreadCount,
    updatePreferences,
    requestPushPermission,
    subscribeToPush,
    unsubscribeFromPush,
    initiateWhatsAppVerification,
    verifyWhatsAppCode,
    sendTestNotification
  } = useNotifications();

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

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

  // Handle push notification toggle
  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      const permissionGranted = await requestPushPermission();
      if (permissionGranted) {
        await subscribeToPush();
      }
    } else {
      await unsubscribeFromPush();
    }
  };

  // Handle WhatsApp verification
  const handleWhatsAppVerification = async () => {
    if (!whatsappPhone) {
      toast.error('Please enter your WhatsApp phone number');
      return;
    }

    const success = await initiateWhatsAppVerification(whatsappPhone);
    if (success) {
      setShowWhatsappVerification(true);
      toast.success('Verification code sent to your WhatsApp!');
    }
  };

  const handleWhatsAppCodeVerification = async () => {
    if (!whatsappCode) {
      toast.error('Please enter the verification code');
      return;
    }

    const success = await verifyWhatsAppCode(whatsappCode);
    if (success) {
      setShowWhatsappVerification(false);
      setWhatsappCode('');
    }
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
      notification_preferences: preferences,
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

  if (loading || notificationsLoading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-gray-600">Loading your notification settings...</p>
          </div>
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

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>



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
                    checked={preferences?.email_enabled || false}
                    onCheckedChange={(checked) => updatePreferences({ email_enabled: checked })}
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
                    checked={isPushSubscribed}
                    onCheckedChange={handlePushToggle}
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
                    checked={preferences?.weather_alerts || false}
                    onCheckedChange={(checked) => updatePreferences({ weather_alerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="market-alerts">Market Price Alerts</Label>
                    <p className="text-sm text-gray-600">Notifications about price changes</p>
                  </div>
                  <Switch
                    id="market-alerts"
                    checked={preferences?.market_alerts || false}
                    onCheckedChange={(checked) => updatePreferences({ market_alerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="task-reminders">Task Reminders</Label>
                    <p className="text-sm text-gray-600">Reminders for farming tasks</p>
                  </div>
                  <Switch
                    id="task-reminders"
                    checked={preferences?.task_reminders || false}
                    onCheckedChange={(checked) => updatePreferences({ task_reminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-reports">Weekly Reports</Label>
                    <p className="text-sm text-gray-600">Weekly farm performance summaries</p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={preferences?.weekly_reports || false}
                    onCheckedChange={(checked) => updatePreferences({ weekly_reports: checked })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={sendTestNotification} variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Send Test Notification
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