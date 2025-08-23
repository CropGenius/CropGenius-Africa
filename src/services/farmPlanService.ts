import { supabase } from '@/integrations/supabase/client';
import type { FarmPlan, PlanTask, FarmPlanCreate, PlanTaskCreate } from '@/types/farmPlan';

class FarmPlanServiceError extends Error {
  constructor(message: string, public code: string, public statusCode?: number) {
    super(message);
    this.name = 'FarmPlanServiceError';
  }
}

export const farmPlanService = {
  // Transform database plan to frontend format (SCHEMA-PERFECT)
  transformPlan(plan: any): FarmPlan {
    return {
      id: plan.id, // BIGINT PRIMARY KEY
      user_id: plan.user_id, // UUID FK to auth.users
      name: plan.name, // TEXT NOT NULL - actual column name
      description: plan.description || '',
      start_date: plan.start_date || new Date().toISOString().split('T')[0],
      end_date: plan.end_date || new Date().toISOString().split('T')[0],
      status: plan.status || 'draft',
      created_at: plan.created_at,
      updated_at: plan.updated_at || plan.created_at,
      tasks: plan.farm_plan_tasks?.map(farmPlanService.transformTask) || []
    };
  },

  // Transform database task to frontend format (SCHEMA-PERFECT)
  transformTask(task: any): PlanTask {
    return {
      id: task.id, // UUID PRIMARY KEY
      plan_id: task.plan_id, // UUID FK to farm_plans
      field_id: task.field_id || undefined, // Not in current schema
      title: task.title, // TEXT NOT NULL
      description: task.description || '', // TEXT NULLABLE
      due_date: task.due_date || new Date().toISOString().split('T')[0], // DATE NULLABLE
      priority: task.priority || 'medium', // TEXT DEFAULT 'medium'
      category: task.category || 'other', // Not in current schema, using default
      status: task.status || 'pending', // TEXT DEFAULT 'pending'
      estimated_duration: task.estimated_duration || 2, // Not in current schema
      created_at: task.created_at, // TIMESTAMPTZ DEFAULT now()
      updated_at: task.updated_at || task.created_at // TIMESTAMPTZ DEFAULT now()
    };
  },

  // Get all farm plans for current user
  async getFarmPlans(): Promise<FarmPlan[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new FarmPlanServiceError('Not authenticated', 'AUTH_ERROR', 401);

      // Fetch farm plans first
      const { data: plans, error: plansError } = await supabase
        .from('farm_plans')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (plansError) {
        console.error('Database error:', plansError);
        throw new FarmPlanServiceError('Failed to fetch farm plans', 'FETCH_ERROR', 500);
      }

      if (!plans || plans.length === 0) {
        return [];
      }

      // Fetch tasks for all plans
      const planIds = plans.map(plan => plan.id);
      const { data: tasks, error: tasksError } = await supabase
        .from('farm_plan_tasks')
        .select('*')
        .in('plan_id', planIds);

      if (tasksError) {
        console.error('Database error fetching tasks:', tasksError);
        // Don't fail completely, just return plans without tasks
      }

      // Group tasks by plan_id
      const tasksByPlanId = (tasks || []).reduce((acc, task) => {
        const planId = task.plan_id;
        if (!acc[planId]) acc[planId] = [];
        acc[planId].push(task);
        return acc;
      }, {} as Record<string, any[]>);

      // Combine plans with their tasks
      return plans.map(plan => farmPlanService.transformPlan({
        ...plan,
        farm_plan_tasks: tasksByPlanId[plan.id] || []
      }));
    } catch (error) {
      if (error instanceof FarmPlanServiceError) throw error;
      console.error('Unexpected error:', error);
      throw new FarmPlanServiceError('Unexpected error while fetching plans', 'UNKNOWN_ERROR', 500);
    }
  },

  // Create new farm plan
  async createFarmPlan(plan: FarmPlanCreate): Promise<FarmPlan> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new FarmPlanServiceError('Not authenticated', 'AUTH_ERROR', 401);

      // Build payload with ACTUAL schema mapping (verified via Supabase MCP)
      const payload = {
        name: plan.name || 'Untitled Plan', // TEXT NOT NULL - actual column name
        description: plan.description || null, // TEXT NULLABLE
        start_date: plan.start_date, // DATE NOT NULL
        end_date: plan.end_date, // DATE NOT NULL
        user_id: user.user.id, // UUID NOT NULL (FK to auth.users)
        status: plan.status || 'draft' // TEXT DEFAULT 'draft'
      };

      const { data, error } = await supabase
        .from('farm_plans')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new FarmPlanServiceError('Failed to create farm plan', 'CREATE_ERROR', 500);
      }

      return farmPlanService.transformPlan({ ...data, farm_tasks: [] });
    } catch (error) {
      if (error instanceof FarmPlanServiceError) throw error;
      console.error('Unexpected error:', error);
      throw new FarmPlanServiceError('Unexpected error while creating plan', 'UNKNOWN_ERROR', 500);
    }
  },

  // Update farm plan
  async updateFarmPlan(id: string, updates: Partial<FarmPlan>): Promise<FarmPlan> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new FarmPlanServiceError('Not authenticated', 'AUTH_ERROR', 401);

      // Map frontend fields to ACTUAL database columns
      const payload: any = {};
      if (updates.name) payload.name = updates.name; // Use actual 'name' column
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.start_date) payload.start_date = updates.start_date;
      if (updates.end_date) payload.end_date = updates.end_date;
      if (updates.status) payload.status = updates.status;
      payload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('farm_plans')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.user.id) // Ensure user owns the plan
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new FarmPlanServiceError('Failed to update farm plan', 'UPDATE_ERROR', 500);
      }

      return farmPlanService.transformPlan({ ...data, farm_tasks: [] });
    } catch (error) {
      if (error instanceof FarmPlanServiceError) throw error;
      console.error('Unexpected error:', error);
      throw new FarmPlanServiceError('Unexpected error while updating plan', 'UNKNOWN_ERROR', 500);
    }
  },

  // Delete farm plan
  async deleteFarmPlan(id: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new FarmPlanServiceError('Not authenticated', 'AUTH_ERROR', 401);

      const { error } = await supabase
        .from('farm_plans')
        .delete()
        .eq('id', id)
        .eq('user_id', user.user.id); // Ensure user owns the plan

      if (error) {
        console.error('Database error:', error);
        throw new FarmPlanServiceError('Failed to delete farm plan', 'DELETE_ERROR', 500);
      }
    } catch (error) {
      if (error instanceof FarmPlanServiceError) throw error;
      console.error('Unexpected error:', error);
      throw new FarmPlanServiceError('Unexpected error while deleting plan', 'UNKNOWN_ERROR', 500);
    }
  },

  // Create farm plan task
  async createFarmPlanTask(task: PlanTaskCreate): Promise<PlanTask> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new FarmPlanServiceError('Not authenticated', 'AUTH_ERROR', 401);

      // Verify user owns the plan
      const { data: plan } = await supabase
        .from('farm_plans')
        .select('id')
        .eq('id', task.plan_id)
        .eq('user_id', user.user.id)
        .single();

      if (!plan) throw new FarmPlanServiceError('Plan not found or access denied', 'ACCESS_ERROR', 403);

      const payload = {
        plan_id: task.plan_id, // UUID FK to farm_plans
        title: task.title, // TEXT NOT NULL
        description: task.description || null, // TEXT NULLABLE
        due_date: task.due_date, // DATE NULLABLE
        priority: task.priority || 'medium', // TEXT DEFAULT 'medium'
        status: 'pending' // TEXT DEFAULT 'pending'
        // Note: estimated_duration, category, field_id not in current schema
      };

      const { data, error } = await supabase
        .from('farm_plan_tasks')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new FarmPlanServiceError('Failed to create task', 'CREATE_TASK_ERROR', 500);
      }

      return farmPlanService.transformTask(data);
    } catch (error) {
      if (error instanceof FarmPlanServiceError) throw error;
      console.error('Unexpected error:', error);
      throw new FarmPlanServiceError('Unexpected error while creating task', 'UNKNOWN_ERROR', 500);
    }
  },

  // Update farm plan task
  async updateFarmPlanTask(id: string, updates: Partial<PlanTask>): Promise<PlanTask> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new FarmPlanServiceError('Not authenticated', 'AUTH_ERROR', 401);

      const payload: any = {};
      if (updates.title) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.due_date) payload.due_date = updates.due_date;
      if (updates.priority) payload.priority = updates.priority;
      if (updates.status) payload.status = updates.status;
      if (updates.estimated_duration) payload.estimated_duration = updates.estimated_duration;
      payload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('farm_plan_tasks')
        .update(payload)
        .eq('id', id)
        .select(`
          *,
          farm_plans!inner(user_id)
        `)
        .single();

      if (error || !data) {
        console.error('Database error:', error);
        throw new FarmPlanServiceError('Failed to update task', 'UPDATE_TASK_ERROR', 500);
      }

      // Verify user owns the plan
      if (data.farm_plans.user_id !== user.user.id) {
        throw new FarmPlanServiceError('Access denied', 'ACCESS_ERROR', 403);
      }

      return farmPlanService.transformTask(data);
    } catch (error) {
      if (error instanceof FarmPlanServiceError) throw error;
      console.error('Unexpected error:', error);
      throw new FarmPlanServiceError('Unexpected error while updating task', 'UNKNOWN_ERROR', 500);
    }
  },

  // Delete farm plan task
  async deleteFarmPlanTask(id: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new FarmPlanServiceError('Not authenticated', 'AUTH_ERROR', 401);

      const { error } = await supabase
        .from('farm_plan_tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Database error:', error);
        throw new FarmPlanServiceError('Failed to delete task', 'DELETE_TASK_ERROR', 500);
      }
    } catch (error) {
      if (error instanceof FarmPlanServiceError) throw error;
      console.error('Unexpected error:', error);
      throw new FarmPlanServiceError('Unexpected error while deleting task', 'UNKNOWN_ERROR', 500);
    }
  }
};