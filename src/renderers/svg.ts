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
  protected applyTheme(_svg: any): void {
    // This method is now deprecated since we're building SVG as strings
    // Use getThemeStyles() directly in the render method
  }

  /**
   * Get CSS styles for the current theme
   */
  protected getThemeStyles(): string {
    const themes: Record<string, string> = {
      default: `
        .chart-title { font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; text-anchor: middle; }
        .set-label { font-family: Arial, sans-serif; font-size: 14px; text-anchor: middle; fill: #333; }
        .venn-circle { fill: rgba(31, 119, 180, 0.3); stroke: rgba(31, 119, 180, 0.8); stroke-width: 2; }
        .venn-circle.set-a { fill: rgba(31, 119, 180, 0.3); stroke: rgba(31, 119, 180, 0.8); }
        .venn-circle.set-b { fill: rgba(255, 127, 14, 0.3); stroke: rgba(255, 127, 14, 0.8); }
        .venn-circle.set-c { fill: rgba(44, 160, 44, 0.3); stroke: rgba(44, 160, 44, 0.8); }
      `,
      rp: `
        .chart-title { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 24px; font-weight: 300; text-anchor: middle; fill: #2c3e50; }
        .set-label { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; text-anchor: middle; fill: #34495e; font-weight: 500; }
        .venn-circle { stroke-width: 3; }
        .venn-circle.set-a { fill: rgba(52, 152, 219, 0.4); stroke: rgba(52, 152, 219, 1); }
        .venn-circle.set-b { fill: rgba(231, 76, 60, 0.4); stroke: rgba(231, 76, 60, 1); }
        .venn-circle.set-c { fill: rgba(46, 204, 113, 0.4); stroke: rgba(46, 204, 113, 1); }
        .intersection-label { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; text-anchor: middle; fill: #2c3e50; font-weight: 600; }
      `,
      robotpony: `
        .chart-title { font-family: 'Courier New', Monaco, Consolas, monospace; font-size: 18px; font-weight: bold; text-anchor: middle; fill: #333; letter-spacing: 1px; }
        .set-label { font-family: 'Courier New', Monaco, Consolas, monospace; font-size: 16px; font-weight: bold; text-anchor: middle; fill: white; letter-spacing: 2px; }
        .venn-circle { stroke-width: 2; opacity: 0.8; }
        .intersection-label { 
          font-family: 'Courier New', Monaco, Consolas, monospace; 
          font-size: 12px; 
          font-weight: bold; 
          text-anchor: middle; 
          fill: white; 
          letter-spacing: 1px;
        }
        .intersection-badge { 
          fill: #2c3e50; 
          stroke: #2c3e50; 
          stroke-width: 2; 
          rx: 8; 
          ry: 8; 
        }
        .connector-line { 
          stroke: #2c3e50; 
          stroke-width: 2; 
          fill: none; 
        }
        /* Flowchart styles */
        .flowchart-shape { stroke-width: 2; opacity: 0.9; }
        .node-text { font-family: 'Courier New', Monaco, Consolas, monospace; font-size: 12px; font-weight: bold; fill: white; text-anchor: middle; }
        .connection-line { stroke: #2c3e50; stroke-width: 2; fill: none; }
        .connection-label { font-family: 'Courier New', Monaco, Consolas, monospace; font-size: 10px; fill: #2c3e50; font-weight: bold; }
        .arrowhead { fill: #2c3e50; }
        .flowchart-caption { font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; fill: #2c3e50; }
        .flowchart-subtitle { font-family: Arial, sans-serif; font-size: 12px; fill: #666; }
      `
    };
    
    return themes[this.theme] || themes.default;
  }

  /**
   * Save SVG to file
   */
  async saveToFile(svg: string, filePath: string): Promise<void> {
    await fs.writeFile(filePath, svg, 'utf-8');
  }
}