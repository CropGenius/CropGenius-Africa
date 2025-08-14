# AI Farm Planning Resurrection - Technical Design

## Overview

This design resurrects the broken AI Farm Planning feature by fixing the core service layer, rebuilding the UI components, and creating a simple, intuitive user experience. The approach is surgical - fix what's broken, keep what works, and make it bulletproof.

## Architecture

### Database Schema (EXISTING - DO NOT CHANGE)

The existing database schema is correct and functional:

```sql
-- farm_plans table (KEEP AS IS)
farm_plans (
  id: bigint PRIMARY KEY,
  user_id: uuid REFERENCES auth.users,
  name: text NOT NULL,
  description: text,
  start_date: date NOT NULL,
  end_date: date NOT NULL,
  status: text DEFAULT 'draft',
  created_at: timestamptz DEFAULT now(),
  updated_at: timestamptz DEFAULT now()
)

-- farm_plan_tasks table (KEEP AS IS)
farm_plan_tasks (
  id: bigint PRIMARY KEY,
  plan_id: bigint REFERENCES farm_plans,
  title: text NOT NULL,
  description: text,
  due_date: date NOT NULL,
  priority: text DEFAULT 'medium',
  status: text DEFAULT 'pending',
  field_id: bigint REFERENCES fields,
  crop_type: text,
  estimated_hours: integer,
  completed_at: timestamptz,
  created_at: timestamptz DEFAULT now(),
  updated_at: timestamptz DEFAULT now()
)
```

### Service Layer Architecture

**Fixed FarmPlanService.ts** - The core issue is ID transformation between database (bigint) and frontend (string):

```typescript
interface FarmPlan {
  id: string;           // Convert from bigint
  user_id: string;
  name: string;
  description?: string;
  start_date: string;   // ISO date string
  end_date: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  tasks?: PlanTask[];
}

interface PlanTask {
  id: string;           // Convert from bigint
  plan_id: string;
  title: string;
  description?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  field_id?: string;
  crop_type?: string;
  estimated_hours?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

class FarmPlanService {
  // Transform database bigint IDs to frontend strings
  private transformPlan(plan: any): FarmPlan {
    return {
      ...plan,
      id: plan.id.toString(),
      start_date: plan.start_date,
      end_date: plan.end_date,
      created_at: plan.created_at,
      updated_at: plan.updated_at
    };
  }

  private transformTask(task: any): PlanTask {
    return {
      ...task,
      id: task.id.toString(),
      plan_id: task.plan_id.toString(),
      field_id: task.field_id?.toString(),
      due_date: task.due_date,
      completed_at: task.completed_at,
      created_at: task.created_at,
      updated_at: task.updated_at
    };
  }

  async getFarmPlans(): Promise<FarmPlan[]> {
    const { data, error } = await supabase
      .from('farm_plans')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(this.transformPlan) || [];
  }

  async createFarmPlan(plan: Omit<FarmPlan, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<FarmPlan> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('farm_plans')
      .insert({
        ...plan,
        user_id: user.user.id,
        status: plan.status || 'draft'
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformPlan(data);
  }

  // Additional CRUD methods...
}
```

## Component Architecture

### Simple Component Hierarchy

```
FarmPlanningPage
├── PlanDashboard (Main view)
│   ├── PlanStats (Quick overview)
│   ├── CreatePlanButton
│   └── PlanGrid
│       └── PlanCard (Individual plans)
└── PlanDetailView (When plan selected)
    ├── PlanHeader (Name, status, actions)
    ├── TaskSection
    │   ├── AddTaskButton
    │   └── TaskList
    │       └── TaskCard (Individual tasks)
    └── Modals (Create/Edit)
```

### State Management

**Simple useState approach** - No complex state management needed:

```typescript
interface FarmPlanningState {
  plans: FarmPlan[];
  currentPlan: FarmPlan | null;
  loading: boolean;
  error: string | null;
  view: 'dashboard' | 'plan-detail';
}

function useFarmPlanning() {
  const [state, setState] = useState<FarmPlanningState>({
    plans: [],
    currentPlan: null,
    loading: false,
    error: null,
    view: 'dashboard'
  });

  const loadPlans = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const plans = await farmPlanService.getFarmPlans();
      setState(prev => ({ ...prev, plans, loading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }));
    }
  };

  const selectPlan = (plan: FarmPlan) => {
    setState(prev => ({ ...prev, currentPlan: plan, view: 'plan-detail' }));
  };

  return { state, loadPlans, selectPlan };
}
```

## UI Design

### Plan Card Component

```typescript
function PlanCard({ plan, onSelect, onEdit, onDelete }) {
  const taskStats = useMemo(() => {
    const total = plan.tasks?.length || 0;
    const completed = plan.tasks?.filter(t => t.status === 'completed').length || 0;
    return { total, completed, progress: total > 0 ? (completed / total) * 100 : 0 };
  }, [plan.tasks]);

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader onClick={() => onSelect(plan)}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </div>
          <Badge variant={getStatusVariant(plan.status)}>
            {plan.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent onClick={() => onSelect(plan)}>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{format(new Date(plan.start_date), 'MMM dd')} - {format(new Date(plan.end_date), 'MMM dd')}</span>
            <span>{taskStats.completed}/{taskStats.total} tasks</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${taskStats.progress}%` }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(plan); }}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(plan.id); }}>
          <Trash className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Task Card Component

