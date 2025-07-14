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
    let svg = this.createSVG(data.background);
    
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
      
      // Draw circles with custom colors
      const color1 = this.getSetColor(0, data.sets[0].color);
      const color2 = this.getSetColor(1, data.sets[1].color);
      
      svg += `<circle class="venn-circle" cx="${circle1X}" cy="${centerY}" r="${radius}" fill="${color1}" stroke="${color1}"/>`;
      svg += `<circle class="venn-circle" cx="${circle2X}" cy="${centerY}" r="${radius}" fill="${color2}" stroke="${color2}"/>`;
      
      // Add labels with multi-line support
      svg += this.renderMultiLineText(data.sets[0].name, circle1X - radius * 0.4, centerY, 'set-label');
      svg += this.renderMultiLineText(data.sets[1].name, circle2X + radius * 0.4, centerY, 'set-label');
      
      // Add intersection label if exists
      if (data.intersections && data.intersections.length > 0) {
        const intersection = data.intersections[0];
        const labelText = intersection.label || intersection.size.toString();
        
        if (this.theme === 'robotpony') {
          // Draw badge-style intersection label with connector line
          const badgeY = centerY + radius + 40;
          const badgeWidth = labelText.length * 8 + 20;
          const badgeHeight = 24;
          
          // Connector line
          svg += `<line class="connector-line" x1="${centerX}" y1="${centerY + 10}" x2="${centerX}" y2="${badgeY - badgeHeight/2}"/>`;
          
          // Badge background
          svg += `<rect class="intersection-badge" x="${centerX - badgeWidth/2}" y="${badgeY - badgeHeight/2}" width="${badgeWidth}" height="${badgeHeight}"/>`;
          
          // Badge text
          svg += `<text class="intersection-label" x="${centerX}" y="${badgeY + 4}">${labelText}</text>`;
        } else {
          svg += `<text class="intersection-label" x="${centerX}" y="${centerY + 5}">${labelText}</text>`;
        }
      }
      
    } else if (data.sets.length === 3) {
      // Three circle venn diagram
      const circle1X = centerX;
      const circle1Y = centerY - offset;
      const circle2X = centerX - offset;
      const circle2Y = centerY + offset;
      const circle3X = centerX + offset;
      const circle3Y = centerY + offset;
      
      // Draw circles with custom colors
      const color1 = this.getSetColor(0, data.sets[0].color);
      const color2 = this.getSetColor(1, data.sets[1].color);
      const color3 = this.getSetColor(2, data.sets[2].color);
      
      svg += `<circle class="venn-circle" cx="${circle1X}" cy="${circle1Y}" r="${radius}" fill="${color1}" stroke="${color1}"/>`;
      svg += `<circle class="venn-circle" cx="${circle2X}" cy="${circle2Y}" r="${radius}" fill="${color2}" stroke="${color2}"/>`;
      svg += `<circle class="venn-circle" cx="${circle3X}" cy="${circle3Y}" r="${radius}" fill="${color3}" stroke="${color3}"/>`;
      
      // Add labels with multi-line support
      svg += this.renderMultiLineText(data.sets[0].name, circle1X, circle1Y - radius - 15, 'set-label');
      svg += this.renderMultiLineText(data.sets[1].name, circle2X - radius - 15, circle2Y + radius + 25, 'set-label');
      svg += this.renderMultiLineText(data.sets[2].name, circle3X + radius + 15, circle3Y + radius + 25, 'set-label');
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

  /**
   * Render multi-line text with line breaks
   */
  private renderMultiLineText(text: string, x: number, y: number, className: string, lineHeight: number = 18): string {
    const lines = text.split('\n');
    if (lines.length === 1) {
      return `<text class="${className}" x="${x}" y="${y}">${text}</text>`;
    }

    let svg = `<g class="${className}">`;
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    
    lines.forEach((line, index) => {
      const lineY = startY + (index * lineHeight);
      svg += `<text x="${x}" y="${lineY}">${line}</text>`;
    });
    
    svg += '</g>';
    return svg;
  }

  /**
   * Get color for a set, with custom color support
   */
  private getSetColor(setIndex: number, customColor?: string): string {
    if (customColor) {
      return customColor;
    }
    
    // Default colors for robotpony theme
    const defaultColors = ['#9fb665', '#c8986b', '#7ba23f'];
    return defaultColors[setIndex] || '#9fb665';
  }
}