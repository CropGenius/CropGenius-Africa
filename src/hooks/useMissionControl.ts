/**
 * 🔥💪 MISSION CONTROL HOOK - INFINITY GOD MODE ACTIVATED!
 * REAL mission control hook with REAL Supabase integration
 * Built for 100 million African farmers with military-grade security!
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { missionControlApi, FarmerUser, SystemHealth, SystemAnalytics, AdminAction, Incident } from '@/services/missionControlApi';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

// 🚀 MISSION CONTROL HOOK INTERFACES
interface UsersOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

interface AdminActionsOptions {
  page?: number;
  limit?: number;
  status?: AdminAction['status'];
}

interface UseMissionControlReturn {
  // User Management
  users: {
    data: FarmerUser[];
    count: number;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    getUser: (userId: string) => Promise<FarmerUser | null>;
    updateUser: (userId: string, updates: Partial<FarmerUser>) => Promise<boolean>;
    deleteUser: (userId: string) => Promise<boolean>;
    options: UsersOptions;
    setOptions: (options: Partial<UsersOptions>) => void;
  };
  
  // System Health
  systemHealth: {
    data: SystemHealth | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    createIncident: (incident: Omit<Incident, 'id' | 'created_at' | 'updated_at'>) => Promise<Incident | null>;
    updateIncident: (incidentId: string, updates: Partial<Incident>) => Promise<boolean>;
  };
  
  // Analytics
  analytics: {
    data: SystemAnalytics | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    userGrowthData: any[];
    featureUsageData: any[];
    period: 'day' | 'week' | 'month' | 'year';
    setPeriod: (period: 'day' | 'week' | 'month' | 'year') => void;
  };
  
  // Admin Actions
  adminActions: {
    data: AdminAction[];
    count: number;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    performAction: (action: Omit<AdminAction, 'id' | 'created_at' | 'updated_at' | 'completed_at'>) => Promise<AdminAction | null>;
    options: AdminActionsOptions;
    setOptions: (options: Partial<AdminActionsOptions>) => void;
  };
}

/**
 * 🔥 INFINITY GOD MODE MISSION CONTROL HOOK
 * Real mission control with military-grade security
 */
