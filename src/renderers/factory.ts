/**
 * Chart renderer factory
 */

import { SVGRenderer, RenderOptions } from './svg';
import { VennDiagramGenerator } from '../generators/venn';
import { FlowchartGenerator } from '../generators/flowchart';
import { ChartSpec } from '../parsers/markdown';

export class ChartRendererFactory {
  /**
   * Create appropriate renderer for chart type
   */
  static createRenderer(chartType: string, options: RenderOptions = {}): SVGRenderer {
    switch (chartType.toLowerCase()) {
      case 'venn':
        return new VennDiagramGenerator(options);
      
      case 'flowchart':
        return new FlowchartGenerator(options);
      
      // TODO: Add other chart types
      case 'bar':
      case 'line':
      case 'pie':
        throw new Error(`Chart type '${chartType}' not yet implemented`);
      
      default:
        throw new Error(`Unknown chart type: ${chartType}`);
    }
  }

  /**
   * Render chart to SVG string
   */
  static async renderChart(chartSpec: ChartSpec, options: RenderOptions = {}): Promise<string> {
    const renderer = this.createRenderer(chartSpec.type, {
      theme: chartSpec.theme,
      ...options
    });
    
    return await renderer.render(chartSpec);
  }

  /**
   * Render chart and save to file
   */
  static async renderToFile(
    chartSpec: ChartSpec, 
    outputPath: string, 
    options: RenderOptions = {}
  ): Promise<void> {
    const svgContent = await this.renderChart(chartSpec, options);
    const renderer = this.createRenderer(chartSpec.type, options);
    await renderer.saveToFile(svgContent, outputPath);
  }
}