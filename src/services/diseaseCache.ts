/**
 * 🧠 CROPGENIUS DISEASE DETECTION CACHE
 * Smart caching system to optimize PlantNet API usage
 * Reduces rate limiting and improves response times
 */

interface CacheEntry {
  result: any;
  timestamp: number;
  imageHash: string;
  cropType: string;
}

class DiseaseCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_ENTRIES = 1000;
  private dailyUsage = new Map<string, number>();

  /**
   * Generate cache key from image hash and crop type
   */
  private cacheKey(imageHash: string, cropType: string): string {
    return `${imageHash}:${cropType.toLowerCase()}`;
  }

  /**
   * Generate simple hash from image data
   */
  hashImage(imageBase64: string): string {
    let hash = 0;
    const str = imageBase64.substring(0, 1000); // Use first 1000 chars for speed
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if result is cached
   */
  get(imageHash: string, cropType: string): any | null {
    const key = this.cacheKey(imageHash, cropType);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    console.log('🎯 Using cached disease detection result');
    return entry.result;
  }

  /**
   * Store result in cache
   */
  set(imageHash: string, cropType: string, result: any): void {
    const key = this.cacheKey(imageHash, cropType);
    
    // Clean up old entries if cache is full
    if (this.cache.size >= this.MAX_ENTRIES) {
      this.cleanup();
    }
    
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      imageHash,
      cropType
    });
    
    console.log(`💾 Cached disease detection result for ${cropType}`);
  }

  /**
   * Check if we're rate limited for today
   * NOTE: Gemini-2.5-Flash has no rate limits, but keeping for future use
   */
  isRateLimited(): boolean {
    // Gemini-2.5-Flash has no rate limits, always return false
    return false;
  }

  /**
   * Increment daily usage counter
   * NOTE: Not needed for Gemini but keeping for analytics
   */
  incrementUsage(): void {
    const today = new Date().toDateString();
    const current = this.dailyUsage.get(today) || 0;
    this.dailyUsage.set(today, current + 1);
    
    // Clean up old usage data
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    this.dailyUsage.delete(yesterday);
  }

  /**
   * Get current daily usage for analytics
   */
  getDailyUsage(): number {
    const today = new Date().toDateString();
    return this.dailyUsage.get(today) || 0;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        toDelete.push(key);
      }
    }
    
    toDelete.forEach(key => this.cache.delete(key));
    
    // If still too many entries, remove oldest ones
    if (this.cache.size >= this.MAX_ENTRIES) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, Math.floor(this.MAX_ENTRIES * 0.2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
    
    console.log(`🧹 Cleaned up cache, ${this.cache.size} entries remaining`);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.dailyUsage.clear();
    console.log('🗑️ Disease cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    entries: number;
    dailyUsage: number;
    rateLimited: boolean;
    cacheHitRate: number;
  } {
    return {
      entries: this.cache.size,
      dailyUsage: this.getDailyUsage(),
      rateLimited: this.isRateLimited(),
      cacheHitRate: 0 // Would need to track hits/misses for accurate rate
    };
  }
}

// Export singleton instance
export const diseaseCache = new DiseaseCache();

/**
 * Enhanced disease database for fallback scenarios
 */
