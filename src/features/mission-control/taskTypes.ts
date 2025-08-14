/**
 * 🔥 ENHANCED TASK TYPES - BACKWARD COMPATIBLE WITH GENIUS SYSTEM
 * Maintains compatibility with existing database while adding INFINITY IQ features
 */

import { GeniusTask, TaskType, TaskCategory, TaskPriority as GeniusTaskPriority, TaskStatus as GeniusTaskStatus } from '@/types/geniusTask';

// Legacy priority mapping for database compatibility
export type TaskPriority = 1 | 2 | 3;
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Enhanced Task interface - PRODUCTION READY
export interface Task {
  id: string; // UUID
  title: string;
  description?: string | null;
  field_id: string; // UUID, Foreign Key to fields table
  assigned_to?: string | null; // UUID, Foreign Key to auth.users table
  due_date?: string | null; // TIMESTAMPTZ
  status: TaskStatus;
  priority: TaskPriority;
  created_by?: string | null; // UUID, Foreign Key to auth.users table
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  
  // NEW GENIUS FEATURES - OPTIONAL FOR BACKWARD COMPATIBILITY
  task_type?: TaskType;
  category?: TaskCategory;
  estimated_duration?: number; // minutes
  fpsi_impact_points?: number;
  confidence_score?: number;
  generation_source?: string;
  completion_data?: any; // JSON data
  user_feedback?: any; // JSON data
}

// Conversion utilities between legacy and genius systems
export const convertToGeniusTask = (task: Task): Partial<GeniusTask> => ({
  id: task.id,
  title: task.title,
  description: task.description || '',
  fieldId: task.field_id,
  status: mapLegacyStatusToGenius(task.status),
  priority: mapLegacyPriorityToGenius(task.priority),
  createdAt: new Date(task.created_at),
  updatedAt: new Date(task.updated_at),
  type: task.task_type || TaskType.CROP_MANAGEMENT,
  category: task.category || TaskCategory.MONITORING,
  estimatedDuration: task.estimated_duration || 30,
  fpsiImpactPoints: task.fpsi_impact_points || 0,
  confidenceScore: task.confidence_score || 0.8,
  completionData: task.completion_data,
  userFeedback: task.user_feedback
});

export const mapLegacyStatusToGenius = (status: TaskStatus): GeniusTaskStatus => {
  switch (status) {
    case 'pending': return GeniusTaskStatus.PENDING;
    case 'in_progress': return GeniusTaskStatus.IN_PROGRESS;
    case 'completed': return GeniusTaskStatus.COMPLETED;
    case 'cancelled': return GeniusTaskStatus.SKIPPED;
    default: return GeniusTaskStatus.PENDING;
  }
};

export const mapLegacyPriorityToGenius = (priority: TaskPriority): GeniusTaskPriority => {
  switch (priority) {
    case 1: return GeniusTaskPriority.HIGH;
    case 2: return GeniusTaskPriority.MEDIUM;
    case 3: return GeniusTaskPriority.LOW;
    default: return GeniusTaskPriority.MEDIUM;
  }
};

// Helper function to map schema integer priority to string for display (optional)
export const mapPriorityToDisplay = (priority: TaskPriority): string => {
  switch (priority) {
    case 1: return 'High';
    case 2: return 'Medium';
    case 3: return 'Low';
    default: return 'Unknown';
  }
};

export const mapDisplayPriorityToInteger = (priority: string): TaskPriority => {
  switch (priority.toLowerCase()) {
    case 'high':
    case 'urgent': // Assuming urgent maps to high
      return 1;
    case 'medium':
    case 'important': // Assuming important maps to medium
      return 2;
    case 'low':
    case 'routine': // Assuming routine maps to low
      return 3;
    default:
      return 2; // Default to medium
  }
}
