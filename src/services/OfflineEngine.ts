/**
 * 🔥 OFFLINE ENGINE - ULTRA SIMPLE OFFLINE-FIRST ARCHITECTURE
 * Works in remote villages with zero internet connectivity
 */

interface OfflineData {
  recipes: any[];
  practices: any[];
  actions: any[];
  progress: any;
  lastSync: number;
}

class OfflineEngine {
  private static instance: OfflineEngine;
  
  static getInstance(): OfflineEngine {
    if (!this.instance) this.instance = new OfflineEngine();
    return this.instance;
  }

  private storageKey = 'cropgenius_offline_data';

  // Save data for offline use
  saveOfflineData(data: Partial<OfflineData>): void {
    try {
      const existing = this.getOfflineData();
      const updated = { ...existing, ...data, lastSync: Date.now() };
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  // Get offline data
  getOfflineData(): OfflineData {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {
        recipes: [],
        practices: [],
        actions: [],
        progress: null,
        lastSync: 0
      };
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return {
        recipes: [],
        practices: [],
        actions: [],
        progress: null,
        lastSync: 0
      };
    }
  }

  // Check if we're offline
  isOffline(): boolean {
    return !navigator.onLine;
  }

  // Get essential recipes for offline use
  getOfflineRecipes(): any[] {
    const data = this.getOfflineData();
    return data.recipes.length > 0 ? data.recipes : [
      {
        id: 'neem_spray',
        name: 'Neem Oil Spray',
        ingredients: ['Neem leaves', 'Water', 'Soap'],
        instructions: ['Boil neem leaves', 'Strain liquid', 'Add soap', 'Spray on crops'],
        category: 'pesticide'
      },
      {
        id: 'compost_tea',
        name: 'Compost Tea',
        ingredients: ['Compost', 'Water'],
        instructions: ['Mix compost with water', 'Let sit 24 hours', 'Strain', 'Apply to soil'],
        category: 'fertilizer'
      }
    ];
  }

  // Get offline practices
  getOfflinePractices(): any[] {
    const data = this.getOfflineData();
    return data.practices.length > 0 ? data.practices : [
      {
        id: 'companion_planting',
        name: 'Companion Planting',
        description: 'Plant maize, beans, and squash together',
        effectiveness: 92
      },
      {
        id: 'crop_rotation',
        name: 'Crop Rotation',
        description: 'Rotate crops each season to maintain soil health',
        effectiveness: 85
      }
    ];
  }

  // Sync when online
  async syncWhenOnline(): Promise<void> {
    if (this.isOffline()) return;

    try {
      // Simulate syncing with server
      const recipes = await this.fetchRecipes();
      const practices = await this.fetchPractices();
      
      this.saveOfflineData({ recipes, practices });
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  private async fetchRecipes(): Promise<any[]> {
    // Simplified - in real app, fetch from API
    return [
      { id: 'neem_spray', name: 'Neem Oil Spray', category: 'pesticide' },
      { id: 'compost_tea', name: 'Compost Tea', category: 'fertilizer' }
    ];
  }

  private async fetchPractices(): Promise<any[]> {
    // Simplified - in real app, fetch from API
    return [
      { id: 'companion_planting', name: 'Companion Planting', effectiveness: 92 },
      { id: 'crop_rotation', name: 'Crop Rotation', effectiveness: 85 }
    ];
  }

  // Generate PDF for printing
  generatePrintablePDF(content: string): string {
    // Ultra-simple PDF generation
    const pdfContent = `
# CropGenius Offline Guide

${content}

---
Generated: ${new Date().toLocaleDateString()}
Visit: cropgenius.app for updates
    `;
    
    // In real app, use proper PDF library
    return pdfContent;
  }
}

export const offlineEngine = OfflineEngine.getInstance();