export function useMissionControl(): UseMissionControlReturn {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  
  // 🚀 STATE MANAGEMENT
  const [usersOptions, setUsersOptions] = useState<UsersOptions>({
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortDirection: 'desc',
    filter: {}
  });
  
  const [adminActionsOptions, setAdminActionsOptions] = useState<AdminActionsOptions>({
    page: 1,
    limit: 10
  });
  
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // 🔥 USER MANAGEMENT QUERIES
  const usersQuery = useQuery({
    queryKey: ['mission-control', 'users', usersOptions],
    queryFn: async () => {
      const result = await missionControlApi.getUsers(usersOptions);
      if (result.error) throw new Error(result.error);
      return result;
    },
    enabled: !!user?.id
  });

  const getUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await missionControlApi.getUserById(userId);
      if (result.error) throw new Error(result.error);
      return result.data;
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<FarmerUser> }) => {
      const result = await missionControlApi.updateUser(userId, updates);
      if (!result.success) throw new Error(result.error);
      return result.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-control', 'users'] });
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update user', { description: error.message });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await missionControlApi.deleteUser(userId);
      if (!result.success) throw new Error(result.error);
      return result.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-control', 'users'] });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete user', { description: error.message });
    }
  });

  // 🚀 SYSTEM HEALTH QUERIES
  const systemHealthQuery = useQuery({
    queryKey: ['mission-control', 'system-health'],
    queryFn: async () => {
      const result = await missionControlApi.getSystemHealth();
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: !!user?.id,
    refetchInterval: 60000 // Refetch every minute
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (incident: Omit<Incident, 'id' | 'created_at' | 'updated_at'>) => {
      const result = await missionControlApi.createIncident(incident);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-control', 'system-health'] });
      toast.success('Incident created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create incident', { description: error.message });
    }
  });

  const updateIncidentMutation = useMutation({
    mutationFn: async ({ incidentId, updates }: { incidentId: string; updates: Partial<Incident> }) => {
      const result = await missionControlApi.updateIncident(incidentId, updates);
      if (!result.success) throw new Error(result.error);
      return result.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-control', 'system-health'] });
      toast.success('Incident updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update incident', { description: error.message });
    }
  });

  // 🔥 ANALYTICS QUERIES
  const analyticsQuery = useQuery({
    queryKey: ['mission-control', 'analytics'],
    queryFn: async () => {
      const result = await missionControlApi.getSystemAnalytics();
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: !!user?.id,
    refetchInterval: 300000 // Refetch every 5 minutes
  });

  const userGrowthQuery = useQuery({
    queryKey: ['mission-control', 'user-growth', analyticsPeriod],
    queryFn: async () => {
      const result = await missionControlApi.getUserGrowthData(analyticsPeriod);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: !!user?.id
  });

  const featureUsageQuery = useQuery({
    queryKey: ['mission-control', 'feature-usage', analyticsPeriod],
    queryFn: async () => {
      const result = await missionControlApi.getFeatureUsageData(analyticsPeriod);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: !!user?.id
  });

  // 🚀 ADMIN ACTIONS QUERIES
  const adminActionsQuery = useQuery({
    queryKey: ['mission-control', 'admin-actions', adminActionsOptions],
    queryFn: async () => {
      const result = await missionControlApi.getAdminActions(adminActionsOptions);
      if (result.error) throw new Error(result.error);
      return result;
    },
    enabled: !!user?.id
  });

  const performActionMutation = useMutation({
    mutationFn: async (action: Omit<AdminAction, 'id' | 'created_at' | 'updated_at' | 'completed_at'>) => {
      const result = await missionControlApi.performAdminAction(action);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-control', 'admin-actions'] });
      toast.success('Admin action performed successfully');
    },
    onError: (error) => {
      toast.error('Failed to perform admin action', { description: error.message });
    }
  });

  // 🔥 HELPER FUNCTIONS
  const refetchUsers = useCallback(async () => {
    try {
      await usersQuery.refetch();
    } catch (error) {
      console.error('Error refetching users:', error);
    }
  }, [usersQuery]);

  const getUser = useCallback(async (userId: string): Promise<FarmerUser | null> => {
    try {
      return await getUserMutation.mutateAsync(userId);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }, [getUserMutation]);

  const updateUser = useCallback(async (userId: string, updates: Partial<FarmerUser>): Promise<boolean> => {
    try {
      return await updateUserMutation.mutateAsync({ userId, updates });
    } catch (error) {
      return false;
    }
  }, [updateUserMutation]);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      return await deleteUserMutation.mutateAsync(userId);
    } catch (error) {
      return false;
    }
  }, [deleteUserMutation]);

  const refetchSystemHealth = useCallback(async () => {
    try {
      await systemHealthQuery.refetch();
    } catch (error) {
      console.error('Error refetching system health:', error);
    }
  }, [systemHealthQuery]);

  const createIncident = useCallback(async (incident: Omit<Incident, 'id' | 'created_at' | 'updated_at'>): Promise<Incident | null> => {
    try {
      return await createIncidentMutation.mutateAsync(incident);
    } catch (error) {
      return null;
    }
  }, [createIncidentMutation]);

  const updateIncident = useCallback(async (incidentId: string, updates: Partial<Incident>): Promise<boolean> => {
    try {
      return await updateIncidentMutation.mutateAsync({ incidentId, updates });
    } catch (error) {
      return false;
    }
  }, [updateIncidentMutation]);

  const refetchAnalytics = useCallback(async () => {
    try {
      await Promise.all([
        analyticsQuery.refetch(),
        userGrowthQuery.refetch(),
        featureUsageQuery.refetch()
      ]);
    } catch (error) {
      console.error('Error refetching analytics:', error);
    }
  }, [analyticsQuery, userGrowthQuery, featureUsageQuery]);

  const refetchAdminActions = useCallback(async () => {
    try {
      await adminActionsQuery.refetch();
    } catch (error) {
      console.error('Error refetching admin actions:', error);
    }
  }, [adminActionsQuery]);

  const performAction = useCallback(async (action: Omit<AdminAction, 'id' | 'created_at' | 'updated_at' | 'completed_at'>): Promise<AdminAction | null> => {
    try {
      return await performActionMutation.mutateAsync(action);
    } catch (error) {
      return null;
    }
  }, [performActionMutation]);

  // 🚀 RETURN HOOK DATA
  return {
    users: {
      data: usersQuery.data?.data || [],
      count: usersQuery.data?.count || 0,
      isLoading: usersQuery.isLoading,
      error: usersQuery.error as Error | null,
      refetch: refetchUsers,
      getUser,
      updateUser,
      deleteUser,
      options: usersOptions,
      setOptions: (options: Partial<UsersOptions>) => setUsersOptions(prev => ({ ...prev, ...options }))
    },
    systemHealth: {
      data: systemHealthQuery.data || null,
      isLoading: systemHealthQuery.isLoading,
      error: systemHealthQuery.error as Error | null,
      refetch: refetchSystemHealth,
      createIncident,
      updateIncident
    },
    analytics: {
      data: analyticsQuery.data || null,
      isLoading: analyticsQuery.isLoading || userGrowthQuery.isLoading || featureUsageQuery.isLoading,
      error: analyticsQuery.error as Error | null,
      refetch: refetchAnalytics,
      userGrowthData: userGrowthQuery.data || [],
      featureUsageData: featureUsageQuery.data || [],
      period: analyticsPeriod,
      setPeriod: setAnalyticsPeriod
    },
    adminActions: {
      data: adminActionsQuery.data?.data || [],
      count: adminActionsQuery.data?.count || 0,
      isLoading: adminActionsQuery.isLoading,
      error: adminActionsQuery.error as Error | null,
      refetch: refetchAdminActions,
      performAction,
      options: adminActionsOptions,
      setOptions: (options: Partial<AdminActionsOptions>) => setAdminActionsOptions(prev => ({ ...prev, ...options }))
    }
  };
}