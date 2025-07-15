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
    
    // Draw grid if enabled
    if (data.grid?.show) {
      svg += this.drawGrid(margin, chartWidth, chartHeight, data);
    }
    
    // Draw axes
    svg += this.drawAxes(margin, chartWidth, chartHeight, data);
    
    // Draw plot lines (both single and multiple)
    svg += this.drawPlotLines(margin, chartWidth, chartHeight, data);
    
    // Draw markers
    if (data.markers) {
      svg += this.drawMarkers(margin, chartWidth, chartHeight, data);
    }
    
    // Draw captions
    svg += this.drawCaptions(margin, chartWidth, chartHeight, data);
    
    // Draw legend if enabled
    if (data.legend?.show && (data.lines || data.line)) {
      svg += this.drawLegend(margin, chartWidth, chartHeight, data);
    }
    
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
      .axis-label { font-family: 'Courier New', Monaco, Consolas, monospace; font-size: 14px; font-weight: bold; fill: #333; letter-spacing: 1px; }
      .plot-line { stroke: #333; stroke-width: 2; fill: none; }
      .plot-line.dotted { stroke-dasharray: 4,4; }
      .plot-line.dashed { stroke-dasharray: 8,4; }
      .plot-line.dash-dot { stroke-dasharray: 8,4,2,4; }
      .caption-box { 
        fill: #2c3e50; 
        stroke: #2c3e50; 
        stroke-width: 1; 
        rx: 4; 
        ry: 4; 
      }
      .caption-text { 
        font-family: 'Courier New', Monaco, Consolas, monospace; 
        font-size: 11px; 
        font-weight: bold; 
        text-anchor: middle; 
        fill: white; 
        letter-spacing: 1px;
      }
      .caption-connector { 
        stroke: #333; 
        stroke-width: 1; 
        fill: none; 
      }
      .marker-label {
        font-family: 'Courier New', Monaco, Consolas, monospace;
        font-size: 10px;
        font-weight: bold;
      }
      .legend-text {
        font-family: 'Courier New', Monaco, Consolas, monospace;
        font-size: 12px;
        font-weight: bold;
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
   * Draw grid lines
   */
  private drawGrid(margin: any, chartWidth: number, chartHeight: number, data: PlotData): string {
    if (!data.grid?.show) return '';
    
    let svg = '';
    const originX = margin.left;
    const originY = margin.top + chartHeight;
    const gridColor = data.grid.color || '#e0e0e0';
    const gridStyle = data.grid.style || 'dotted';
    
    // Vertical grid lines
    const xStep = chartWidth / 10;
    for (let i = 1; i < 10; i++) {
      const x = originX + i * xStep;
      svg += `<line x1="${x}" y1="${margin.top}" x2="${x}" y2="${originY}" stroke="${gridColor}" stroke-dasharray="${gridStyle === 'dotted' ? '2,2' : gridStyle === 'dashed' ? '5,5' : 'none'}" stroke-width="1"/>`;
    }
    
    // Horizontal grid lines
    const yStep = chartHeight / 10;
    for (let i = 1; i < 10; i++) {
      const y = margin.top + i * yStep;
      svg += `<line x1="${originX}" y1="${y}" x2="${originX + chartWidth}" y2="${y}" stroke="${gridColor}" stroke-dasharray="${gridStyle === 'dotted' ? '2,2' : gridStyle === 'dashed' ? '5,5' : 'none'}" stroke-width="1"/>`;
    }
    
    return svg;
  }

  /**
   * Draw all plot lines (both single and multiple)
   */
  private drawPlotLines(margin: any, chartWidth: number, chartHeight: number, data: PlotData): string {
    let svg = '';
    
    // Draw legacy single line
    if (data.line && data.line.points && data.line.points.length >= 2) {
      svg += this.drawSingleLine(margin, chartWidth, chartHeight, data.line, data);
    }
    
    // Draw multiple lines
    if (data.lines) {
      for (const line of data.lines) {
        if (line.points && line.points.length >= 2) {
          svg += this.drawSingleLine(margin, chartWidth, chartHeight, line, data);
        }
      }
    }
    
    return svg;
  }

  /**
   * Draw a single plot line
   */
  private drawSingleLine(margin: any, chartWidth: number, chartHeight: number, line: any, data: PlotData): string {
    const originX = margin.left;
    const originY = margin.top + chartHeight;
    
    // Convert data coordinates to SVG coordinates
    const svgPoints = line.points.map(([x, y]: [number, number]) => {
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
    
    const lineClass = `plot-line ${line.style || 'solid'}`;
    const lineColor = line.color || '#333';
    const lineWidth = line.width || 2;
    const dashArray = this.getLineDashArray(line.style);
    
    return `<path class="${lineClass}" d="${pathData}" stroke="${lineColor}" stroke-width="${lineWidth}" stroke-dasharray="${dashArray}" fill="none"/>`;
  }

  /**
   * Get dash array for line style
   */
  private getLineDashArray(style?: string): string {
    switch (style) {
      case 'dotted': return '4,4';
      case 'dashed': return '8,4';
      case 'dash-dot': return '8,4,2,4';
      default: return 'none';
    }
  }

  /**
   * Draw markers
   */
  private drawMarkers(margin: any, chartWidth: number, chartHeight: number, data: PlotData): string {
    if (!data.markers) return '';
    
    let svg = '';
    const originX = margin.left;
    const originY = margin.top + chartHeight;
    
    for (const marker of data.markers) {
      const markerX = originX + (marker.x - data.x_range[0]) / (data.x_range[1] - data.x_range[0]) * chartWidth;
      const markerY = originY - (marker.y - data.y_range[0]) / (data.y_range[1] - data.y_range[0]) * chartHeight;
      const size = marker.size || 6;
      const color = marker.color || '#333';
      
      switch (marker.type) {
        case 'circle':
          svg += `<circle cx="${markerX}" cy="${markerY}" r="${size}" fill="${color}" stroke="${color}"/>`;
          break;
        case 'square':
          svg += `<rect x="${markerX - size}" y="${markerY - size}" width="${size * 2}" height="${size * 2}" fill="${color}" stroke="${color}"/>`;
          break;
        case 'triangle':
          const points = [
            `${markerX},${markerY - size}`,
            `${markerX - size},${markerY + size}`,
            `${markerX + size},${markerY + size}`
          ].join(' ');
          svg += `<polygon points="${points}" fill="${color}" stroke="${color}"/>`;
          break;
        case 'diamond':
          const diamondPoints = [
            `${markerX},${markerY - size}`,
            `${markerX + size},${markerY}`,
            `${markerX},${markerY + size}`,
            `${markerX - size},${markerY}`
          ].join(' ');
          svg += `<polygon points="${diamondPoints}" fill="${color}" stroke="${color}"/>`;
          break;
      }
      
      // Add marker label if provided
      if (marker.label) {
        svg += `<text x="${markerX + size + 5}" y="${markerY - size}" class="marker-label" fill="${color}">${marker.label}</text>`;
      }
    }
    
    return svg;
  }

  /**
   * Draw legend
   */
  private drawLegend(margin: any, chartWidth: number, chartHeight: number, data: PlotData): string {
    const legendItems: Array<{label: string, color: string, style: string}> = [];
    
    // Add single line to legend
    if (data.line) {
      legendItems.push({
        label: 'Line',
        color: data.line.color || '#333',
        style: data.line.style || 'solid'
      });
    }
    
    // Add multiple lines to legend
    if (data.lines) {
      for (const line of data.lines) {
        if (line.label) {
          legendItems.push({
            label: line.label,
            color: line.color || '#333',
            style: line.style || 'solid'
          });
        }
      }
    }
    
    if (legendItems.length === 0) return '';
    
    let svg = '';
    const position = data.legend?.position || 'top-right';
    const legendWidth = 120;
    const legendHeight = legendItems.length * 25 + 10;
    
    let legendX: number;
    let legendY: number;
    
    switch (position) {
      case 'top-left':
        legendX = margin.left + 10;
        legendY = margin.top + 10;
        break;
      case 'top-right':
        legendX = margin.left + chartWidth - legendWidth - 10;
        legendY = margin.top + 10;
        break;
      case 'bottom-left':
        legendX = margin.left + 10;
        legendY = margin.top + chartHeight - legendHeight - 10;
        break;
      case 'bottom-right':
      default:
        legendX = margin.left + chartWidth - legendWidth - 10;
        legendY = margin.top + chartHeight - legendHeight - 10;
        break;
    }
    
    // Legend background
    svg += `<rect x="${legendX}" y="${legendY}" width="${legendWidth}" height="${legendHeight}" fill="rgba(255,255,255,0.9)" stroke="#ccc" stroke-width="1" rx="4"/>`;
    
    // Legend items
    for (let i = 0; i < legendItems.length; i++) {
      const item = legendItems[i];
      const itemY = legendY + 15 + i * 25;
      const dashArray = this.getLineDashArray(item.style);
      
      // Legend line sample
      svg += `<line x1="${legendX + 10}" y1="${itemY}" x2="${legendX + 30}" y2="${itemY}" stroke="${item.color}" stroke-width="2" stroke-dasharray="${dashArray}"/>`;
      
      // Legend text
      svg += `<text x="${legendX + 35}" y="${itemY + 4}" class="legend-text" fill="#333">${item.label}</text>`;
    }
    
    return svg;
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