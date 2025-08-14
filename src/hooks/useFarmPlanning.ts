import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmPlanService } from '@/services/farmPlanService';
import { toast } from 'sonner';
import type { FarmPlan, PlanTask, FarmPlanCreate, PlanTaskCreate } from '@/types/farmPlan';

interface FarmPlanningState {
  selectedPlan: FarmPlan | null;
  view: 'dashboard' | 'plan-detail';
  showCreatePlan: boolean;
  showCreateTask: boolean;
  showEditPlan: boolean;
  showEditTask: boolean;
  editingTask: PlanTask | null;
}

export function useFarmPlanning() {
  const queryClient = useQueryClient();
  
  const [state, setState] = useState<FarmPlanningState>({
    selectedPlan: null,
    view: 'dashboard',
    showCreatePlan: false,
    showCreateTask: false,
    showEditPlan: false,
    showEditTask: false,
    editingTask: null
  });

  // Fetch farm plans
  const { 
    data: plans = [], 
    isLoading: plansLoading, 
    error: plansError 
  } = useQuery({
    queryKey: ['farm-plans'],
    queryFn: farmPlanService.getFarmPlans,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: farmPlanService.createFarmPlan,
    onSuccess: (newPlan) => {
      queryClient.invalidateQueries({ queryKey: ['farm-plans'] });
      setState(prev => ({ 
        ...prev, 
        showCreatePlan: false,
        selectedPlan: newPlan,
        view: 'plan-detail'
      }));
      toast.success('Farm plan created successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to create plan:', error);
      toast.error(error.message || 'Failed to create farm plan');
    }
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<FarmPlan> }) =>
      farmPlanService.updateFarmPlan(id, updates),
    onSuccess: (updatedPlan) => {
      queryClient.invalidateQueries({ queryKey: ['farm-plans'] });
      setState(prev => ({ 
        ...prev, 
        selectedPlan: updatedPlan,
        showEditPlan: false
      }));
      toast.success('Plan updated successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to update plan:', error);
      toast.error(error.message || 'Failed to update plan');
    }
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: farmPlanService.deleteFarmPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-plans'] });
      setState(prev => ({ 
        ...prev, 
        selectedPlan: null,
        view: 'dashboard'
      }));
      toast.success('Plan deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to delete plan:', error);
      toast.error(error.message || 'Failed to delete plan');
    }
  });

  // Create task mutation with optimistic updates
  const createTaskMutation = useMutation({
    mutationFn: farmPlanService.createFarmPlanTask,
    onMutate: async (newTask) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['farm-plans'] });

      // Snapshot previous value
      const previousPlans = queryClient.getQueryData<FarmPlan[]>(['farm-plans']);

      // Optimistically update
      if (previousPlans && state.selectedPlan) {
        const optimisticTask: PlanTask = {
          id: `temp-${Date.now()}`,
          plan_id: newTask.plan_id,
          field_id: newTask.field_id,
          title: newTask.title,
          description: newTask.description || '',
          due_date: newTask.due_date,
          priority: newTask.priority,
          category: newTask.category,
          status: 'pending',
          estimated_duration: newTask.estimated_duration,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const updatedPlans = previousPlans.map(plan =>
          plan.id === state.selectedPlan?.id
            ? { ...plan, tasks: [...plan.tasks, optimisticTask] }
            : plan
        );

        queryClient.setQueryData(['farm-plans'], updatedPlans);
        
        setState(prev => ({
          ...prev,
          selectedPlan: prev.selectedPlan ? {
            ...prev.selectedPlan,
            tasks: [...prev.selectedPlan.tasks, optimisticTask]
          } : null,
          showCreateTask: false
        }));
      }

      return { previousPlans };
    },
    onError: (error: any, newTask, context) => {
      // Revert optimistic update
      if (context?.previousPlans) {
        queryClient.setQueryData(['farm-plans'], context.previousPlans);
      }
      console.error('Failed to create task:', error);
      toast.error(error.message || 'Failed to create task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-plans'] });
    }
  });

  // Update task mutation with optimistic updates
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PlanTask> }) =>
      farmPlanService.updateFarmPlanTask(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['farm-plans'] });
      const previousPlans = queryClient.getQueryData<FarmPlan[]>(['farm-plans']);

      if (previousPlans && state.selectedPlan) {
        const updatedPlans = previousPlans.map(plan =>
          plan.id === state.selectedPlan?.id
            ? {
                ...plan,
                tasks: plan.tasks.map(task =>
                  task.id === id ? { ...task, ...updates } : task
                )
              }
            : plan
        );

        queryClient.setQueryData(['farm-plans'], updatedPlans);
        
        setState(prev => ({
          ...prev,
          selectedPlan: prev.selectedPlan ? {
            ...prev.selectedPlan,
            tasks: prev.selectedPlan.tasks.map(task =>
              task.id === id ? { ...task, ...updates } : task
            )
          } : null,
          showEditTask: false,
          editingTask: null
        }));
      }

      return { previousPlans };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousPlans) {
        queryClient.setQueryData(['farm-plans'], context.previousPlans);
      }
      console.error('Failed to update task:', error);
      toast.error(error.message || 'Failed to update task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-plans'] });
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: farmPlanService.deleteFarmPlanTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-plans'] });
      toast.success('Task deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to delete task:', error);
      toast.error(error.message || 'Failed to delete task');
    }
  });

  // Actions
  const actions = {
    // Plan actions
    createPlan: useCallback((plan: FarmPlanCreate) => {
      createPlanMutation.mutate(plan);
    }, [createPlanMutation]),

    updatePlan: useCallback((id: string, updates: Partial<FarmPlan>) => {
      updatePlanMutation.mutate({ id, updates });
    }, [updatePlanMutation]),

    deletePlan: useCallback((id: string) => {
      if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
        deletePlanMutation.mutate(id);
      }
    }, [deletePlanMutation]),

    selectPlan: useCallback((plan: FarmPlan) => {
      setState(prev => ({ 
        ...prev, 
        selectedPlan: plan, 
        view: 'plan-detail' 
      }));
    }, []),

    // Task actions
    createTask: useCallback((task: PlanTaskCreate) => {
      createTaskMutation.mutate(task);
    }, [createTaskMutation]),

    updateTask: useCallback((id: string, updates: Partial<PlanTask>) => {
      updateTaskMutation.mutate({ id, updates });
    }, [updateTaskMutation]),

    deleteTask: useCallback((id: string) => {
      if (window.confirm('Are you sure you want to delete this task?')) {
        deleteTaskMutation.mutate(id);
      }
    }, [deleteTaskMutation]),

    toggleTaskStatus: useCallback((id: string, currentStatus: PlanTask['status']) => {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      updateTaskMutation.mutate({ id, updates: { status: newStatus } });
    }, [updateTaskMutation]),

    // UI actions
    setView: useCallback((view: 'dashboard' | 'plan-detail') => {
      setState(prev => ({ ...prev, view }));
    }, []),

    openCreatePlan: useCallback(() => {
      setState(prev => ({ ...prev, showCreatePlan: true }));
    }, []),

    closeCreatePlan: useCallback(() => {
      setState(prev => ({ ...prev, showCreatePlan: false }));
    }, []),

    openEditPlan: useCallback(() => {
      setState(prev => ({ ...prev, showEditPlan: true }));
    }, []),

    closeEditPlan: useCallback(() => {
      setState(prev => ({ ...prev, showEditPlan: false }));
    }, []),

    openCreateTask: useCallback(() => {
      setState(prev => ({ ...prev, showCreateTask: true }));
    }, []),

    closeCreateTask: useCallback(() => {
      setState(prev => ({ ...prev, showCreateTask: false }));
    }, []),

    openEditTask: useCallback((task: PlanTask) => {
      setState(prev => ({ 
        ...prev, 
        showEditTask: true, 
        editingTask: task 
      }));
    }, []),

    closeEditTask: useCallback(() => {
      setState(prev => ({ 
        ...prev, 
        showEditTask: false, 
        editingTask: null 
      }));
    }, []),

    goToDashboard: useCallback(() => {
      setState(prev => ({ 
        ...prev, 
        view: 'dashboard', 
        selectedPlan: null 
      }));
    }, [])
  };

  return {
    // Data
    plans,
    selectedPlan: state.selectedPlan,
    
    // Loading states
    loading: plansLoading,
    creating: createPlanMutation.isPending,
    updating: updatePlanMutation.isPending,
    deleting: deletePlanMutation.isPending,
    
    // Error states
    error: plansError,
    
    // UI state
    view: state.view,
    showCreatePlan: state.showCreatePlan,
    showCreateTask: state.showCreateTask,
    showEditPlan: state.showEditPlan,
    showEditTask: state.showEditTask,
    editingTask: state.editingTask,
    
    // Actions
    ...actions
  };
}