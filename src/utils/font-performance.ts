/**
 * Font loading and performance optimization utilities
 */

export interface FontMetrics {
  family: string;
  size: number;
  weight: number | string;
  style: string;
  loadTime?: number;
  cacheHit?: boolean;
}

export interface FontCache {
  fonts: Map<string, FontMetrics>;
  totalSize: number;
  maxSize: number;
}

// Global font cache (for future use)
// const fontCache: FontCache = {
//   fonts: new Map(),
//   totalSize: 0,
//   maxSize: 50 // Maximum number of cached fonts
// };

/**
 * Font loading manager with caching and optimization
 */
export class FontManager {
  private loadedFonts = new Set<string>();
  private loadingPromises = new Map<string, Promise<void>>();
  
  /**
   * Load font with caching and error handling
   */
  async loadFont(fontFamily: string, fontUrl?: string): Promise<boolean> {
    const fontKey = this.getFontKey(fontFamily);
    
    // Check if already loaded
    if (this.loadedFonts.has(fontKey)) {
      return true;
    }
    
    // Check if already loading
    if (this.loadingPromises.has(fontKey)) {
      try {
        await this.loadingPromises.get(fontKey);
        return true;
      } catch {
        return false;
      }
    }
    
    // Start loading
    const loadPromise = this.loadFontInternal(fontFamily, fontUrl);
    this.loadingPromises.set(fontKey, loadPromise);
    
    try {
      await loadPromise;
      this.loadedFonts.add(fontKey);
      this.loadingPromises.delete(fontKey);
      return true;
    } catch (error) {
      this.loadingPromises.delete(fontKey);
      console.warn(`Failed to load font ${fontFamily}:`, error);
      return false;
    }
  }
  
  /**
   * Internal font loading implementation
   */
  private async loadFontInternal(fontFamily: string, fontUrl?: string): Promise<void> {
    if (fontUrl) {
      // Load web font
      await this.loadWebFont(fontFamily, fontUrl);
    } else {
      // Check system font availability
      await this.checkSystemFont(fontFamily);
    }
  }
  
  /**
   * Load web font from URL (browser-only, disabled for server-side rendering)
   */
  private async loadWebFont(fontFamily: string, fontUrl: string): Promise<void> {
    // For server-side SVG generation, we assume fonts are available
    // This would be implemented for browser environments
    console.warn(`Font loading not implemented for server-side: ${fontFamily} from ${fontUrl}`);
    return Promise.resolve();
  }
  
  /**
   * Check if system font is available (browser-only, disabled for server-side rendering)
   */
  private async checkSystemFont(fontFamily: string): Promise<void> {
    // For server-side SVG generation, we assume system fonts are available
    // This would be implemented for browser environments
    console.warn(`System font check not implemented for server-side: ${fontFamily}`);
    return Promise.resolve();
  }
  
