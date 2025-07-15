/**
 * Test utilities and helpers
 */
import { ChartSpec, VennData, PlotData, FlowchartData } from '../../src/parsers/markdown';
/**
 * Create a temporary test file with given content
 */
export declare function createTempFile(content: string, extension?: string): Promise<string>;
/**
 * Clean up temporary test files
 */
export declare function cleanupTempFiles(): Promise<void>;
/**
 * Create a mock Venn diagram chart spec
 */
export declare function createMockVennChart(overrides?: Partial<VennData>): ChartSpec;
/**
 * Create a mock plot chart spec
 */
export declare function createMockPlotChart(overrides?: Partial<PlotData>): ChartSpec;
/**
 * Create a mock flowchart chart spec
 */
export declare function createMockFlowchartChart(overrides?: Partial<FlowchartData>): ChartSpec;
/**
 * Extract specific SVG elements from SVG string
 */
export declare function extractSVGElements(svg: string, elementType: string): string[];
/**
 * Extract text content from SVG
 */
export declare function extractSVGText(svg: string): string[];
/**
 * Check if SVG contains specific attributes
 */
export declare function svgContainsAttributes(svg: string, element: string, attributes: Record<string, string>): boolean;
/**
 * Validate SVG structure and required elements
 */
export declare function validateSVGStructure(svg: string): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=test-utils.d.ts.map