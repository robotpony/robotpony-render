/**
 * TypeScript declarations for test environment
 */

declare global {
  namespace jest {
    interface Matchers<R> {
      toContainSVGElement(element: string): R;
      toHaveValidSVGStructure(): R;
    }
  }
}

export {};