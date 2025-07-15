/**
 * Smoke tests - basic functionality verification
 */

import { ChartRendererFactory } from '../src/renderers/factory';
import { createMockVennChart, createMockPlotChart, validateSVGStructure } from './helpers/test-utils';

describe('Smoke Tests', () => {
  describe('Basic functionality', () => {
    it('should create and render a basic Venn diagram', async () => {
      const chartSpec = createMockVennChart();
      const svg = await ChartRendererFactory.renderChart(chartSpec);

      expect(svg).toBeDefined();
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      
      const validation = validateSVGStructure(svg);
      expect(validation.valid).toBe(true);
    });

    it('should create and render a basic plot graph', async () => {
      const chartSpec = createMockPlotChart();
      const svg = await ChartRendererFactory.renderChart(chartSpec);

      expect(svg).toBeDefined();
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      
      const validation = validateSVGStructure(svg);
      expect(validation.valid).toBe(true);
    });

    it('should apply robotpony theme correctly', async () => {
      const chartSpec = createMockVennChart();
      chartSpec.theme = 'robotpony';
      
      const svg = await ChartRendererFactory.renderChart(chartSpec);

      expect(svg).toContain('Courier New');
      expect(svg).toContain('monospace');
      expect(svg).toContain('drop-shadow');
    });

    it('should handle different chart types through factory', () => {
      expect(() => ChartRendererFactory.createRenderer('venn')).not.toThrow();
      expect(() => ChartRendererFactory.createRenderer('plot')).not.toThrow();
      expect(() => ChartRendererFactory.createRenderer('flowchart')).not.toThrow();
      
      expect(() => ChartRendererFactory.createRenderer('unknown')).toThrow();
    });

    it('should generate valid SVG for all supported chart types', async () => {
      const charts = [
        createMockVennChart(),
        createMockPlotChart(),
        // Add flowchart when we create the mock helper
      ];

      for (const chart of charts) {
        const svg = await ChartRendererFactory.renderChart(chart);
        const validation = validateSVGStructure(svg);
        
        expect(validation.valid).toBe(true);
        expect(validation.errors).toEqual([]);
      }
    });
  });

  describe('Theme consistency', () => {
    it('should apply themes consistently across chart types', async () => {
      const vennChart = createMockVennChart();
      const plotChart = createMockPlotChart();
      
      vennChart.theme = 'robotpony';
      plotChart.theme = 'robotpony';

      const vennSvg = await ChartRendererFactory.renderChart(vennChart);
      const plotSvg = await ChartRendererFactory.renderChart(plotChart);

      // Both should have robotpony theme characteristics
      expect(vennSvg).toContain('Courier New');
      expect(plotSvg).toContain('Courier New');
      
      expect(vennSvg).toContain('monospace');
      expect(plotSvg).toContain('monospace');
    });
  });

  describe('Error resilience', () => {
    it('should handle minimal chart specifications', async () => {
      const minimalVenn = {
        type: 'venn' as const,
        data: {
          sets: [
            { name: 'A', size: 100 },
            { name: 'B', size: 100 }
          ]
        }
      };

      const svg = await ChartRendererFactory.renderChart(minimalVenn);
      expect(validateSVGStructure(svg).valid).toBe(true);
    });

    it('should handle empty captions gracefully', async () => {
      const plotWithEmptyCaptions = createMockPlotChart({
        captions: []
      });

      const svg = await ChartRendererFactory.renderChart(plotWithEmptyCaptions);
      expect(validateSVGStructure(svg).valid).toBe(true);
    });
  });
});