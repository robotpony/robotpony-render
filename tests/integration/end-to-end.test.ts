/**
 * End-to-end integration tests
 */

// Core integration test - end to end functionality
import { MarkdownParser } from '../../src/parsers/markdown';
import { ChartRendererFactory } from '../../src/renderers/factory';
import { createTempFile, cleanupTempFiles, validateSVGStructure } from '../helpers/test-utils';

describe('End-to-End Integration', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  afterEach(async () => {
    await cleanupTempFiles();
  });

  describe('Complete workflow', () => {
    it('should generate Venn diagram from markdown to SVG', async () => {
      const markdown = `---
type: venn
theme: robotpony
sets:
  - "Test A"
  - "Test B"
overlap: "Common Area"
---

# Test Venn Diagram`;

      const filepath = await createTempFile(markdown);
      const chartSpec = await parser.parseFile(filepath);
      const svg = await ChartRendererFactory.renderChart(chartSpec);

      expect(chartSpec.type).toBe('venn');
      expect(chartSpec.theme).toBe('robotpony');
      
      const validation = validateSVGStructure(svg);
      expect(validation.valid).toBe(true);
      
      expect(svg).toContain('Test A');
      expect(svg).toContain('Test B');
      expect(svg).toContain('Common Area');
    });

    it('should generate plot graph from markdown to SVG', async () => {
      const markdown = `---
type: plot
theme: robotpony
x_axis: "Time"
y_axis: "Value"
x_range: [0, 10]
y_range: [0, 10]
line:
  style: dotted
  points:
    - [0, 0]
    - [5, 8]
    - [10, 10]
captions:
  - text: "Start"
    x: 0
    y: 0
  - text: "Peak"
    x: 10
    y: 10
---

# Test Plot`;

      const filepath = await createTempFile(markdown);
      const chartSpec = await parser.parseFile(filepath);
      const svg = await ChartRendererFactory.renderChart(chartSpec);

      expect(chartSpec.type).toBe('plot');
      
      const validation = validateSVGStructure(svg);
      expect(validation.valid).toBe(true);
      
      expect(svg).toContain('Time');
      expect(svg).toContain('Value');
      expect(svg).toContain('Start');
      expect(svg).toContain('Peak');
      expect(svg).toContain('dotted');
    });

    it('should apply robotpony theme enhancements', async () => {
      const markdown = `---
type: venn
theme: robotpony
sets:
  - "Enhanced"
  - "Design"
---`;

      const filepath = await createTempFile(markdown);
      const chartSpec = await parser.parseFile(filepath);
      const svg = await ChartRendererFactory.renderChart(chartSpec);

      // Should include robotpony theme features
      expect(svg).toContain('drop-shadow');
      expect(svg).toContain('vintage-texture');
      expect(svg).toContain('Courier New');
      expect(svg).toContain('monospace');
    });

    it('should reject missing frontmatter with validation error', async () => {
      const markdown = `# Just a title

No frontmatter here.`;

      const filepath = await createTempFile(markdown);
      
      await expect(parser.parseFile(filepath)).rejects.toThrow('Invalid chart specification');
    });

    it('should render multiple chart types consistently', async () => {
      const vennMarkdown = `---
type: venn
sets: ["A", "B"]
---`;

      const plotMarkdown = `---
type: plot
x_axis: "X"
y_axis: "Y"
x_range: [0, 10]
y_range: [0, 10]
line:
  points: [[1,1], [2,2]]
captions: []
---`;

      const vennFile = await createTempFile(vennMarkdown);
      const plotFile = await createTempFile(plotMarkdown);

      const vennSpec = await parser.parseFile(vennFile);
      const plotSpec = await parser.parseFile(plotFile);

      const vennSvg = await ChartRendererFactory.renderChart(vennSpec);
      const plotSvg = await ChartRendererFactory.renderChart(plotSpec);

      // Both should produce valid SVG
      expect(validateSVGStructure(vennSvg).valid).toBe(true);
      expect(validateSVGStructure(plotSvg).valid).toBe(true);

      // Should have different content
      expect(vennSvg).toContain('circle');
      expect(plotSvg).toContain('axis-line');
    });
  });

  describe('Error handling', () => {
    it('should handle invalid YAML gracefully', async () => {
      const markdown = `---
type: venn
invalid: yaml: structure: [
---`;

      const filepath = await createTempFile(markdown);
      
      // Should throw a validation error for invalid YAML
      await expect(parser.parseFile(filepath)).rejects.toThrow('Invalid chart specification');
    });

    it('should handle non-existent files appropriately', async () => {
      await expect(parser.parseFile('/non/existent/file.md'))
        .rejects.toThrow();
    });
  });

  describe('Quality assurance', () => {
    it('should produce SVG with proper structure and styling', async () => {
      const markdown = `---
type: venn
theme: robotpony
sets:
  - "Quality"
  - "Assurance"
---`;

      const filepath = await createTempFile(markdown);
      const chartSpec = await parser.parseFile(filepath);
      const svg = await ChartRendererFactory.renderChart(chartSpec);

      // Validate SVG structure
      const validation = validateSVGStructure(svg);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);

      // Should include proper styling
      expect(svg).toContain('<style type="text/css">');
      expect(svg).toContain('<defs>');
      
      // Should have gradients and patterns for robotpony theme
      expect(svg).toContain('radialGradient');
      expect(svg).toContain('pattern');
      expect(svg).toContain('filter');
    });

    it('should maintain consistent canvas size across chart types', async () => {
      const vennSpec = {
        type: 'venn' as const,
        data: {
          sets: [
            { name: 'A', size: 100 },
            { name: 'B', size: 100 }
          ]
        }
      };

      const plotSpec = {
        type: 'plot' as const,
        data: {
          x_axis: 'X',
          y_axis: 'Y',
          x_range: [0, 10],
          y_range: [0, 10],
          line: { points: [[1,1], [2,2]] },
          captions: []
        }
      };

      for (const spec of [vennSpec, plotSpec]) {
        const svg = await ChartRendererFactory.renderChart(spec);
        
        expect(svg).toMatch(/width="800"/);
        expect(svg).toMatch(/height="600"/);
        expect(svg).toMatch(/viewBox="0 0 800 600"/);
      }
    });
  });
});