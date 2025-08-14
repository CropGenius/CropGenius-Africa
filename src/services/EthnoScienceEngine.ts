/**
 * 🔥 ETHNO-SCIENCE ENGINE - ULTRA SIMPLE TRADITIONAL WISDOM
 * Ancient African farming knowledge enhanced by AI
 */

interface TraditionalPractice {
  id: string;
  name: string;
  region: string;
  crop: string;
  practice: string;
  modernEquivalent: string;
  effectiveness: number;
}

class EthnoScienceEngine {
  private static instance: EthnoScienceEngine;
  
  static getInstance(): EthnoScienceEngine {
    if (!this.instance) this.instance = new EthnoScienceEngine();
    return this.instance;
  }

  private practices: TraditionalPractice[] = [
    {
      id: 'neem_pest',
      name: 'Neem Leaf Spray',
      region: 'West Africa',
      crop: 'All crops',
      practice: 'Boil neem leaves, spray on crops at dawn',
      modernEquivalent: 'Organic pesticide with azadirachtin',
      effectiveness: 85
    },
    {
      id: 'ash_fertilizer',
      name: 'Wood Ash Fertilizer',
      region: 'East Africa',
      crop: 'Vegetables',
      practice: 'Mix wood ash with compost for potassium',
      modernEquivalent: 'Potassium-rich organic fertilizer',
      effectiveness: 78
    },
    {
      id: 'companion_planting',
      name: 'Three Sisters Planting',
      region: 'Central Africa',
      crop: 'Maize, Beans, Squash',
      practice: 'Plant maize, beans, and squash together',
      modernEquivalent: 'Companion planting for nitrogen fixation',
      effectiveness: 92
    },
    {
      id: 'moon_planting',
      name: 'Lunar Cycle Planting',
      region: 'Southern Africa',
      crop: 'Root vegetables',
      practice: 'Plant root crops during waning moon',
      modernEquivalent: 'Optimal soil moisture timing',
      effectiveness: 70
    },
    {
      id: 'banana_mulch',
      name: 'Banana Leaf Mulch',
      region: 'Tropical Africa',
      crop: 'All crops',
      practice: 'Use banana leaves as natural mulch',
      modernEquivalent: 'Organic mulch for moisture retention',
      effectiveness: 88
    }
  ];

  getRecommendations(crop: string, region?: string): TraditionalPractice[] {
    return this.practices
      .filter(p => p.crop === 'All crops' || p.crop.toLowerCase().includes(crop.toLowerCase()))
      .filter(p => !region || p.region.toLowerCase().includes(region.toLowerCase()))
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 3);
  }

  getAllPractices(): TraditionalPractice[] {
    return this.practices.sort((a, b) => b.effectiveness - a.effectiveness);
  }

  getPracticeById(id: string): TraditionalPractice | undefined {
    return this.practices.find(p => p.id === id);
  }
}

export const ethnoScienceEngine = EthnoScienceEngine.getInstance();
export type { TraditionalPractice };