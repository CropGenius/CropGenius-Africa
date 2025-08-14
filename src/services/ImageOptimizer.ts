/**
 * 🖼️ CROPGENIUS IMAGE OPTIMIZER - INFINITY GRADE
 * -------------------------------------------------------------
 * Lightning-fast image optimization for Gemini-2.5-Flash
 * - JPEG compression with diagnostic quality preservation
 * - Automatic resizing for optimal AI analysis
 * - Base64 payload minimization
 * - Format normalization for consistent processing
 */

export class ImageOptimizer {
  private static readonly MAX_WIDTH = 1024;
  private static readonly MAX_HEIGHT = 1024;
  private static readonly QUALITY = 0.85;
  private static readonly MAX_SIZE_KB = 1024;

  /**
   * Optimize image for Gemini-2.5-Flash analysis
   * Combines compression, resizing, and format normalization
   */
  static async optimizeForAI(imageBase64: string): Promise<string> {
    try {
      // Convert base64 to image element for processing
      const img = await this.base64ToImage(imageBase64);
      
      // Calculate optimal dimensions
      const { width, height } = this.calculateOptimalDimensions(img.width, img.height);
      
      // Create canvas for processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to optimized JPEG
      const optimizedBase64 = canvas.toDataURL('image/jpeg', this.QUALITY);
      
      // Return base64 without data URL prefix
      return optimizedBase64.split(',')[1];
    } catch (error) {
      console.error('Image optimization failed:', error);
      // Return original if optimization fails
      return imageBase64;
    }
  }

  /**
   * Compress JPEG image while maintaining diagnostic quality
   */
  static async compressImage(
    imageBase64: string, 
    maxSizeKB: number = this.MAX_SIZE_KB,
    quality: number = this.QUALITY
  ): Promise<string> {
    const img = await this.base64ToImage(imageBase64);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    let currentQuality = quality;
    let compressedBase64: string;
    
    // Iteratively compress until size target is met
    do {
      compressedBase64 = canvas.toDataURL('image/jpeg', currentQuality);
      const sizeKB = Math.ceil(compressedBase64.length * 0.75) / 1024;
      
      if (sizeKB <= maxSizeKB) break;
      
      currentQuality -= 0.1;
    } while (currentQuality > 0.3);

    // Clean up canvas to prevent memory leaks
    canvas.width = 0;
    canvas.height = 0;
    
    return compressedBase64.split(',')[1];
  }

  /**
   * Resize image to optimal dimensions for AI analysis
   */
  static async resizeImage(
    imageBase64: string,
    maxWidth: number = this.MAX_WIDTH,
    maxHeight: number = this.MAX_HEIGHT
  ): Promise<string> {
    const img = await this.base64ToImage(imageBase64);
    const { width, height } = this.calculateOptimalDimensions(img.width, img.height, maxWidth, maxHeight);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');
    
    canvas.width = width;
    canvas.height = height;
    
    // Use high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    
    const resizedBase64 = canvas.toDataURL('image/jpeg', this.QUALITY);
    return resizedBase64.split(',')[1];
  }

  /**
   * Convert various formats to optimized JPEG
   */
  static async normalizeFormat(imageBase64: string): Promise<string> {
    const img = await this.base64ToImage(imageBase64);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const normalizedBase64 = canvas.toDataURL('image/jpeg', this.QUALITY);
    return normalizedBase64.split(',')[1];
  }

  /**
   * Get image dimensions and file size info
   */
  static async getImageInfo(imageBase64: string): Promise<{
    width: number;
    height: number;
    sizeKB: number;
    format: string;
  }> {
    const img = await this.base64ToImage(imageBase64);
    const sizeKB = Math.ceil(imageBase64.length * 0.75) / 1024;
    
    // Detect format from base64 header
    const format = imageBase64.charAt(0) === '/' ? 'jpeg' : 
                  imageBase64.charAt(0) === 'i' ? 'png' : 
                  imageBase64.charAt(0) === 'R' ? 'gif' : 'unknown';
    
    return {
      width: img.width,
      height: img.height,
      sizeKB,
      format
    };
  }

  /**
   * Convert base64 string to Image element
   */
  private static base64ToImage(base64: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      
      // Add data URL prefix if not present
      const dataUrl = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
      img.src = dataUrl;
    });
  }

  /**
   * Calculate optimal dimensions maintaining aspect ratio
   */
  private static calculateOptimalDimensions(
    originalWidth: number, 
    originalHeight: number,
    maxWidth: number = this.MAX_WIDTH,
    maxHeight: number = this.MAX_HEIGHT
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;
    
    // Scale down if too large
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  /**
   * Validate image before processing
   */
  static validateImage(imageBase64: string): { valid: boolean; error?: string } {
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return { valid: false, error: 'Invalid image data' };
    }
    
    const sizeKB = Math.ceil(imageBase64.length * 0.75) / 1024;
    if (sizeKB > 10 * 1024) { // 10MB limit
      return { valid: false, error: 'Image size exceeds 10MB limit' };
    }
    
    return { valid: true };
  }
}