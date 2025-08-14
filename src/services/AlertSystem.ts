/**
 * 🚨 ALERT SYSTEM - INFINITY IQ AGRICULTURAL INTELLIGENCE
 * Real-time agricultural alerts based on actual conditions
 * NEVER MISSES CRITICAL CONDITIONS - Saves crops and profits
 */

import { WeatherData, FieldData, Alert } from './DashboardDataManager';

export interface AgriculturalAlert extends Alert {
  conditions: {
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    rainfall?: number;
  };
  recommendations: string[];
  urgencyLevel: 1 | 2 | 3 | 4 | 5; // 1 = info, 5 = emergency
  estimatedImpact: {
    yieldLoss: number; // percentage
    financialImpact: number; // estimated loss in USD
    timeToAct: string; // "immediate", "within 24h", "within week"
  };
}

export class AlertSystem {
  private static instance: AlertSystem;

  private constructor() {}

  public static getInstance(): AlertSystem {
    if (!AlertSystem.instance) {
      AlertSystem.instance = new AlertSystem();
    }
    return AlertSystem.instance;
  }

  /**
   * Generate comprehensive agricultural alerts
   */
  generateAlerts(weather: WeatherData | null, fields: FieldData[]): AgriculturalAlert[] {
    const alerts: AgriculturalAlert[] = [];

    if (!weather) return alerts;

    // Critical disease risk alert
    if (weather.humidityPercent > 85 && weather.temperatureCelsius > 20) {
      alerts.push({
        id: 'fungal-disease-risk',
        type: 'disease',
        severity: 'critical',
        title: 'CRITICAL: Fungal Disease Risk',
        message: `Extreme humidity (${weather.humidityPercent}%) + warm temperature (${weather.temperatureCelsius}°C) creates perfect conditions for fungal diseases`,
        action: 'Apply Preventive Fungicide NOW',
        timestamp: Date.now(),
        conditions: {
          temperature: weather.temperatureCelsius,
          humidity: weather.humidityPercent
        },
        recommendations: [
          'Apply copper-based fungicide immediately',
          'Improve field drainage',
          'Increase air circulation around plants',
          'Monitor for early disease symptoms'
        ],
        urgencyLevel: 5,
        estimatedImpact: {
          yieldLoss: 40,
          financialImpact: 2000,
          timeToAct: 'immediate'
        }
      });
    }

    // Heat stress alert
    if (weather.temperatureCelsius > 35) {
      alerts.push({
        id: 'heat-stress-critical',
        type: 'weather',
        severity: 'high',
        title: 'URGENT: Extreme Heat Stress',
        message: `Dangerous temperature (${weather.temperatureCelsius}°C) will cause severe crop stress and potential death`,
        action: 'Emergency Irrigation Required',
        timestamp: Date.now(),
        conditions: {
          temperature: weather.temperatureCelsius
        },
        recommendations: [
          'Start emergency irrigation immediately',
          'Apply shade cloth if available',
          'Spray crops with water to cool leaves',
          'Harvest mature crops early if possible'
        ],
        urgencyLevel: 4,
        estimatedImpact: {
          yieldLoss: 25,
          financialImpact: 1500,
          timeToAct: 'immediate'
        }
      });
    } else if (weather.temperatureCelsius > 30) {
      alerts.push({
        id: 'heat-stress-moderate',
        type: 'weather',
        severity: 'medium',
        title: 'Heat Stress Warning',
        message: `High temperature (${weather.temperatureCelsius}°C) may stress crops and reduce yields`,
        action: 'Increase Irrigation Frequency',
        timestamp: Date.now(),
        conditions: {
          temperature: weather.temperatureCelsius
        },
        recommendations: [
          'Water crops early morning and evening',
          'Mulch around plants to retain moisture',
          'Monitor for wilting symptoms',
          'Consider temporary shade for sensitive crops'
        ],
        urgencyLevel: 3,
        estimatedImpact: {
          yieldLoss: 10,
          financialImpact: 500,
          timeToAct: 'within 24h'
        }
      });
    }

    // Wind damage alert
    if (weather.windSpeedMps > 15) {
      alerts.push({
        id: 'wind-damage-critical',
        type: 'weather',
        severity: 'high',
        title: 'URGENT: Destructive Wind Warning',
        message: `Extremely strong winds (${weather.windSpeedMps}m/s) will cause severe crop damage`,
        action: 'Secure Crops Immediately',
        timestamp: Date.now(),
        conditions: {
          windSpeed: weather.windSpeedMps
        },
        recommendations: [
          'Stake tall plants immediately',
          'Harvest mature crops if possible',
          'Cover young plants with protective barriers',
          'Secure greenhouse structures and equipment'
        ],
        urgencyLevel: 4,
        estimatedImpact: {
          yieldLoss: 30,
          financialImpact: 1800,
          timeToAct: 'immediate'
        }
      });
    } else if (weather.windSpeedMps > 10) {
      alerts.push({
        id: 'wind-damage-moderate',
        type: 'weather',
        severity: 'medium',
        title: 'Strong Wind Alert',
        message: `Strong winds (${weather.windSpeedMps}m/s) may damage crops and structures`,
        action: 'Secure Loose Items',
        timestamp: Date.now(),
        conditions: {
          windSpeed: weather.windSpeedMps
        },
        recommendations: [
          'Check and reinforce plant supports',
          'Secure irrigation equipment',
          'Monitor for plant damage',
          'Postpone spraying operations'
        ],
        urgencyLevel: 2,
        estimatedImpact: {
          yieldLoss: 5,
          financialImpact: 200,
          timeToAct: 'within 24h'
        }
      });
    }

    // Drought stress alert
    if (weather.temperatureCelsius > 28 && weather.humidityPercent < 40) {
      alerts.push({
        id: 'drought-stress',
        type: 'irrigation',
        severity: 'high',
        title: 'Drought Stress Conditions',
        message: `Hot (${weather.temperatureCelsius}°C) and dry (${weather.humidityPercent}% humidity) conditions require immediate irrigation`,
        action: 'Start Intensive Irrigation',
        timestamp: Date.now(),
        conditions: {
          temperature: weather.temperatureCelsius,
          humidity: weather.humidityPercent
        },
        recommendations: [
          'Increase irrigation frequency by 50%',
          'Apply mulch to reduce water evaporation',
          'Monitor soil moisture levels daily',
          'Consider drought-resistant crop varieties for next season'
        ],
        urgencyLevel: 4,
        estimatedImpact: {
          yieldLoss: 20,
          financialImpact: 1200,
          timeToAct: 'within 24h'
        }
      });
    }

    // Optimal conditions alert (positive alert)
    if (weather.temperatureCelsius >= 20 && weather.temperatureCelsius <= 28 && 
        weather.humidityPercent >= 50 && weather.humidityPercent <= 70 &&
        weather.windSpeedMps < 8) {
      alerts.push({
        id: 'optimal-conditions',
        type: 'weather',
        severity: 'low',
        title: '✅ Perfect Growing Conditions',
        message: `Ideal temperature (${weather.temperatureCelsius}°C), humidity (${weather.humidityPercent}%), and calm winds - perfect for crop growth`,
        action: 'Maximize Growth Potential',
        timestamp: Date.now(),
        conditions: {
          temperature: weather.temperatureCelsius,
          humidity: weather.humidityPercent,
          windSpeed: weather.windSpeedMps
        },
        recommendations: [
          'Apply fertilizer for maximum uptake',
          'Plant new crops if planned',
          'Conduct field maintenance activities',
          'Take advantage of optimal spraying conditions'
        ],
        urgencyLevel: 1,
        estimatedImpact: {
          yieldLoss: -10, // negative means yield increase
          financialImpact: -500, // negative means profit increase
          timeToAct: 'within week'
        }
      });
    }

    // Field-specific alerts
    fields.forEach(field => {
      const fieldAlerts = this.generateFieldSpecificAlerts(field, weather);
      alerts.push(...fieldAlerts);
    });

    // Sort alerts by urgency level (highest first)
    return alerts.sort((a, b) => b.urgencyLevel - a.urgencyLevel);
  }

