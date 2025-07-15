/**
 * Plot graph generator for comic-style scatter plots
 */

import { SVGRenderer, RenderOptions } from '../renderers/svg';
import { ChartSpec, PlotData } from '../parsers/markdown';

export class PlotGenerator extends SVGRenderer {
  constructor(options: RenderOptions = {}) {
    super(options);
  }

  /**
   * Render plot graph to SVG string
   */
  async render(chartSpec: ChartSpec): Promise<string> {
    const data = chartSpec.data as PlotData;
    let svg = this.createSVG(data.background || '#d4c5a9'); // Default beige background
    
    // Add styles
    svg += this.generateStyles();
    
    // Chart margins
    const margin = { top: 60, right: 80, bottom: 80, left: 80 };
    const chartWidth = this.width - margin.left - margin.right;
    const chartHeight = this.height - margin.top - margin.bottom;
    
    // Add title if provided
    if (chartSpec.title) {
      svg += `<text class="chart-title" x="${this.width / 2}" y="30">${chartSpec.title}</text>`;
    }
    
    // Draw axes
    svg += this.drawAxes(margin, chartWidth, chartHeight, data);
    
    // Draw plot line
    svg += this.drawPlotLine(margin, chartWidth, chartHeight, data);
    
    // Draw captions
    svg += this.drawCaptions(margin, chartWidth, chartHeight, data);
    
    svg += this.closeSVG();
    return svg;
  }

  /**
   * Generate CSS styles for the plot graph
   */
  private generateStyles(): string {
    const baseStyles = this.getThemeStyles();
    const plotStyles = `
      .axis-line { stroke: #333; stroke-width: 2; fill: none; }
      .axis-label { font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; fill: #333; }
      .plot-line { stroke: #333; stroke-width: 2; fill: none; }
      .plot-line.dotted { stroke-dasharray: 4,4; }
      .plot-line.dashed { stroke-dasharray: 8,4; }
      .caption-box { 
        fill: #2c3e50; 
        stroke: #2c3e50; 
        stroke-width: 1; 
        rx: 4; 
        ry: 4; 
      }
      .caption-text { 
        font-family: Arial, sans-serif; 
        font-size: 11px; 
        font-weight: bold; 
        text-anchor: middle; 
        fill: white; 
      }
      .caption-connector { 
        stroke: #333; 
        stroke-width: 1; 
        fill: none; 
      }
    `;
    
    return `<defs><style type="text/css">${baseStyles}${plotStyles}</style></defs>`;
  }

  /**
   * Draw X and Y axes with labels
   */
  private drawAxes(margin: any, chartWidth: number, chartHeight: number, data: PlotData): string {
    let svg = '';
    
    const originX = margin.left;
    const originY = margin.top + chartHeight;
    
    // Draw X axis
    svg += `<line class="axis-line" x1="${originX}" y1="${originY}" x2="${originX + chartWidth}" y2="${originY}"/>`;
    
    // Draw Y axis
    svg += `<line class="axis-line" x1="${originX}" y1="${originY}" x2="${originX}" y2="${margin.top}"/>`;
    
    // X axis label
    svg += `<text class="axis-label" x="${originX + chartWidth / 2}" y="${originY + 40}" text-anchor="middle">${data.x_axis}</text>`;
    
    // Y axis label (rotated)
    svg += `<text class="axis-label" x="${originX - 40}" y="${margin.top + chartHeight / 2}" text-anchor="middle" transform="rotate(-90 ${originX - 40} ${margin.top + chartHeight / 2})">${data.y_axis}</text>`;
    
    // Add "+" and "-" symbols at axis ends
    svg += `<text class="axis-label" x="${originX + chartWidth + 10}" y="${originY + 5}" font-size="16">+</text>`;
    svg += `<text class="axis-label" x="${originX - 10}" y="${margin.top - 5}" font-size="16">+</text>`;
    svg += `<text class="axis-label" x="${originX - 10}" y="${originY + 5}" font-size="16">-</text>`;
    svg += `<text class="axis-label" x="${originX + chartWidth + 10}" y="${originY + 20}" font-size="16">-</text>`;
    
    return svg;
  }

  /**
   * Draw the plot line
   */
  private drawPlotLine(margin: any, chartWidth: number, chartHeight: number, data: PlotData): string {
    if (!data.line.points || data.line.points.length < 2) {
      return '';
    }
    
    const originX = margin.left;
    const originY = margin.top + chartHeight;
    
    // Convert data coordinates to SVG coordinates
    const svgPoints = data.line.points.map(([x, y]) => {
      const svgX = originX + (x - data.x_range[0]) / (data.x_range[1] - data.x_range[0]) * chartWidth;
      const svgY = originY - (y - data.y_range[0]) / (data.y_range[1] - data.y_range[0]) * chartHeight;
      return [svgX, svgY];
    });
    
    // Create smooth curve using cubic bezier paths
    let pathData = `M ${svgPoints[0][0]} ${svgPoints[0][1]}`;
    
    for (let i = 1; i < svgPoints.length; i++) {
      const prevPoint = svgPoints[i - 1];
      const currPoint = svgPoints[i];
      
      // Simple smooth curve using quadratic bezier
      const controlX = (prevPoint[0] + currPoint[0]) / 2;
      const controlY = (prevPoint[1] + currPoint[1]) / 2;
      
      if (i === 1) {
        pathData += ` Q ${controlX} ${controlY} ${currPoint[0]} ${currPoint[1]}`;
      } else {
        pathData += ` T ${currPoint[0]} ${currPoint[1]}`;
      }
    }
    
    const lineClass = `plot-line ${data.line.style || 'solid'}`;
    return `<path class="${lineClass}" d="${pathData}"/>`;
  }

  /**
   * Draw caption boxes with connector lines
   */
  private drawCaptions(margin: any, chartWidth: number, chartHeight: number, data: PlotData): string {
    let svg = '';
    
    const originX = margin.left;
    const originY = margin.top + chartHeight;
    
    data.captions.forEach(caption => {
      // Convert caption coordinates to SVG coordinates
      const pointX = originX + (caption.x - data.x_range[0]) / (data.x_range[1] - data.x_range[0]) * chartWidth;
      const pointY = originY - (caption.y - data.y_range[0]) / (data.y_range[1] - data.y_range[0]) * chartHeight;
      
      // Calculate caption box dimensions
      const textWidth = caption.text.length * 7 + 16; // Approximate text width
      const textHeight = 18;
      
      // Position caption box to avoid overlaps (simple positioning logic)
      let boxX = pointX + 20;
      let boxY = pointY - textHeight / 2;
      
      // Adjust position if it goes outside chart bounds
      if (boxX + textWidth > margin.left + chartWidth) {
        boxX = pointX - textWidth - 20;
      }
      if (boxY < margin.top) {
        boxY = pointY + 20;
      }
      if (boxY + textHeight > margin.top + chartHeight) {
        boxY = pointY - textHeight - 20;
      }
      
      // Draw connector line from point to caption box
      const boxCenterX = boxX + textWidth / 2;
      const boxCenterY = boxY + textHeight / 2;
      svg += `<line class="caption-connector" x1="${pointX}" y1="${pointY}" x2="${boxCenterX}" y2="${boxCenterY}"/>`;
      
      // Draw caption box
      svg += `<rect class="caption-box" x="${boxX}" y="${boxY}" width="${textWidth}" height="${textHeight}"/>`;
      
      // Draw caption text
      svg += `<text class="caption-text" x="${boxX + textWidth / 2}" y="${boxY + textHeight / 2 + 4}">${caption.text}</text>`;
    });
    
    return svg;
  }
}