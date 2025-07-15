/**
 * Unit tests for markdown parser
 */

import { MarkdownParser, VennData, PlotData } from '../../../src/parsers/markdown';
import { createTempFile, cleanupTempFiles } from '../../helpers/test-utils';

describe('MarkdownParser', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  afterEach(async () => {
    await cleanupTempFiles();
  });

  describe('parseContent', () => {
    it('should parse basic Venn diagram frontmatter', () => {
      const markdown = `---
type: venn
theme: robotpony
background: beige

sets:
  - Best Practices (olive)
  - Philosophy (orange)

overlap: Wishful Thinking
---

# Test diagram`;

      const result = parser.parseContent(markdown);

      expect(result.type).toBe('venn');
      expect(result.theme).toBe('robotpony');
      expect(result.data).toBeDefined();
      
      const vennData = result.data as VennData;
      expect(vennData.sets).toHaveLength(2);
      expect(vennData.sets[0].name).toBe('Best\nPractices');
      expect(vennData.sets[0].color).toBe('#9fb665'); // olive color
      expect(vennData.intersections?.[0].label).toBe('Wishful Thinking');
    });

    it('should parse plot diagram frontmatter', () => {
      const markdown = `---
type: plot
theme: robotpony
x_axis: "Cool"
y_axis: "Relevance"
x_range: [0, 10]
y_range: [0, 10]
line:
  style: dotted
  points:
    - [1, 1]
    - [5, 5]
captions:
  - text: "Test Point"
    x: 1
    y: 1
---

# Test plot`;

      const result = parser.parseContent(markdown);

      expect(result.type).toBe('plot');
      expect(result.theme).toBe('robotpony');
      
      const plotData = result.data as PlotData;
      expect(plotData.x_axis).toBe('Cool');
      expect(plotData.y_axis).toBe('Relevance');
      expect(plotData.line?.style).toBe('dotted');
      expect(plotData.line?.points).toHaveLength(2);
      expect(plotData.captions).toHaveLength(1);
      expect(plotData.captions[0].text).toBe('Test Point');
    });

    it('should throw validation error for missing frontmatter', () => {
      const markdown = `# Just a title

Some content without frontmatter.`;

      expect(() => parser.parseContent(markdown)).toThrow('Invalid chart specification');
    });

    it('should parse frontmatter without body content', () => {
      const markdown = `---
type: venn
sets:
  - A (blue)
  - B (red)
---`;

      const result = parser.parseContent(markdown);

      expect(result.type).toBe('venn');
      const vennData = result.data as VennData;
      expect(vennData.sets).toHaveLength(2);
    });
  });

  describe('parseFile', () => {
    it('should parse file from filesystem', async () => {
      const content = `---
type: venn
sets:
  - Test A
  - Test B
---

# File test`;

      const filepath = await createTempFile(content);
      const result = await parser.parseFile(filepath);

      expect(result.type).toBe('venn');
      const vennData = result.data as VennData;
      expect(vennData.sets).toHaveLength(2);
      expect(vennData.sets[0].name).toBe('Test A');
    });

    it('should throw error for non-existent file', async () => {
      await expect(parser.parseFile('/non/existent/file.md'))
        .rejects.toThrow();
    });
  });

  describe('color parsing', () => {
    it('should parse natural color names', () => {
      const markdown = `---
type: venn
sets:
  - Test (olive)
  - Another (orange)
  - Third (blue)
---`;

      const result = parser.parseContent(markdown);
      const vennData = result.data as VennData;
      
      expect(vennData.sets[0].color).toBe('#9fb665'); // olive
      expect(vennData.sets[1].color).toBe('#c8986b'); // orange  
      expect(vennData.sets[2].color).toBe('#3498db'); // blue
    });

    it('should parse hex color codes', () => {
      const markdown = `---
type: venn
sets:
  - Test (#ff0000)
  - Another (#00ff00)
---`;

      const result = parser.parseContent(markdown);
      const vennData = result.data as VennData;
      
      expect(vennData.sets[0].color).toBe('#ff0000');
      expect(vennData.sets[1].color).toBe('#00ff00');
    });

    it('should handle sets without colors', () => {
      const markdown = `---
type: venn
sets:
  - Plain Text Set
  - Another Plain Set
---`;

      const result = parser.parseContent(markdown);
      const vennData = result.data as VennData;
      
      expect(vennData.sets[0].color).toBeUndefined();
      expect(vennData.sets[1].color).toBeUndefined();
    });
  });

  describe('automatic line breaks', () => {
    it('should add line breaks to long text', () => {
      const markdown = `---
type: venn
sets:
  - Very Long Set Name That Should Break
  - Short
---`;

      const result = parser.parseContent(markdown);
      const vennData = result.data as VennData;
      
      expect(vennData.sets[0].name).toContain('\n');
      expect(vennData.sets[1].name).not.toContain('\n');
    });

    it('should preserve existing line breaks', () => {
      const markdown = `---
type: venn
sets:
  - "Manual\nLine Break"
  - "Another Set"
---`;

      const result = parser.parseContent(markdown);
      const vennData = result.data as VennData;
      
      expect(vennData.sets[0].name).toBe('Manual Line\nBreak');
    });
  });

  describe('validation and defaults', () => {
    it('should validate required fields for venn diagrams', () => {
      const markdown = `---
type: venn
---`;

      expect(() => parser.parseContent(markdown)).toThrow('Invalid chart specification');
    });

    it('should validate required fields for plot data', () => {
      const markdown = `---
type: plot
---`;

      expect(() => parser.parseContent(markdown)).toThrow('Invalid chart specification');
    });
  });
});