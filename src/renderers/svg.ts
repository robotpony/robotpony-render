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
    this.width = options.width || 1200;
    this.height = options.height || 900;
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
    
    return `<svg width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}" xmlns="http://www.w3.org/2000/svg" style="shape-rendering: geometricPrecision; text-rendering: optimizeLegibility; font-smooth: always; -webkit-font-smoothing: antialiased;">${this.createPatterns()}${bgRect}`;
  }

  /**
   * Create SVG pattern and gradient definitions
   */
  protected createPatterns(): string {
    return `<defs>
      <!-- Rough edges filter for retro aesthetic -->
      <filter id="rough-edges" x="-50%" y="-50%" width="200%" height="200%">
        <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2"/>
      </filter>
      
      <!-- Vintage texture pattern -->
      <pattern id="vintage-texture" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill="rgba(255,255,255,0.05)"/>
        <circle cx="2" cy="2" r="0.5" fill="rgba(0,0,0,0.08)"/>
        <rect x="1" y="1" width="1" height="1" fill="rgba(255,255,255,0.1)"/>
      </pattern>
      
      <!-- Paper texture for background -->
      <pattern id="paper-texture" patternUnits="userSpaceOnUse" width="8" height="8">
        <rect width="8" height="8" fill="#d4c5a9"/>
        <circle cx="2" cy="2" r="0.3" fill="rgba(139,125,107,0.2)"/>
        <circle cx="6" cy="6" r="0.2" fill="rgba(139,125,107,0.3)"/>
        <rect x="4" y="1" width="0.5" height="0.5" fill="rgba(139,125,107,0.1)"/>
      </pattern>
      
      <!-- Gradient definitions for depth -->
      <radialGradient id="circle-gradient-blue" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:rgba(255,255,255,0.4);stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgba(0,0,0,0.15);stop-opacity:1" />
      </radialGradient>
      
      <radialGradient id="circle-gradient-green" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:rgba(255,255,255,0.4);stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgba(0,0,0,0.15);stop-opacity:1" />
      </radialGradient>
      
      <radialGradient id="circle-gradient-orange" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:rgba(255,255,255,0.4);stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgba(0,0,0,0.15);stop-opacity:1" />
      </radialGradient>
      
      <!-- Drop shadow filter -->
      <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
      </filter>
      
      <!-- Pixelated text effect -->
      <filter id="pixelate-text" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="0" result="smooth"/>
        <feComponentTransfer>
          <feFuncA type="discrete" tableValues="0 .5 1"/>
        </feComponentTransfer>
        <feColorMatrix type="saturate" values="2"/>
      </filter>
    </defs>`;
  }

  /**
   * Add watermark for robotpony theme
   */
  protected addWatermark(): string {
    const { getTheme } = require('../themes');
    const theme = getTheme(this.theme);
    
    if (theme.name === 'robotpony') {
      const watermarkX = this.width - 10;
      const watermarkY = this.height - 10;
      
      return `<text x="${watermarkX}" y="${watermarkY}" font-family="Courier New, monospace" font-size="9" font-weight="700" fill="#999" opacity="0.7" text-anchor="end" letter-spacing="1px">ROBOTPONY.CA</text>`;
    }
    
    return '';
  }

  /**
   * Close SVG tag
   */
  protected closeSVG(): string {
    return this.addWatermark() + '</svg>';
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