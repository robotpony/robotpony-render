/**
 * Markdown parser for extracting chart specifications
 */

// Natural format parser for chart specifications
import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';

export interface ChartSpec {
  type: 'venn' | 'flowchart' | 'bar' | 'line' | 'pie';
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

export class MarkdownParser {
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
   * Parse natural format from frontmatter
   */
  private parseNaturalFormat(frontmatter: any, chartType: string): VennData | FlowchartData {
    if (chartType === 'flowchart') {
      return this.parseFlowchartFormat(frontmatter);
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
   * Convert natural color names to hex values
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
    
    // Return mapped color or original if not found
    return colorMap[colorName.toLowerCase()] || colorName;
  }

}