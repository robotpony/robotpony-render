"use strict";
/**
 * Unit tests for Chart Renderer Factory
 */
Object.defineProperty(exports, "__esModule", { value: true });
const factory_1 = require("../../../src/renderers/factory");
const venn_1 = require("../../../src/generators/venn");
const plot_1 = require("../../../src/generators/plot");
const flowchart_1 = require("../../../src/generators/flowchart");
const test_utils_1 = require("../../helpers/test-utils");
describe('ChartRendererFactory', () => {
    describe('createRenderer', () => {
        it('should create VennDiagramGenerator for venn type', () => {
            const renderer = factory_1.ChartRendererFactory.createRenderer('venn');
            expect(renderer).toBeInstanceOf(venn_1.VennDiagramGenerator);
        });
        it('should create PlotGenerator for plot type', () => {
            const renderer = factory_1.ChartRendererFactory.createRenderer('plot');
            expect(renderer).toBeInstanceOf(plot_1.PlotGenerator);
        });
        it('should create FlowchartGenerator for flowchart type', () => {
            const renderer = factory_1.ChartRendererFactory.createRenderer('flowchart');
            expect(renderer).toBeInstanceOf(flowchart_1.FlowchartGenerator);
        });
        it('should be case insensitive', () => {
            const renderer1 = factory_1.ChartRendererFactory.createRenderer('VENN');
            const renderer2 = factory_1.ChartRendererFactory.createRenderer('Plot');
            expect(renderer1).toBeInstanceOf(venn_1.VennDiagramGenerator);
            expect(renderer2).toBeInstanceOf(plot_1.PlotGenerator);
        });
        it('should throw error for unsupported chart types', () => {
            expect(() => factory_1.ChartRendererFactory.createRenderer('bar'))
                .toThrow('Chart type \'bar\' not yet implemented');
            expect(() => factory_1.ChartRendererFactory.createRenderer('unknown'))
                .toThrow('Unknown chart type: unknown');
        });
        it('should pass options to renderer', () => {
            const options = { theme: 'robotpony', width: 1000, height: 800 };
            const renderer = factory_1.ChartRendererFactory.createRenderer('venn', options);
            expect(renderer).toBeInstanceOf(venn_1.VennDiagramGenerator);
            // Options are passed to constructor, which we can't easily test without exposing them
        });
    });
    describe('renderChart', () => {
        it('should render Venn diagram chart', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)();
            const svg = await factory_1.ChartRendererFactory.renderChart(chartSpec);
            expect(svg).toContain('<svg');
            expect(svg).toContain('</svg>');
            expect(svg).toContain('circle');
        });
        it('should render plot chart', async () => {
            const chartSpec = (0, test_utils_1.createMockPlotChart)();
            const svg = await factory_1.ChartRendererFactory.renderChart(chartSpec);
            expect(svg).toContain('<svg');
            expect(svg).toContain('</svg>');
            expect(svg).toContain('axis-line');
        });
        it('should apply theme from chart spec', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)();
            chartSpec.theme = 'robotpony';
            const svg = await factory_1.ChartRendererFactory.renderChart(chartSpec);
            expect(svg).toContain('Courier New');
            expect(svg).toContain('monospace');
        });
        it('should override theme with options', async () => {
            const chartSpec = (0, test_utils_1.createMockVennChart)();
            chartSpec.theme = 'default';
            const svg = await factory_1.ChartRendererFactory.renderChart(chartSpec, { theme: 'robotpony' });
            expect(svg).toContain('Courier New');
        });
    });
});
//# sourceMappingURL=factory.test.js.map