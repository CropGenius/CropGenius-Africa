/**
 * 🔥 ORGANIC PROGRESS DASHBOARD - CERTIFICATION JOURNEY VISUALIZATION
 * Visual progress tracking for organic readiness and certification milestones
 * Built to make farmers feel like they're leveling up in a game
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  TrendingUp, 
  Target, 
  Trophy, 
  Award, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Zap,
  Star,
  Calendar,
  MapPin,
  Leaf,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Crown,
  Medal,
  Gift
} from 'lucide-react';
import { organicScoringEngine, CertificationProgress } from '../../services/OrganicScoringEngine';
import { useSimpleAuthContext as useAuth } from '@/providers/SimpleAuthProvider';

interface OrganicProgressDashboardProps {
  className?: string;
}

export const OrganicProgressDashboard: React.FC<OrganicProgressDashboardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<CertificationProgress | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;
    
    try {
      const certificationProgress = await organicScoringEngine.calculateOrganicScore(user.id);
      setProgress(certificationProgress);
      
      // Show celebration if user reached a milestone
      if (certificationProgress.overallScore >= 80 && certificationProgress.certificationReadiness) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    } catch (error) {
      console.error('Failed to load organic progress:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    if (score >= 40) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const getLevelInfo = (score: number) => {
    if (score >= 90) return { level: 'Organic Master', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-100' };
    if (score >= 80) return { level: 'Organic Expert', icon: Trophy, color: 'text-gold-600', bg: 'bg-yellow-100' };
    if (score >= 70) return { level: 'Organic Pro', icon: Medal, color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 60) return { level: 'Organic Farmer', icon: Award, color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 40) return { level: 'Organic Learner', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Organic Seedling', icon: Leaf, color: 'text-gray-600', bg: 'bg-gray-100' };
  };



  if (!progress) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Organic Progress Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Leaf className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 mb-4">Add fields to start tracking your organic progress!</p>
            <Button onClick={() => window.location.href = '/fields'} className="bg-green-600 hover:bg-green-700">
              Add Your First Field
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const levelInfo = getLevelInfo(progress.overallScore);
  const LevelIcon = levelInfo.icon;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-500">
          <Card className="bg-gradient-to-r from-green-100 to-emerald-100 border-green-300 shadow-2xl animate-bounce">
            <CardContent className="text-center py-8 px-12">
              <Trophy className="h-20 w-20 mx-auto mb-4 text-yellow-500 animate-spin" />
              <h2 className="text-2xl font-bold text-green-800 mb-2">🎉 CERTIFICATION READY! 🎉</h2>
              <p className="text-green-700 mb-4">You've achieved organic certification readiness!</p>
              <Sparkles className="h-8 w-8 mx-auto text-yellow-500 animate-pulse" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Progress Header */}
      <Card className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Organic Journey
              </span>
            </div>
            <div className="flex gap-2">
              {['week', 'month', 'year'].map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe as any)}
                  className={selectedTimeframe === timeframe ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Button>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Level and Overall Score */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Current Level */}
            <div className={`p-6 rounded-lg ${levelInfo.bg} border-2 border-opacity-20`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <LevelIcon className={`h-8 w-8 ${levelInfo.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{levelInfo.level}</h3>
                  <p className="text-sm text-gray-600">Current Level</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Progress to next level</span>
                <span className="text-sm font-bold text-gray-800">{Math.min(100, progress.overallScore + 10)}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${getScoreBgColor(progress.overallScore)}`}
                  style={{ width: `${Math.min(100, (progress.overallScore % 20) * 5)}%` }}
                ></div>
              </div>
            </div>

            {/* Overall Score */}
            <div className="p-6 bg-white rounded-lg border-2 border-gray-100 shadow-sm">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress.overallScore / 100)}`}
                      className={getScoreColor(progress.overallScore)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${getScoreColor(progress.overallScore)}`}>
                      {progress.overallScore}%
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Organic Readiness</h3>
                <p className="text-sm text-gray-600">Overall Score</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-xl font-bold text-green-600">+{progress.marketPremiumPotential}%</div>
              <div className="text-xs text-gray-600">Market Premium</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
              <CheckCircle className={`h-6 w-6 mx-auto mb-2 ${progress.certificationReadiness ? 'text-green-600' : 'text-gray-400'}`} />
              <div className={`text-sm font-bold ${progress.certificationReadiness ? 'text-green-600' : 'text-gray-600'}`}>
                {progress.certificationReadiness ? 'READY!' : 'In Progress'}
              </div>
              <div className="text-xs text-gray-600">Certification</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-sm font-bold text-blue-600">
                {progress.estimatedCertificationDate ? 
                  Math.ceil((progress.estimatedCertificationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) + ' days' : 
                  'TBD'
                }
              </div>
              <div className="text-xs text-gray-600">To Certification</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-sm font-bold text-purple-600">
                {Object.values(progress.categoryBreakdown).filter(cat => cat.score >= 80).length}/
                {Object.keys(progress.categoryBreakdown).length}
              </div>
              <div className="text-xs text-gray-600">Categories Ready</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-green-600" />
            Category Progress Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(progress.categoryBreakdown).map(([key, category]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-800 capitalize flex items-center gap-2">
                    {category.score >= 80 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${getScoreColor(category.score)}`}>
                      {category.score}%
                    </span>
                    {category.score >= 80 && <Trophy className="h-4 w-4 text-yellow-500" />}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${getScoreBgColor(category.score)}`}
                    style={{ width: `${category.score}%` }}
                  ></div>
                </div>
                
                {category.nextSteps.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-600 mb-2">Next Steps:</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      {category.nextSteps.slice(0, 2).map((step, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ArrowUp className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths and Improvement Areas */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        {progress.strengths.length > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Trophy className="h-5 w-5" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {progress.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3 text-green-700">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        
        {/* Areas for Improvement */}
        {progress.complianceGaps.length > 0 && (
          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Target className="h-5 w-5" />
                Focus Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {progress.complianceGaps.map((gap, index) => (
                  <li key={index} className="flex items-start gap-3 text-orange-700">
                    <ArrowUp className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{gap}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Next Milestone */}
      <Card className="w-full bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Gift className="h-5 w-5" />
            Next Milestone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{progress.nextMilestone}</h3>
              {progress.estimatedCertificationDate && (
                <p className="text-sm text-gray-600">
                  Estimated completion: {progress.estimatedCertificationDate.toLocaleDateString()}
                </p>
              )}
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Zap className="h-4 w-4 mr-2" />
              Take Action
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Motivation Footer */}
      <Card className="w-full bg-gradient-to-r from-green-100 to-blue-100 border-green-200">
        <CardContent className="text-center py-6">
          <Sparkles className="h-8 w-8 mx-auto mb-3 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            🌟 You're {100 - progress.overallScore}% away from organic mastery!
          </h3>
          <p className="text-gray-600 mb-4">
            Every action you take brings you closer to premium markets and sustainable success.
          </p>
          <Button onClick={loadProgress} className="bg-green-600 hover:bg-green-700">
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh Progress
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};