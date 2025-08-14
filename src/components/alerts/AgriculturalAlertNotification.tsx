/**
 * 🚨 AGRICULTURAL ALERT NOTIFICATION - LIQUID GLASS PERFECTION
 * Beautiful, expandable notifications for 100 million farmers
 * FLAWLESS UI - Click to expand for detailed advice
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Button } from '@/components/ui/button';
import { AgriculturalAlert } from '@/services/AlertSystem';
import { Clock, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';

interface AgriculturalAlertNotificationProps {
  alert: AgriculturalAlert;
  onDismiss?: () => void;
}

export const AgriculturalAlertNotification: React.FC<AgriculturalAlertNotificationProps> = ({
  alert,
  onDismiss
}) => {
  const navigate = useNavigate();

  // Get alert styling based on urgency
  const getAlertStyling = (urgencyLevel: number) => {
    switch (urgencyLevel) {
      case 5: return {
        bgGradient: 'from-red-500/20 via-red-400/15 to-red-600/20',
        borderColor: 'border-red-400/30',
        glowColor: 'xl',
        icon: '🚨',
        urgencyText: 'EMERGENCY',
        urgencyColor: 'text-red-600'
      };
      case 4: return {
        bgGradient: 'from-orange-500/20 via-orange-400/15 to-red-500/20',
        borderColor: 'border-orange-400/30',
        glowColor: 'lg',
        icon: '⚠️',
        urgencyText: 'URGENT',
        urgencyColor: 'text-orange-600'
      };
      case 3: return {
        bgGradient: 'from-yellow-500/20 via-yellow-400/15 to-orange-500/20',
        borderColor: 'border-yellow-400/30',
        glowColor: 'md',
        icon: '⚡',
        urgencyText: 'HIGH',
        urgencyColor: 'text-yellow-600'
      };
      case 2: return {
        bgGradient: 'from-blue-500/20 via-blue-400/15 to-cyan-500/20',
        borderColor: 'border-blue-400/30',
        glowColor: 'sm',
        icon: '💡',
        urgencyText: 'MEDIUM',
        urgencyColor: 'text-blue-600'
      };
      default: return {
        bgGradient: 'from-green-500/20 via-green-400/15 to-emerald-500/20',
        borderColor: 'border-green-400/30',
        glowColor: 'sm',
        icon: '✅',
        urgencyText: 'INFO',
        urgencyColor: 'text-green-600'
      };
    }
  };

  const styling = getAlertStyling(alert.urgencyLevel);

  const handleActionClick = () => {
    if (alert.type === 'disease') navigate('/scan');
    else if (alert.type === 'irrigation') navigate('/weather');
    else if (alert.type === 'weather') navigate('/weather');
    else navigate('/fields');
  };

  return (
    <LiquidGlassCard
      expandable={true}
      draggable={false}
      width="100%"
      height="auto"
      expandedHeight="auto"
      glowIntensity={styling.glowColor as any}
      className={`bg-gradient-to-br ${styling.bgGradient} border ${styling.borderColor} mb-3`}
      borderRadius="20px"
    >
      <div className="p-4">
        {/* Collapsed View - Summary */}
        <div className="flex items-start space-x-3">
          {/* Alert Icon & Urgency */}
          <div className="flex flex-col items-center space-y-1">
            <div className="text-2xl">{styling.icon}</div>
            <div className={`text-xs font-bold ${styling.urgencyColor} px-2 py-1 rounded-full bg-white/20`}>
              {styling.urgencyText}
            </div>
          </div>

          {/* Alert Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900 text-sm leading-tight">
                {alert.title}
              </h3>
              <div className="flex items-center text-xs text-gray-600 ml-2">
                <Clock className="w-3 h-3 mr-1" />
                {alert.estimatedImpact.timeToAct}
              </div>
            </div>

            <p className="text-xs text-gray-700 mb-3 leading-relaxed">
              {alert.message}
            </p>

            {/* Impact Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs">
                {alert.estimatedImpact.yieldLoss > 0 && (
                  <div className="flex items-center text-red-600">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {alert.estimatedImpact.yieldLoss}% yield loss
                  </div>
                )}
                {alert.estimatedImpact.financialImpact > 0 && (
                  <div className="flex items-center text-red-600">
                    <DollarSign className="w-3 h-3 mr-1" />
                    ${alert.estimatedImpact.financialImpact} risk
                  </div>
                )}
              </div>

              <Button 
                size="sm" 
                className="h-7 px-3 text-xs bg-white/20 hover:bg-white/30 text-gray-800 border-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick();
                }}
              >
                {alert.action}
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded View - Detailed Advice */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="space-y-4">
            {/* Detailed Conditions */}
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Current Conditions
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {alert.conditions.temperature && (
                  <div className="bg-white/10 rounded-lg p-2">
                    <span className="text-gray-600">Temperature:</span>
                    <span className="font-semibold ml-1">{alert.conditions.temperature}°C</span>
                  </div>
                )}
                {alert.conditions.humidity && (
                  <div className="bg-white/10 rounded-lg p-2">
                    <span className="text-gray-600">Humidity:</span>
                    <span className="font-semibold ml-1">{alert.conditions.humidity}%</span>
                  </div>
                )}
                {alert.conditions.windSpeed && (
                  <div className="bg-white/10 rounded-lg p-2">
                    <span className="text-gray-600">Wind Speed:</span>
                    <span className="font-semibold ml-1">{alert.conditions.windSpeed}m/s</span>
                  </div>
                )}
                {alert.conditions.rainfall && (
                  <div className="bg-white/10 rounded-lg p-2">
                    <span className="text-gray-600">Rainfall:</span>
                    <span className="font-semibold ml-1">{alert.conditions.rainfall}mm</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-2">
                🎯 Expert Recommendations
              </h4>
              <div className="space-y-2">
                {alert.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <span className="text-gray-700 leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Details */}
            <div className="bg-white/10 rounded-lg p-3">
              <h4 className="font-semibold text-gray-900 text-sm mb-2">
                📊 Potential Impact
              </h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Yield Loss:</span>
                  <span className="font-semibold text-red-600">
                    {alert.estimatedImpact.yieldLoss > 0 ? `${alert.estimatedImpact.yieldLoss}%` : 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Financial Risk:</span>
                  <span className="font-semibold text-red-600">
                    {alert.estimatedImpact.financialImpact > 0 ? `$${alert.estimatedImpact.financialImpact}` : 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time to Act:</span>
                  <span className="font-semibold text-orange-600 capitalize">
                    {alert.estimatedImpact.timeToAct}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                onClick={handleActionClick}
              >
                {alert.action}
              </Button>
              {onDismiss && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss();
                  }}
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </LiquidGlassCard>
  );
};