export const diseaseDatabase = {
  maize: {
    'leaf_spots': {
      name: 'Northern Corn Leaf Blight',
      scientific_name: 'Exserohilum turcicum',
      confidence: 85,
      symptoms: [
        'Long, elliptical lesions on leaves',
        'Gray-green to tan colored spots',
        'Lesions may have dark borders'
      ],
      treatment: [
        'Apply fungicide containing propiconazole',
        'Remove infected plant debris',
        'Improve air circulation'
      ],
      products: ['Tilt 250EC', 'Bumper 25EC', 'Copper oxychloride']
    },
    'rust': {
      name: 'Common Rust',
      scientific_name: 'Puccinia sorghi',
      confidence: 90,
      symptoms: [
        'Small, circular to oval pustules',
        'Golden to cinnamon-brown color',
        'Pustules on both leaf surfaces'
      ],
      treatment: [
        'Apply fungicide spray',
        'Use resistant varieties',
        'Ensure proper plant spacing'
      ],
      products: ['Mancozeb 75WP', 'Propiconazole', 'Tebuconazole']
    },
    'blight': {
      name: 'Southern Corn Leaf Blight',
      scientific_name: 'Bipolaris maydis',
      confidence: 88,
      symptoms: [
        'Small, tan lesions with dark borders',
        'Lesions may coalesce',
        'Premature leaf death'
      ],
      treatment: [
        'Fungicide application',
        'Crop rotation',
        'Use resistant hybrids'
      ],
      products: ['Ridomil Gold', 'Metalaxyl', 'Copper fungicides']
    }
  },
  tomato: {
    'early_blight': {
      name: 'Early Blight',
      scientific_name: 'Alternaria solani',
      confidence: 92,
      symptoms: [
        'Dark spots with concentric rings',
        'Yellow halo around spots',
        'Lower leaves affected first'
      ],
      treatment: [
        'Remove affected leaves',
        'Apply copper-based fungicide',
        'Improve air circulation'
      ],
      products: ['Copper oxychloride', 'Mancozeb', 'Chlorothalonil']
    },
    'late_blight': {
      name: 'Late Blight',
      scientific_name: 'Phytophthora infestans',
      confidence: 95,
      symptoms: [
        'Water-soaked lesions',
        'White fuzzy growth on leaf undersides',
        'Rapid spread in humid conditions'
      ],
      treatment: [
        'Immediate fungicide application',
        'Remove infected plants',
        'Improve drainage'
      ],
      products: ['Ridomil Gold', 'Metalaxyl-M', 'Copper hydroxide']
    }
  },
  beans: {
    'anthracnose': {
      name: 'Bean Anthracnose',
      scientific_name: 'Colletotrichum lindemuthianum',
      confidence: 87,
      symptoms: [
        'Dark, sunken lesions on pods',
        'Circular spots on leaves',
        'Pink spore masses in humid conditions'
      ],
      treatment: [
        'Use certified disease-free seeds',
        'Apply copper-based fungicides',
        'Avoid overhead irrigation'
      ],
      products: ['Copper sulfate', 'Mancozeb', 'Benomyl']
    }
  }
};

/**
 * Enhanced fallback disease detection
 */
export function enhancedDiseaseFallback(
  cropType: string, 
  symptoms: string[] = [],
  imageAnalysis?: any
): any {
  const cropData = diseaseDatabase[cropType.toLowerCase()];
  
  if (!cropData) {
    return {
      name: `General ${cropType} Health Issue`,
      scientific_name: 'Unknown pathogen',
      confidence: 50,
      symptoms: ['Visual inspection required'],
      treatment: ['Consult agricultural extension officer'],
      products: ['Local agricultural store recommendations']
    };
  }

  // Try to match symptoms to known diseases
  let bestMatch = null;
  let highestScore = 0;

  for (const [diseaseKey, diseaseData] of Object.entries(cropData)) {
    let score = 0;
    
    // Check for keyword matches in symptoms
    symptoms.forEach(symptom => {
      const symptomLower = symptom.toLowerCase();
      if (diseaseData.symptoms.some(s => 
        s.toLowerCase().includes(symptomLower) || 
        symptomLower.includes(s.toLowerCase().split(' ')[0])
      )) {
        score += 20;
      }
    });

    // Check disease name matches
    if (symptoms.some(s => s.toLowerCase().includes(diseaseKey))) {
      score += 30;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = diseaseData;
    }
  }

  // If no good match, return the first disease for the crop
  if (!bestMatch || highestScore < 20) {
    bestMatch = Object.values(cropData)[0];
  }

  return bestMatch;
}