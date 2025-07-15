/**
 * Markdown parser for extracting chart specifications
 */

// Natural format parser for chart specifications
import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';
import Ajv from 'ajv';
import { getSchemaForType, validationMessages, getColorSuggestion } from '../schemas';

export interface ChartSpec {
  type: 'venn' | 'flowchart' | 'plot' | 'bar' | 'line' | 'pie';
  title?: string;
  data: any;
  theme?: string;
  style?: string;
}

export interface VennData {
  sets: Array<{
    name: string;
    size: number;
    color?: string;
  }>;
  intersections?: Array<{
    sets: string[];
    size: number;
    label?: string;
  }>;
  background?: string;
}

export interface FlowchartData {
  nodes: Array<{
    id: string;
    type: 'diamond' | 'rectangle' | 'circle';
    text: string;
    color?: string;
    x?: number;
    y?: number;
  }>;
  connections: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
  caption?: string;
  subtitle?: string;
  background?: string;
}

export interface PlotData {
  x_axis: string;
  y_axis: string;
  x_range: [number, number];
  y_range: [number, number];
  lines?: Array<{
    style?: 'solid' | 'dotted' | 'dashed' | 'dash-dot';
    color?: string;
    width?: number;
    points: Array<[number, number]>;
    label?: string;
  }>;
  line?: {
    style?: 'solid' | 'dotted' | 'dashed' | 'dash-dot';
    color?: string;
    width?: number;
    points: Array<[number, number]>;
  };
  markers?: Array<{
    type?: 'circle' | 'square' | 'triangle' | 'diamond';
    size?: number;
    color?: string;
    x: number;
    y: number;
    label?: string;
  }>;
  captions: Array<{
    text: string;
    x: number;
    y: number;
  }>;
  grid?: {
    show?: boolean;
    color?: string;
    style?: 'solid' | 'dotted' | 'dashed';
  };
  legend?: {
    show?: boolean;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  };
  background?: string;
}

