/**
 * SVG renderer for chart generation
 */

// SVG rendering using template strings
import * as fs from 'fs/promises';
import { ChartSpec } from '../parsers/markdown';

export interface RenderOptions {
  width?: number;
  height?: number;
  theme?: string;
}

export abstract class SVGRenderer {
  protected width: number;
  protected height: number;
  protected theme: string;

  constructor(options: RenderOptions = {}) {
    this.width = options.width || 800;
    this.height = options.height || 600;
    this.theme = options.theme || 'default';
  }

  /**
   * Render chart to SVG string
   */
  abstract render(chartSpec: ChartSpec): Promise<string>;

  /**
   * Create base SVG container as string with optional background
   */
  protected createSVG(backgroundColor?: string): string {
    const bgRect = backgroundColor ? 
      `<rect width="100%" height="100%" fill="${backgroundColor}"/>` : '';
    
    return `<svg width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}" xmlns="http://www.w3.org/2000/svg">${this.createPatterns()}${bgRect}`;
  }

  /**
   * Create SVG pattern and gradient definitions
   */
  protected createPatterns(): string {
    return `<defs>
      <!-- Subtle texture pattern for vintage comic look -->
      <pattern id="vintage-texture" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill="rgba(255,255,255,0.02)"/>
        <circle cx="2" cy="2" r="0.5" fill="rgba(0,0,0,0.03)"/>
      </pattern>
      
      <!-- Gradient definitions for depth -->
      <radialGradient id="circle-gradient-blue" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:rgba(255,255,255,0.3);stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgba(0,0,0,0.1);stop-opacity:1" />
      </radialGradient>
      
      <radialGradient id="circle-gradient-green" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:rgba(255,255,255,0.3);stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgba(0,0,0,0.1);stop-opacity:1" />
      </radialGradient>
      
      <radialGradient id="circle-gradient-orange" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:rgba(255,255,255,0.3);stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgba(0,0,0,0.1);stop-opacity:1" />
      </radialGradient>
      
      <!-- Drop shadow filter -->
      <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
      </filter>
    </defs>`;
  }

  /**
   * Close SVG tag
   */
  protected closeSVG(): string {
    return '</svg>';
  }

  /**
   * Apply theme styles to SVG (deprecated - use getThemeStyles directly)
   */
  protected applyTheme(): void {
    // This method is now deprecated since we're building SVG as strings
    // Use getThemeStyles() directly in the render method
  }

  /**
   * Get CSS styles for the current theme
   */
  protected getThemeStyles(): string {
    const { getTheme, themeToCSS } = require('../themes');
    const theme = getTheme(this.theme);
    return themeToCSS(theme);
  }

  /**
   * Save SVG to file
   */
  async saveToFile(svg: string, filePath: string): Promise<void> {
    await fs.writeFile(filePath, svg, 'utf-8');
  }
}