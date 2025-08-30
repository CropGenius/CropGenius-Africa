/**
 * 🚨 ALERTS PAGE - COMPREHENSIVE ALERT MANAGEMENT
 * Full-featured alerts page for agricultural intelligence
 * LIQUID GLASS PERFECTION for 100 million farmers
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell } from 'lucide-react';
import { AlertDashboard } from '@/components/alerts/AlertDashboard';
import { useDashboardManager } from '@/hooks/useDashboardManager';
import { useSimpleAuthContext } from '@/providers/SimpleAuthProvider';

export default function Alerts() {
  const navigate = useNavigate();
  const { user } = useSimpleAuthContext();
  const dashboard = useDashboardManager(user?.id);

  return (
    <div className="min-h-screen">


      {/* Content */}
      <div className="p-4 max-w-4xl mx-auto">
        {dashboard.isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading agricultural intelligence...</p>
          </div>
        ) : (
          <AlertDashboard 
            alerts={dashboard.alerts || []}
            onRefresh={dashboard.refreshData}
          />
        )}
      </div>

      {/* Bottom Navigation Spacer */}
      <div className="h-20"></div>
    </div>
  );
}