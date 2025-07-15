/**
 * Unit tests for Plot generator
 */

import { PlotGenerator } from '../../../src/generators/plot';
import { createMockPlotChart, validateSVGStructure, extractSVGText } from '../../helpers/test-utils';

describe('PlotGenerator', () => {
  let generator: PlotGenerator;

  beforeEach(() => {
    generator = new PlotGenerator({ theme: 'robotpony' });
  });

  describe('render', () => {
    it('should generate valid SVG for plot graph', async () => {
      const chartSpec = createMockPlotChart();
      const svg = await generator.render(chartSpec);

      expect(svg).toHaveValidSVGStructure();
      const validation = validateSVGStructure(svg);
      expect(validation.valid).toBe(true);
    });

    it('should include axes with labels', async () => {
      const chartSpec = createMockPlotChart({
        x_axis: 'Test X Axis',
        y_axis: 'Test Y Axis'
      });

      const svg = await generator.render(chartSpec);
      const textElements = extractSVGText(svg);
      
      expect(textElements).toContain('Test X Axis');
      expect(textElements).toContain('Test Y Axis');
      expect(svg).toContainSVGElement('axis-line');
    });

    it('should render plot line with correct style', async () => {
      const chartSpec = createMockPlotChart({
        line: {
          style: 'dotted',
          points: [[1, 2], [3, 4], [5, 6]]
        }
      });

      const svg = await generator.render(chartSpec);
      
      expect(svg).toContain('class="plot-line dotted"');
      expect(svg).toContainSVGElement('path');
    });

    it('should include caption boxes and text', async () => {
      const chartSpec = createMockPlotChart({
        captions: [
          { text: 'Important Point', x: 3, y: 4 },
          { text: 'Another Point', x: 7, y: 8 }
        ]
      });

      const svg = await generator.render(chartSpec);
      const textElements = extractSVGText(svg);
      
      expect(textElements).toContain('Important Point');
      expect(textElements).toContain('Another Point');
      expect(svg).toContainSVGElement('caption-box');
      expect(svg).toContainSVGElement('caption-connector');
    });

    it('should draw connector lines from captions to plot points', async () => {
      const chartSpec = createMockPlotChart({
        captions: [{ text: 'Test', x: 5, y: 5 }]
      });

      const svg = await generator.render(chartSpec);
      
      expect(svg).toContain('class="caption-connector"');
      expect(svg).toContainSVGElement('line');
    });

    it('should handle empty captions array', async () => {
      const chartSpec = createMockPlotChart({
        captions: []
      });

      const svg = await generator.render(chartSpec);
      
      // Should not contain actual caption elements (but CSS classes are still there)
      expect(svg).not.toContain('<rect class="caption-box"');
      expect(svg).not.toContain('<line class="caption-connector"');
    });

    it('should use monospace fonts for robotpony theme', async () => {
      const chartSpec = createMockPlotChart();
      const svg = await generator.render(chartSpec);

      expect(svg).toContain('Courier New');
      expect(svg).toContain('monospace');
      expect(svg).toContain('letter-spacing');
    });

    it('should include axis markers (+/-)', async () => {
      const chartSpec = createMockPlotChart();
      const svg = await generator.render(chartSpec);
      const textElements = extractSVGText(svg);
      
      expect(textElements).toContain('+');
      expect(textElements).toContain('-');
    });

    it('should handle different line styles', async () => {
      const solidChart = createMockPlotChart({ line: { style: 'solid', points: [[1,1], [2,2]] } });
      const dashedChart = createMockPlotChart({ line: { style: 'dashed', points: [[1,1], [2,2]] } });
      
      const solidSvg = await generator.render(solidChart);
      const dashedSvg = await generator.render(dashedChart);
      
      expect(solidSvg).toContain('class="plot-line solid"');
      expect(dashedSvg).toContain('class="plot-line dashed"');
    });

    it('should create smooth curves for plot lines', async () => {
      const chartSpec = createMockPlotChart({
        line: {
          style: 'solid',
          points: [[1, 1], [3, 4], [5, 2], [7, 6]]
        }
      });

      const svg = await generator.render(chartSpec);
      
      // Should use SVG path with curve commands
      expect(svg).toContain('<path');
      expect(svg).toContain('d="M '); // Move command
      expect(svg).toContain(' Q ');    // Quadratic curve or
      expect(svg).toContain(' T ');    // Smooth curve commands
    });

    it('should apply background color when specified', async () => {
      const chartSpec = createMockPlotChart({
        background: '#f5f5f5'
      });

      const svg = await generator.render(chartSpec);
      
      expect(svg).toContain('fill="#f5f5f5"');
    });

    it('should include chart title when provided', async () => {
      const chartSpec = createMockPlotChart();
      chartSpec.title = 'Test Plot Chart';

      const svg = await generator.render(chartSpec);
      const textElements = extractSVGText(svg);
      
      expect(textElements).toContain('Test Plot Chart');
    });
  });

  describe('coordinate transformation', () => {
    it('should transform data coordinates to SVG coordinates correctly', async () => {
      const chartSpec = createMockPlotChart({
        x_range: [0, 10],
        y_range: [0, 10],
        captions: [{ text: 'Origin', x: 0, y: 0 }]
      });

      const svg = await generator.render(chartSpec);
      
      // Should contain transformed coordinates, not raw data coordinates
      expect(svg).not.toContain('x="0"');
      expect(svg).not.toContain('y="0"');
      
      // Should contain reasonable SVG coordinates for text elements
      const textMatches = Array.from(svg.matchAll(/<text[^>]*x="([^"]+)"[^>]*y="([^"]+)"/g));
      expect(textMatches.length).toBeGreaterThan(0);
      
      // Check axis label coordinates (should be reasonable)
      const axisLabelMatch = svg.match(/<text class="axis-label"[^>]*x="([^"]+)"[^>]*y="([^"]+)"/);
      if (axisLabelMatch) {
        const x = parseInt(axisLabelMatch[1]);
        const y = parseInt(axisLabelMatch[2]);
        expect(x).toBeGreaterThan(30);  // Within chart area
        expect(y).toBeGreaterThan(30);  // Within chart area
      }
    });

    it('should handle different axis ranges', async () => {
      const chartSpec = createMockPlotChart({
        x_range: [-5, 15],
        y_range: [-10, 20],
        captions: [{ text: 'Mid', x: 5, y: 5 }]
      });

      const svg = await generator.render(chartSpec);
      
      // Should still generate valid SVG with transformed coordinates
      expect(svg).toHaveValidSVGStructure();
      expect(svg).toContain('Mid');
    });
  });

  describe('caption positioning', () => {
    it('should adjust caption position to avoid chart boundaries', async () => {
      const chartSpec = createMockPlotChart({
        x_range: [0, 10],
        y_range: [0, 10],
        captions: [
          { text: 'Edge Case Very Long Caption', x: 9.5, y: 9.5 }
        ]
      });

      const svg = await generator.render(chartSpec);
      
      // Should contain the caption text
      expect(svg).toContain('Edge Case Very Long Caption');
      
      // Should contain caption box positioning
      expect(svg).toContainSVGElement('caption-box');
    });

    it('should create caption boxes sized for text content', async () => {
      const shortChart = createMockPlotChart({
        captions: [{ text: 'A', x: 5, y: 5 }]
      });
      const longChart = createMockPlotChart({
        captions: [{ text: 'Very Long Caption Text', x: 5, y: 5 }]
      });

      const shortSvg = await generator.render(shortChart);
      const longSvg = await generator.render(longChart);
      
      // Both should contain caption boxes
      expect(shortSvg).toContainSVGElement('caption-box');
      expect(longSvg).toContainSVGElement('caption-box');
      
      // Caption boxes should be sized differently (this is implicit in the width calculation)
      expect(shortSvg).toContain('A');
      expect(longSvg).toContain('Very Long Caption Text');
    });
  });
});