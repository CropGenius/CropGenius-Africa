import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';


const Tasks = () => {
  const tasks = [
    { id: 1, title: 'Spray Field 3 for Blight', priority: 'urgent', status: 'pending', icon: AlertTriangle },
    { id: 2, title: 'Check Market Prices', priority: 'high', status: 'pending', icon: Clock },
    { id: 3, title: 'Water Field 1', priority: 'medium', status: 'completed', icon: CheckCircle }
  ];

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-amber-600 bg-amber-50';
      case 'medium': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Farm Tasks</h1>
      
      <div className="space-y-4">
        {tasks.map(task => {
          const Icon = task.icon;
          return (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getPriorityColor(task.priority)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{task.title}</h3>
                      <p className="text-sm text-gray-600 capitalize">{task.priority} priority</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      

    </div>
  );
};

export default Tasks;