```typescript
function TaskCard({ task, onUpdate, onEdit, onDelete }) {
  const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed';

  const handleStatusToggle = () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    onUpdate(task.id, { status: newStatus });
  };

  return (
    <Card className={cn(
      "transition-all",
      task.status === 'completed' && "opacity-75",
      isOverdue && "border-red-300 bg-red-50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={task.status === 'completed'}
            onCheckedChange={handleStatusToggle}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className={cn(
                "font-medium",
                task.status === 'completed' && "line-through text-gray-500"
              )}>
                {task.title}
              </h4>
              <Badge variant={getPriorityVariant(task.priority)}>
                {task.priority}
              </Badge>
            </div>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span className={cn(isOverdue && "text-red-600 font-medium")}>
                Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
              </span>
              {task.estimated_hours && <span>{task.estimated_hours}h</span>}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Data Flow

### Simple Request-Response Pattern

```
User Action → Component → Service → Database → Service → Component → UI Update
```

**Example: Create Plan**
1. User clicks "New Plan" → Opens modal
2. User submits form → `createPlan(planData)`
3. Service calls → `supabase.from('farm_plans').insert()`
4. Database returns → New plan with bigint ID
5. Service transforms → Convert ID to string
6. Component updates → Add to plans list
7. UI re-renders → New plan appears

### Optimistic Updates for Tasks

```typescript
const updateTask = async (taskId: string, updates: Partial<PlanTask>) => {
  // Optimistic update
  setTasks(prev => prev.map(task => 
    task.id === taskId ? { ...task, ...updates } : task
  ));

  try {
    await farmPlanService.updateTask(taskId, updates);
  } catch (error) {
    // Revert on error
    setTasks(prev => prev.map(task => 
      task.id === taskId ? task : task
    ));
    toast.error('Failed to update task');
  }
};
```

## Error Handling

### Service Layer Errors

```typescript
class FarmPlanServiceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'FarmPlanServiceError';
  }
}

// In service methods
try {
  const { data, error } = await supabase.from('farm_plans').select('*');
  if (error) throw new FarmPlanServiceError('Failed to fetch plans', 'FETCH_ERROR');
  return data?.map(this.transformPlan) || [];
} catch (error) {
  if (error instanceof FarmPlanServiceError) throw error;
  throw new FarmPlanServiceError('Unexpected error', 'UNKNOWN_ERROR');
}
```

### Component Error Boundaries

```typescript
function FarmPlanningErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Something went wrong
        </h2>
        <Button onClick={() => setHasError(false)}>
          Try Again
        </Button>
      </div>
    );
  }

  return children;
}
```

## Mobile Responsiveness

### Responsive Grid

```css
.plan-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .plan-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .plan-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Touch-Friendly Interactions

- Minimum 44px touch targets
- Swipe gestures for task completion
- Long press for context menus
- Pull-to-refresh for plan updates

## Performance Considerations

### Lazy Loading

```typescript
const PlanDetailView = lazy(() => import('./PlanDetailView'));

// In component
<Suspense fallback={<div>Loading...</div>}>
  <PlanDetailView plan={currentPlan} />
</Suspense>
```

### Pagination for Large Lists

```typescript
const usePaginatedPlans = (pageSize = 20) => {
  const [plans, setPlans] = useState<FarmPlan[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    const newPlans = await farmPlanService.getFarmPlans({
      offset: plans.length,
      limit: pageSize
    });
    setPlans(prev => [...prev, ...newPlans]);
    setHasMore(newPlans.length === pageSize);
  };

  return { plans, loadMore, hasMore };
};
```

## Testing Strategy

### Service Layer Tests

```typescript
describe('FarmPlanService', () => {
  it('should transform bigint IDs to strings', async () => {
    const mockPlan = { id: 1, name: 'Test Plan' };
    supabase.from.mockReturnValue({
      select: () => ({ data: [mockPlan], error: null })
    });

    const result = await farmPlanService.getFarmPlans();
    expect(result[0].id).toBe('1');
  });
});
```

### Component Tests

```typescript
describe('PlanCard', () => {
  it('should display plan information', () => {
    render(<PlanCard plan={mockPlan} onSelect={jest.fn()} />);
    expect(screen.getByText('Test Plan')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<PlanCard plan={mockPlan} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Test Plan'));
    expect(onSelect).toHaveBeenCalledWith(mockPlan);
  });
});
```

## Deployment Strategy

### Feature Flag

```typescript
const FEATURE_FLAGS = {
  FARM_PLANNING_V2: process.env.REACT_APP_ENABLE_FARM_PLANNING === 'true'
};

// Gradual rollout
if (!FEATURE_FLAGS.FARM_PLANNING_V2) {
  return <LegacyFarmPlanning />;
}
return <NewFarmPlanning />;
```

This design provides a clean, simple, and bulletproof resurrection of the AI Farm Planning feature. The focus is on fixing the core issues while maintaining simplicity and reliability.