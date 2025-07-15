"use strict";
/**
 * Smoke tests - basic functionality verification
 */
Object.defineProperty(exports, "__esModule", { value: true });
const factory_1 = require("../src/renderers/factory");
const test_utils_1 = require("./helpers/test-utils");
describe('Smoke Tests', () => {
    describe('Basic functionality', () => {
        it('should create and render a basic Venn diagram', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)();
            const svg = await factory_1.ChartRendererFactory.renderChart(chartSpec);
            expect(svg).toBeDefined();
            expect(svg).toContain('<svg');
            expect(svg).toContain('</svg>');
            const validation = (0, test_utils_1.validateSVGStructure)(svg);
            expect(validation.valid).toBe(true);
        });
        it('should create and render a basic plot graph', async () => {
            const chartSpec = (0, test_utils_1.createMockPlotChart)();
            const svg = await factory_1.ChartRendererFactory.renderChart(chartSpec);
            expect(svg).toBeDefined();
            expect(svg).toContain('<svg');
            expect(svg).toContain('</svg>');
            const validation = (0, test_utils_1.validateSVGStructure)(svg);
            expect(validation.valid).toBe(true);
        });
        it('should apply robotpony theme correctly', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)();
            chartSpec.theme = 'robotpony';
            const svg = await factory_1.ChartRendererFactory.renderChart(chartSpec);
            expect(svg).toContain('Courier New');
            expect(svg).toContain('monospace');
            expect(svg).toContain('drop-shadow');
        });
        it('should handle different chart types through factory', () => {
            expect(() => factory_1.ChartRendererFactory.createRenderer('venn')).not.toThrow();
            expect(() => factory_1.ChartRendererFactory.createRenderer('plot')).not.toThrow();
            expect(() => factory_1.ChartRendererFactory.createRenderer('flowchart')).not.toThrow();
            expect(() => factory_1.ChartRendererFactory.createRenderer('unknown')).toThrow();
        });
        it('should generate valid SVG for all supported chart types', async () => {
            const charts = [
                (0, test_utils_1.createMockVennChart)(),
                (0, test_utils_1.createMockPlotChart)(),
                // Add flowchart when we create the mock helper
            ];
            for (const chart of charts) {
                const svg = await factory_1.ChartRendererFactory.renderChart(chart);
                const validation = (0, test_utils_1.validateSVGStructure)(svg);
                expect(validation.valid).toBe(true);
                expect(validation.errors).toEqual([]);
            }
        });
    });
    describe('Theme consistency', () => {
        it('should apply themes consistently across chart types', async () => {
            const vennChart = (0, test_utils_1.createMockVennChart)();
            const plotChart = (0, test_utils_1.createMockPlotChart)();
            vennChart.theme = 'robotpony';
            plotChart.theme = 'robotpony';
            const vennSvg = await factory_1.ChartRendererFactory.renderChart(vennChart);
            const plotSvg = await factory_1.ChartRendererFactory.renderChart(plotChart);
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
                type: 'venn',
                data: {
                    sets: [
                        { name: 'A', size: 100 },
                        { name: 'B', size: 100 }
                    ]
                }
            };
            const svg = await factory_1.ChartRendererFactory.renderChart(minimalVenn);
            expect((0, test_utils_1.validateSVGStructure)(svg).valid).toBe(true);
        });
        it('should handle empty captions gracefully', async () => {
            const plotWithEmptyCaptions = (0, test_utils_1.createMockPlotChart)({
                captions: []
            });
            const svg = await factory_1.ChartRendererFactory.renderChart(plotWithEmptyCaptions);
            expect((0, test_utils_1.validateSVGStructure)(svg).valid).toBe(true);
        });
    });
});
//# sourceMappingURL=smoke.test.js.map