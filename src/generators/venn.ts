/**
 * Simple Venn diagram generator using basic SVG
 */

import { SVGRenderer, RenderOptions } from '../renderers/svg';
import { ChartSpec, VennData } from '../parsers/markdown';

export class VennDiagramGenerator extends SVGRenderer {
  constructor(options: RenderOptions = {}) {
    super(options);
  }

  /**
   * Render venn diagram to SVG string
   */
  async render(chartSpec: ChartSpec): Promise<string> {
    const data = chartSpec.data as VennData;
    let svg = this.createSVG();
    
    // Add styles
    svg += this.generateStyles();
    
    // Add title if provided
    if (chartSpec.title) {
      svg += `<text class="chart-title" x="${this.width / 2}" y="30">${chartSpec.title}</text>`;
    }
    
    // Calculate positions for circles
    const centerY = this.height / 2;
    const centerX = this.width / 2;
    const radius = Math.min(this.width, this.height) * 0.15;
    const offset = radius * 0.7;
    
    if (data.sets.length === 2) {
      // Two circle venn diagram
      const circle1X = centerX - offset;
      const circle2X = centerX + offset;
      
      // Draw circles
      svg += `<circle class="venn-circle set-a" cx="${circle1X}" cy="${centerY}" r="${radius}"/>`;
      svg += `<circle class="venn-circle set-b" cx="${circle2X}" cy="${centerY}" r="${radius}"/>`;
      
      // Add labels
      svg += `<text class="set-label" x="${circle1X - radius * 0.5}" y="${centerY + 5}">${data.sets[0].name}</text>`;
      svg += `<text class="set-label" x="${circle2X + radius * 0.5}" y="${centerY + 5}">${data.sets[1].name}</text>`;
      
      // Add intersection label if exists
      if (data.intersections && data.intersections.length > 0) {
        svg += `<text class="intersection-label" x="${centerX}" y="${centerY + 5}">${data.intersections[0].size}</text>`;
      }
      
    } else if (data.sets.length === 3) {
      // Three circle venn diagram
      const circle1X = centerX;
      const circle1Y = centerY - offset;
      const circle2X = centerX - offset;
      const circle2Y = centerY + offset;
      const circle3X = centerX + offset;
      const circle3Y = centerY + offset;
      
      // Draw circles
      svg += `<circle class="venn-circle set-a" cx="${circle1X}" cy="${circle1Y}" r="${radius}"/>`;
      svg += `<circle class="venn-circle set-b" cx="${circle2X}" cy="${circle2Y}" r="${radius}"/>`;
      svg += `<circle class="venn-circle set-c" cx="${circle3X}" cy="${circle3Y}" r="${radius}"/>`;
      
      // Add labels
      svg += `<text class="set-label" x="${circle1X}" y="${circle1Y - radius - 10}">${data.sets[0].name}</text>`;
      svg += `<text class="set-label" x="${circle2X - radius - 10}" y="${circle2Y + radius + 20}">${data.sets[1].name}</text>`;
      svg += `<text class="set-label" x="${circle3X + radius + 10}" y="${circle3Y + radius + 20}">${data.sets[2].name}</text>`;
    }
    
    svg += this.closeSVG();
    return svg;
  }

  /**
   * Generate CSS styles for the diagram
   */
  private generateStyles(): string {
    const styles = this.getThemeStyles();
    return `<defs><style type="text/css">${styles}</style></defs>`;
  }
}