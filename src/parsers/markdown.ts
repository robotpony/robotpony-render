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
}

export interface VennData {
  sets: Array<{
    name: string;
    size: number;
  }>;
  intersections?: Array<{
    sets: string[];
    size: number;
  }>;
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
    
    // Parse the body for chart data
    const tokens = marked.lexer(body);
    const chartData = this.extractChartData(tokens);
    
    return {
      type: frontmatter.type || 'venn',
      title: frontmatter.title,
      theme: frontmatter.theme,
      data: chartData
    };
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
   * Simple YAML parser for basic frontmatter
   */
  private parseSimpleYaml(yaml: string): any {
    const result: any = {};
    const lines = yaml.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex > 0) {
          const key = trimmed.substring(0, colonIndex).trim();
          const value = trimmed.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
          result[key] = value;
        }
      }
    }
    
    return result;
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