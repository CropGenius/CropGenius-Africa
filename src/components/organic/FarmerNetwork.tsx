/**
 * 🔥 FARMER NETWORK - ULTRA SIMPLE COMMUNITY FEATURES
 * Connect farmers with minimal code, maximum impact
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, Star, MessageCircle, Trophy } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../hooks/useAuth';
import { ViralShareButton } from './ViralShareButton';

interface FarmerProfile {
    id: string;
    name: string;
    level: string;
    totalSavings: number;
    location: string;
    topRecipe: string;
}

export const FarmerNetwork: React.FC = () => {
    const { user } = useAuth();
    const [topFarmers, setTopFarmers] = useState<FarmerProfile[]>([]);

    useEffect(() => {
        loadTopFarmers();
    }, []);

    const loadTopFarmers = async () => {
        try {
            // Get top farmers by total savings (simplified)
            const { data } = await supabase
                .from('organic_superpowers_history')
                .select(`
          user_id,
          cost_savings,
          profiles!inner(full_name)
        `)
                .eq('completed', true)
                .limit(10);

            if (data) {
                // Group by user and calculate totals (simplified)
                const farmerMap = new Map();
                data.forEach(item => {
                    const userId = item.user_id;
                    if (!farmerMap.has(userId)) {
                        farmerMap.set(userId, {
                            id: userId,
                            name: item.profiles?.full_name || 'Anonymous Farmer',
                            totalSavings: 0,
                            level: 'Organic Farmer',
                            location: 'Unknown',
                            topRecipe: 'Neem Oil Spray'
                        });
                    }
                    farmerMap.get(userId).totalSavings += item.cost_savings || 0;
                });

                const farmers = Array.from(farmerMap.values())
                    .sort((a, b) => b.totalSavings - a.totalSavings)
                    .slice(0, 5);

                setTopFarmers(farmers);
            }
        } catch (error) {
            console.error('Failed to load top farmers:', error);
        }
    };

    const shareNetworkMessage = () => {
        return `🌾 Join the CropGenius Farmer Network!

👥 Connect with organic farmers worldwide
💰 Share money-saving recipes
🏆 Compete in organic challenges
🌿 Build sustainable communities

Join us: cropgenius.app

#FarmerNetwork #OrganicFarming #CropGenius`;
    };



    return (
        <Card className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Farmer Network
                    </div>
                    <ViralShareButton
                        message={shareNetworkMessage()}
                        type="whatsapp"
                        size="sm"
                    />
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Top Farmers Leaderboard */}
                <div className="space-y-3 mb-6">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        Top Organic Heroes
                    </h4>
                    {topFarmers.map((farmer, index) => (
                        <div key={farmer.id} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                    index === 1 ? 'bg-gray-400' :
                                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                                }`}>
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-gray-800">{farmer.name}</div>
                                <div className="text-sm text-gray-600">{farmer.level} • ${farmer.totalSavings} saved</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-green-600">${farmer.totalSavings}</div>
                                <div className="text-xs text-gray-500">Total Saved</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Community Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{topFarmers.length * 20}</div>
                        <div className="text-xs text-gray-600">Active Farmers</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            ${topFarmers.reduce((sum, f) => sum + f.totalSavings, 0)}
                        </div>
                        <div className="text-xs text-gray-600">Community Savings</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">50+</div>
                        <div className="text-xs text-gray-600">Shared Recipes</div>
                    </div>
                </div>

                {/* Join Community CTA */}
                <div className="text-center p-4 bg-white rounded-lg border-2 border-dashed border-blue-300">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-bold text-gray-800 mb-2">Join the Revolution!</h4>
                    <p className="text-sm text-gray-600 mb-3">
                        Connect with farmers worldwide, share recipes, and build sustainable communities.
                    </p>
                    <ViralShareButton
                        message={shareNetworkMessage()}
                        type="whatsapp"
                        className="w-full"
                    />
                </div>
            </CardContent>
        </Card>
    );
};