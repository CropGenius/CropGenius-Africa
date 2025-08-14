export interface FarmPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  tasks: PlanTask[];
  created_at: string;
  updated_at: string;
}

export interface PlanTask {
  id: string;
  plan_id: string;
  field_id?: string;
  title: string;
  description?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  category: 'planting' | 'irrigation' | 'fertilizing' | 'harvesting' | 'pest_control' | 'other';
  status: 'pending' | 'in_progress' | 'completed';
  estimated_duration: number;
  created_at: string;
  updated_at: string;
}

export interface FarmPlanCreate {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status?: 'draft' | 'active' | 'completed' | 'archived';
}

export interface PlanTaskCreate {
  plan_id: string;
  field_id?: string;
  title: string;
  description?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  category: 'planting' | 'irrigation' | 'fertilizing' | 'harvesting' | 'pest_control' | 'other';
  estimated_duration: number;
}