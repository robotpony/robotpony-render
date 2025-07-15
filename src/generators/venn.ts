/**
 * Simple Venn diagram generator using basic SVG
 */

import { SVGRenderer, RenderOptions } from '../renderers/svg';
import { ChartSpec, VennData } from '../parsers/markdown';
import { getAccessibleTextColor } from '../utils/accessibility';
import { getTheme, Theme } from '../themes';

export class VennDiagramGenerator extends SVGRenderer {
  constructor(options: RenderOptions = {}) {
    super(options);
  }

  /**
   * Get the current theme object
   */
  private getCurrentTheme(): Theme {
    return getTheme(this.theme);
  }

  /**
   * Render text with multi-line support
   */
  private renderText(text: string, x: number, y: number, className: string, fill?: string): string {
    const lines = text.split('\n');
    if (lines.length === 1) {
      const fillAttr = fill ? ` fill="${fill}"` : '';
      return `<text class="${className}" x="${x}" y="${y}"${fillAttr}>${text}</text>`;
    }

    // Multi-line text
    let svg = `<g class="${className}">`;
    const lineHeight = 18;
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    
    lines.forEach((line, index) => {
      const lineY = startY + (index * lineHeight);
      const fillAttr = fill ? ` fill="${fill}"` : '';
      svg += `<text x="${x}" y="${lineY}"${fillAttr}>${line}</text>`;
    });
    
    svg += '</g>';
    return svg;
  }

