/**
 * Test utilities and helpers
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ChartSpec, VennData, PlotData, FlowchartData } from '../../src/parsers/markdown';

/**
 * Create a temporary test file with given content
 */
export async function createTempFile(content: string, extension = '.md'): Promise<string> {
  const tempDir = path.join(__dirname, '..', 'temp');
  await fs.mkdir(tempDir, { recursive: true });
  
  const filename = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${extension}`;
  const filepath = path.join(tempDir, filename);
  
  await fs.writeFile(filepath, content, 'utf-8');
  return filepath;
}

/**
 * Clean up temporary test files
 */
export async function cleanupTempFiles(): Promise<void> {
  const tempDir = path.join(__dirname, '..', 'temp');
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch {
    // Ignore errors if directory doesn't exist
  }
}

/**
 * Create a mock Venn diagram chart spec
 */
export function createMockVennChart(overrides: Partial<VennData> = {}): ChartSpec {
  const defaultData: VennData = {
    sets: [
      { name: 'Set A', size: 100, color: '#blue' },
      { name: 'Set B', size: 100, color: '#red' }
    ],
    intersections: [
      { sets: ['Set A', 'Set B'], size: 50, label: 'Overlap' }
    ],
    background: '#beige'
  };

  return {
    type: 'venn',
    theme: 'robotpony',
    data: { ...defaultData, ...overrides }
  };
}

/**
 * Create a mock plot chart spec
 */
export function createMockPlotChart(overrides: Partial<PlotData> = {}): ChartSpec {
  const defaultData: PlotData = {
    x_axis: 'X Axis',
    y_axis: 'Y Axis',
    x_range: [0, 10],
    y_range: [0, 10],
    line: {
      style: 'solid',
      points: [[1, 2], [5, 6], [9, 8]]
    },
    captions: [
      { text: 'Point A', x: 1, y: 2 },
      { text: 'Point B', x: 5, y: 6 }
    ],
    background: '#beige'
  };

  return {
    type: 'plot',
    theme: 'robotpony',
    data: { ...defaultData, ...overrides }
  };
}

/**
 * Create a mock flowchart chart spec
 */
export function createMockFlowchartChart(overrides: Partial<FlowchartData> = {}): ChartSpec {
  const defaultData: FlowchartData = {
    nodes: [
      { id: 'start', type: 'rectangle', text: 'Start', color: 'blue' },
      { id: 'end', type: 'circle', text: 'End', color: 'green' }
    ],
    connections: [
      { from: 'start', to: 'end', label: 'Next' }
    ],
    background: '#beige'
  };

  return {
    type: 'flowchart',
    theme: 'robotpony',
    data: { ...defaultData, ...overrides }
  };
}

/**
 * Extract specific SVG elements from SVG string
 */
export function extractSVGElements(svg: string, elementType: string): string[] {
  const regex = new RegExp(`<${elementType}[^>]*>`, 'g');
  return svg.match(regex) || [];
}

/**
 * Extract text content from SVG
 */
export function extractSVGText(svg: string): string[] {
  const textRegex = /<text[^>]*>([^<]+)<\/text>/g;
  const matches = [];
  let match;
  
  while ((match = textRegex.exec(svg)) !== null) {
    matches.push(match[1]);
  }
  
  return matches;
}

/**
 * Check if SVG contains specific attributes
 */
export function svgContainsAttributes(svg: string, element: string, attributes: Record<string, string>): boolean {
  const elementRegex = new RegExp(`<${element}[^>]*>`, 'g');
  const matches = svg.match(elementRegex);
  
  if (!matches) return false;
  
  return matches.some(match => {
    return Object.entries(attributes).every(([key, value]) => {
      return match.includes(`${key}="${value}"`);
    });
  });
}

/**
 * Validate SVG structure and required elements
 */
export function validateSVGStructure(svg: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!svg.includes('<svg')) {
    errors.push('Missing opening <svg> tag');
  }
  
  if (!svg.includes('</svg>')) {
    errors.push('Missing closing </svg> tag');
  }
  
  if (!svg.includes('viewBox=')) {
    errors.push('Missing viewBox attribute');
  }
  
  if (!svg.includes('xmlns=')) {
    errors.push('Missing xmlns attribute');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}