export class MarkdownParser {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
  }

  /**
   * Parse a markdown file and extract chart specification
   */
  async parseFile(filePath: string): Promise<ChartSpec> {
    const content = await fs.readFile(filePath, 'utf-8');
    return this.parseContent(content);
  }

  /**
   * Parse markdown content and extract chart specification
   */
  parseContent(content: string): ChartSpec {
    const { frontmatter } = this.extractFrontmatter(content);
    
    // Validate frontmatter structure
    this.validateFrontmatter(frontmatter);
    
    // Parse natural format data from frontmatter based on type
    const chartType = frontmatter.type || 'venn';
    const chartData = this.parseNaturalFormat(frontmatter, chartType);
    
    return {
      type: chartType,
      title: frontmatter.title,
      theme: frontmatter.theme,
      style: frontmatter.style,
      data: chartData
    };
  }

  /**
   * Validate frontmatter against schema
   */
  private validateFrontmatter(frontmatter: any): void {
    const chartType = frontmatter.type || 'venn';
    
    try {
      const schema = getSchemaForType(chartType);
      const validate = this.ajv.compile(schema);
      const valid = validate(frontmatter);
      
      if (!valid) {
        const errors = validate.errors || [];
        const errorMessages = errors.map(error => this.formatValidationError(error));
        throw new Error(`Invalid chart specification:\n${errorMessages.join('\n')}`);
      }
    } catch (error: any) {
      if (error.message.includes('Unknown chart type')) {
        throw new Error(`${validationMessages.invalidChartType}. Found: ${chartType}`);
      }
      throw error;
    }
  }

  /**
   * Format validation error into user-friendly message
   */
  private formatValidationError(error: any): string {
    const { instancePath, message, params } = error;
    const field = instancePath.replace('/', '') || 'root';
    
    // Custom error messages for common cases
    if (message === 'must be equal to one of the allowed values') {
      if (field === 'theme') {
        return `❌ ${validationMessages.invalidTheme}. Found: ${params?.allowedValue || 'unknown'}`;
      }
      if (field === 'type') {
        return `❌ ${validationMessages.invalidChartType}. Found: ${params?.allowedValue || 'unknown'}`;
      }
    }
    
    if (message === 'must have required property') {
      return `❌ ${validationMessages.missingRequiredField(params.missingProperty)}`;
    }
    
    if (message?.includes('minimum')) {
      return `❌ Field '${field}' must be greater than or equal to ${params?.limit}`;
    }
    
    if (message?.includes('items')) {
      return `❌ Field '${field}' contains invalid items. ${message}`;
    }
    
    if (field === 'sets' && message?.includes('minItems')) {
      return `❌ ${validationMessages.insufficientSets}`;
    }
    
    if (field === 'sets' && message?.includes('maxItems')) {
      return `❌ ${validationMessages.tooManySets}`;
    }
    
    if (field.includes('points') && message?.includes('minItems')) {
      return `❌ ${validationMessages.insufficientPoints}`;
    }
    
    // Default formatted message
    return `❌ Field '${field}': ${message}`;
  }

  /**
   * Parse natural format from frontmatter
   */
  private parseNaturalFormat(frontmatter: any, chartType: string): VennData | FlowchartData | PlotData {
    if (chartType === 'flowchart') {
      return this.parseFlowchartFormat(frontmatter);
    } else if (chartType === 'plot') {
      return this.parsePlotFormat(frontmatter);
    } else {
      return this.parseVennFormat(frontmatter);
    }
  }

  /**
   * Parse venn diagram format from frontmatter
   */
  private parseVennFormat(frontmatter: any): VennData {
    const vennData: VennData = {
      sets: [],
      intersections: []
    };
    
    // Add background if specified
    if (frontmatter.background) {
      vennData.background = this.parseColorValue(frontmatter.background);
    }
    
    // Parse sets - required for venn diagrams
    if (frontmatter.sets && Array.isArray(frontmatter.sets)) {
      vennData.sets = frontmatter.sets.map((set: any, index: number) => {
        if (typeof set === 'string') {
          const parsed = this.parseSetDefinition(set);
          return {
            ...parsed,
            size: 100 // Default size
          };
        } else if (typeof set === 'object' && set !== null) {
          return {
            name: set.name || `Set ${index + 1}`,
            size: set.size || 100,
            color: set.color ? this.parseColorValue(set.color) : undefined
          };
        }
        return { name: `Set ${index + 1}`, size: 100 };
      });
    } else {
      // Default sets if none provided
      vennData.sets = [
        { name: 'Set A', size: 100 },
        { name: 'Set B', size: 100 }
      ];
    }
    
    // Parse overlap/intersection
    if (frontmatter.overlap) {
      vennData.intersections = [{
        sets: vennData.sets.map(set => set.name),
        size: 30, // Default size
        label: frontmatter.overlap
      }];
    }
    
    // Add automatic line breaks for long names
    vennData.sets = vennData.sets.map(set => ({
      ...set,
      name: this.addAutomaticLineBreaks(set.name)
    }));
    
    return vennData;
  }

  /**
   * Parse flowchart format from frontmatter
   */
  private parseFlowchartFormat(frontmatter: any): FlowchartData {
    const flowchartData: FlowchartData = {
      nodes: [],
      connections: []
    };
    
    // Add background if specified
    if (frontmatter.background) {
      flowchartData.background = this.parseColorValue(frontmatter.background);
    }
    
    // Add caption and subtitle
    if (frontmatter.caption) {
      flowchartData.caption = frontmatter.caption;
    }
    if (frontmatter.subtitle) {
      flowchartData.subtitle = frontmatter.subtitle;
    }
    
    // Parse nodes
    if (frontmatter.nodes && Array.isArray(frontmatter.nodes)) {
      flowchartData.nodes = frontmatter.nodes.map((node: any, index: number) => {
        return {
          id: node.id || `node${index}`,
          type: node.type || 'rectangle',
          text: node.text || `Node ${index + 1}`,
          color: node.color ? this.parseColorValue(node.color) : undefined,
          x: node.x,
          y: node.y
        };
      });
    }
    
    // Parse connections
    if (frontmatter.connections && Array.isArray(frontmatter.connections)) {
      flowchartData.connections = frontmatter.connections.map((conn: any) => ({
        from: conn.from,
        to: conn.to,
        label: conn.label
      }));
    }
    
    return flowchartData;
  }

  /**
   * Parse plot format from frontmatter
   */
  private parsePlotFormat(frontmatter: any): PlotData {
    const plotData: PlotData = {
      x_axis: frontmatter.x_axis || 'X',
      y_axis: frontmatter.y_axis || 'Y',
      x_range: frontmatter.x_range || [0, 10],
      y_range: frontmatter.y_range || [0, 10],
      captions: []
    };

    // Handle legacy single line format
    if (frontmatter.line) {
      plotData.line = {
        style: frontmatter.line.style || 'solid',
        color: frontmatter.line.color ? this.parseColorValue(frontmatter.line.color) : undefined,
        width: frontmatter.line.width || 2,
        points: frontmatter.line.points || [[0, 0], [10, 10]]
      };
    }

    // Handle multiple lines format
    if (frontmatter.lines && Array.isArray(frontmatter.lines)) {
      plotData.lines = frontmatter.lines.map((line: any) => ({
        style: line.style || 'solid',
        color: line.color ? this.parseColorValue(line.color) : undefined,
        width: line.width || 2,
        points: line.points || [],
        label: line.label
      }));
    }

    // Parse markers
    if (frontmatter.markers && Array.isArray(frontmatter.markers)) {
      plotData.markers = frontmatter.markers.map((marker: any) => ({
        type: marker.type || 'circle',
        size: marker.size || 6,
        color: marker.color ? this.parseColorValue(marker.color) : undefined,
        x: marker.x || 0,
        y: marker.y || 0,
        label: marker.label
      }));
    }

    // Parse grid settings
    if (frontmatter.grid) {
      plotData.grid = {
        show: frontmatter.grid.show !== false,
        color: frontmatter.grid.color ? this.parseColorValue(frontmatter.grid.color) : '#e0e0e0',
        style: frontmatter.grid.style || 'dotted'
      };
    }

    // Parse legend settings
    if (frontmatter.legend) {
      plotData.legend = {
        show: frontmatter.legend.show !== false,
        position: frontmatter.legend.position || 'top-right'
      };
    }

    // Add background if specified
    if (frontmatter.background) {
      plotData.background = this.parseColorValue(frontmatter.background);
    }

    // Parse captions
    if (frontmatter.captions && Array.isArray(frontmatter.captions)) {
      plotData.captions = frontmatter.captions.map((caption: any) => ({
        text: caption.text || '',
        x: caption.x || 0,
        y: caption.y || 0
      }));
    }

    return plotData;
  }

  /**
   * Add automatic line breaks to long text
   */
  private addAutomaticLineBreaks(text: string, maxLength: number = 12): string {
    if (text.length <= maxLength || text.includes('\n')) {
      return text;
    }
    
    // Find good break points (spaces, hyphens)
    const words = text.split(/(\s+|-)/);
    let result = '';
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + word).length > maxLength && currentLine.length > 0) {
        result += (result ? '\n' : '') + currentLine.trim();
        currentLine = word;
      } else {
        currentLine += word;
      }
    }
    
    result += (result ? '\n' : '') + currentLine.trim();
    return result;
  }

  /**
   * Extract YAML frontmatter from markdown content
   */
  private extractFrontmatter(content: string): { frontmatter: any; body: string } {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
      const frontmatterText = match[1];
      const body = match[2];
      
      // Parse YAML frontmatter
      const frontmatter = yaml.load(frontmatterText) as any;
      return { frontmatter, body };
    }
    
    return { frontmatter: {}, body: content };
  }

  /**
   * Parse set definition with optional color
   * Examples: "Best Practices (olive)", "Zen and the Art Of (orange)"
   */
  private parseSetDefinition(text: string): { name: string; color?: string } {
    const colorMatch = text.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    
    if (colorMatch) {
      return {
        name: colorMatch[1].trim(),
        color: this.parseColorValue(colorMatch[2].trim())
      };
    }
    
    return { name: text };
  }

  /**
   * Convert natural color names to hex values with suggestions for typos
   */
  private parseColorValue(colorName: string): string {
    const colorMap: Record<string, string> = {
      'olive': '#9fb665',
      'orange': '#c8986b', 
      'beige': '#d4c5a9',
      'blue': '#3498db',
      'red': '#e74c3c',
      'green': '#2ecc71',
      'purple': '#9b59b6',
      'yellow': '#f1c40f',
      'gray': '#95a5a6',
      'grey': '#95a5a6',
      'black': '#2c3e50',
      'white': '#ffffff'
    };
    
    // Return hex color if it starts with #
    if (colorName.startsWith('#')) {
      return colorName;
    }
    
    const lowerColor = colorName.toLowerCase();
    
    // Return mapped color if found
    if (colorMap[lowerColor]) {
      return colorMap[lowerColor];
    }
    
    // Check for suggestions and provide helpful error
    const suggestion = getColorSuggestion(colorName);
    if (suggestion) {
      throw new Error(`❌ Unknown color '${colorName}'. Did you mean '${suggestion}'?`);
    }
    
    // If no suggestion, return original (might be a valid hex or CSS color)
    return colorName;
  }

}