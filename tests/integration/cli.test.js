"use strict";
/**
 * CLI integration tests
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
const child_process_1 = require("child_process");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const test_utils_1 = require("../helpers/test-utils");
describe('CLI Integration', () => {
    const binPath = path.join(__dirname, '..', '..', 'bin', 'graphinate');
    afterEach(async () => {
        await (0, test_utils_1.cleanupTempFiles)();
    });
    /**
     * Helper to run CLI command and capture output
     */
    async function runCLI(args) {
        return new Promise((resolve) => {
            const child = (0, child_process_1.spawn)('node', [binPath, ...args], {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            let stdout = '';
            let stderr = '';
            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('close', (exitCode) => {
                resolve({ exitCode, stdout, stderr });
            });
        });
    }
    describe('Command execution', () => {
        it('should generate SVG from valid markdown file', async () => {
            const markdown = `---
type: venn
theme: robotpony
sets:
  - "CLI Test A"
  - "CLI Test B"
overlap: "Integration"
---

# CLI Test Chart`;
            const inputFile = await (0, test_utils_1.createTempFile)(markdown, '.md');
            const outputFile = inputFile.replace('.md', '.svg');
            const result = await runCLI([inputFile, outputFile, '--theme', 'robotpony']);
            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain('Chart saved to:');
            expect(result.stdout).toContain(outputFile);
            // Verify output file was created and contains valid SVG
            const svgContent = await fs.readFile(outputFile, 'utf-8');
            expect(svgContent).toContain('<svg');
            expect(svgContent).toContain('</svg>');
            expect(svgContent).toContain('CLI Test A');
            expect(svgContent).toContain('CLI Test B');
            expect(svgContent).toContain('Integration');
            // Clean up output file
            await fs.unlink(outputFile);
        }, 15000);
        it('should generate PNG from valid markdown file', async () => {
            const markdown = `---
type: plot
theme: robotpony
x_axis: "Time"
y_axis: "Progress"
line:
  points: [[0, 0], [10, 10]]
captions:
  - text: "Start"
    x: 0
    y: 0
---`;
            const inputFile = await (0, test_utils_1.createTempFile)(markdown, '.md');
            const outputFile = inputFile.replace('.md', '.png');
            const result = await runCLI([inputFile, outputFile]);
            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain('Chart saved to:');
            // Verify PNG file was created
            const stats = await fs.stat(outputFile);
            expect(stats.size).toBeGreaterThan(0);
            // Clean up
            await fs.unlink(outputFile);
        }, 15000);
    });
    describe('Error handling', () => {
        it('should handle non-existent input file', async () => {
            const result = await runCLI(['/non/existent/file.md', 'output.svg']);
            expect(result.exitCode).toBe(1);
            expect(result.stderr).toContain('File not found');
        });
        it('should handle invalid file extensions', async () => {
            const inputFile = await (0, test_utils_1.createTempFile)('# test', '.md');
            const result = await runCLI([inputFile, 'output.xyz']);
            expect(result.exitCode).toBe(1);
            expect(result.stderr).toContain('Unsupported file extension');
        });
        it('should handle invalid markdown files', async () => {
            const inputFile = await (0, test_utils_1.createTempFile)('not a markdown file', '.txt');
            const result = await runCLI([inputFile, 'output.svg']);
            expect(result.exitCode).toBe(1);
            expect(result.stderr).toContain('Unsupported file extension');
        });
    });
    describe('Theme options', () => {
        it('should apply theme from command line', async () => {
            const markdown = `---
type: venn
sets: ["Theme", "Test"]
---`;
            const inputFile = await (0, test_utils_1.createTempFile)(markdown, '.md');
            const outputFile = inputFile.replace('.md', '.svg');
            const result = await runCLI([inputFile, outputFile, '--theme', 'robotpony']);
            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain('Theme: robotpony');
            const svgContent = await fs.readFile(outputFile, 'utf-8');
            expect(svgContent).toContain('Courier New');
            expect(svgContent).toContain('monospace');
            await fs.unlink(outputFile);
        }, 10000);
        it('should show chart information in output', async () => {
            const markdown = `---
type: plot
title: "Test Chart Title"
---`;
            const inputFile = await (0, test_utils_1.createTempFile)(markdown, '.md');
            const outputFile = inputFile.replace('.md', '.svg');
            const result = await runCLI([inputFile, outputFile]);
            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain('Chart type: plot');
            expect(result.stdout).toContain('Title: Test Chart Title');
            await fs.unlink(outputFile);
        }, 10000);
    });
    describe('Output validation', () => {
        it('should create output directory if it does not exist', async () => {
            const markdown = `---
type: venn
sets: ["Dir", "Test"]
---`;
            const inputFile = await (0, test_utils_1.createTempFile)(markdown, '.md');
            const tempDir = path.join(path.dirname(inputFile), 'new-dir');
            const outputFile = path.join(tempDir, 'test.svg');
            const result = await runCLI([inputFile, outputFile]);
            expect(result.exitCode).toBe(0);
            // Verify directory was created
            const stats = await fs.stat(tempDir);
            expect(stats.isDirectory()).toBe(true);
            // Verify file was created
            const fileStats = await fs.stat(outputFile);
            expect(fileStats.isFile()).toBe(true);
            // Clean up
            await fs.rm(tempDir, { recursive: true });
        }, 10000);
    });
});
//# sourceMappingURL=cli.test.js.map