  /**
   * Generate field-specific alerts
   */
  private generateFieldSpecificAlerts(field: FieldData, weather: WeatherData): AgriculturalAlert[] {
    const alerts: AgriculturalAlert[] = [];

    // Crop-specific temperature alerts
    switch (field.crop_type.toLowerCase()) {
      case 'maize':
        if (weather.temperatureCelsius > 32) {
          alerts.push({
            id: `maize-heat-${field.id}`,
            type: 'weather',
            severity: 'high',
            title: `${field.name}: Maize Heat Stress`,
            message: `Maize in ${field.name} is experiencing dangerous heat stress (${weather.temperatureCelsius}°C)`,
            action: 'Emergency Irrigation for Maize',
            timestamp: Date.now(),
            conditions: { temperature: weather.temperatureCelsius },
            recommendations: [
              'Irrigate maize fields immediately',
              'Apply water stress mitigation techniques',
              'Monitor for leaf rolling and wilting',
              'Consider early harvest if near maturity'
            ],
            urgencyLevel: 4,
            estimatedImpact: {
              yieldLoss: 35,
              financialImpact: 1000,
              timeToAct: 'immediate'
            }
          });
        }
        break;

      case 'beans':
        if (weather.humidityPercent > 80 && weather.temperatureCelsius > 22) {
          alerts.push({
            id: `beans-disease-${field.id}`,
            type: 'disease',
            severity: 'critical',
            title: `${field.name}: Bean Disease Risk`,
            message: `Beans in ${field.name} at extreme risk for rust and blight diseases`,
            action: 'Apply Fungicide to Beans',
            timestamp: Date.now(),
            conditions: { 
              temperature: weather.temperatureCelsius,
              humidity: weather.humidityPercent 
            },
            recommendations: [
              'Apply copper-based fungicide immediately',
              'Improve air circulation between plants',
              'Remove any infected plant material',
              'Avoid overhead watering'
            ],
            urgencyLevel: 5,
            estimatedImpact: {
              yieldLoss: 50,
              financialImpact: 800,
              timeToAct: 'immediate'
            }
          });
        }
        break;

      case 'tomatoes':
        if (weather.temperatureCelsius < 15 || weather.temperatureCelsius > 30) {
          alerts.push({
            id: `tomato-temp-${field.id}`,
            type: 'weather',
            severity: 'medium',
            title: `${field.name}: Tomato Temperature Stress`,
            message: `Tomatoes in ${field.name} experiencing temperature stress (${weather.temperatureCelsius}°C)`,
            action: 'Adjust Tomato Growing Conditions',
            timestamp: Date.now(),
            conditions: { temperature: weather.temperatureCelsius },
            recommendations: [
              'Use row covers for temperature protection',
              'Adjust irrigation to moderate temperature',
              'Monitor fruit set and quality',
              'Consider greenhouse protection'
            ],
            urgencyLevel: 3,
            estimatedImpact: {
              yieldLoss: 15,
              financialImpact: 600,
              timeToAct: 'within 24h'
            }
          });
        }
        break;
    }

    return alerts;
  }

  /**
   * Get alert priority color for UI
   */
  getAlertColor(urgencyLevel: number): string {
    switch (urgencyLevel) {
      case 5: return 'bg-red-600 text-white'; // Emergency
      case 4: return 'bg-red-500 text-white'; // Critical
      case 3: return 'bg-orange-500 text-white'; // High
      case 2: return 'bg-yellow-500 text-black'; // Medium
      case 1: return 'bg-green-500 text-white'; // Info/Positive
      default: return 'bg-gray-500 text-white';
    }
  }

  /**
   * Get alert icon for UI
   */
  getAlertIcon(type: string, urgencyLevel: number): string {
    if (urgencyLevel === 1) return '✅'; // Positive alert
    
    switch (type) {
      case 'disease': return '🦠';
      case 'weather': return '🌡️';
      case 'irrigation': return '💧';
      case 'pest': return '🐛';
      default: return '⚠️';
    }
  }
}

// Export singleton instance
export const alertSystem = AlertSystem.getInstance();