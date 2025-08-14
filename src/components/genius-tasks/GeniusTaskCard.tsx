/**
 * 🎯 GENIUS TASK CARD - BEAUTIFUL UI FOR FARMERS
 * Individual task card with CLEAN UI + SUPABASE BACKEND = REAL MAGIC ✨
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, ChevronDown, ChevronUp, Zap, Target, Droplets, Shield, Eye, Sprout } from 'lucide-react';
import { GeniusTask, TaskPriority, TaskStatus } from '@/types/geniusTask';
import { motion } from 'framer-motion';

interface GeniusTaskCardProps {
    task: GeniusTask;
    onComplete: () => void;
    onSkip: (reason: string) => void;
    onViewDetails: () => void;
}

const TASK_ICONS = {
    droplets: Droplets,
    'shield-check': Shield,
    eye: Eye,
    seedling: Sprout,
    target: Target,
    zap: Zap
};

const PRIORITY_COLORS = {
    [TaskPriority.CRITICAL]: 'border-red-500 bg-red-50',
    [TaskPriority.HIGH]: 'border-orange-500 bg-orange-50',
    [TaskPriority.MEDIUM]: 'border-blue-500 bg-blue-50',
    [TaskPriority.LOW]: 'border-gray-500 bg-gray-50'
};

const PRIORITY_LABELS = {
    [TaskPriority.CRITICAL]: 'Critical',
    [TaskPriority.HIGH]: 'High',
    [TaskPriority.MEDIUM]: 'Medium',
    [TaskPriority.LOW]: 'Low'
};

export const GeniusTaskCard: React.FC<GeniusTaskCardProps> = ({
    task,
    onComplete,
    onSkip,
    onViewDetails
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    const IconComponent = TASK_ICONS[task.iconName as keyof typeof TASK_ICONS] || Target;
    const priorityColor = PRIORITY_COLORS[task.priority];
    const priorityLabel = PRIORITY_LABELS[task.priority];

    const handleComplete = async () => {
        setIsCompleting(true);
        try {
            onComplete();
        } finally {
            setIsCompleting(false);
        }
    };

    const handleSkip = () => {
        const reason = prompt('Why are you skipping this task?') || 'No reason provided';
        onSkip(reason);
    };

    if (task.status === TaskStatus.COMPLETED) {
        return (
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0.7, scale: 0.98 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 line-through">{task.title}</h4>
                                <p className="text-sm text-green-600">
                                    ✅ Completed • +{task.fpsiImpactPoints} FPSI points earned
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <Card className={`${priorityColor} border-2 hover:shadow-lg transition-all duration-200`}>
                <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start space-x-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${task.colorScheme?.background || 'bg-blue-100'
                            }`}>
                            <IconComponent className={`h-5 w-5 ${task.colorScheme?.primary ? `text-[${task.colorScheme.primary}]` : 'text-blue-600'
                                }`} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900 truncate">{task.title}</h4>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${task.priority === TaskPriority.CRITICAL ? 'bg-red-100 text-red-700' :
                                        task.priority === TaskPriority.HIGH ? 'bg-orange-100 text-orange-700' :
                                            task.priority === TaskPriority.MEDIUM ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {priorityLabel}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>

                            {/* Metadata */}
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {task.estimatedDuration}min
                                </div>
                                <div className="flex items-center">
                                    <Zap className="h-3 w-3 mr-1" />
                                    +{task.fpsiImpactPoints} FPSI
                                </div>
                                {task.fieldName && (
                                    <div className="flex items-center">
                                        <Target className="h-3 w-3 mr-1" />
                                        {task.fieldName}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t pt-3 mt-3"
                        >
                            {task.detailedInstructions && (
                                <div className="mb-3">
                                    <h5 className="font-medium text-gray-900 mb-1">Instructions:</h5>
                                    <p className="text-sm text-gray-600">{task.detailedInstructions}</p>
                                </div>
                            )}

                            {task.actionSteps && task.actionSteps.length > 0 && (
                                <div className="mb-3">
                                    <h5 className="font-medium text-gray-900 mb-1">Steps:</h5>
                                    <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                                        {task.actionSteps.map((step, index) => (
                                            <li key={index}>{step}</li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            <div className="bg-white rounded-lg p-3">
                                <h5 className="font-medium text-gray-900 mb-2">Expected Impact:</h5>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-gray-500">Yield Impact:</span>
                                        <span className="ml-1 font-medium text-green-600">+{task.expectedImpact.yieldImpact}%</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Risk Reduction:</span>
                                        <span className="ml-1 font-medium text-blue-600">{task.expectedImpact.riskReduction}%</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            {isExpanded ? (
                                <>Less <ChevronUp className="h-4 w-4 ml-1" /></>
                            ) : (
                                <>Details <ChevronDown className="h-4 w-4 ml-1" /></>
                            )}
                        </Button>

                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSkip}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                Skip
                            </Button>
                            <Button
                                onClick={handleComplete}
                                disabled={isCompleting}
                                className={`${task.priority === TaskPriority.CRITICAL ? 'bg-red-600 hover:bg-red-700' :
                                    task.priority === TaskPriority.HIGH ? 'bg-orange-600 hover:bg-orange-700' :
                                        'bg-blue-600 hover:bg-blue-700'
                                    } text-white`}
                            >
                                {isCompleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Completing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Complete
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};