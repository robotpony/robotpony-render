/**
 * Flowchart generator for programming-style diagrams
 */

import { SVGRenderer, RenderOptions } from '../renderers/svg';
import { ChartSpec, FlowchartData } from '../parsers/markdown';

interface Point {
  x: number;
  y: number;
}

interface LayoutNode {
  id: string;
  type: 'diamond' | 'rectangle' | 'circle';
  text: string;
  color?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class FlowchartGenerator extends SVGRenderer {
  constructor(options: RenderOptions = {}) {
    super(options);
  }

  /**
   * Render flowchart to SVG string
   */
  async render(chartSpec: ChartSpec): Promise<string> {
    const data = chartSpec.data as FlowchartData;
    let svg = this.createSVG(data.background);
    
    // Add styles
    svg += this.generateStyles();
    
    // Calculate layout for nodes
    const layoutNodes = this.calculateLayout(data);
    
    // Render connections first (so they appear behind nodes)
    svg += this.renderConnections(data.connections, layoutNodes);
    
    // Render nodes
    for (const node of layoutNodes) {
      svg += this.renderNode(node);
    }
    
    // Add caption if provided
    if (data.caption || data.subtitle) {
      svg += this.renderCaption(data.caption, data.subtitle);
    }
    
    svg += this.closeSVG();
    return svg;
  }

  /**
   * Calculate automatic layout for nodes
   */
  private calculateLayout(data: FlowchartData): LayoutNode[] {
    const nodes = data.nodes;
    const layoutNodes: LayoutNode[] = [];
    
    // Simple vertical layout for now
    const centerX = this.width / 2;
    let currentY = 100;
    const verticalSpacing = 120;
    
    for (const node of nodes) {
      const dimensions = this.getNodeDimensions(node.text, node.type);
      
      layoutNodes.push({
        ...node,
        x: node.x !== undefined ? node.x : centerX,
        y: node.y !== undefined ? node.y : currentY,
        width: dimensions.width,
        height: dimensions.height
      });
      
      currentY += verticalSpacing;
    }
    
    return layoutNodes;
  }

  /**
   * Get dimensions for a node based on text and type
   */
  private getNodeDimensions(text: string, type: string): { width: number; height: number } {
    const lines = text.split('\n');
    const maxLineLength = Math.max(...lines.map(line => line.length));
    
    // Estimate based on character count and font size
    const charWidth = 8; // Approximate character width for monospace font
    const lineHeight = 16;
    
    let width = maxLineLength * charWidth + 40; // Padding
    let height = lines.length * lineHeight + 20; // Padding
    
    // Adjust for shape type
    if (type === 'diamond') {
      width = Math.max(width, 120);
      height = Math.max(height, 80);
    } else if (type === 'circle') {
      const size = Math.max(width, height);
      width = height = size;
    } else {
      // Rectangle
      width = Math.max(width, 100);
      height = Math.max(height, 40);
    }
    
    return { width, height };
  }

  /**
   * Render a single node
   */
  private renderNode(node: LayoutNode): string {
    const { x, y, width, height, type, text, color } = node;
    
    let shape = '';
    const textX = x;
    const textY = y;
    
    // Default colors
    const fillColor = color || (type === 'diamond' ? '#4a5568' : '#8b4513');
    
    switch (type) {
      case 'diamond':
        shape = this.renderDiamond(x, y, width, height, fillColor);
        break;
      case 'circle':
        const radius = Math.min(width, height) / 2;
        shape = `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fillColor}" stroke="${fillColor}" class="flowchart-shape"/>`;
        break;
      case 'rectangle':
      default:
        const rectX = x - width / 2;
        const rectY = y - height / 2;
        shape = `<rect x="${rectX}" y="${rectY}" width="${width}" height="${height}" rx="8" ry="8" fill="${fillColor}" stroke="${fillColor}" class="flowchart-shape"/>`;
        break;
    }
    
    // Render text
    const textSvg = this.renderNodeText(text, textX, textY);
    
    return shape + textSvg;
  }

  /**
   * Render diamond shape
   */
  private renderDiamond(x: number, y: number, width: number, height: number, color: string): string {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    const points = [
      `${x},${y - halfHeight}`, // Top
      `${x + halfWidth},${y}`,  // Right
      `${x},${y + halfHeight}`, // Bottom
      `${x - halfWidth},${y}`   // Left
    ].join(' ');
    
    return `<polygon points="${points}" fill="${color}" stroke="${color}" class="flowchart-shape"/>`;
  }

  /**
   * Render text within a node
   */
  private renderNodeText(text: string, x: number, y: number): string {
    const lines = text.split('\n');
    const lineHeight = 16;
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    
    let textSvg = '<g class="node-text">';
    lines.forEach((line, index) => {
      const lineY = startY + (index * lineHeight);
      textSvg += `<text x="${x}" y="${lineY}" text-anchor="middle" dominant-baseline="middle">${line}</text>`;
    });
    textSvg += '</g>';
    
    return textSvg;
  }

  /**
   * Render connections between nodes
   */
  private renderConnections(connections: any[], nodes: LayoutNode[]): string {
    let svg = '';
    
    for (const conn of connections) {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      
      if (fromNode && toNode) {
        svg += this.renderArrow(fromNode, toNode, conn.label);
      }
    }
    
    return svg;
  }

  /**
   * Render arrow between two nodes
   */
  private renderArrow(from: LayoutNode, to: LayoutNode, label?: string): string {
    // Calculate connection points
    const fromPoint = this.getConnectionPoint(from, to);
    const toPoint = this.getConnectionPoint(to, from);
    
    let svg = `<line x1="${fromPoint.x}" y1="${fromPoint.y}" x2="${toPoint.x}" y2="${toPoint.y}" class="connection-line"/>`;
    
    // Add arrowhead
    svg += this.renderArrowhead(toPoint, from);
    
    // Add label if provided
    if (label) {
      const midX = (fromPoint.x + toPoint.x) / 2;
      const midY = (fromPoint.y + toPoint.y) / 2;
      svg += `<text x="${midX}" y="${midY - 5}" text-anchor="middle" class="connection-label">${label}</text>`;
    }
    
    return svg;
  }

  /**
   * Get connection point on edge of shape
   */
  private getConnectionPoint(node: LayoutNode, target: LayoutNode): Point {
    const dx = target.x - node.x;
    const dy = target.y - node.y;
    const angle = Math.atan2(dy, dx);
    
    if (node.type === 'circle') {
      const radius = Math.min(node.width, node.height) / 2;
      return {
        x: node.x + Math.cos(angle) * radius,
        y: node.y + Math.sin(angle) * radius
      };
    } else if (node.type === 'diamond') {
      // Simplified diamond connection point
      const halfWidth = node.width / 2;
      const halfHeight = node.height / 2;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        // Connect to left or right point
        return {
          x: node.x + (dx > 0 ? halfWidth : -halfWidth),
          y: node.y
        };
      } else {
        // Connect to top or bottom point
        return {
          x: node.x,
          y: node.y + (dy > 0 ? halfHeight : -halfHeight)
        };
      }
    } else {
      // Rectangle
      const halfWidth = node.width / 2;
      const halfHeight = node.height / 2;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        // Connect to left or right edge
        return {
          x: node.x + (dx > 0 ? halfWidth : -halfWidth),
          y: node.y
        };
      } else {
        // Connect to top or bottom edge
        return {
          x: node.x,
          y: node.y + (dy > 0 ? halfHeight : -halfHeight)
        };
      }
    }
  }

  /**
   * Render arrowhead
   */
  private renderArrowhead(point: Point, fromNode: LayoutNode): string {
    const dx = point.x - fromNode.x;
    const dy = point.y - fromNode.y;
    const angle = Math.atan2(dy, dx);
    
    const arrowLength = 8;
    const arrowAngle = Math.PI / 6; // 30 degrees
    
    const x1 = point.x - arrowLength * Math.cos(angle - arrowAngle);
    const y1 = point.y - arrowLength * Math.sin(angle - arrowAngle);
    const x2 = point.x - arrowLength * Math.cos(angle + arrowAngle);
    const y2 = point.y - arrowLength * Math.sin(angle + arrowAngle);
    
    return `<polygon points="${point.x},${point.y} ${x1},${y1} ${x2},${y2}" fill="#2c3e50" class="arrowhead"/>`;
  }

  /**
   * Render caption at bottom
   */
  private renderCaption(caption?: string, subtitle?: string): string {
    if (!caption && !subtitle) return '';
    
    let svg = '';
    const captionY = this.height - 60;
    
    if (caption) {
      svg += `<text x="${this.width / 2}" y="${captionY}" text-anchor="middle" class="flowchart-caption">${caption}</text>`;
    }
    
    if (subtitle) {
      const subtitleY = captionY + (caption ? 20 : 0);
      svg += `<text x="${this.width / 2}" y="${subtitleY}" text-anchor="middle" class="flowchart-subtitle">${subtitle}</text>`;
    }
    
    return svg;
  }

  /**
   * Generate CSS styles for the flowchart
   */
  private generateStyles(): string {
    const styles = this.getThemeStyles();
    return `<defs><style type="text/css">${styles}</style></defs>`;
  }
}