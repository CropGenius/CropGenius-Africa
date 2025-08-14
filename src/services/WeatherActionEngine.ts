/**
 * 🔥 WEATHER ACTION ENGINE - ULTRA SIMPLE WEATHER-RESPONSIVE ACTIONS
 * Perfect timing for organic farming actions
 */

interface WeatherAction {
  id: string;
  action: string;
  weatherCondition: string;
  urgency: 'low' | 'medium' | 'high';
  timing: string;
  reason: string;
}

class WeatherActionEngine {
  private static instance: WeatherActionEngine;
  
  static getInstance(): WeatherActionEngine {
    if (!this.instance) this.instance = new WeatherActionEngine();
    return this.instance;
  }

  getWeatherActions(temperature: number, humidity: number, rainfall: number): WeatherAction[] {
    const actions: WeatherAction[] = [];

    // Hot weather actions
    if (temperature > 30) {
      actions.push({
        id: 'hot_mulch',
        action: 'Apply thick mulch layer',
        weatherCondition: 'Hot weather',
        urgency: 'high',
        timing: 'Early morning',
        reason: 'Protect roots from heat stress'
      });
    }

    // High humidity actions
    if (humidity > 80) {
      actions.push({
        id: 'humid_spray',
        action: 'Apply neem oil spray',
        weatherCondition: 'High humidity',
        urgency: 'medium',
        timing: 'Evening',
        reason: 'Prevent fungal diseases'
      });
    }

    // Rainy weather actions
    if (rainfall > 10) {
      actions.push({
        id: 'rain_drainage',
        action: 'Check drainage systems',
        weatherCondition: 'Heavy rain',
        urgency: 'high',
        timing: 'After rain stops',
        reason: 'Prevent waterlogging'
      });
    }

    // Dry weather actions
    if (rainfall < 2 && humidity < 40) {
      actions.push({
        id: 'dry_water',
        action: 'Deep watering session',
        weatherCondition: 'Dry weather',
        urgency: 'high',
        timing: 'Early morning or evening',
        reason: 'Maintain soil moisture'
      });
    }

    return actions.slice(0, 3); // Max 3 actions
  }

  getBestTiming(action: string, currentHour: number): string {
    const timingMap: Record<string, string> = {
      'spray': currentHour < 10 ? 'Perfect time now!' : 'Wait until evening (6-8 PM)',
      'water': currentHour < 9 || currentHour > 17 ? 'Perfect time now!' : 'Wait until evening',
      'mulch': currentHour < 11 ? 'Perfect time now!' : 'Wait until tomorrow morning',
      'fertilize': currentHour < 10 ? 'Perfect time now!' : 'Wait until tomorrow morning'
    };

    const actionType = Object.keys(timingMap).find(key => action.toLowerCase().includes(key));
    return actionType ? timingMap[actionType] : 'Anytime is good';
  }
}

export const weatherActionEngine = WeatherActionEngine.getInstance();
export type { WeatherAction };