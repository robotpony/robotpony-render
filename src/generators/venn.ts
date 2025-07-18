/**
 * Simple Venn diagram generator using basic SVG
 */

import { SVGRenderer, RenderOptions } from '../renderers/svg';
import { ChartSpec, VennData } from '../parsers/markdown';
import { getAccessibleTextColor } from '../utils/accessibility';
import { getTheme, Theme } from '../themes';
import { renderMultilineText, renderText } from '../utils/text';

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
   * Render venn diagram to SVG string
   */
  async render(chartSpec: ChartSpec): Promise<string> {
    const data = chartSpec.data as VennData;
    let svg = this.createSVG(data.background);
    
    // Add styles within existing defs
    const styles = this.getThemeStyles();
    svg = svg.replace('</defs>', `<style type="text/css">${styles}</style></defs>`);
    
    // Add title if provided
    if (chartSpec.title) {
      const isRobotpony = this.getCurrentTheme().name === 'robotpony';
      svg += renderMultilineText(chartSpec.title, this.width / 2, 40, { 
        class: 'chart-title',
        textAnchor: 'middle',
        pixelated: isRobotpony,
        letterSpacing: isRobotpony ? 3 : undefined
      });
    }
    
    // Calculate positions for circles with improved proportions
    const centerY = this.height / 2;
    const centerX = this.width / 2;
    const radius = Math.min(this.width, this.height) * 0.2; // Optimized size for readability
    const offset = radius * 0.9; // Better overlap calculation for visual appeal
    
    if (data.sets.length === 2) {
      // Check if this should be a subset relationship based on size difference
      const set1Size = typeof data.sets[0] === 'object' ? data.sets[0].size || 100 : 100;
      const set2Size = typeof data.sets[1] === 'object' ? data.sets[1].size || 100 : 100;
      const sizeRatio = Math.min(set1Size, set2Size) / Math.max(set1Size, set2Size);
      
      let circle1X, circle2X, radius1, radius2;
      
      if (sizeRatio < 0.8) {
        // Subset relationship - one circle inside the other
        const largerIndex = set1Size > set2Size ? 0 : 1;
        const smallerIndex = 1 - largerIndex;
        
        // Larger circle at center
        circle1X = centerX;
        radius1 = radius;
        
        // Smaller circle offset within the larger one
        circle2X = centerX - radius * 0.4;
        const circle2Y = centerY - radius * 0.2;
        radius2 = radius * (sizeRatio + 0.2); // Make it appropriately smaller
        
        // Draw larger circle first
        const largerColor = this.getSetColor(largerIndex, data.sets[largerIndex].color);
        const smallerColor = this.getSetColor(smallerIndex, data.sets[smallerIndex].color);
        
        if (this.getCurrentTheme().name === 'robotpony') {
          svg += `<circle class="venn-circle" cx="${circle1X}" cy="${centerY}" r="${radius1}" fill="${largerColor}" stroke="${largerColor}" filter="url(#drop-shadow)"/>`;
          svg += `<circle cx="${circle1X}" cy="${centerY}" r="${radius1}" fill="${this.getGradientOverlay(largerColor)}" opacity="0.6"/>`;
          svg += `<circle cx="${circle1X}" cy="${centerY}" r="${radius1}" fill="url(#vintage-texture)"/>`;
          
          svg += `<circle class="venn-circle" cx="${circle2X}" cy="${circle2Y}" r="${radius2}" fill="${smallerColor}" stroke="${smallerColor}" filter="url(#drop-shadow)"/>`;
          svg += `<circle cx="${circle2X}" cy="${circle2Y}" r="${radius2}" fill="${this.getGradientOverlay(smallerColor)}" opacity="0.6"/>`;
          svg += `<circle cx="${circle2X}" cy="${circle2Y}" r="${radius2}" fill="url(#vintage-texture)"/>`;
        } else {
          svg += `<circle class="venn-circle" cx="${circle1X}" cy="${centerY}" r="${radius1}" fill="${largerColor}" stroke="${largerColor}"/>`;
          svg += `<circle class="venn-circle" cx="${circle2X}" cy="${circle2Y}" r="${radius2}" fill="${smallerColor}" stroke="${smallerColor}"/>`;
        }
        
        // Add labels
        const textColor1 = getAccessibleTextColor(largerColor, false);
        const textColor2 = getAccessibleTextColor(smallerColor, false);
        
        const isRobotpony = this.getCurrentTheme().name === 'robotpony';
        
        // Label for larger circle (positioned to avoid overlap)
        svg += renderText(data.sets[largerIndex].name, centerX + radius * 0.4, centerY + radius * 0.3, { 
          class: 'set-label',
          textAnchor: 'middle',
          fill: textColor1,
          pixelated: isRobotpony,
          fontSize: isRobotpony ? 13 : undefined,
          letterSpacing: isRobotpony ? 2 : undefined
        });
        
        // Label for smaller circle
        svg += renderText(data.sets[smallerIndex].name, circle2X, circle2Y, { 
          class: 'set-label',
          textAnchor: 'middle',
          fill: textColor2,
          pixelated: isRobotpony,
          fontSize: isRobotpony ? 13 : undefined,
          letterSpacing: isRobotpony ? 2 : undefined
        });
        
      } else {
        // Standard overlapping circles
        circle1X = centerX - offset;
        circle2X = centerX + offset;
        
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
        
        // Add labels centered in circles
        const textColor1 = getAccessibleTextColor(color1, false);
        const textColor2 = getAccessibleTextColor(color2, false);
        
        const isRobotpony = this.getCurrentTheme().name === 'robotpony';
        
        svg += renderText(data.sets[0].name, circle1X, centerY, { 
          class: 'set-label',
          textAnchor: 'middle',
          fill: textColor1,
          pixelated: isRobotpony,
          fontSize: isRobotpony ? 13 : undefined,
          letterSpacing: isRobotpony ? 2 : undefined
        });
        svg += renderText(data.sets[1].name, circle2X, centerY, { 
          class: 'set-label',
          textAnchor: 'middle',
          fill: textColor2,
          pixelated: isRobotpony,
          fontSize: isRobotpony ? 13 : undefined,
          letterSpacing: isRobotpony ? 2 : undefined
        });
      }
      
      // Add intersection label if exists
      if (data.intersections && data.intersections.length > 0) {
        const intersection = data.intersections[0];
        const labelText = intersection.label || intersection.size.toString();
        
        if (this.getCurrentTheme().name === 'robotpony') {
          if (intersection.arrow) {
            // Draw arrow-style indicator pointing to intersection
            const arrowStartX = centerX - radius * 1.2;
            const arrowStartY = centerY - radius * 0.8;
            const arrowEndX = centerX - radius * 0.2;
            const arrowEndY = centerY - radius * 0.2;
            
            // Arrow line
            svg += `<line class="connector-line" x1="${arrowStartX}" y1="${arrowStartY}" x2="${arrowEndX}" y2="${arrowEndY}"/>`;
            
            // Arrowhead
            const arrowLength = 8;
            const arrowAngle = Math.PI / 6; // 30 degrees
            const lineAngle = Math.atan2(arrowEndY - arrowStartY, arrowEndX - arrowStartX);
            const x1 = arrowEndX - arrowLength * Math.cos(lineAngle - arrowAngle);
            const y1 = arrowEndY - arrowLength * Math.sin(lineAngle - arrowAngle);
            const x2 = arrowEndX - arrowLength * Math.cos(lineAngle + arrowAngle);
            const y2 = arrowEndY - arrowLength * Math.sin(lineAngle + arrowAngle);
            svg += `<polygon points="${arrowEndX},${arrowEndY} ${x1},${y1} ${x2},${y2}" fill="#34495e" class="arrowhead"/>`;
            
            // Badge positioned near arrow start
            const badgeWidth = labelText.length * 8 + 20;
            const badgeHeight = 20;
            svg += `<rect class="intersection-badge" x="${arrowStartX - badgeWidth - 10}" y="${arrowStartY - badgeHeight/2}" width="${badgeWidth}" height="${badgeHeight}" rx="4" ry="4"/>`;
            
            // Text label near arrow
            svg += renderText(labelText, arrowStartX - 10, arrowStartY + 5, { 
              class: 'intersection-label',
              textAnchor: 'end',
              pixelated: true,
              fontSize: 10,
              letterSpacing: 1
            });
          } else {
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
            svg += renderText(labelText, centerX, bracketY + 20, { 
              class: 'intersection-label',
              textAnchor: 'middle',
              pixelated: true,
              fontSize: 10,
              letterSpacing: 1
            });
          }
        } else {
          svg += renderText(labelText, centerX, centerY + 5, { 
            class: 'intersection-label',
            textAnchor: 'middle'
          });
        }
      }
      
    } else if (data.sets.length === 3) {
      // Three circle venn diagram with organic positioning like robotpony comics
      let circle1X, circle1Y, circle1R;
      let circle2X, circle2Y, circle2R;
      let circle3X, circle3Y, circle3R;
      
      if (this.getCurrentTheme().name === 'robotpony') {
        // Organic layout mimicking the reference c-is-for-cookie.png
        // Large main circle (COOKIE) at center-right
        circle1X = centerX + offset * 0.3;
        circle1Y = centerY - offset * 0.3;
        circle1R = radius * 1.4; // Larger main circle
        
        // Medium circle (C) at top-right, smaller
        circle2X = centerX + offset * 1.2;
        circle2Y = centerY - offset * 1.1;
        circle2R = radius * 0.8; // Smaller secondary circle
        
        // Small circle (ME) at bottom-left
        circle3X = centerX - offset * 0.8;
        circle3Y = centerY + offset * 0.8;
        circle3R = radius * 0.7; // Smallest circle
      } else {
        // Standard symmetric layout for other themes
        circle1X = centerX;
        circle1Y = centerY - offset * 0.7;
        circle1R = radius;
        circle2X = centerX - offset * 0.85;
        circle2Y = centerY + offset * 0.5;
        circle2R = radius;
        circle3X = centerX + offset * 0.85;
        circle3Y = centerY + offset * 0.5;
        circle3R = radius;
      }
      
      // Draw circles with custom colors
      const color1 = this.getSetColor(0, data.sets[0].color);
      const color2 = this.getSetColor(1, data.sets[1].color);
      const color3 = this.getSetColor(2, data.sets[2].color);
      
      // Draw circles with enhanced styling for robotpony theme
      if (this.getCurrentTheme().name === 'robotpony') {
        // Circle 1 (largest)
        svg += `<circle class="venn-circle" cx="${circle1X}" cy="${circle1Y}" r="${circle1R}" fill="${color1}" stroke="${color1}" filter="url(#drop-shadow)"/>`;
        svg += `<circle cx="${circle1X}" cy="${circle1Y}" r="${circle1R}" fill="${this.getGradientOverlay(color1)}" opacity="0.6"/>`;
        svg += `<circle cx="${circle1X}" cy="${circle1Y}" r="${circle1R}" fill="url(#vintage-texture)"/>`;
        
        // Circle 2 (medium)
        svg += `<circle class="venn-circle" cx="${circle2X}" cy="${circle2Y}" r="${circle2R}" fill="${color2}" stroke="${color2}" filter="url(#drop-shadow)"/>`;
        svg += `<circle cx="${circle2X}" cy="${circle2Y}" r="${circle2R}" fill="${this.getGradientOverlay(color2)}" opacity="0.6"/>`;
        svg += `<circle cx="${circle2X}" cy="${circle2Y}" r="${circle2R}" fill="url(#vintage-texture)"/>`;
        
        // Circle 3 (smallest)
        svg += `<circle class="venn-circle" cx="${circle3X}" cy="${circle3Y}" r="${circle3R}" fill="${color3}" stroke="${color3}" filter="url(#drop-shadow)"/>`;
        svg += `<circle cx="${circle3X}" cy="${circle3Y}" r="${circle3R}" fill="${this.getGradientOverlay(color3)}" opacity="0.6"/>`;
        svg += `<circle cx="${circle3X}" cy="${circle3Y}" r="${circle3R}" fill="url(#vintage-texture)"/>`;
      } else {
        svg += `<circle class="venn-circle" cx="${circle1X}" cy="${circle1Y}" r="${circle1R}" fill="${color1}" stroke="${color1}"/>`;
        svg += `<circle class="venn-circle" cx="${circle2X}" cy="${circle2Y}" r="${circle2R}" fill="${color2}" stroke="${color2}"/>`;
        svg += `<circle class="venn-circle" cx="${circle3X}" cy="${circle3Y}" r="${circle3R}" fill="${color3}" stroke="${color3}"/>`;
      }
      
      // Add labels centered in circles
      const textColor1 = getAccessibleTextColor(color1, false);
      const textColor2 = getAccessibleTextColor(color2, false);
      const textColor3 = getAccessibleTextColor(color3, false);
      
      svg += renderMultilineText(data.sets[0].name, circle1X, circle1Y, { 
        class: 'set-label',
        textAnchor: 'middle',
        fill: textColor1
      });
      svg += renderMultilineText(data.sets[1].name, circle2X, circle2Y, { 
        class: 'set-label',
        textAnchor: 'middle',
        fill: textColor2
      });
      svg += renderMultilineText(data.sets[2].name, circle3X, circle3Y, { 
        class: 'set-label',
        textAnchor: 'middle',
        fill: textColor3
      });
    }
    
    svg += this.closeSVG();
    return svg;
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