  /**
   * Render venn diagram to SVG string
   */
  async render(chartSpec: ChartSpec): Promise<string> {
    const data = chartSpec.data as VennData;
    let svg = this.createSVG(data.background);
    
    // Add styles
    svg += this.generateStyles();
    
    // Add title if provided with simple rendering
    if (chartSpec.title) {
      svg += this.renderText(chartSpec.title, this.width / 2, 40, 'chart-title');
    }
    
    // Calculate positions for circles with improved proportions
    const centerY = this.height / 2;
    const centerX = this.width / 2;
    const radius = Math.min(this.width, this.height) * 0.2; // Optimized size for readability
    const offset = radius * 0.9; // Better overlap calculation for visual appeal
    
    if (data.sets.length === 2) {
      // Two circle venn diagram
      const circle1X = centerX - offset;
      const circle2X = centerX + offset;
      
      // Draw circles with custom colors
      const color1 = this.getSetColor(0, data.sets[0].color);
      const color2 = this.getSetColor(1, data.sets[1].color);
      
      // Draw circles with enhanced styling for robotpony theme
      if (this.getCurrentTheme().name === 'robotpony') {
        svg += `<circle class="venn-circle" cx="${circle1X}" cy="${centerY}" r="${radius}" fill="${color1}" stroke="${color1}" filter="url(#drop-shadow)"/>`;
        svg += `<circle cx="${circle1X}" cy="${centerY}" r="${radius}" fill="${this.getGradientOverlay(color1)}" opacity="0.6"/>`;
        svg += `<circle cx="${circle1X}" cy="${centerY}" r="${radius}" fill="url(#vintage-texture)"/>`;
        
        svg += `<circle class="venn-circle" cx="${circle2X}" cy="${centerY}" r="${radius}" fill="${color2}" stroke="${color2}" filter="url(#drop-shadow)"/>`;
        svg += `<circle cx="${circle2X}" cy="${centerY}" r="${radius}" fill="${this.getGradientOverlay(color2)}" opacity="0.6"/>`;
        svg += `<circle cx="${circle2X}" cy="${centerY}" r="${radius}" fill="url(#vintage-texture)"/>`;
      } else {
        svg += `<circle class="venn-circle" cx="${circle1X}" cy="${centerY}" r="${radius}" fill="${color1}" stroke="${color1}"/>`;
        svg += `<circle class="venn-circle" cx="${circle2X}" cy="${centerY}" r="${radius}" fill="${color2}" stroke="${color2}"/>`;
      }
      
      // Add labels centered in circles with simple rendering
      const textColor1 = getAccessibleTextColor(color1, false);
      const textColor2 = getAccessibleTextColor(color2, false);
      
      svg += this.renderText(data.sets[0].name, circle1X, centerY, 'set-label', textColor1);
      svg += this.renderText(data.sets[1].name, circle2X, centerY, 'set-label', textColor2);
      
      // Add intersection label if exists
      if (data.intersections && data.intersections.length > 0) {
        const intersection = data.intersections[0];
        const labelText = intersection.label || intersection.size.toString();
        
        if (this.getCurrentTheme().name === 'robotpony') {
          // Draw bracket-style connector like in the comic
          const bracketY = centerY + radius + 30;
          const bracketWidth = radius * 1.5;
          const bracketHeight = 20;
          
          // Vertical connector line from intersection to bracket
          svg += `<line class="connector-line" x1="${centerX}" y1="${centerY + 10}" x2="${centerX}" y2="${bracketY - bracketHeight/2}"/>`;
          
          // Draw bracket shape (inverted U)
          svg += `<path class="connector-line" d="M ${centerX - bracketWidth/2} ${bracketY - bracketHeight/2} L ${centerX - bracketWidth/2} ${bracketY} L ${centerX + bracketWidth/2} ${bracketY} L ${centerX + bracketWidth/2} ${bracketY - bracketHeight/2}" fill="none"/>`;
          
          // Badge background
          const badgeWidth = labelText.length * 8 + 20;
          const badgeHeight = 20;
          svg += `<rect class="intersection-badge" x="${centerX - badgeWidth/2}" y="${bracketY + 5}" width="${badgeWidth}" height="${badgeHeight}"/>`;
          
          // Add intersection text below bracket
          svg += this.renderText(labelText, centerX, bracketY + 20, 'intersection-label');
        } else {
          svg += this.renderText(labelText, centerX, centerY + 5, 'intersection-label');
        }
      }
      
    } else if (data.sets.length === 3) {
      // Three circle venn diagram with improved positioning
      const circle1X = centerX;
      const circle1Y = centerY - offset * 0.7; // Better vertical spacing
      const circle2X = centerX - offset * 0.85; // Optimized horizontal positioning
      const circle2Y = centerY + offset * 0.5;
      const circle3X = centerX + offset * 0.85;
      const circle3Y = centerY + offset * 0.5;
      
      // Draw circles with custom colors
      const color1 = this.getSetColor(0, data.sets[0].color);
      const color2 = this.getSetColor(1, data.sets[1].color);
      const color3 = this.getSetColor(2, data.sets[2].color);
      
      // Draw circles with enhanced styling for robotpony theme
      if (this.getCurrentTheme().name === 'robotpony') {
        // Circle 1
        svg += `<circle class="venn-circle" cx="${circle1X}" cy="${circle1Y}" r="${radius}" fill="${color1}" stroke="${color1}" filter="url(#drop-shadow)"/>`;
        svg += `<circle cx="${circle1X}" cy="${circle1Y}" r="${radius}" fill="${this.getGradientOverlay(color1)}" opacity="0.6"/>`;
        svg += `<circle cx="${circle1X}" cy="${circle1Y}" r="${radius}" fill="url(#vintage-texture)"/>`;
        
        // Circle 2  
        svg += `<circle class="venn-circle" cx="${circle2X}" cy="${circle2Y}" r="${radius}" fill="${color2}" stroke="${color2}" filter="url(#drop-shadow)"/>`;
        svg += `<circle cx="${circle2X}" cy="${circle2Y}" r="${radius}" fill="${this.getGradientOverlay(color2)}" opacity="0.6"/>`;
        svg += `<circle cx="${circle2X}" cy="${circle2Y}" r="${radius}" fill="url(#vintage-texture)"/>`;
        
        // Circle 3
        svg += `<circle class="venn-circle" cx="${circle3X}" cy="${circle3Y}" r="${radius}" fill="${color3}" stroke="${color3}" filter="url(#drop-shadow)"/>`;
        svg += `<circle cx="${circle3X}" cy="${circle3Y}" r="${radius}" fill="${this.getGradientOverlay(color3)}" opacity="0.6"/>`;
        svg += `<circle cx="${circle3X}" cy="${circle3Y}" r="${radius}" fill="url(#vintage-texture)"/>`;
      } else {
        svg += `<circle class="venn-circle" cx="${circle1X}" cy="${circle1Y}" r="${radius}" fill="${color1}" stroke="${color1}"/>`;
        svg += `<circle class="venn-circle" cx="${circle2X}" cy="${circle2Y}" r="${radius}" fill="${color2}" stroke="${color2}"/>`;
        svg += `<circle class="venn-circle" cx="${circle3X}" cy="${circle3Y}" r="${radius}" fill="${color3}" stroke="${color3}"/>`;
      }
      
      // Add labels centered in circles with simple rendering
      const textColor1 = getAccessibleTextColor(color1, false);
      const textColor2 = getAccessibleTextColor(color2, false);
      const textColor3 = getAccessibleTextColor(color3, false);
      
      svg += this.renderText(data.sets[0].name, circle1X, circle1Y, 'set-label', textColor1);
      svg += this.renderText(data.sets[1].name, circle2X, circle2Y, 'set-label', textColor2);
      svg += this.renderText(data.sets[2].name, circle3X, circle3Y, 'set-label', textColor3);
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
   * Get color for a set, with custom color support
   */
  private getSetColor(setIndex: number, customColor?: string): string {
    if (customColor) {
      return customColor;
    }
    
    const theme = this.getCurrentTheme();
    
    if (theme.name === 'robotpony') {
      // Use comic-style colors: burgundy, black, yellow
      const robotponyColors = [theme.colors.primary, theme.colors.secondary, theme.colors.accent];
      return robotponyColors[setIndex] || theme.colors.primary;
    }
    
    // Default theme colors
    const defaultColors = [theme.colors.primary, theme.colors.secondary, theme.colors.accent];
    return defaultColors[setIndex] || theme.colors.primary;
  }


  /**
   * Get gradient overlay URL for enhanced depth
   */
  private getGradientOverlay(color: string): string {
    if (this.getCurrentTheme().name !== 'robotpony') {
      return 'none';
    }

    if (color.includes('#9fb665') || color.includes('olive') || color.includes('green')) {
      return 'url(#circle-gradient-green)';
    } else if (color.includes('#c8986b') || color.includes('orange')) {
      return 'url(#circle-gradient-orange)';
    } else {
      return 'url(#circle-gradient-blue)';
    }
  }
}