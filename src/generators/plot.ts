/**
 * Plot graph generator for comic-style scatter plots
 */

import { SVGRenderer, RenderOptions } from '../renderers/svg';
import { ChartSpec, PlotData } from '../parsers/markdown';
import { renderText } from '../utils/text';
import { getTheme } from '../themes';
import { 
  drawGrid, 
  drawAxes, 
  getLineDashArray, 
  dataToSVGCoordinates, 
  createSmoothPath,
  createOrganicPath,
  ChartMargin
} from '../utils/chart';

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
    
    // Add styles within existing defs
    const styles = this.getThemeStyles();
    svg = svg.replace('</defs>', `<style type="text/css">${styles}</style></defs>`);
    
    // Chart margins
    const margin: ChartMargin = { top: 60, right: 80, bottom: 80, left: 80 };
    const chartWidth = this.width - margin.left - margin.right;
    const chartHeight = this.height - margin.top - margin.bottom;
    
    // Add title if provided
    if (chartSpec.title) {
      const isRobotpony = getTheme(this.theme).name === 'robotpony';
      svg += renderText(chartSpec.title, this.width / 2, 30, {
        class: 'chart-title',
        textAnchor: 'middle',
        pixelated: isRobotpony,
        fontSize: isRobotpony ? 20 : undefined,
        letterSpacing: isRobotpony ? 3 : undefined
      });
    }
    
    // Draw grid if enabled
    svg += drawGrid(margin, chartWidth, chartHeight, data.grid || {});
    
    // Draw axes
    svg += drawAxes(margin, chartWidth, chartHeight, data.x_axis, data.y_axis);
    
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
   * Draw all plot lines (both single and multiple)
   */
  private drawPlotLines(margin: ChartMargin, chartWidth: number, chartHeight: number, data: PlotData): string {
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
  private drawSingleLine(margin: ChartMargin, chartWidth: number, chartHeight: number, line: any, data: PlotData): string {
    // Convert data coordinates to SVG coordinates
    const svgPoints = line.points.map(([x, y]: [number, number]) => 
      dataToSVGCoordinates(x, y, margin, chartWidth, chartHeight, data.x_range, data.y_range)
    );
    
    // Create smooth curve path - use organic curves for robotpony theme
    const pathData = this.theme === 'robotpony' ? 
      createOrganicPath(svgPoints) : 
      createSmoothPath(svgPoints);
    
    const lineClass = `plot-line ${line.style || 'solid'}`;
    const lineColor = line.color || '#333';
    const lineWidth = line.width || 2;
    const dashArray = getLineDashArray(line.style);
    
    return `<path class="${lineClass}" d="${pathData}" stroke="${lineColor}" stroke-width="${lineWidth}" stroke-dasharray="${dashArray}" fill="none"/>`;
  }

  /**
   * Draw markers
   */
  private drawMarkers(margin: ChartMargin, chartWidth: number, chartHeight: number, data: PlotData): string {
    if (!data.markers) return '';
    
    let svg = '';
    
    for (const marker of data.markers) {
      const point = dataToSVGCoordinates(marker.x, marker.y, margin, chartWidth, chartHeight, data.x_range, data.y_range);
      const size = marker.size || 6;
      const color = marker.color || '#333';
      
      switch (marker.type) {
        case 'circle':
          svg += `<circle cx="${point.x}" cy="${point.y}" r="${size}" fill="${color}" stroke="${color}"/>`;
          break;
        case 'square':
          svg += `<rect x="${point.x - size}" y="${point.y - size}" width="${size * 2}" height="${size * 2}" fill="${color}" stroke="${color}"/>`;
          break;
        case 'triangle':
          const points = [
            `${point.x},${point.y - size}`,
            `${point.x - size},${point.y + size}`,
            `${point.x + size},${point.y + size}`
          ].join(' ');
          svg += `<polygon points="${points}" fill="${color}" stroke="${color}"/>`;
          break;
        case 'diamond':
          const diamondPoints = [
            `${point.x},${point.y - size}`,
            `${point.x + size},${point.y}`,
            `${point.x},${point.y + size}`,
            `${point.x - size},${point.y}`
          ].join(' ');
          svg += `<polygon points="${diamondPoints}" fill="${color}" stroke="${color}"/>`;
          break;
      }
      
      // Add marker label if provided
      if (marker.label) {
        svg += renderText(marker.label, point.x + size + 5, point.y - size, {
          class: 'marker-label',
          fill: color
        });
      }
    }
    
    return svg;
  }

  /**
   * Draw legend
   */
  private drawLegend(margin: ChartMargin, chartWidth: number, chartHeight: number, data: PlotData): string {
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
      const dashArray = getLineDashArray(item.style);
      
      // Legend line sample
      svg += `<line x1="${legendX + 10}" y1="${itemY}" x2="${legendX + 30}" y2="${itemY}" stroke="${item.color}" stroke-width="2" stroke-dasharray="${dashArray}"/>`;
      
      // Legend text
      svg += renderText(item.label, legendX + 35, itemY + 4, {
        class: 'legend-text',
        fill: '#333'
      });
    }
    
    return svg;
  }

  /**
   * Draw caption boxes with connector lines
   */
  private drawCaptions(margin: ChartMargin, chartWidth: number, chartHeight: number, data: PlotData): string {
    let svg = '';
    
    data.captions.forEach(caption => {
      // Convert caption coordinates to SVG coordinates
      const point = dataToSVGCoordinates(caption.x, caption.y, margin, chartWidth, chartHeight, data.x_range, data.y_range);
      
      // Calculate caption box dimensions
      const textWidth = caption.text.length * 7 + 16; // Approximate text width
      const textHeight = 18;
      
      // Position caption box to avoid overlaps (simple positioning logic)
      let boxX = point.x + 20;
      let boxY = point.y - textHeight / 2;
      
      // Adjust position if it goes outside chart bounds
      if (boxX + textWidth > margin.left + chartWidth) {
        boxX = point.x - textWidth - 20;
      }
      if (boxY < margin.top) {
        boxY = point.y + 20;
      }
      if (boxY + textHeight > margin.top + chartHeight) {
        boxY = point.y - textHeight - 20;
      }
      
      // Draw connector line from point to caption box
      const boxCenterX = boxX + textWidth / 2;
      const boxCenterY = boxY + textHeight / 2;
      svg += `<line class="caption-connector" x1="${point.x}" y1="${point.y}" x2="${boxCenterX}" y2="${boxCenterY}"/>`;
      
      // Draw caption box
      svg += `<rect class="caption-box" x="${boxX}" y="${boxY}" width="${textWidth}" height="${textHeight}"/>`;
      
      // Draw caption text
      const isRobotpony = getTheme(this.theme).name === 'robotpony';
      svg += renderText(caption.text, boxX + textWidth / 2, boxY + textHeight / 2 + 4, {
        class: 'caption-text',
        textAnchor: 'middle',
        pixelated: isRobotpony,
        fontSize: isRobotpony ? 10 : undefined,
        letterSpacing: isRobotpony ? 1 : undefined
      });
    });
    
    return svg;
  }
}