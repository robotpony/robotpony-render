"use strict";
/**
 * Test utilities and helpers
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTempFile = createTempFile;
exports.cleanupTempFiles = cleanupTempFiles;
exports.createMockVennChart = createMockVennChart;
exports.createMockPlotChart = createMockPlotChart;
exports.createMockFlowchartChart = createMockFlowchartChart;
exports.extractSVGElements = extractSVGElements;
exports.extractSVGText = extractSVGText;
exports.svgContainsAttributes = svgContainsAttributes;
exports.validateSVGStructure = validateSVGStructure;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
/**
 * Create a temporary test file with given content
 */
async function createTempFile(content, extension = '.md') {
    const tempDir = path.join(__dirname, '..', 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    const filename = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${extension}`;
    const filepath = path.join(tempDir, filename);
    await fs.writeFile(filepath, content, 'utf-8');
    return filepath;
}
/**
 * Clean up temporary test files
 */
async function cleanupTempFiles() {
    const tempDir = path.join(__dirname, '..', 'temp');
    try {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
    catch {
        // Ignore errors if directory doesn't exist
    }
}
/**
 * Create a mock Venn diagram chart spec
 */
function createMockVennChart(overrides = {}) {
    const defaultData = {
        sets: [
            { name: 'Set A', size: 100, color: '#blue' },
            { name: 'Set B', size: 100, color: '#red' }
        ],
        intersections: [
            { sets: ['Set A', 'Set B'], size: 50, label: 'Overlap' }
        ],
        background: '#beige'
    };
    return {
        type: 'venn',
        theme: 'robotpony',
        data: { ...defaultData, ...overrides }
    };
}
/**
 * Create a mock plot chart spec
 */
function createMockPlotChart(overrides = {}) {
    const defaultData = {
        x_axis: 'X Axis',
        y_axis: 'Y Axis',
        x_range: [0, 10],
        y_range: [0, 10],
        line: {
            style: 'solid',
            points: [[1, 2], [5, 6], [9, 8]]
        },
        captions: [
            { text: 'Point A', x: 1, y: 2 },
            { text: 'Point B', x: 5, y: 6 }
        ],
        background: '#beige'
    };
    return {
        type: 'plot',
        theme: 'robotpony',
        data: { ...defaultData, ...overrides }
    };
}
/**
 * Create a mock flowchart chart spec
 */
function createMockFlowchartChart(overrides = {}) {
    const defaultData = {
        nodes: [
            { id: 'start', type: 'rectangle', text: 'Start', color: 'blue' },
            { id: 'end', type: 'circle', text: 'End', color: 'green' }
        ],
        connections: [
            { from: 'start', to: 'end', label: 'Next' }
        ],
        background: '#beige'
    };
    return {
        type: 'flowchart',
        theme: 'robotpony',
        data: { ...defaultData, ...overrides }
    };
}
/**
 * Extract specific SVG elements from SVG string
 */
function extractSVGElements(svg, elementType) {
    const regex = new RegExp(`<${elementType}[^>]*>`, 'g');
    return svg.match(regex) || [];
}
/**
 * Extract text content from SVG
 */
function extractSVGText(svg) {
    const textRegex = /<text[^>]*>([^<]+)<\/text>/g;
    const matches = [];
    let match;
    while ((match = textRegex.exec(svg)) !== null) {
        matches.push(match[1]);
    }
    return matches;
}
/**
 * Check if SVG contains specific attributes
 */
function svgContainsAttributes(svg, element, attributes) {
    const elementRegex = new RegExp(`<${element}[^>]*>`, 'g');
    const matches = svg.match(elementRegex);
    if (!matches)
        return false;
    return matches.some(match => {
        return Object.entries(attributes).every(([key, value]) => {
            return match.includes(`${key}="${value}"`);
        });
    });
}
/**
 * Validate SVG structure and required elements
 */
function validateSVGStructure(svg) {
    const errors = [];
    if (!svg.includes('<svg')) {
        errors.push('Missing opening <svg> tag');
    }
    if (!svg.includes('</svg>')) {
        errors.push('Missing closing </svg> tag');
    }
    if (!svg.includes('viewBox=')) {
        errors.push('Missing viewBox attribute');
    }
    if (!svg.includes('xmlns=')) {
        errors.push('Missing xmlns attribute');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
//# sourceMappingURL=test-utils.js.map