  /**
   * Generate font cache key
   */
  private getFontKey(fontFamily: string): string {
    return fontFamily.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
  
  /**
   * Get fallback font stack
   */
  getFallbackStack(primaryFont: string): string[] {
    const fallbacks: Record<string, string[]> = {
      'serif': ['Times New Roman', 'Times', 'serif'],
      'sans-serif': ['Arial', 'Helvetica', 'sans-serif'],
      'monospace': ['Courier New', 'Courier', 'monospace'],
      'cursive': ['Comic Sans MS', 'cursive'],
      'fantasy': ['Impact', 'fantasy']
    };
    
    // Get font category
    const category = this.getFontCategory(primaryFont);
    return [primaryFont, ...(fallbacks[category] || fallbacks['sans-serif'])];
  }
  
  /**
   * Determine font category
   */
  private getFontCategory(fontFamily: string): string {
    const font = fontFamily.toLowerCase();
    
    if (font.includes('serif') && !font.includes('sans')) return 'serif';
    if (font.includes('mono') || font.includes('courier')) return 'monospace';
    if (font.includes('comic') || font.includes('script')) return 'cursive';
    if (font.includes('impact') || font.includes('display')) return 'fantasy';
    
    return 'sans-serif';
  }
}

/**
 * Optimize SVG text for performance
 */
export function optimizeSVGText(svgContent: string): string {
  // Remove redundant font declarations
  let optimized = svgContent.replace(
    /font-family:\s*([^;]+);\s*font-family:\s*[^;]+;/g,
    'font-family: $1;'
  );
  
  // Combine consecutive text elements with same styling
  optimized = optimized.replace(
    /<text([^>]+)>([^<]+)<\/text>\s*<text\1>([^<]+)<\/text>/g,
    '<text$1>$2$3</text>'
  );
  
  // Remove unnecessary precision in numeric values
  optimized = optimized.replace(
    /(\d+\.\d{3,})/g,
    (match) => parseFloat(match).toFixed(2)
  );
  
  return optimized;
}

/**
 * Calculate font subsetting needs
 */
export function calculateFontSubset(textElements: string[]): {
  characters: Set<string>;
  unicodeRanges: string[];
  estimatedSavings: number;
} {
  const characters = new Set<string>();
  
  textElements.forEach(text => {
    for (const char of text) {
      characters.add(char);
    }
  });
  
  const unicodeRanges = getUnicodeRanges(characters);
  const estimatedSavings = calculateSubsetSavings(characters.size);
  
  return { characters, unicodeRanges, estimatedSavings };
}

/**
 * Get Unicode ranges for character set
 */
function getUnicodeRanges(characters: Set<string>): string[] {
  const ranges: string[] = [];
  const codePoints = Array.from(characters).map(char => char.codePointAt(0)!).sort((a, b) => a - b);
  
  let start = codePoints[0];
  let end = start;
  
  for (let i = 1; i < codePoints.length; i++) {
    if (codePoints[i] === end + 1) {
      end = codePoints[i];
    } else {
      ranges.push(start === end ? `U+${start.toString(16)}` : `U+${start.toString(16)}-${end.toString(16)}`);
      start = end = codePoints[i];
    }
  }
  
  ranges.push(start === end ? `U+${start.toString(16)}` : `U+${start.toString(16)}-${end.toString(16)}`);
  return ranges;
}

/**
 * Estimate savings from font subsetting
 */
function calculateSubsetSavings(uniqueCharCount: number): number {
  const averageFontSize = 150000; // bytes
  const totalCharacters = 65536; // approximate Unicode BMP
  const compressionRatio = 0.7; // gzip compression
  
  const subsetRatio = uniqueCharCount / totalCharacters;
  const subsetSize = averageFontSize * subsetRatio * compressionRatio;
  const savings = averageFontSize - subsetSize;
  
  return Math.max(0, savings);
}

/**
 * Monitor font loading performance
 */
export class FontPerformanceMonitor {
  private metrics: Map<string, FontMetrics> = new Map();
  
  startLoadTracking(fontFamily: string): string {
    const trackingId = `${fontFamily}-${Date.now()}`;
    
    this.metrics.set(trackingId, {
      family: fontFamily,
      size: 0,
      weight: 'normal',
      style: 'normal',
      loadTime: performance.now()
    });
    
    return trackingId;
  }
  
  endLoadTracking(trackingId: string): FontMetrics | null {
    const metric = this.metrics.get(trackingId);
    if (!metric) return null;
    
    metric.loadTime = performance.now() - (metric.loadTime || 0);
    this.metrics.delete(trackingId);
    
    return metric;
  }
  
  getPerformanceReport(): {
    totalFonts: number;
    averageLoadTime: number;
    slowestFont: FontMetrics | null;
    cacheHitRate: number;
  } {
    const allMetrics = Array.from(this.metrics.values());
    const loadTimes = allMetrics.map(m => m.loadTime || 0).filter(t => t > 0);
    const cacheHits = allMetrics.filter(m => m.cacheHit).length;
    
    return {
      totalFonts: allMetrics.length,
      averageLoadTime: loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length || 0,
      slowestFont: allMetrics.length > 0 ? allMetrics.reduce((slowest: FontMetrics | null, current) => 
        (current.loadTime || 0) > (slowest?.loadTime || 0) ? current : slowest, null) : null,
      cacheHitRate: allMetrics.length > 0 ? cacheHits / allMetrics.length : 0
    };
  }
}

/**
 * Global font manager instance
 */
export const fontManager = new FontManager();

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new FontPerformanceMonitor();