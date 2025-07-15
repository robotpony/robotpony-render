/**
 * Chart rendering utilities shared across generators
 */

import { renderText } from './text';

export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface LineStyle {
  style?: string;
  color?: string;
  width?: number;
  points: [number, number][];
}

/**
 * Draw grid lines for charts
 */
export function drawGrid(
  margin: ChartMargin,
  chartWidth: number,
  chartHeight: number,
  gridOptions: { show?: boolean; color?: string; style?: string }
): string {
  if (!gridOptions.show) return '';
  
  let svg = '';
  const originX = margin.left;
  const originY = margin.top + chartHeight;
  const gridColor = gridOptions.color || '#e0e0e0';
  const gridStyle = gridOptions.style || 'dotted';
  
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
 * Draw chart axes with labels
 */
export function drawAxes(
  margin: ChartMargin,
  chartWidth: number,
  chartHeight: number,
  xLabel: string,
  yLabel: string
): string {
  let svg = '';
  
  const originX = margin.left;
  const originY = margin.top + chartHeight;
  
  // Draw X axis
  svg += `<line class="axis-line" x1="${originX}" y1="${originY}" x2="${originX + chartWidth}" y2="${originY}"/>`;
  
  // Draw Y axis
  svg += `<line class="axis-line" x1="${originX}" y1="${originY}" x2="${originX}" y2="${margin.top}"/>`;
  
  // X axis label
  svg += renderText(xLabel, originX + chartWidth / 2, originY + 40, {
    class: 'axis-label',
    textAnchor: 'middle'
  });
  
  // Y axis label (rotated)
  svg += `<text class="axis-label" x="${originX - 40}" y="${margin.top + chartHeight / 2}" text-anchor="middle" transform="rotate(-90 ${originX - 40} ${margin.top + chartHeight / 2})">${yLabel}</text>`;
  
  // Add "+" and "-" symbols at axis ends
  svg += renderText('+', originX + chartWidth + 10, originY + 5, { class: 'axis-label', fontSize: 16 });
  svg += renderText('+', originX - 10, margin.top - 5, { class: 'axis-label', fontSize: 16 });
  svg += renderText('-', originX - 10, originY + 5, { class: 'axis-label', fontSize: 16 });
  svg += renderText('-', originX + chartWidth + 10, originY + 20, { class: 'axis-label', fontSize: 16 });
  
  return svg;
}

/**
 * Get dash array for line style
 */
export function getLineDashArray(style?: string): string {
  switch (style) {
    case 'dotted': return '4,4';
    case 'dashed': return '8,4';
    case 'dash-dot': return '8,4,2,4';
    default: return 'none';
  }
}

/**
 * Convert data coordinates to SVG coordinates
 */
export function dataToSVGCoordinates(
  dataX: number,
  dataY: number,
  margin: ChartMargin,
  chartWidth: number,
  chartHeight: number,
  xRange: [number, number],
  yRange: [number, number]
): Point {
  const originX = margin.left;
  const originY = margin.top + chartHeight;
  
  const svgX = originX + (dataX - xRange[0]) / (xRange[1] - xRange[0]) * chartWidth;
  const svgY = originY - (dataY - yRange[0]) / (yRange[1] - yRange[0]) * chartHeight;
  
  return { x: svgX, y: svgY };
}

/**
 * Create smooth curve path from points using catmull-rom splines
 */
export function createSmoothPath(points: Point[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }
  
  let pathData = `M ${points[0].x} ${points[0].y}`;
  
  // Use cubic bezier curves for smoother interpolation
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    
    // Calculate control points for cubic bezier
    const tension = 0.3; // Tension factor for smoothness
    
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    
    pathData += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  
  return pathData;
}

/**
 * Create organic, hand-drawn style path for robotpony theme
 */
export function createOrganicPath(points: Point[]): string {
  if (points.length < 2) return '';
  
  let pathData = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currPoint = points[i];
    
    // Add slight irregularities for hand-drawn feel
    const wobble = 2;
    const wobbleX = (Math.random() - 0.5) * wobble;
    const wobbleY = (Math.random() - 0.5) * wobble;
    
    // Use cubic bezier with organic variations
    const tension = 0.4;
    const dx = currPoint.x - prevPoint.x;
    const dy = currPoint.y - prevPoint.y;
    
    const cp1x = prevPoint.x + dx * tension + wobbleX;
    const cp1y = prevPoint.y + dy * tension + wobbleY;
    const cp2x = currPoint.x - dx * tension - wobbleX;
    const cp2y = currPoint.y - dy * tension - wobbleY;
    
    pathData += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${currPoint.x} ${currPoint.y}`;
  }
  
  return pathData;
}