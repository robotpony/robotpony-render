/**
 * Unit tests for Chart Renderer Factory
 */

import { ChartRendererFactory } from '../../../src/renderers/factory';
import { VennDiagramGenerator } from '../../../src/generators/venn';
import { PlotGenerator } from '../../../src/generators/plot';
import { FlowchartGenerator } from '../../../src/generators/flowchart';
import { createMockVennChart, createMockPlotChart } from '../../helpers/test-utils';

describe('ChartRendererFactory', () => {
  describe('createRenderer', () => {
    it('should create VennDiagramGenerator for venn type', () => {
      const renderer = ChartRendererFactory.createRenderer('venn');
      expect(renderer).toBeInstanceOf(VennDiagramGenerator);
    });

    it('should create PlotGenerator for plot type', () => {
      const renderer = ChartRendererFactory.createRenderer('plot');
      expect(renderer).toBeInstanceOf(PlotGenerator);
    });

    it('should create FlowchartGenerator for flowchart type', () => {
      const renderer = ChartRendererFactory.createRenderer('flowchart');
      expect(renderer).toBeInstanceOf(FlowchartGenerator);
    });

    it('should be case insensitive', () => {
      const renderer1 = ChartRendererFactory.createRenderer('VENN');
      const renderer2 = ChartRendererFactory.createRenderer('Plot');
      
      expect(renderer1).toBeInstanceOf(VennDiagramGenerator);
      expect(renderer2).toBeInstanceOf(PlotGenerator);
    });

    it('should throw error for unsupported chart types', () => {
      expect(() => ChartRendererFactory.createRenderer('bar'))
        .toThrow('Chart type \'bar\' not yet implemented');
        
      expect(() => ChartRendererFactory.createRenderer('unknown'))
        .toThrow('Unknown chart type: unknown');
    });

    it('should pass options to renderer', () => {
      const options = { theme: 'robotpony', width: 1000, height: 800 };
      const renderer = ChartRendererFactory.createRenderer('venn', options);
      
      expect(renderer).toBeInstanceOf(VennDiagramGenerator);
      // Options are passed to constructor, which we can't easily test without exposing them
    });
  });

  describe('renderChart', () => {
    it('should render Venn diagram chart', async () => {
      const chartSpec = createMockVennChart();
      const svg = await ChartRendererFactory.renderChart(chartSpec);
      
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('circle');
    });

    it('should render plot chart', async () => {
      const chartSpec = createMockPlotChart();
      const svg = await ChartRendererFactory.renderChart(chartSpec);
      
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('axis-line');
    });

    it('should apply theme from chart spec', async () => {
      const chartSpec = createMockVennChart();
      chartSpec.theme = 'robotpony';
      
      const svg = await ChartRendererFactory.renderChart(chartSpec);
      
      expect(svg).toContain('Courier New');
      expect(svg).toContain('monospace');
    });

    it('should override theme with options', async () => {
      const chartSpec = createMockVennChart();
      chartSpec.theme = 'default';
      
      const svg = await ChartRendererFactory.renderChart(chartSpec, { theme: 'robotpony' });
      
      expect(svg).toContain('Courier New');
    });
  });
});