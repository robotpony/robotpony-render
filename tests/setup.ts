/**
 * Jest test setup file
 */

// Increase timeout for image generation tests
jest.setTimeout(30000);

// Mock console.log/error for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  // Suppress console output during tests unless explicitly needed
  console.log = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  // Restore console for debugging when needed
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Export to make this a module
export {};

// Custom Jest matchers for SVG testing
expect.extend({
  toContainSVGElement(received: string, element: string) {
    const pass = received.includes(`<${element}`) || received.includes(`class="${element}"`);
    return {
      message: () => `expected SVG to ${pass ? 'not ' : ''}contain element "${element}"`,
      pass,
    };
  },
  
  toHaveValidSVGStructure(received: string) {
    const hasOpeningTag = received.includes('<svg');
    const hasClosingTag = received.includes('</svg>');
    const hasViewBox = received.includes('viewBox=');
    
    const pass = hasOpeningTag && hasClosingTag && hasViewBox;
    return {
      message: () => `expected string to ${pass ? 'not ' : ''}be a valid SVG`,
      pass,
    };
  },
});