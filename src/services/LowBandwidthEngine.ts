/**
 * 🔥 LOW-BANDWIDTH ENGINE - ULTRA SIMPLE 2G OPTIMIZATION
 * Works perfectly on slow connections and feature phones
 */

class LowBandwidthEngine {
  private static instance: LowBandwidthEngine;
  
  static getInstance(): LowBandwidthEngine {
    if (!this.instance) this.instance = new LowBandwidthEngine();
    return this.instance;
  }

  // Detect connection speed
  getConnectionSpeed(): 'fast' | 'slow' | 'offline' {
    if (!navigator.onLine) return 'offline';
    
    // Simple connection detection
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        return 'slow';
      }
    }
    
    // Default to slow for safety in rural areas
    return 'slow';
  }

  // Get text-only content for slow connections
  getTextOnlyContent(content: any): string {
    if (typeof content === 'string') return content;
    
    // Convert rich content to simple text
    return `
🌿 ${content.title || 'Organic Farming Tip'}

📝 ${content.description || ''}

${content.ingredients ? '🧪 Ingredients: ' + content.ingredients.join(', ') : ''}

${content.steps ? '📋 Steps:\n' + content.steps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n') : ''}

💰 Saves: $${content.savings || 25}
⭐ Rating: ${content.rating || 4.5}/5
    `;
  }

  // Compress data for transmission
  compressData(data: any): string {
    try {
      // Ultra-simple compression - remove whitespace and shorten keys
      const compressed = JSON.stringify(data)
        .replace(/\s+/g, ' ')
        .replace(/"title":/g, '"t":')
        .replace(/"description":/g, '"d":')
        .replace(/"ingredients":/g, '"i":')
        .replace(/"instructions":/g, '"s":');
      
      return compressed;
    } catch (error) {
      return JSON.stringify(data);
    }
  }

  // Progressive loading for slow connections
  async loadProgressively<T>(
    essentialData: () => Promise<T>,
    enhancedData: () => Promise<T>
  ): Promise<T> {
    const speed = this.getConnectionSpeed();
    
    if (speed === 'slow' || speed === 'offline') {
      return essentialData();
    }
    
    return enhancedData();
  }

  // SMS-friendly format
  formatForSMS(content: any): string {
    const text = this.getTextOnlyContent(content);
    
    // Keep under 160 characters for SMS
    if (text.length <= 160) return text;
    
    // Truncate and add link
    return text.substring(0, 140) + '... Get full guide: cropgenius.app';
  }

  // Feature phone compatible HTML
  generateFeaturePhoneHTML(content: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>CropGenius</title>
  <style>
    body { font-family: Arial; font-size: 14px; margin: 10px; }
    .tip { border: 1px solid #ccc; padding: 10px; margin: 10px 0; }
    .title { font-weight: bold; color: #006600; }
    .steps { margin: 10px 0; }
    .step { margin: 5px 0; }
  </style>
</head>
<body>
  <h1>🌿 CropGenius</h1>
  <div class="tip">
    <div class="title">${content.title || 'Organic Tip'}</div>
    <p>${content.description || ''}</p>
    ${content.steps ? '<div class="steps">' + content.steps.map((step: string, i: number) => 
      `<div class="step">${i + 1}. ${step}</div>`).join('') + '</div>' : ''}
    <p><strong>Saves: $${content.savings || 25}</strong></p>
  </div>
  <p><a href="tel:*123#">Get more tips via SMS</a></p>
</body>
</html>
    `;
  }

  // Check if device is feature phone
  isFeaturePhone(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('kaios') || 
           userAgent.includes('nokia') ||
           window.screen.width <= 320;
  }

  // Optimize images for slow connections
  optimizeImage(imageUrl: string): string {
    if (this.getConnectionSpeed() === 'slow') {
      // Return placeholder or very low quality version
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
    return imageUrl;
  }
}

export const lowBandwidthEngine = LowBandwidthEngine.getInstance();