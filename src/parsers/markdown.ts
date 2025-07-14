/**
 * Markdown parser for extracting chart specifications
 */

import { marked, Token } from 'marked';
import * as fs from 'fs/promises';

export interface ChartSpec {
  type: 'venn' | 'bar' | 'line' | 'pie';
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
    const { frontmatter, body } = this.extractFrontmatter(content);
    
    // Check if we have natural format data in frontmatter
    let chartData: VennData;
    if (frontmatter.sets || frontmatter.overlap) {
      chartData = this.parseNaturalFormat(frontmatter);
    } else {
      // Parse the body for chart data (legacy JSON format)
      const tokens = marked.lexer(body);
      chartData = this.extractChartData(tokens);
    }
    
    return {
      type: frontmatter.type || 'venn',
      title: frontmatter.title,
      theme: frontmatter.theme,
      style: frontmatter.style,
      data: chartData
    };
  }

  /**
   * Parse natural format from frontmatter
   */
  private parseNaturalFormat(frontmatter: any): VennData {
    const vennData: VennData = {
      sets: [],
      intersections: []
    };
    
    // Add background if specified
    if (frontmatter.background) {
      vennData.background = this.parseColorValue(frontmatter.background);
    }
    
    // Parse sets
    if (frontmatter.sets && Array.isArray(frontmatter.sets)) {
      vennData.sets = frontmatter.sets.map((set: any, index: number) => {
        if (typeof set === 'string') {
          return this.parseSetDefinition(set);
        } else if (typeof set === 'object') {
          return {
            name: set.name || `Set ${index + 1}`,
            size: set.size || 100,
            color: set.color ? this.parseColorValue(set.color) : undefined
          };
        }
        return { name: `Set ${index + 1}`, size: 100 };
      });
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
      
      // Simple YAML parsing for basic key-value pairs
      const frontmatter = this.parseSimpleYaml(frontmatterText);
      return { frontmatter, body };
    }
    
    return { frontmatter: {}, body: content };
  }

  /**
   * Enhanced YAML parser for natural format support
   */
  private parseSimpleYaml(yaml: string): any {
    const result: any = {};
    const lines = yaml.split('\n');
    let currentKey: string | null = null;
    let currentArray: any[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      if (trimmed.startsWith('- ')) {
        // Array item
        if (currentKey) {
          const item = trimmed.substring(2).trim();
          currentArray.push(this.parseSetDefinition(item));
        }
      } else {
        // Save previous array if exists
        if (currentKey && currentArray.length > 0) {
          result[currentKey] = currentArray;
          currentArray = [];
        }
        
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex > 0) {
          const key = trimmed.substring(0, colonIndex).trim();
          const value = trimmed.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
          
          if (value) {
            // Simple key-value
            result[key] = this.parseColorValue(value);
            currentKey = null;
          } else {
            // Array key
            currentKey = key;
            currentArray = [];
          }
        }
      }
    }
    
    // Save final array if exists
    if (currentKey && currentArray.length > 0) {
      result[currentKey] = currentArray;
    }
    
    return result;
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

  /**
   * Extract chart data from markdown tokens
   */
  private extractChartData(tokens: Token[]): any {
    for (const token of tokens) {
      if (token.type === 'code' && (token.lang === 'venn' || token.lang === 'chart')) {
        try {
          return JSON.parse(token.text);
        } catch (error) {
          // If JSON parsing fails, try to parse as simple format
          return this.parseSimpleFormat(token.text);
        }
      }
    }
    
    // If no code block found, try to extract from lists
    return this.extractFromList(tokens);
  }

  /**
   * Parse simple text format for chart data
   */
  private parseSimpleFormat(text: string): VennData {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const sets: Array<{ name: string; size: number }> = [];
    const intersections: Array<{ sets: string[]; size: number }> = [];
    
    for (const line of lines) {
      if (line.includes('∩') || line.includes('&') || line.includes(' and ')) {
        // Intersection
        const parts = line.split(/[∩&]|and/).map(p => p.trim());
        if (parts.length >= 2) {
          const sizeMatch = line.match(/(\d+)$/);
          if (sizeMatch) {
            intersections.push({
              sets: parts.slice(0, -1).map(s => s.replace(/\d+$/, '').trim()),
              size: parseInt(sizeMatch[1])
            });
          }
        }
      } else {
        // Simple set
        const match = line.match(/^(.+?):?\s*(\d+)$/);
        if (match) {
          sets.push({
            name: match[1].trim(),
            size: parseInt(match[2])
          });
        }
      }
    }
    
    return { sets, intersections };
  }

  /**
   * Extract chart data from markdown list tokens
   */
  private extractFromList(tokens: Token[]): VennData {
    const sets: Array<{ name: string; size: number }> = [];
    
    for (const token of tokens) {
      if (token.type === 'list') {
        for (const item of token.items) {
          if (item.type === 'list_item') {
            const text = item.text;
            const match = text.match(/^(.+?):?\s*(\d+)$/);
            if (match) {
              sets.push({
                name: match[1].trim(),
                size: parseInt(match[2])
              });
            }
          }
        }
      }
    }
    
    return { sets, intersections: [] };
  }
}