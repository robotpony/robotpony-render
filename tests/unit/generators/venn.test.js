"use strict";
/**
 * Unit tests for Venn diagram generator
 */
Object.defineProperty(exports, "__esModule", { value: true });
const venn_1 = require("../../../src/generators/venn");
const test_utils_1 = require("../../helpers/test-utils");
describe('VennDiagramGenerator', () => {
    let generator;
    beforeEach(() => {
        generator = new venn_1.VennDiagramGenerator({ theme: 'robotpony' });
    });
    describe('render', () => {
        it('should generate valid SVG for two-circle Venn diagram', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)();
            const svg = await generator.render(chartSpec);
            expect(svg).toHaveValidSVGStructure();
            expect(svg).toContainSVGElement('circle');
            expect(svg).toContainSVGElement('text');
            const validation = (0, test_utils_1.validateSVGStructure)(svg);
            expect(validation.valid).toBe(true);
        });
        it('should generate three circles for three-set diagram', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)({
                sets: [
                    { name: 'A', size: 100, color: 'blue' },
                    { name: 'B', size: 100, color: 'red' },
                    { name: 'C', size: 100, color: 'green' }
                ]
            });
            const svg = await generator.render(chartSpec);
            const circles = svg.match(/<circle[^>]*class="venn-circle"/g);
            // Should have 3 base circles with venn-circle class
            expect(circles).toHaveLength(3);
        });
        it('should include set labels in generated SVG', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)({
                sets: [
                    { name: 'First Set', size: 100 },
                    { name: 'Second Set', size: 100 }
                ]
            });
            const svg = await generator.render(chartSpec);
            const textElements = (0, test_utils_1.extractSVGText)(svg);
            expect(textElements).toContain('First Set');
            expect(textElements).toContain('Second Set');
        });
        it('should include intersection labels when provided', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)({
                intersections: [
                    { sets: ['Set A', 'Set B'], size: 50, label: 'Overlap Area' }
                ]
            });
            const svg = await generator.render(chartSpec);
            const textElements = (0, test_utils_1.extractSVGText)(svg);
            expect(textElements).toContain('Overlap Area');
            expect(svg).toContainSVGElement('intersection-badge');
            expect(svg).toContainSVGElement('connector-line');
        });
        it('should not include intersection elements when no overlap specified', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)({
                intersections: undefined
            });
            const svg = await generator.render(chartSpec);
            expect(svg).not.toContain('<rect class="intersection-badge"');
            expect(svg).not.toContain('<line class="connector-line"');
        });
        it('should center text within circles', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)();
            const svg = await generator.render(chartSpec);
            // Extract first venn circle center and first text position
            const circleMatch = svg.match(/<circle[^>]*class="venn-circle"[^>]*cx="([^"]+)"[^>]*cy="([^"]+)"/);
            const textMatch = svg.match(/<text[^>]*class="set-label"[^>]*x="([^"]+)"[^>]*y="([^"]+)"/);
            expect(circleMatch).toBeTruthy();
            expect(textMatch).toBeTruthy();
            // Text should be positioned at circle center
            if (circleMatch && textMatch) {
                expect(textMatch[1]).toBe(circleMatch[1]); // x coordinates match
                expect(textMatch[2]).toBe(circleMatch[2]); // y coordinates match
            }
        });
        it('should apply robotpony theme enhancements', async () => {
            const generator = new venn_1.VennDiagramGenerator({ theme: 'robotpony' });
            const chartSpec = (0, test_utils_1.createMockVennChart)();
            const svg = await generator.render(chartSpec);
            // Should include drop shadows, gradients, and textures
            expect(svg).toContain('filter="url(#drop-shadow)"');
            expect(svg).toContain('fill="url(#circle-gradient-');
            expect(svg).toContain('fill="url(#vintage-texture)"');
            expect(svg).toContain('font-family: \'Courier New\'');
        });
        it('should not apply enhancements for default theme', async () => {
            const generator = new venn_1.VennDiagramGenerator({ theme: 'default' });
            const chartSpec = (0, test_utils_1.createMockVennChart)();
            const svg = await generator.render(chartSpec);
            // Should not include robotpony enhancements
            expect(svg).not.toContain('filter="url(#drop-shadow)"');
            expect(svg).not.toContain('fill="url(#circle-gradient-');
            expect(svg).not.toContain('fill="url(#vintage-texture)"');
        });
        it('should use custom colors when specified', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)({
                sets: [
                    { name: 'Custom', size: 100, color: '#ff0000' },
                    { name: 'Another', size: 100, color: '#00ff00' }
                ]
            });
            const svg = await generator.render(chartSpec);
            expect(svg).toContain('fill="#ff0000"');
            expect(svg).toContain('fill="#00ff00"');
        });
        it('should handle multi-line text labels', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)({
                sets: [
                    { name: 'Multi\nLine\nText', size: 100 },
                    { name: 'Single', size: 100 }
                ]
            });
            const svg = await generator.render(chartSpec);
            // Should contain <g> element for multi-line text
            expect(svg).toContain('<g class="set-label">');
            expect(svg).toContain('Multi');
            expect(svg).toContain('Line');
            expect(svg).toContain('Text');
        });
        it('should include chart title when provided', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)();
            chartSpec.title = 'Test Chart Title';
            const svg = await generator.render(chartSpec);
            const textElements = (0, test_utils_1.extractSVGText)(svg);
            expect(textElements).toContain('Test Chart Title');
            expect(svg).toContainSVGElement('chart-title');
        });
        it('should apply background color when specified', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)({
                background: '#f0f0f0'
            });
            const svg = await generator.render(chartSpec);
            expect(svg).toContain('fill="#f0f0f0"');
        });
    });
    describe('styling and themes', () => {
        it('should include CSS styles in output', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)();
            const svg = await generator.render(chartSpec);
            expect(svg).toContain('<style type="text/css">');
            expect(svg).toContain('.set-label');
            expect(svg).toContain('.venn-circle');
        });
        it('should use monospace fonts for robotpony theme', async () => {
            const generator = new venn_1.VennDiagramGenerator({ theme: 'robotpony' });
            const chartSpec = (0, test_utils_1.createMockVennChart)();
            const svg = await generator.render(chartSpec);
            expect(svg).toContain('Courier New');
            expect(svg).toContain('monospace');
            expect(svg).toContain('letter-spacing');
        });
    });
    describe('positioning and layout', () => {
        it('should use proper circle sizing', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)();
            const svg = await generator.render(chartSpec);
            // Should use 18% of canvas size for radius (108 pixels for 600px canvas)
            const radiusMatch = svg.match(/<circle[^>]*class="venn-circle"[^>]*r="([^"]+)"/);
            expect(radiusMatch).toBeTruthy();
            if (radiusMatch) {
                const radius = parseFloat(radiusMatch[1]);
                expect(radius).toBeGreaterThan(100); // Should be reasonably sized (108px expected)
                expect(radius).toBeLessThan(120); // But not too large
            }
        });
        it('should create overlapping circles', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)();
            const svg = await generator.render(chartSpec);
            const circleMatches = Array.from(svg.matchAll(/<circle[^>]*class="venn-circle"[^>]*cx="([^"]+)"/g));
            expect(circleMatches).toHaveLength(2); // 2 base circles
            // Extract positions of first two circles
            const pos1 = parseFloat(circleMatches[0][1]);
            const pos2 = parseFloat(circleMatches[1][1]);
            // Circles should be positioned to overlap
            const distance = Math.abs(pos1 - pos2);
            expect(distance).toBeLessThan(200); // Should overlap
            expect(distance).toBeGreaterThan(50); // But not be identical
        });
    });
});
//# sourceMappingURL=venn.test.js.map