import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FieldSuccessProps {
    fieldName: string;
    onContinue: () => void;
}

export default function FieldSuccess({ fieldName, onContinue }: FieldSuccessProps) {
    // Generate confetti
    const confetti = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        color: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'][i % 4],
        delay: Math.random() * 2,
        x: Math.random() * 100,
        y: Math.random() * 20
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden flex items-center justify-center">
            {/* Confetti */}
            {confetti.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute w-2 h-2 rounded-full"
                    style={{ backgroundColor: particle.color, left: `${particle.x}%`, top: `${particle.y}%` }}
                    initial={{ scale: 0, y: 0 }}
                    animate={{ scale: [0, 1, 0], y: [0, -100, 300] }}
                    transition={{ duration: 3, delay: particle.delay }}
                />
            ))}

            <div className="text-center max-w-lg mx-auto px-6">
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-gray-900 mb-4"
                >
                    🎉 {fieldName} Created!
                </motion.h1>

                {/* Main Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-lg p-6 shadow-lg mb-6"
                >
                    <div className="flex items-center justify-center mb-3">
                        <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
                        <h2 className="text-xl font-semibold">CropGenius is Now Watching</h2>
                    </div>
                    <p className="text-gray-700 mb-4">
                        Our AI will monitor your field 24/7 using satellite imagery and machine learning to:
                    </p>
                    <div className="space-y-2 text-left">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                            <span className="text-sm">Guide you to go organic</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            <span className="text-sm">Send smart notifications</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                            <span className="text-sm">Predict optimal actions</span>
                        </div>
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Button
                        onClick={onContinue}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white px-8"
                    >
                        View My Field
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}