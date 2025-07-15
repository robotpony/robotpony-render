"use strict";
/**
 * End-to-end integration tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Core integration test - end to end functionality
const markdown_1 = require("../../src/parsers/markdown");
const factory_1 = require("../../src/renderers/factory");
const test_utils_1 = require("../helpers/test-utils");
describe('End-to-End Integration', () => {
    let parser;
    beforeEach(() => {
        parser = new markdown_1.MarkdownParser();
    });
    afterEach(async () => {
        await (0, test_utils_1.cleanupTempFiles)();
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
            const filepath = await (0, test_utils_1.createTempFile)(markdown);
            const chartSpec = await parser.parseFile(filepath);
            const svg = await factory_1.ChartRendererFactory.renderChart(chartSpec);
            expect(chartSpec.type).toBe('venn');
            expect(chartSpec.theme).toBe('robotpony');
            const validation = (0, test_utils_1.validateSVGStructure)(svg);
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
            const filepath = await (0, test_utils_1.createTempFile)(markdown);
            const chartSpec = await parser.parseFile(filepath);
            const svg = await factory_1.ChartRendererFactory.renderChart(chartSpec);
            expect(chartSpec.type).toBe('plot');
            const validation = (0, test_utils_1.validateSVGStructure)(svg);
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
            const filepath = await (0, test_utils_1.createTempFile)(markdown);
            const chartSpec = await parser.parseFile(filepath);
            const svg = await factory_1.ChartRendererFactory.renderChart(chartSpec);
            // Should include robotpony theme features
            expect(svg).toContain('drop-shadow');
            expect(svg).toContain('vintage-texture');
            expect(svg).toContain('Courier New');
            expect(svg).toContain('monospace');
        });
        it('should handle missing frontmatter gracefully', async () => {
            const markdown = `# Just a title

No frontmatter here.`;
            const filepath = await (0, test_utils_1.createTempFile)(markdown);
            const chartSpec = await parser.parseFile(filepath);
            const svg = await factory_1.ChartRendererFactory.renderChart(chartSpec);
            expect(chartSpec.type).toBe('venn'); // default
            const validation = (0, test_utils_1.validateSVGStructure)(svg);
            expect(validation.valid).toBe(true);
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
line:
  points: [[1,1], [2,2]]
captions: []
---`;
            const vennFile = await (0, test_utils_1.createTempFile)(vennMarkdown);
            const plotFile = await (0, test_utils_1.createTempFile)(plotMarkdown);
            const vennSpec = await parser.parseFile(vennFile);
            const plotSpec = await parser.parseFile(plotFile);
            const vennSvg = await factory_1.ChartRendererFactory.renderChart(vennSpec);
            const plotSvg = await factory_1.ChartRendererFactory.renderChart(plotSpec);
            // Both should produce valid SVG
            expect((0, test_utils_1.validateSVGStructure)(vennSvg).valid).toBe(true);
            expect((0, test_utils_1.validateSVGStructure)(plotSvg).valid).toBe(true);
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
            const filepath = await (0, test_utils_1.createTempFile)(markdown);
            // Should not throw but handle gracefully
            await expect(parser.parseFile(filepath)).resolves.toBeDefined();
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
            const filepath = await (0, test_utils_1.createTempFile)(markdown);
            const chartSpec = await parser.parseFile(filepath);
            const svg = await factory_1.ChartRendererFactory.renderChart(chartSpec);
            // Validate SVG structure
            const validation = (0, test_utils_1.validateSVGStructure)(svg);
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
            const specs = [
                { type: 'venn', sets: ['A', 'B'] },
                { type: 'plot', x_axis: 'X', y_axis: 'Y', line: { points: [[1, 1]] }, captions: [] }
            ];
            for (const spec of specs) {
                const svg = await factory_1.ChartRendererFactory.renderChart({
                    type: spec.type,
                    data: spec
                });
                expect(svg).toMatch(/width="800"/);
                expect(svg).toMatch(/height="600"/);
                expect(svg).toMatch(/viewBox="0 0 800 600"/);
            }
        });
    });
});
//# sourceMappingURL=end-to-end.test.js.map